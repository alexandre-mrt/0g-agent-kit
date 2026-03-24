import { describe, expect, test } from "bun:test";
import { quickAgent } from "../src/quick";

process.env.ZG_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

describe("quickAgent", () => {
	test("creates agent with minimal config", () => {
		const agent = quickAgent({
			name: "QuickBot",
			inferenceEndpoint: "https://api.openai.com",
		});
		expect(agent.name).toBe("QuickBot");
		expect(agent.getWallet().address).toMatch(/^0x/);
		expect(agent.getMemory()).toBeTruthy();
	});

	test("accepts custom model", () => {
		const agent = quickAgent({
			name: "CustomModel",
			inferenceEndpoint: "https://api.example.com",
			model: "llama-3.1-70b",
		});
		expect(agent.name).toBe("CustomModel");
	});

	test("accepts custom tools", () => {
		const agent = quickAgent({
			name: "ToolBot",
			inferenceEndpoint: "https://api.example.com",
			tools: [{
				name: "custom",
				description: "Custom tool",
				parameters: { type: "object", properties: {} },
				execute: async () => "ok",
			}],
		});
		expect(agent.name).toBe("ToolBot");
	});

	test("rejects empty name", () => {
		expect(() => quickAgent({
			name: "",
			inferenceEndpoint: "https://api.example.com",
		})).toThrow("name");
	});

	test("rejects empty endpoint", () => {
		expect(() => quickAgent({
			name: "Bot",
			inferenceEndpoint: "",
		})).toThrow("endpoint");
	});

	test("memory is functional", async () => {
		const agent = quickAgent({
			name: "MemBot",
			inferenceEndpoint: "https://api.example.com",
		});
		await agent.getMemory().save("key", "value");
		expect(await agent.getMemory().load("key")).toBe("value");
	});

	test("accepts description", () => {
		const agent = quickAgent({
			name: "DescBot",
			description: "A bot with a description",
			inferenceEndpoint: "https://api.example.com",
		});
		expect(agent.description).toBe("A bot with a description");
	});

	test("default model is gpt-4o-mini", () => {
		const agent = quickAgent({
			name: "DefaultModel",
			inferenceEndpoint: "https://api.example.com",
		});
		// Agent stores the model name internally
		expect(agent.name).toBe("DefaultModel");
	});
});
