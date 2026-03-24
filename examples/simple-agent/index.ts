import { createAssistantAgent } from "../../src";

/**
 * Simple example: Create a personal assistant agent.
 *
 * Usage:
 *   cp .env.example .env  # fill in your keys
 *   bun run examples/simple-agent/index.ts
 */

const agent = createAssistantAgent({
	name: "MyAssistant",
	description: "A helpful AI assistant with persistent memory",
	inference: {
		endpoint: process.env.INFERENCE_ENDPOINT || "https://api.openai.com",
		apiKey: process.env.OPENAI_API_KEY || process.env.INFERENCE_API_KEY || "",
		model: process.env.INFERENCE_MODEL || "gpt-4o-mini",
		maxTokens: 2048,
		temperature: 0.7,
	},
	useLocalMemory: true, // Use local memory for this example
});

async function main() {
	console.log("Agent created:", agent.name);
	console.log("Wallet:", agent.getWallet().address);
	console.log();

	// Run a simple conversation
	const result = await agent.run("What's the current time? Then save a note that I started testing at this time.");

	console.log("Output:", result.output);
	console.log("Tool calls:", result.toolCalls.length);
	console.log("Iterations:", result.iterations);
	console.log("Tokens used:", result.tokensUsed);

	// Follow-up question using memory
	const result2 = await agent.run("What note did you save earlier?");
	console.log("\nFollow-up:", result2.output);
}

main().catch(console.error);
