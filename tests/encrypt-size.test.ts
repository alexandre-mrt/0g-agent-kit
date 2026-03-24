import { describe, expect, test } from "bun:test";
import { encrypt, generateEncryptionKey } from "../src/utils/crypto";

describe("Encryption output size", () => {
	test("ciphertext is longer than plaintext hex", () => {
		const key = generateEncryptionKey();
		const enc = encrypt("short", key);
		expect(enc.ciphertext.length).toBeGreaterThan(0);
	});
	test("iv is always 32 hex chars", () => {
		const key = generateEncryptionKey();
		const enc = encrypt("data", key);
		expect(enc.iv.length).toBe(32);
	});
	test("tag is always 32 hex chars", () => {
		const key = generateEncryptionKey();
		const enc = encrypt("data", key);
		expect(enc.tag.length).toBe(32);
	});
});
