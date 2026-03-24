import { describe, expect, test } from "bun:test";
import { decrypt, encrypt, generateEncryptionKey, hashData } from "../src/utils/crypto";

describe("generateEncryptionKey", () => {
	test("returns a 32-byte buffer", () => {
		const key = generateEncryptionKey();
		expect(key.length).toBe(32);
		expect(Buffer.isBuffer(key)).toBe(true);
	});

	test("generates unique keys", () => {
		const key1 = generateEncryptionKey();
		const key2 = generateEncryptionKey();
		expect(key1.toString("hex")).not.toBe(key2.toString("hex"));
	});
});

describe("encrypt / decrypt", () => {
	test("round-trips correctly", () => {
		const key = generateEncryptionKey();
		const plaintext = "Hello 0G Agent Kit!";
		const encrypted = encrypt(plaintext, key);
		const decrypted = decrypt(encrypted, key);
		expect(decrypted).toBe(plaintext);
	});

	test("encrypted data has required fields", () => {
		const key = generateEncryptionKey();
		const encrypted = encrypt("test data", key);
		expect(encrypted).toHaveProperty("ciphertext");
		expect(encrypted).toHaveProperty("iv");
		expect(encrypted).toHaveProperty("tag");
		expect(encrypted.ciphertext.length).toBeGreaterThan(0);
		expect(encrypted.iv.length).toBe(32); // 16 bytes = 32 hex chars
		expect(encrypted.tag.length).toBe(32); // 16 bytes = 32 hex chars
	});

	test("different keys produce different ciphertexts", () => {
		const key1 = generateEncryptionKey();
		const key2 = generateEncryptionKey();
		const plaintext = "same data";
		const enc1 = encrypt(plaintext, key1);
		const enc2 = encrypt(plaintext, key2);
		expect(enc1.ciphertext).not.toBe(enc2.ciphertext);
	});

	test("wrong key fails to decrypt", () => {
		const key1 = generateEncryptionKey();
		const key2 = generateEncryptionKey();
		const encrypted = encrypt("secret", key1);
		expect(() => decrypt(encrypted, key2)).toThrow();
	});

	test("handles empty string", () => {
		const key = generateEncryptionKey();
		const encrypted = encrypt("", key);
		const decrypted = decrypt(encrypted, key);
		expect(decrypted).toBe("");
	});

	test("handles long text", () => {
		const key = generateEncryptionKey();
		const longText = "a".repeat(10000);
		const encrypted = encrypt(longText, key);
		const decrypted = decrypt(encrypted, key);
		expect(decrypted).toBe(longText);
	});

	test("handles JSON data", () => {
		const key = generateEncryptionKey();
		const jsonData = JSON.stringify({ agent: "test", capabilities: ["trade", "analyze"] });
		const encrypted = encrypt(jsonData, key);
		const decrypted = decrypt(encrypted, key);
		expect(JSON.parse(decrypted)).toEqual({ agent: "test", capabilities: ["trade", "analyze"] });
	});
});

describe("hashData", () => {
	test("returns a 64-char hex string", () => {
		const hash = hashData("test");
		expect(hash).toMatch(/^[a-f0-9]{64}$/);
	});

	test("is deterministic", () => {
		expect(hashData("same")).toBe(hashData("same"));
	});

	test("different inputs produce different hashes", () => {
		expect(hashData("a")).not.toBe(hashData("b"));
	});
});
