import { ethers } from "ethers";
import type { Agent } from "../core/agent";
import type { AgentWallet } from "../core/wallet";
import { type AgentMetadata, createMetadataFromAgent, encryptAgentMetadata, validateMetadata } from "./metadata";

// Minimal ERC-7857 INFT ABI for minting
const INFT_ABI = [
	"function mint(address to, bytes memory encryptedMetadata, bytes32 metadataHash) external returns (uint256)",
	"function ownerOf(uint256 tokenId) external view returns (address)",
	"function tokenURI(uint256 tokenId) external view returns (string)",
	"function totalSupply() external view returns (uint256)",
	"event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];

export interface MintOptions {
	contractAddress: string;
	agent: Agent;
	capabilities: string[];
	customData?: Record<string, unknown>;
}

export interface MintResult {
	tokenId: string;
	contractAddress: string;
	txHash: string;
	metadataHash: string;
	encryptionKey: string;
	owner: string;
}

/**
 * Mints an AI agent as an INFT (ERC-7857) on the 0G chain.
 *
 * The agent's configuration, capabilities, and system prompt are
 * encrypted and stored on-chain, with the metadata hash providing
 * verifiable integrity.
 */
export async function mintINFT(
	wallet: AgentWallet,
	options: MintOptions,
): Promise<MintResult> {
	if (!options.contractAddress || !options.contractAddress.startsWith("0x")) {
		throw new Error("contractAddress must be a valid address starting with 0x");
	}
	if (!options.capabilities || options.capabilities.length === 0) {
		throw new Error("At least one capability is required");
	}

	const metadata: AgentMetadata = createMetadataFromAgent(
		options.agent.name,
		options.agent.description,
		"meta-llama/llama-3.1-70b", // default model
		options.capabilities,
		undefined,
		options.customData,
	);

	const errors = validateMetadata(metadata);
	if (errors.length > 0) {
		throw new Error(`Invalid metadata: ${errors.join(", ")}`);
	}

	const encrypted = encryptAgentMetadata(metadata);

	const signer = wallet.getSigner();
	const contract = new ethers.Contract(options.contractAddress, INFT_ABI, signer);

	const encryptedBytes = ethers.toUtf8Bytes(JSON.stringify(encrypted.encrypted));
	const metadataHashBytes = ethers.id(encrypted.metadataHash);

	const tx = await contract.mint(
		wallet.address,
		encryptedBytes,
		metadataHashBytes,
	);

	const receipt = await tx.wait();
	if (!receipt) {
		throw new Error("Mint transaction failed: no receipt");
	}

	// Extract tokenId from Transfer event
	const transferEvent = receipt.logs.find(
		(log: ethers.Log) => log.topics[0] === ethers.id("Transfer(address,address,uint256)"),
	);

	const tokenId = transferEvent
		? ethers.toBigInt(transferEvent.topics[3]).toString()
		: "unknown";

	return {
		tokenId,
		contractAddress: options.contractAddress,
		txHash: receipt.hash,
		metadataHash: encrypted.metadataHash,
		encryptionKey: encrypted.encryptionKey,
		owner: wallet.address,
	};
}

/**
 * Reads INFT ownership information.
 */
export async function getINFTOwner(
	wallet: AgentWallet,
	contractAddress: string,
	tokenId: string,
): Promise<string> {
	const owner = await wallet.readContract(
		contractAddress,
		INFT_ABI,
		"ownerOf",
		[tokenId],
	);

	return owner as string;
}
