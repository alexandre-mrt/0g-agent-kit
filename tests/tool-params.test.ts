import { describe, expect, test } from "bun:test";
import { createTimeTool, createFetchWebTool } from "../src/tools/web";

describe("Tool parameter schemas", () => {
	test("time tool has no required params", () => {
		const tool = createTimeTool();
		expect(tool.parameters.type).toBe("object");
	});

	test("web tool requires url", () => {
		const tool = createFetchWebTool();
		expect(tool.parameters.required).toContain("url");
	});
});
