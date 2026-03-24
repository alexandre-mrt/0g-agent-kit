import { describe, expect, test } from "bun:test";
import { AgentWallet } from "../src/core/wallet";
import { LocalMemory } from "../src/core/memory";
import { createBalanceTool, createTransferTool, createSwapTool, createPriceQuoteTool } from "../src/tools/defi";
import { createSaveMemoryTool, createLoadMemoryTool, createListMemoryTool } from "../src/tools/storage";
import { createFetchWebTool, createTimeTool } from "../src/tools/web";

const TEST_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const wallet = new AgentWallet(TEST_KEY, "https://evmrpc-testnet.0g.ai");
const memory = new LocalMemory();

describe("Tool name uniqueness", () => {
	test("all built-in tools have unique names", () => {
		const tools = [
			createBalanceTool(wallet),
			createTransferTool(wallet),
			createSwapTool(wallet, "0x1"),
			createPriceQuoteTool(wallet, "0x1"),
			createSaveMemoryTool(memory),
			createLoadMemoryTool(memory),
			createListMemoryTool(memory),
			createFetchWebTool(),
			createTimeTool(),
		];

		const names = tools.map((t) => t.name);
		const uniqueNames = new Set(names);
		expect(uniqueNames.size).toBe(names.length);
	});

	test("all tools have non-empty descriptions", () => {
		const tools = [
			createBalanceTool(wallet),
			createTransferTool(wallet),
			createSwapTool(wallet, "0x1"),
			createPriceQuoteTool(wallet, "0x1"),
			createSaveMemoryTool(memory),
			createLoadMemoryTool(memory),
			createListMemoryTool(memory),
			createFetchWebTool(),
			createTimeTool(),
		];

		for (const tool of tools) {
			expect(tool.description.length).toBeGreaterThan(10);
		}
	});

	test("all tools have parameters object", () => {
		const tools = [
			createBalanceTool(wallet),
			createTimeTool(),
			createListMemoryTool(memory),
		];

		for (const tool of tools) {
			expect(tool.parameters).toHaveProperty("type", "object");
		}
	});

	test("all tool execute functions return promises", async () => {
		const tool = createTimeTool();
		const result = tool.execute({});
		expect(result).toBeInstanceOf(Promise);
		const resolved = await result;
		expect(typeof resolved).toBe("string");
	});
});
