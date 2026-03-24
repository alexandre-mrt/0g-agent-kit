import { describe, expect, test } from "bun:test";
import { generateEncryptionKey } from "../src/utils/crypto";

describe("Encryption key generation", () => {
	test("keys are 32 bytes", () => {
		for (let i = 0; i < 5; i++) {
			expect(generateEncryptionKey().length).toBe(32);
		}
	});

	test("100 keys are all unique", () => {
		const keys = new Set<string>();
		for (let i = 0; i < 100; i++) {
			keys.add(generateEncryptionKey().toString("hex"));
		}
		expect(keys.size).toBe(100);
	});
});
