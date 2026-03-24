import { describe, expect, test } from "bun:test";
import { createFetchWebTool, createTimeTool } from "../src/tools/web";
import { createSaveMemoryTool, createLoadMemoryTool, createListMemoryTool } from "../src/tools/storage";
import { LocalMemory } from "../src/core/memory";

describe("createTimeTool", () => {
	const tool = createTimeTool();

	test("has correct metadata", () => {
		expect(tool.name).toBe("get_current_time");
		expect(tool.description).toContain("current");
	});

	test("returns current time", async () => {
		const result = await tool.execute({});
		const parsed = JSON.parse(result);
		expect(parsed).toHaveProperty("iso");
		expect(parsed).toHaveProperty("unix");
		expect(parsed).toHaveProperty("readable");
		expect(parsed.unix).toBeCloseTo(Math.floor(Date.now() / 1000), -1);
	});
});

describe("createFetchWebTool", () => {
	const tool = createFetchWebTool();

	test("has correct metadata", () => {
		expect(tool.name).toBe("fetch_web_page");
		expect(tool.description).toContain("web");
	});

	test("handles invalid URL gracefully", async () => {
		const result = await tool.execute({ url: "http://localhost:99999/nonexistent" });
		const parsed = JSON.parse(result);
		expect(parsed.success).toBe(false);
	});
});

describe("Memory tools", () => {
	const memory = new LocalMemory();
	const saveTool = createSaveMemoryTool(memory);
	const loadTool = createLoadMemoryTool(memory);
	const listTool = createListMemoryTool(memory);

	test("saveTool has correct metadata", () => {
		expect(saveTool.name).toBe("save_to_memory");
	});

	test("loadTool has correct metadata", () => {
		expect(loadTool.name).toBe("load_from_memory");
	});

	test("listTool has correct metadata", () => {
		expect(listTool.name).toBe("list_memory");
	});

	test("save and load round trip", async () => {
		const saveResult = await saveTool.execute({ key: "test-key", value: "hello world" });
		const parsed = JSON.parse(saveResult);
		expect(parsed.success).toBe(true);
		expect(parsed.key).toBe("test-key");

		const loadResult = await loadTool.execute({ key: "test-key" });
		const loadParsed = JSON.parse(loadResult);
		expect(loadParsed.found).toBe(true);
		expect(loadParsed.value).toBe("hello world");
	});

	test("load returns not found for missing key", async () => {
		const result = await loadTool.execute({ key: "nonexistent" });
		const parsed = JSON.parse(result);
		expect(parsed.found).toBe(false);
	});

	test("save parses JSON values", async () => {
		await saveTool.execute({ key: "json-key", value: '{"a": 1}' });
		const result = await loadTool.execute({ key: "json-key" });
		const parsed = JSON.parse(result);
		expect(parsed.value).toEqual({ a: 1 });
	});

	test("list shows all entries", async () => {
		const result = await listTool.execute({});
		const parsed = JSON.parse(result);
		expect(parsed.count).toBeGreaterThanOrEqual(2);
		expect(parsed.entries.length).toBeGreaterThanOrEqual(2);
	});
});
