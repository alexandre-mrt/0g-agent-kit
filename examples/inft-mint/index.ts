import {
	Agent,
	AgentWallet,
	LocalMemory,
	ZeroGInference,
	createAssistantAgent,
	createMetadataFromAgent,
	encryptAgentMetadata,
	mintINFT,
	validateMetadata,
} from "../../src";

/**
 * INFT Minting example.
 *
 * Demonstrates how to:
 * 1. Create an AI agent
 * 2. Prepare encrypted metadata
 * 3. Mint it as an INFT (ERC-7857) on 0G Chain
 *
 * Prerequisites:
 * - Deploy the INFT contract first (see contracts/INFT.sol)
 * - Have testnet 0G tokens for gas
 *
 * Usage:
 *   cp .env.example .env
 *   bun run examples/inft-mint/index.ts
 */

const INFT_CONTRACT = process.env.INFT_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

async function main() {
	// 1. Create an agent
	const agent = createAssistantAgent({
		name: "SmartAssistant",
		description: "A personal AI assistant that remembers everything",
		inference: {
			endpoint: process.env.INFERENCE_ENDPOINT || "https://api.openai.com",
			apiKey: process.env.OPENAI_API_KEY || "",
			model: "gpt-4o-mini",
			maxTokens: 2048,
			temperature: 0.7,
		},
		useLocalMemory: true,
	});

	console.log("Agent created:", agent.name);

	// 2. Prepare metadata
	const metadata = createMetadataFromAgent(
		agent.name,
		"A personal AI assistant with persistent memory, web browsing, and wallet management",
		"gpt-4o-mini",
		["memory", "web-browsing", "wallet", "conversation"],
		undefined,
		{ creator: "0g-agent-kit", version: "0.1.0" },
	);

	// 3. Validate
	const errors = validateMetadata(metadata);
	if (errors.length > 0) {
		console.error("Validation errors:", errors);
		return;
	}

	// 4. Encrypt metadata
	const encrypted = encryptAgentMetadata(metadata);
	console.log("\nMetadata encrypted:");
	console.log("  Hash:", encrypted.metadataHash);
	console.log("  Key (save securely!):", encrypted.encryptionKey);

	// 5. Mint INFT
	console.log("\nMinting INFT on contract:", INFT_CONTRACT);

	if (INFT_CONTRACT === "0x0000000000000000000000000000000000000000") {
		console.log("\n[Demo mode] Set INFT_CONTRACT_ADDRESS to mint on a real contract.");
		console.log("The agent would be minted with:");
		console.log("  - Name:", metadata.name);
		console.log("  - Capabilities:", metadata.capabilities.join(", "));
		console.log("  - Encrypted metadata stored on-chain");
		console.log("  - Only the owner can decrypt with the encryption key");
		return;
	}

	const wallet = agent.getWallet();
	const result = await mintINFT(wallet, {
		contractAddress: INFT_CONTRACT,
		agent,
		capabilities: metadata.capabilities,
		customData: metadata.customData,
	});

	console.log("\nINFT Minted!");
	console.log("  Token ID:", result.tokenId);
	console.log("  Contract:", result.contractAddress);
	console.log("  TX Hash:", result.txHash);
	console.log("  Owner:", result.owner);
	console.log("  Encryption Key (SAVE THIS!):", result.encryptionKey);
}

main().catch(console.error);
