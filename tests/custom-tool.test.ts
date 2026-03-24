import { describe, expect, test } from "bun:test";
import type { ToolDefinition } from "../src/core/inference";

describe("Custom tool execution", () => {
	test("tool returns string result", async () => {
		const tool: ToolDefinition = {
			name: "greet",
			description: "Greet a user",
			parameters: {
				type: "object",
				properties: { name: { type: "string" } },
				required: ["name"],
			},
			execute: async (args) => {
				return `Hello, ${args.name}!`;
			},
		};

		const result = await tool.execute({ name: "Alice" });
		expect(result).toBe("Hello, Alice!");
	});

	test("tool returns JSON result", async () => {
		const tool: ToolDefinition = {
			name: "calc",
			description: "Add two numbers",
			parameters: {
				type: "object",
				properties: {
					a: { type: "number" },
					b: { type: "number" },
				},
				required: ["a", "b"],
			},
			execute: async (args) => {
				const sum = (args.a as number) + (args.b as number);
				return JSON.stringify({ sum });
			},
		};

		const result = await tool.execute({ a: 3, b: 7 });
		expect(JSON.parse(result)).toEqual({ sum: 10 });
	});

	test("tool handles errors gracefully", async () => {
		const tool: ToolDefinition = {
			name: "failing_tool",
			description: "Always fails",
			parameters: { type: "object", properties: {} },
			execute: async () => {
				throw new Error("Tool crashed");
			},
		};

		try {
			await tool.execute({});
			expect(true).toBe(false);
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect((e as Error).message).toBe("Tool crashed");
		}
	});

	test("tool with async operations", async () => {
		const tool: ToolDefinition = {
			name: "async_tool",
			description: "Simulates async work",
			parameters: { type: "object", properties: {} },
			execute: async () => {
				await new Promise((r) => setTimeout(r, 10));
				return "done";
			},
		};

		const result = await tool.execute({});
		expect(result).toBe("done");
	});

	test("tool parameter types preserved", async () => {
		const tool: ToolDefinition = {
			name: "type_check",
			description: "Checks parameter types",
			parameters: {
				type: "object",
				properties: {
					str: { type: "string" },
					num: { type: "number" },
					bool: { type: "boolean" },
				},
			},
			execute: async (args) => {
				return JSON.stringify({
					strType: typeof args.str,
					numType: typeof args.num,
					boolType: typeof args.bool,
				});
			},
		};

		const result = JSON.parse(
			await tool.execute({ str: "hello", num: 42, bool: true }),
		);
		expect(result.strType).toBe("string");
		expect(result.numType).toBe("number");
		expect(result.boolType).toBe("boolean");
	});
});
