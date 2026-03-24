import { ethers } from "ethers";
import type { AgentWallet } from "../core/wallet";

const INFT_TRANSFER_ABI = [
	"function transfer(address from, address to, uint256 tokenId, bytes memory newEncryptedMetadata, bytes memory proof) external",
	"function authorizeUsage(uint256 tokenId, address user, uint256 expiry) external",
	"function clone(uint256 tokenId, address to) external returns (uint256)",
	"event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];

export interface TransferOptions {
	contractAddress: string;
	tokenId: string;
	to: string;
	newEncryptedMetadata: string;
	proof: string;
}

export interface TransferResult {
	txHash: string;
	from: string;
	to: string;
	tokenId: string;
}

/**
 * Transfer an INFT to a new owner with re-encrypted metadata.
 * Follows the ERC-7857 secure transfer protocol.
 */
export async function transferINFT(
	wallet: AgentWallet,
	options: TransferOptions,
): Promise<TransferResult> {
	const signer = wallet.getSigner();
	const contract = new ethers.Contract(
		options.contractAddress,
		INFT_TRANSFER_ABI,
		signer,
	);

	const tx = await contract.transfer(
		wallet.address,
		options.to,
		options.tokenId,
		ethers.toUtf8Bytes(options.newEncryptedMetadata),
		ethers.toUtf8Bytes(options.proof),
	);

	const receipt = await tx.wait();
	if (!receipt) {
		throw new Error("Transfer transaction failed: no receipt");
	}

	return {
		txHash: receipt.hash,
		from: wallet.address,
		to: options.to,
		tokenId: options.tokenId,
	};
}

/**
 * Grant temporary usage rights to another address without transferring ownership.
 */
export async function authorizeUsage(
	wallet: AgentWallet,
	contractAddress: string,
	tokenId: string,
	userAddress: string,
	durationSeconds: number,
): Promise<string> {
	const expiry = Math.floor(Date.now() / 1000) + durationSeconds;
	const signer = wallet.getSigner();
	const contract = new ethers.Contract(contractAddress, INFT_TRANSFER_ABI, signer);

	const tx = await contract.authorizeUsage(tokenId, userAddress, expiry);
	const receipt = await tx.wait();

	if (!receipt) {
		throw new Error("Authorization transaction failed: no receipt");
	}

	return receipt.hash;
}

/**
 * Clone an INFT to create a copy with the same metadata.
 */
export async function cloneINFT(
	wallet: AgentWallet,
	contractAddress: string,
	tokenId: string,
	toAddress: string,
): Promise<{ txHash: string; newTokenId: string }> {
	const signer = wallet.getSigner();
	const contract = new ethers.Contract(contractAddress, INFT_TRANSFER_ABI, signer);

	const tx = await contract.clone(tokenId, toAddress);
	const receipt = await tx.wait();

	if (!receipt) {
		throw new Error("Clone transaction failed: no receipt");
	}

	const transferEvent = receipt.logs.find(
		(log: ethers.Log) => log.topics[0] === ethers.id("Transfer(address,address,uint256)"),
	);

	const newTokenId = transferEvent
		? ethers.toBigInt(transferEvent.topics[3]).toString()
		: "unknown";

	return { txHash: receipt.hash, newTokenId };
}
