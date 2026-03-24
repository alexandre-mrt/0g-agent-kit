import { describe, expect, test } from "bun:test";
import { AgentConfigSchema } from "../src/utils/config";

describe("AgentConfig defaults", () => {
	test("minimal config gets all defaults", () => {
		const cfg = AgentConfigSchema.parse({ name: "Min" });
		expect(cfg.model).toBe("meta-llama/llama-3.1-70b");
		expect(cfg.maxIterations).toBe(10);
		expect(cfg.temperature).toBe(0.7);
		expect(cfg.systemPrompt).toBeUndefined();
		expect(cfg.description).toBeUndefined();
	});

	test("all fields can be overridden", () => {
		const cfg = AgentConfigSchema.parse({
			name: "Full",
			description: "desc",
			model: "custom",
			systemPrompt: "prompt",
			maxIterations: 5,
			temperature: 0.3,
		});
		expect(cfg.model).toBe("custom");
		expect(cfg.maxIterations).toBe(5);
		expect(cfg.temperature).toBe(0.3);
	});
});
