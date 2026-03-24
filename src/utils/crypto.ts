import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";

export interface EncryptedData {
	ciphertext: string;
	iv: string;
	tag: string;
}

export function generateEncryptionKey(): Buffer {
	return randomBytes(32);
}

export function encrypt(data: string, key: Buffer): EncryptedData {
	const iv = randomBytes(16);
	const cipher = createCipheriv(ALGORITHM, key, iv);

	let ciphertext = cipher.update(data, "utf8", "hex");
	ciphertext += cipher.final("hex");

	return {
		ciphertext,
		iv: iv.toString("hex"),
		tag: cipher.getAuthTag().toString("hex"),
	};
}

export function decrypt(encrypted: EncryptedData, key: Buffer): string {
	const decipher = createDecipheriv(
		ALGORITHM,
		key,
		Buffer.from(encrypted.iv, "hex"),
	);
	decipher.setAuthTag(Buffer.from(encrypted.tag, "hex"));

	let plaintext = decipher.update(encrypted.ciphertext, "hex", "utf8");
	plaintext += decipher.final("utf8");

	return plaintext;
}

export function hashData(data: string): string {
	return createHash("sha256").update(data).digest("hex");
}
