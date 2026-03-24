import { describe, expect, test } from "bun:test";
import { quickAgent } from "../src/quick";

process.env.ZG_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

describe("quickAgent validation", () => {
	test("returns Agent with run method", () => {
		const a = quickAgent({ name: "V", inferenceEndpoint: "https://x.com" });
		expect(typeof a.run).toBe("function");
	});

	test("returns Agent with saveState method", () => {
		const a = quickAgent({ name: "V", inferenceEndpoint: "https://x.com" });
		expect(typeof a.saveState).toBe("function");
	});
});
