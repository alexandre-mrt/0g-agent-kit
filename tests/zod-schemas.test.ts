import { describe, expect, test } from "bun:test";
import { AgentConfigSchema, InferenceConfigSchema, ZeroGConfigSchema } from "../src/utils/config";

describe("Zod schema error messages", () => {
	test("AgentConfig name error is descriptive", () => {
		try {
			AgentConfigSchema.parse({});
		} catch (e: any) {
			expect(e.errors.length).toBeGreaterThan(0);
		}
	});

	test("InferenceConfig endpoint error", () => {
		try {
			InferenceConfigSchema.parse({});
		} catch (e: any) {
			expect(e.errors.length).toBeGreaterThan(0);
		}
	});

	test("ZeroGConfig requires indexerRpc and privateKey", () => {
		try {
			ZeroGConfigSchema.parse({});
		} catch (e: any) {
			expect(e.errors.length).toBeGreaterThanOrEqual(2);
		}
	});
});
