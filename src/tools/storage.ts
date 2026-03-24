import type { ToolDefinition } from "../core/inference";
import type { MemoryProvider } from "../core/memory";

/**
 * Creates a tool for saving data to the agent's memory (0G Storage).
 */
export function createSaveMemoryTool(memory: MemoryProvider): ToolDefinition {
	return {
		name: "save_to_memory",
		description: "Save data to the agent's persistent memory on 0G Storage. Use for storing important context, analysis results, or state.",
		parameters: {
			type: "object",
			properties: {
				key: { type: "string", description: "Unique key for this memory entry" },
				value: { type: "string", description: "Data to store (will be JSON-parsed if valid JSON)" },
			},
			required: ["key", "value"],
		},
		execute: async (args) => {
			const { key, value } = args as { key: string; value: string };

			let parsedValue: unknown;
			try {
				parsedValue = JSON.parse(value);
			} catch {
				parsedValue = value;
			}

			const rootHash = await memory.save(key, parsedValue);
			return JSON.stringify({ success: true, key, rootHash });
		},
	};
}

/**
 * Creates a tool for loading data from the agent's memory.
 */
export function createLoadMemoryTool(memory: MemoryProvider): ToolDefinition {
	return {
		name: "load_from_memory",
		description: "Load data from the agent's persistent memory. Use to recall previously saved context or state.",
		parameters: {
			type: "object",
			properties: {
				key: { type: "string", description: "Key of the memory entry to load" },
			},
			required: ["key"],
		},
		execute: async (args) => {
			const { key } = args as { key: string };
			const value = await memory.load(key);

			if (value === null) {
				return JSON.stringify({ found: false, key });
			}

			return JSON.stringify({ found: true, key, value });
		},
	};
}

/**
 * Creates a tool for listing all memory entries.
 */
export function createListMemoryTool(memory: MemoryProvider): ToolDefinition {
	return {
		name: "list_memory",
		description: "List all entries in the agent's persistent memory.",
		parameters: {
			type: "object",
			properties: {},
		},
		execute: async () => {
			const entries = await memory.list();
			return JSON.stringify({
				count: entries.length,
				entries: entries.map((e) => ({
					key: e.key,
					timestamp: e.timestamp,
					rootHash: e.rootHash,
				})),
			});
		},
	};
}
