import { describe, expect, test } from "bun:test";
import { LocalMemory } from "../src/core/memory";

describe("LocalMemory advanced", () => {
	test("save returns the key as identifier", async () => {
		const mem = new LocalMemory();
		const result = await mem.save("my-key", "data");
		expect(result).toBe("my-key");
	});

	test("timestamps increase on successive saves", async () => {
		const mem = new LocalMemory();
		await mem.save("t1", "first");
		await new Promise((r) => setTimeout(r, 5));
		await mem.save("t2", "second");

		const entries = await mem.list();
		const t1 = entries.find((e) => e.key === "t1");
		const t2 = entries.find((e) => e.key === "t2");
		expect(t2!.timestamp).toBeGreaterThanOrEqual(t1!.timestamp);
	});

	test("overwrite updates timestamp", async () => {
		const mem = new LocalMemory();
		await mem.save("key", "v1");
		const before = (await mem.list())[0].timestamp;
		await new Promise((r) => setTimeout(r, 5));
		await mem.save("key", "v2");
		const after = (await mem.list())[0].timestamp;
		expect(after).toBeGreaterThanOrEqual(before);
	});

	test("list order matches insertion order", async () => {
		const mem = new LocalMemory();
		const keys = ["alpha", "beta", "gamma"];
		for (const k of keys) {
			await mem.save(k, k);
		}
		const entries = await mem.list();
		expect(entries.map((e) => e.key)).toEqual(keys);
	});

	test("handles 100 entries", async () => {
		const mem = new LocalMemory();
		for (let i = 0; i < 100; i++) {
			await mem.save(`key-${i}`, { index: i });
		}
		const entries = await mem.list();
		expect(entries.length).toBe(100);
		expect(await mem.load("key-50")).toEqual({ index: 50 });
		expect(await mem.load("key-99")).toEqual({ index: 99 });
	});

	test("delete middle entry preserves others", async () => {
		const mem = new LocalMemory();
		await mem.save("a", 1);
		await mem.save("b", 2);
		await mem.save("c", 3);
		await mem.delete("b");

		expect(await mem.load("a")).toBe(1);
		expect(await mem.load("b")).toBeNull();
		expect(await mem.load("c")).toBe(3);
		expect((await mem.list()).length).toBe(2);
	});
});
