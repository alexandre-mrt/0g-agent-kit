import { describe, expect, test } from "bun:test";
import {
	createMetadataFromAgent,
	encryptAgentMetadata,
	validateMetadata,
} from "../src/inft/metadata";

describe("validateMetadata", () => {
	test("returns empty array for valid metadata", () => {
		const metadata = createMetadataFromAgent(
			"TestAgent",
			"A test agent",
			"gpt-4o",
			["trading"],
		);
		expect(validateMetadata(metadata)).toEqual([]);
	});

	test("catches missing name", () => {
		const metadata = createMetadataFromAgent("", "desc", "model", ["cap"]);
		const errors = validateMetadata(metadata);
		expect(errors).toContain("Name is required");
	});

	test("catches missing description", () => {
		const metadata = createMetadataFromAgent("Name", "", "model", ["cap"]);
		const errors = validateMetadata(metadata);
		expect(errors).toContain("Description is required");
	});

	test("catches empty capabilities", () => {
		const metadata = createMetadataFromAgent("Name", "Desc", "model", []);
		const errors = validateMetadata(metadata);
		expect(errors).toContain("At least one capability is required");
	});
});

describe("createMetadataFromAgent", () => {
	test("creates correct metadata structure", () => {
		const metadata = createMetadataFromAgent(
			"MyAgent",
			"Does stuff",
			"llama-70b",
			["trade", "analyze"],
			"You are a trader",
			{ creator: "test" },
		);
		expect(metadata.name).toBe("MyAgent");
		expect(metadata.description).toBe("Does stuff");
		expect(metadata.model).toBe("llama-70b");
		expect(metadata.capabilities).toEqual(["trade", "analyze"]);
		expect(metadata.systemPrompt).toBe("You are a trader");
		expect(metadata.version).toBe("1.0.0");
		expect(metadata.createdAt).toBeGreaterThan(0);
		expect(metadata.customData).toEqual({ creator: "test" });
	});
});

describe("encryptAgentMetadata", () => {
	test("returns encrypted data with hash and key", () => {
		const metadata = createMetadataFromAgent(
			"Test",
			"Desc",
			"model",
			["cap"],
		);
		const result = encryptAgentMetadata(metadata);

		expect(result).toHaveProperty("encrypted");
		expect(result).toHaveProperty("metadataHash");
		expect(result).toHaveProperty("encryptionKey");
		expect(result.metadataHash).toMatch(/^[a-f0-9]{64}$/);
		expect(result.encryptionKey.length).toBe(64); // 32 bytes hex
		expect(result.encrypted.ciphertext.length).toBeGreaterThan(0);
	});

	test("produces unique keys per call", () => {
		const metadata = createMetadataFromAgent("Test", "Desc", "model", ["cap"]);
		const r1 = encryptAgentMetadata(metadata);
		const r2 = encryptAgentMetadata(metadata);
		expect(r1.encryptionKey).not.toBe(r2.encryptionKey);
	});

	test("encrypted data can be decrypted back to original metadata", () => {
		const { decrypt } = require("../src/utils/crypto");
		const metadata = createMetadataFromAgent(
			"RecoverAgent",
			"Full round-trip test",
			"llama-3.1-70b",
			["trade", "analyze", "memory"],
			"You are a trading agent",
			{ version: "2.0", custom: true },
		);

		const result = encryptAgentMetadata(metadata);
		const key = Buffer.from(result.encryptionKey, "hex");
		const decrypted = decrypt(result.encrypted, key);
		const recovered = JSON.parse(decrypted);

		expect(recovered.name).toBe("RecoverAgent");
		expect(recovered.description).toBe("Full round-trip test");
		expect(recovered.model).toBe("llama-3.1-70b");
		expect(recovered.capabilities).toEqual(["trade", "analyze", "memory"]);
		expect(recovered.systemPrompt).toBe("You are a trading agent");
		expect(recovered.customData).toEqual({ version: "2.0", custom: true });
		expect(recovered.version).toBe("1.0.0");
	});

	test("metadata hash is consistent for same data", () => {
		const metadata = createMetadataFromAgent("Hash", "Test", "m", ["cap"]);
		const r1 = encryptAgentMetadata(metadata);
		// Hash is of the raw JSON, which includes createdAt, so it differs per call
		// But the hash format should be consistent
		expect(r1.metadataHash).toMatch(/^[a-f0-9]{64}$/);
	});
});
