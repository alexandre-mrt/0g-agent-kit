import { describe, expect, test } from "bun:test";
import { createMetadataFromAgent } from "../src/inft/metadata";

describe("createMetadataFromAgent", () => {
	test("sets createdAt to current time", () => {
		const before = Date.now();
		const meta = createMetadataFromAgent("A", "D", "M", ["c"]);
		const after = Date.now();
		expect(meta.createdAt).toBeGreaterThanOrEqual(before);
		expect(meta.createdAt).toBeLessThanOrEqual(after);
	});

	test("version defaults to 1.0.0", () => {
		const meta = createMetadataFromAgent("A", "D", "M", ["c"]);
		expect(meta.version).toBe("1.0.0");
	});

	test("customData is optional", () => {
		const meta = createMetadataFromAgent("A", "D", "M", ["c"]);
		expect(meta.customData).toBeUndefined();
	});
});
