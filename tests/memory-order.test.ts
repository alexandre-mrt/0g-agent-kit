import { describe, expect, test } from "bun:test";
import { LocalMemory } from "../src/core/memory";

describe("LocalMemory ordering", () => {
	test("entries maintain insertion order", async () => {
		const mem = new LocalMemory();
		await mem.save("c", 3);
		await mem.save("a", 1);
		await mem.save("b", 2);
		const entries = await mem.list();
		expect(entries.map(e => e.key)).toEqual(["c", "a", "b"]);
	});

	test("overwrite preserves position in map", async () => {
		const mem = new LocalMemory();
		await mem.save("x", 1);
		await mem.save("y", 2);
		await mem.save("x", 10); // overwrite
		const entries = await mem.list();
		// Map.set updates in-place for existing keys
		expect(entries[0].key).toBe("x");
		expect(entries[0].value).toBe(10);
	});
});
