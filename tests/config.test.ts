import { describe, expect, test } from "bun:test";
import { AgentConfigSchema, InferenceConfigSchema, ZeroGConfigSchema } from "../src/utils/config";

describe("AgentConfigSchema", () => {
	test("accepts valid config", () => {
		const result = AgentConfigSchema.parse({
			name: "TestAgent",
			model: "gpt-4o",
		});
		expect(result.name).toBe("TestAgent");
		expect(result.model).toBe("gpt-4o");
		expect(result.maxIterations).toBe(10); // default
		expect(result.temperature).toBe(0.7); // default
	});

	test("rejects empty name", () => {
		expect(() => AgentConfigSchema.parse({ name: "" })).toThrow();
	});

	test("applies defaults", () => {
		const result = AgentConfigSchema.parse({ name: "Test" });
		expect(result.model).toBe("meta-llama/llama-3.1-70b");
		expect(result.maxIterations).toBe(10);
		expect(result.temperature).toBe(0.7);
	});

	test("rejects invalid temperature", () => {
		expect(() =>
			AgentConfigSchema.parse({ name: "Test", temperature: 3 }),
		).toThrow();
	});

	test("rejects negative maxIterations", () => {
		expect(() =>
			AgentConfigSchema.parse({ name: "Test", maxIterations: -1 }),
		).toThrow();
	});
});

describe("InferenceConfigSchema", () => {
	test("accepts valid config", () => {
		const result = InferenceConfigSchema.parse({
			endpoint: "https://api.openai.com",
			apiKey: "sk-test",
		});
		expect(result.endpoint).toBe("https://api.openai.com");
		expect(result.model).toBe("meta-llama/llama-3.1-70b"); // default
		expect(result.maxTokens).toBe(4096); // default
	});

	test("rejects invalid URL", () => {
		expect(() =>
			InferenceConfigSchema.parse({ endpoint: "not-a-url" }),
		).toThrow();
	});
});

describe("ZeroGConfigSchema", () => {
	test("accepts valid config", () => {
		const result = ZeroGConfigSchema.parse({
			indexerRpc: "https://indexer.0g.ai",
			privateKey: "0xabc123",
		});
		expect(result.evmRpc).toBe("https://evmrpc-testnet.0g.ai"); // default
		expect(result.privateKey).toBe("0xabc123");
	});

	test("rejects missing privateKey", () => {
		expect(() =>
			ZeroGConfigSchema.parse({
				indexerRpc: "https://indexer.0g.ai",
				privateKey: "",
			}),
		).toThrow();
	});

	test("accepts custom evmRpc", () => {
		const result = ZeroGConfigSchema.parse({
			evmRpc: "https://custom-rpc.example.com",
			indexerRpc: "https://indexer.0g.ai",
			privateKey: "0xkey",
		});
		expect(result.evmRpc).toBe("https://custom-rpc.example.com");
	});
});

describe("Config boundary values", () => {
	test("AgentConfig temperature at boundaries", () => {
		expect(() => AgentConfigSchema.parse({ name: "T", temperature: 0 })).not.toThrow();
		expect(() => AgentConfigSchema.parse({ name: "T", temperature: 2 })).not.toThrow();
		expect(() => AgentConfigSchema.parse({ name: "T", temperature: -0.1 })).toThrow();
		expect(() => AgentConfigSchema.parse({ name: "T", temperature: 2.1 })).toThrow();
	});

	test("AgentConfig maxIterations must be positive integer", () => {
		expect(() => AgentConfigSchema.parse({ name: "T", maxIterations: 1 })).not.toThrow();
		expect(() => AgentConfigSchema.parse({ name: "T", maxIterations: 0 })).toThrow();
		expect(() => AgentConfigSchema.parse({ name: "T", maxIterations: 1.5 })).toThrow();
	});
});
