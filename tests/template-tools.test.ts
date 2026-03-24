import { describe, expect, test } from "bun:test";

process.env.ZG_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

import { createTradingAgent } from "../src/templates/trading-agent";
import { createAssistantAgent } from "../src/templates/assistant-agent";

describe("TradingAgent tool set", () => {
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

	test("has wallet with valid address", () => {
		expect(agent.getWallet().address).toMatch(/^0x/);
	});

	test("has memory provider", () => {
		expect(agent.getMemory()).toBeTruthy();
	});

	test("name defaults to TradingBot", () => {
		expect(agent.name).toBe("TradingBot");
	});
});

describe("AssistantAgent tool set", () => {
	const agent = createAssistantAgent({
		inference: {
			endpoint: "https://api.example.com",
			model: "test",
			maxTokens: 100,
			temperature: 0.7,
		},
		useLocalMemory: true,
	});

	test("has memory that works", async () => {
		const mem = agent.getMemory();
		await mem.save("hello", "world");
		expect(await mem.load("hello")).toBe("world");
	});

	test("name defaults to Assistant", () => {
		expect(agent.name).toBe("Assistant");
	});

	test("description mentions assistant", () => {
		expect(agent.description.toLowerCase()).toContain("assistant");
	});
});
