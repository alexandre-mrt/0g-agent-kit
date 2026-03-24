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

describe("encrypt / decrypt - special characters", () => {
	test("handles unicode and emojis", () => {
		const key = generateEncryptionKey();
		const text = "Agent with unicode: and special chars: <>&\"'";
		const encrypted = encrypt(text, key);
		const decrypted = decrypt(encrypted, key);
		expect(decrypted).toBe(text);
	});

	test("same plaintext produces different ciphertexts (random IV)", () => {
		const key = generateEncryptionKey();
		const enc1 = encrypt("same", key);
		const enc2 = encrypt("same", key);
		expect(enc1.ciphertext).not.toBe(enc2.ciphertext);
		expect(enc1.iv).not.toBe(enc2.iv);
	});

	test("tampered ciphertext fails to decrypt", () => {
		const key = generateEncryptionKey();
		const encrypted = encrypt("secret", key);
		encrypted.ciphertext = "ff" + encrypted.ciphertext.slice(2);
		expect(() => decrypt(encrypted, key)).toThrow();
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

	test("produces known SHA-256 value", () => {
		// SHA-256 of "test" is well-known
		expect(hashData("test")).toBe("9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08");
	});

	test("handles empty string", () => {
		const hash = hashData("");
		expect(hash).toMatch(/^[a-f0-9]{64}$/);
		// SHA-256 of "" is known
		expect(hash).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
	});

	test("handles very long input", () => {
		const hash = hashData("x".repeat(100000));
		expect(hash).toMatch(/^[a-f0-9]{64}$/);
	});

	test("similar inputs produce very different hashes", () => {
		const h1 = hashData("test1");
		const h2 = hashData("test2");
		// Count differing characters - should be many (avalanche effect)
		let diff = 0;
		for (let i = 0; i < h1.length; i++) {
			if (h1[i] !== h2[i]) diff++;
		}
		expect(diff).toBeGreaterThan(10);
	});
});
