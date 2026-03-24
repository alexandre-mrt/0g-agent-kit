import type { EncryptedData } from "../utils/crypto";
import { encrypt, generateEncryptionKey, hashData } from "../utils/crypto";

export interface AgentMetadata {
	name: string;
	description: string;
	model: string;
	capabilities: string[];
	systemPrompt?: string;
	version: string;
	createdAt: number;
	customData?: Record<string, unknown>;
}

export interface EncryptedMetadata {
	encrypted: EncryptedData;
	metadataHash: string;
	encryptionKey: string; // Hex-encoded, only shared with owner
}

/**
 * Prepares agent metadata for INFT minting.
 * Encrypts sensitive data (model weights, prompts, capabilities)
 * and returns the encrypted payload + hash for on-chain verification.
 */
export function encryptAgentMetadata(metadata: AgentMetadata): EncryptedMetadata {
	const raw = JSON.stringify(metadata);
	const metadataHash = hashData(raw);
	const key = generateEncryptionKey();
	const encrypted = encrypt(raw, key);

	return {
		encrypted,
		metadataHash,
		encryptionKey: key.toString("hex"),
	};
}

/**
 * Validates agent metadata before encryption.
 */
export function validateMetadata(metadata: AgentMetadata): string[] {
	const errors: string[] = [];

	if (!metadata.name || metadata.name.length < 1) {
		errors.push("Name is required");
	}
	if (!metadata.description) {
		errors.push("Description is required");
	}
	if (!metadata.model) {
		errors.push("Model is required");
	}
	if (!metadata.capabilities || metadata.capabilities.length === 0) {
		errors.push("At least one capability is required");
	}
	if (!metadata.version) {
		errors.push("Version is required");
	}

	return errors;
}

/**
 * Creates a standard metadata object from agent configuration.
 */
export function createMetadataFromAgent(
	name: string,
	description: string,
	model: string,
	capabilities: string[],
	systemPrompt?: string,
	customData?: Record<string, unknown>,
): AgentMetadata {
	return {
		name,
		description,
		model,
		capabilities,
		systemPrompt,
		version: "1.0.0",
		createdAt: Date.now(),
		customData,
	};
}
