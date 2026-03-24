import { Indexer, ZgFile } from "@0gfoundation/0g-ts-sdk";
import { ethers } from "ethers";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ZeroGConfig } from "../utils/config";

export interface MemoryEntry {
	key: string;
	value: unknown;
	timestamp: number;
	rootHash?: string;
}

export interface MemoryProvider {
	save(key: string, value: unknown): Promise<string>;
	load(key: string): Promise<unknown | null>;
	list(): Promise<MemoryEntry[]>;
	delete(key: string): Promise<void>;
}

/**
 * In-memory provider for development/testing.
 */
export class LocalMemory implements MemoryProvider {
	private store = new Map<string, MemoryEntry>();

	async save(key: string, value: unknown): Promise<string> {
		this.store.set(key, { key, value, timestamp: Date.now() });
		return key;
	}

	async load(key: string): Promise<unknown | null> {
		return this.store.get(key)?.value ?? null;
	}

	async list(): Promise<MemoryEntry[]> {
		return Array.from(this.store.values());
	}

	async delete(key: string): Promise<void> {
		this.store.delete(key);
	}
}

/**
 * 0G Storage-backed persistent memory for agents.
 * Stores data as JSON files on 0G decentralized storage.
 */
export class ZeroGMemory implements MemoryProvider {
	private readonly provider: ethers.JsonRpcProvider;
	private readonly signer: ethers.Wallet;
	private readonly indexerRpc: string;
	private readonly localIndex = new Map<string, MemoryEntry>();

	constructor(config: ZeroGConfig) {
		this.provider = new ethers.JsonRpcProvider(config.evmRpc);
		this.signer = new ethers.Wallet(config.privateKey, this.provider);
		this.indexerRpc = config.indexerRpc;
	}

	async save(key: string, value: unknown): Promise<string> {
		const data = JSON.stringify({ key, value, timestamp: Date.now() });
		const tempDir = await mkdtemp(join(tmpdir(), "0g-mem-"));
		const tempPath = join(tempDir, `${key}.json`);

		try {
			await writeFile(tempPath, data);

			const file = await ZgFile.fromFilePath(tempPath);
			const [tree, treeErr] = await file.merkleTree();

			if (treeErr || !tree) {
				throw new Error(`Failed to compute merkle tree: ${treeErr}`);
			}

			const rootHash = tree.rootHash() ?? "";
			const indexer = new Indexer(this.indexerRpc);
			const [, uploadErr] = await indexer.upload(
				file,
				this.provider._getConnection().url,
				this.signer,
			);

			if (uploadErr) {
				throw new Error(`Upload failed: ${uploadErr}`);
			}

			await file.close();

			const entry: MemoryEntry = { key, value, timestamp: Date.now(), rootHash };
			this.localIndex.set(key, entry);

			return rootHash;
		} finally {
			await rm(tempDir, { recursive: true, force: true }).catch(() => {});
		}
	}

	async load(key: string): Promise<unknown | null> {
		const entry = this.localIndex.get(key);
		if (!entry?.rootHash) return null;

		const tempDir = await mkdtemp(join(tmpdir(), "0g-mem-dl-"));
		const outputPath = join(tempDir, `${key}.json`);

		try {
			const indexer = new Indexer(this.indexerRpc);
			const [, downloadErr] = await indexer.download(entry.rootHash, outputPath, true);

			if (downloadErr) {
				throw new Error(`Download failed: ${downloadErr}`);
			}

			const raw = await readFile(outputPath, "utf-8");
			const parsed = JSON.parse(raw) as { value: unknown };
			return parsed.value;
		} finally {
			await rm(tempDir, { recursive: true, force: true }).catch(() => {});
		}
	}

	async list(): Promise<MemoryEntry[]> {
		return Array.from(this.localIndex.values());
	}

	async delete(key: string): Promise<void> {
		this.localIndex.delete(key);
	}
}
