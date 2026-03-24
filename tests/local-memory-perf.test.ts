import { describe, expect, test } from "bun:test";
import { LocalMemory } from "../src/core/memory";

describe("LocalMemory performance", () => {
	test("1000 operations complete under 100ms", async () => {
		const mem = new LocalMemory();
		const start = Date.now();
		for (let i = 0; i < 1000; i++) {
			await mem.save(`k${i}`, i);
		}
		expect(Date.now() - start).toBeLessThan(100);
		expect((await mem.list()).length).toBe(1000);
	});

	test("load after bulk insert is fast", async () => {
		const mem = new LocalMemory();
		for (let i = 0; i < 500; i++) await mem.save(`k${i}`, i);
		const start = Date.now();
		expect(await mem.load("k499")).toBe(499);
		expect(Date.now() - start).toBeLessThan(5);
	});
});
