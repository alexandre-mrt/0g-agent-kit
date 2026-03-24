import { Agent } from "./core/agent";
import { ZeroGInference } from "./core/inference";
import { LocalMemory } from "./core/memory";
import { AgentWallet } from "./core/wallet";
import { createTimeTool, createFetchWebTool } from "./tools/web";
import { createSaveMemoryTool, createLoadMemoryTool } from "./tools/storage";
import type { ToolDefinition } from "./core/inference";

export interface QuickAgentOptions {
	name: string;
	description?: string;
	/** OpenAI-compatible inference endpoint */
	inferenceEndpoint: string;
	/** API key for the inference endpoint */
	inferenceApiKey?: string;
	/** Model name (default: gpt-4o-mini) */
	model?: string;
	/** Additional tools to add */
	tools?: ToolDefinition[];
}

/**
 * Create an agent with minimal configuration.
 * Uses local memory and a dummy wallet for quick prototyping.
 */
export function quickAgent(options: QuickAgentOptions): Agent {
	if (!options.name) throw new Error("Agent name is required");
	if (!options.inferenceEndpoint) throw new Error("Inference endpoint is required");

	const privateKey = process.env.ZG_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
	const rpcUrl = process.env.ZG_EVM_RPC || "https://evmrpc-testnet.0g.ai";

	const memory = new LocalMemory();
	const wallet = new AgentWallet(privateKey, rpcUrl);
	const inference = new ZeroGInference({
		endpoint: options.inferenceEndpoint,
		apiKey: options.inferenceApiKey,
		model: options.model ?? "gpt-4o-mini",
		maxTokens: 4096,
		temperature: 0.7,
	});

	const defaultTools = [
		createTimeTool(),
		createFetchWebTool(),
		createSaveMemoryTool(memory),
		createLoadMemoryTool(memory),
	];

	return new Agent(
		{
			name: options.name,
			description: options.description,
			model: options.model ?? "gpt-4o-mini",
			maxIterations: 10,
			temperature: 0.7,
		},
		{ memory, wallet, inference },
		[...defaultTools, ...(options.tools ?? [])],
	);
}
