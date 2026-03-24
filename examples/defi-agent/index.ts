import { createTradingAgent } from "../../src";

/**
 * DeFi Trading Agent example.
 *
 * This agent can:
 * - Check token balances
 * - Get price quotes from a DEX
 * - Execute swaps
 * - Save trading history to memory
 *
 * Usage:
 *   cp .env.example .env  # fill in your keys
 *   bun run examples/defi-agent/index.ts
 */

const agent = createTradingAgent({
	name: "DeFiTrader",
	description: "Autonomous DeFi trading agent on 0G testnet",
	inference: {
		endpoint: process.env.INFERENCE_ENDPOINT || "https://api.openai.com",
		apiKey: process.env.OPENAI_API_KEY || process.env.INFERENCE_API_KEY || "",
		model: process.env.INFERENCE_MODEL || "gpt-4o-mini",
		maxTokens: 4096,
		temperature: 0.3,
	},
	dexRouterAddress: "0x0000000000000000000000000000000000000000", // Replace with actual DEX router
	maxTradeSize: "5",
	useLocalMemory: true,
});

async function main() {
	console.log("DeFi Trading Agent created:", agent.name);
	console.log("Wallet:", agent.getWallet().address);
	console.log();

	// Ask the agent to analyze and trade
	const result = await agent.run(
		"Check my native token balance and tell me what you see. If I have tokens, what trading strategies would you recommend?",
	);

	console.log("Output:", result.output);
	console.log("\nTool calls:");
	for (const tc of result.toolCalls) {
		console.log(`  - ${tc.tool}(${JSON.stringify(tc.args)})`);
		console.log(`    Result: ${tc.result.slice(0, 100)}...`);
	}
}

main().catch(console.error);
