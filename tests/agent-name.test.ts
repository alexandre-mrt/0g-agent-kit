import { describe, expect, test } from "bun:test";
import { Agent } from "../src/core/agent";
import { ZeroGInference } from "../src/core/inference";
import { LocalMemory } from "../src/core/memory";
import { AgentWallet } from "../src/core/wallet";

const k = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const ctx = {
	memory: new LocalMemory(),
	wallet: new AgentWallet(k, "https://evmrpc-testnet.0g.ai"),
	inference: new ZeroGInference({ endpoint: "https://x.com", model: "t", maxTokens: 1, temperature: 0 }),
};

describe("Agent name and description", () => {
	test("name is stored correctly", () => {
		const a = new Agent({ name: "TestName", model: "m", maxIterations: 1, temperature: 0 }, ctx);
		expect(a.name).toBe("TestName");
	});

	test("description defaults to empty string", () => {
		const a = new Agent({ name: "N", model: "m", maxIterations: 1, temperature: 0 }, ctx);
		expect(a.description).toBe("");
	});

	test("description is stored when provided", () => {
		const a = new Agent({ name: "N", description: "D", model: "m", maxIterations: 1, temperature: 0 }, ctx);
		expect(a.description).toBe("D");
	});
});
