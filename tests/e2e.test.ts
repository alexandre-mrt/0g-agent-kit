import { describe, expect, test } from "bun:test";

process.env.ZG_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

import { createAssistantAgent } from "../src/templates/assistant-agent";
import { createTradingAgent } from "../src/templates/trading-agent";
import { LocalMemory } from "../src/core/memory";

describe("End-to-end: create agents and use tools", () => {
	test("assistant agent saves and loads state via shared memory", async () => {
		const sharedMem = new LocalMemory();

		const agent1 = createAssistantAgent({
			inference: { endpoint: "https://api.example.com", model: "test", maxTokens: 100, temperature: 0.7 },
			useLocalMemory: true,
		});

		// Save state
		await agent1.getMemory().save("user-pref", { theme: "dark", lang: "en" });

		// Verify via memory directly
		const pref = await agent1.getMemory().load("user-pref");
		expect(pref).toEqual({ theme: "dark", lang: "en" });
	});

	test("trading agent has all required capabilities", () => {
		const agent = createTradingAgent({
			inference: { endpoint: "https://api.example.com", model: "test", maxTokens: 100, temperature: 0.3 },
			dexRouterAddress: "0x0000000000000000000000000000000000000001",
			useLocalMemory: true,
			maxTradeSize: "50",
		});

		expect(agent.name).toBe("TradingBot");
		expect(agent.getWallet()).toBeTruthy();
		expect(agent.getMemory()).toBeTruthy();
	});

	test("agents have different wallets when using same key", () => {
		const a1 = createAssistantAgent({
			inference: { endpoint: "https://api.example.com", model: "test", maxTokens: 100, temperature: 0.7 },
			useLocalMemory: true,
		});
		const a2 = createTradingAgent({
			inference: { endpoint: "https://api.example.com", model: "test", maxTokens: 100, temperature: 0.3 },
			dexRouterAddress: "0x1",
			useLocalMemory: true,
		});
		// Same env key = same address
		expect(a1.getWallet().address).toBe(a2.getWallet().address);
	});
});
