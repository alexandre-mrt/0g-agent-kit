import { describe, expect, test } from "bun:test";
import { LocalMemory } from "../src/core/memory";

describe("LocalMemory", () => {
	test("save and load", async () => {
		const mem = new LocalMemory();
		await mem.save("key1", { data: "hello" });
		const result = await mem.load("key1");
		expect(result).toEqual({ data: "hello" });
	});

	test("load returns null for missing key", async () => {
		const mem = new LocalMemory();
		const result = await mem.load("nonexistent");
		expect(result).toBeNull();
	});

	test("list returns all entries", async () => {
		const mem = new LocalMemory();
		await mem.save("a", 1);
		await mem.save("b", 2);
		const entries = await mem.list();
		expect(entries.length).toBe(2);
		expect(entries.map((e) => e.key).sort()).toEqual(["a", "b"]);
	});

	test("delete removes entry", async () => {
		const mem = new LocalMemory();
		await mem.save("key", "value");
		await mem.delete("key");
		const result = await mem.load("key");
		expect(result).toBeNull();
	});

	test("overwrite existing key", async () => {
		const mem = new LocalMemory();
		await mem.save("key", "old");
		await mem.save("key", "new");
		const result = await mem.load("key");
		expect(result).toBe("new");
	});

	test("handles various value types", async () => {
		const mem = new LocalMemory();
		await mem.save("string", "hello");
		await mem.save("number", 42);
		await mem.save("array", [1, 2, 3]);
		await mem.save("null", null);

		expect(await mem.load("string")).toBe("hello");
		expect(await mem.load("number")).toBe(42);
		expect(await mem.load("array")).toEqual([1, 2, 3]);
		expect(await mem.load("null")).toBeNull();
	});
});
