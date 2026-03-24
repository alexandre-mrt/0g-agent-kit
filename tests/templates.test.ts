import { describe, expect, test } from "bun:test";
import { createTradingAgent } from "../src/templates/trading-agent";
import { createAssistantAgent } from "../src/templates/assistant-agent";

// Use a valid dummy private key for testing (never use on mainnet!)
const TEST_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// Set env before templates try to read it
process.env.ZG_PRIVATE_KEY = TEST_KEY;

describe("createTradingAgent", () => {
	test("creates agent with default name", () => {
		const agent = createTradingAgent({
			inference: {
				endpoint: "https://api.example.com",
				model: "test",
				maxTokens: 100,
				temperature: 0.3,
			},
			dexRouterAddress: "0x0000000000000000000000000000000000000001",
			useLocalMemory: true,
		});

		expect(agent.name).toBe("TradingBot");
		expect(agent.description).toContain("DeFi");
	});

	test("creates agent with custom name", () => {
		const agent = createTradingAgent({
			name: "MyTrader",
			description: "Custom trader",
			inference: {
				endpoint: "https://api.example.com",
				model: "test",
				maxTokens: 100,
				temperature: 0.3,
			},
			dexRouterAddress: "0x1",
			useLocalMemory: true,
		});

		expect(agent.name).toBe("MyTrader");
		expect(agent.description).toBe("Custom trader");
	});

	test("has wallet access", () => {
		process.env.ZG_PRIVATE_KEY = TEST_KEY;
		const agent = createTradingAgent({
			inference: {
				endpoint: "https://api.example.com",
				model: "test",
				maxTokens: 100,
				temperature: 0.3,
			},
			dexRouterAddress: "0x1",
			useLocalMemory: true,
		});

		expect(agent.getWallet()).toBeTruthy();
		expect(agent.getWallet().address).toMatch(/^0x/);
	});
});

describe("createAssistantAgent", () => {
	test("creates agent with default name", () => {
		const agent = createAssistantAgent({
			inference: {
				endpoint: "https://api.example.com",
				model: "test",
				maxTokens: 100,
				temperature: 0.7,
			},
			useLocalMemory: true,
		});

		expect(agent.name).toBe("Assistant");
		expect(agent.description).toContain("assistant");
	});

	test("creates agent with custom config", () => {
		const agent = createAssistantAgent({
			name: "Jarvis",
			description: "My personal AI",
			systemPrompt: "You are Jarvis.",
			inference: {
				endpoint: "https://api.example.com",
				model: "gpt-4o",
				maxTokens: 2048,
				temperature: 0.5,
			},
			useLocalMemory: true,
		});

		expect(agent.name).toBe("Jarvis");
		expect(agent.description).toBe("My personal AI");
	});

	test("has memory access", () => {
		const agent = createAssistantAgent({
			inference: {
				endpoint: "https://api.example.com",
				model: "test",
				maxTokens: 100,
				temperature: 0.7,
			},
			useLocalMemory: true,
		});

		expect(agent.getMemory()).toBeTruthy();
	});

	test("uses local memory when useLocalMemory=true", async () => {
		const agent = createAssistantAgent({
			inference: {
				endpoint: "https://api.example.com",
				model: "test",
				maxTokens: 100,
				temperature: 0.7,
			},
			useLocalMemory: true,
		});

		// LocalMemory should work without 0G config
		const mem = agent.getMemory();
		await mem.save("test-key", "test-value");
		const value = await mem.load("test-key");
		expect(value).toBe("test-value");
	});
});

describe("Template agent wallet access", () => {
	test("trading agent wallet has valid address", () => {
		const agent = createTradingAgent({
			inference: {
				endpoint: "https://api.example.com",
				model: "test",
				maxTokens: 100,
				temperature: 0.3,
			},
			dexRouterAddress: "0x1",
			useLocalMemory: true,
		});
		expect(agent.getWallet().address).toMatch(/^0x[a-fA-F0-9]{40}$/);
	});

	test("assistant agent wallet has valid address", () => {
		const agent = createAssistantAgent({
			inference: {
				endpoint: "https://api.example.com",
				model: "test",
				maxTokens: 100,
				temperature: 0.7,
			},
			useLocalMemory: true,
		});
		expect(agent.getWallet().address).toMatch(/^0x[a-fA-F0-9]{40}$/);
	});
});
