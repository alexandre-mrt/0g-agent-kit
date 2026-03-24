import { describe, expect, test } from "bun:test";
import { LocalMemory } from "../src/core/memory";

describe("Memory value types", () => {
	const m = new LocalMemory();
	test("stores boolean", async () => { await m.save("b", true); expect(await m.load("b")).toBe(true); });
	test("stores object", async () => { await m.save("o", {x:1}); expect(await m.load("o")).toEqual({x:1}); });
});
