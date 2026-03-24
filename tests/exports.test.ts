import { describe, expect, test } from "bun:test";
import * as lib from "../src/index";

describe("Package exports", () => {
	test("exports Agent class", () => {
		expect(lib.Agent).toBeDefined();
		expect(typeof lib.Agent).toBe("function");
	});

	test("exports ZeroGInference", () => {
		expect(lib.ZeroGInference).toBeDefined();
	});

	test("exports LocalMemory", () => {
		expect(lib.LocalMemory).toBeDefined();
	});

	test("exports ZeroGMemory", () => {
		expect(lib.ZeroGMemory).toBeDefined();
	});

	test("exports AgentWallet", () => {
		expect(lib.AgentWallet).toBeDefined();
	});

	test("exports INFT functions", () => {
		expect(typeof lib.mintINFT).toBe("function");
		expect(typeof lib.getINFTOwner).toBe("function");
		expect(typeof lib.transferINFT).toBe("function");
		expect(typeof lib.authorizeUsage).toBe("function");
		expect(typeof lib.cloneINFT).toBe("function");
	});

	test("exports metadata functions", () => {
		expect(typeof lib.encryptAgentMetadata).toBe("function");
		expect(typeof lib.validateMetadata).toBe("function");
		expect(typeof lib.createMetadataFromAgent).toBe("function");
	});

	test("exports tool factories", () => {
		expect(typeof lib.createBalanceTool).toBe("function");
		expect(typeof lib.createTransferTool).toBe("function");
		expect(typeof lib.createSwapTool).toBe("function");
		expect(typeof lib.createPriceQuoteTool).toBe("function");
		expect(typeof lib.createSaveMemoryTool).toBe("function");
		expect(typeof lib.createLoadMemoryTool).toBe("function");
		expect(typeof lib.createListMemoryTool).toBe("function");
		expect(typeof lib.createFetchWebTool).toBe("function");
		expect(typeof lib.createTimeTool).toBe("function");
	});

	test("exports templates", () => {
		expect(typeof lib.createTradingAgent).toBe("function");
		expect(typeof lib.createAssistantAgent).toBe("function");
	});

	test("exports config schemas", () => {
		expect(lib.AgentConfigSchema).toBeDefined();
		expect(lib.ZeroGConfigSchema).toBeDefined();
		expect(lib.InferenceConfigSchema).toBeDefined();
		expect(typeof lib.loadConfigFromEnv).toBe("function");
	});

	test("exports crypto utilities", () => {
		expect(typeof lib.encrypt).toBe("function");
		expect(typeof lib.decrypt).toBe("function");
		expect(typeof lib.generateEncryptionKey).toBe("function");
		expect(typeof lib.hashData).toBe("function");
	});
});

describe("Export count verification", () => {
	test("has at least 25 named exports", () => {
		const exportCount = Object.keys(lib).length;
		expect(exportCount).toBeGreaterThanOrEqual(25);
	});

	test("no export is undefined", () => {
		for (const [key, value] of Object.entries(lib)) {
			expect(value).toBeDefined();
		}
	});

	test("class exports are constructable", () => {
		expect(lib.Agent.prototype).toBeTruthy();
		expect(lib.ZeroGInference.prototype).toBeTruthy();
		expect(lib.LocalMemory.prototype).toBeTruthy();
		expect(lib.ZeroGMemory.prototype).toBeTruthy();
		expect(lib.AgentWallet.prototype).toBeTruthy();
	});
});
