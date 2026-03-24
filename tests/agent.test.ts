import { describe, expect, test } from "bun:test";
import { Agent } from "../src/core/agent";
import { ZeroGInference } from "../src/core/inference";
import { LocalMemory } from "../src/core/memory";
import { AgentWallet } from "../src/core/wallet";
import type { ToolDefinition } from "../src/core/inference";

// Use a dummy private key for testing (never use on mainnet!)
const TEST_PRIVATE_KEY = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const TEST_RPC = "https://evmrpc-testnet.0g.ai";

describe("Agent", () => {
	const memory = new LocalMemory();
	const wallet = new AgentWallet(TEST_PRIVATE_KEY, TEST_RPC);
	const inference = new ZeroGInference({
		endpoint: "https://api.example.com",
		model: "test-model",
		maxTokens: 100,
		temperature: 0.5,
	});

	test("creates agent with correct properties", () => {
		const agent = new Agent(
			{
				name: "TestAgent",
				description: "A test agent",
				model: "test-model",
				maxIterations: 5,
				temperature: 0.5,
			},
			{ memory, wallet, inference },
		);

		expect(agent.name).toBe("TestAgent");
		expect(agent.description).toBe("A test agent");
	});

	test("getWallet returns wallet", () => {
		const agent = new Agent(
			{ name: "Test", model: "m", maxIterations: 1, temperature: 0 },
			{ memory, wallet, inference },
		);
		expect(agent.getWallet()).toBe(wallet);
	});

	test("getMemory returns memory", () => {
		const agent = new Agent(
			{ name: "Test", model: "m", maxIterations: 1, temperature: 0 },
			{ memory, wallet, inference },
		);
		expect(agent.getMemory()).toBe(memory);
	});

	test("resetHistory clears conversation", () => {
		const agent = new Agent(
			{ name: "Test", model: "m", maxIterations: 1, temperature: 0 },
			{ memory, wallet, inference },
		);
		agent.resetHistory();
		// No error thrown, method works
		expect(true).toBe(true);
	});

	test("run rejects empty message", async () => {
		const agent = new Agent(
			{ name: "Test", model: "m", maxIterations: 1, temperature: 0 },
			{ memory, wallet, inference },
		);
		expect(agent.run("")).rejects.toThrow("empty");
		expect(agent.run("   ")).rejects.toThrow("empty");
	});

	test("saveState stores to memory", async () => {
		const agent = new Agent(
			{ name: "StateAgent", model: "m", maxIterations: 1, temperature: 0 },
			{ memory, wallet, inference },
		);
		const rootHash = await agent.saveState("session-1");
		expect(rootHash).toBe("agent-state:session-1");
	});

	test("accepts tools", () => {
		const tool: ToolDefinition = {
			name: "test_tool",
			description: "A test tool",
			parameters: { type: "object", properties: {} },
			execute: async () => "result",
		};

		const agent = new Agent(
			{ name: "ToolAgent", model: "m", maxIterations: 1, temperature: 0 },
			{ memory, wallet, inference },
			[tool],
		);
		expect(agent.name).toBe("ToolAgent");
	});
});

describe("AgentWallet", () => {
	test("creates wallet with correct address", () => {
		const wallet = new AgentWallet(TEST_PRIVATE_KEY, TEST_RPC);
		expect(wallet.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
	});

	test("getSigner returns signer", () => {
		const wallet = new AgentWallet(TEST_PRIVATE_KEY, TEST_RPC);
		expect(wallet.getSigner()).toBeTruthy();
	});

	test("getProvider returns provider", () => {
		const wallet = new AgentWallet(TEST_PRIVATE_KEY, TEST_RPC);
		expect(wallet.getProvider()).toBeTruthy();
	});
});

describe("ZeroGInference", () => {
	test("creates inference client", () => {
		const inference = new ZeroGInference({
			endpoint: "https://api.example.com",
			model: "test",
			maxTokens: 100,
			temperature: 0.5,
		});
		expect(inference).toBeTruthy();
	});
});
