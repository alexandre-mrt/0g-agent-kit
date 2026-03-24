import { Agent } from "../core/agent";
import { ZeroGInference } from "../core/inference";
import { LocalMemory, ZeroGMemory } from "../core/memory";
import { AgentWallet } from "../core/wallet";
import { createBalanceTool } from "../tools/defi";
import { createListMemoryTool, createLoadMemoryTool, createSaveMemoryTool } from "../tools/storage";
import { createFetchWebTool, createTimeTool } from "../tools/web";
import type { InferenceConfig, ZeroGConfig } from "../utils/config";

export interface AssistantAgentConfig {
	name?: string;
	description?: string;
	systemPrompt?: string;
	zeroG?: ZeroGConfig;
	inference: InferenceConfig;
	useLocalMemory?: boolean;
}

/**
 * Pre-built personal assistant agent template.
 *
 * Capabilities:
 * - Persistent memory (remember conversations and preferences)
 * - Web browsing for research
 * - Wallet balance checking
 * - Time awareness
 */
export function createAssistantAgent(config: AssistantAgentConfig): Agent {
	const wallet = new AgentWallet(
		config.zeroG?.privateKey ?? process.env.ZG_PRIVATE_KEY ?? "",
		config.zeroG?.evmRpc ?? process.env.ZG_EVM_RPC ?? "https://evmrpc-testnet.0g.ai",
	);

	const memory = config.useLocalMemory || !config.zeroG
		? new LocalMemory()
		: new ZeroGMemory(config.zeroG);

	const inference = new ZeroGInference(config.inference);

	const tools = [
		createSaveMemoryTool(memory),
		createLoadMemoryTool(memory),
		createListMemoryTool(memory),
		createFetchWebTool(),
		createTimeTool(),
		createBalanceTool(wallet),
	];

	return new Agent(
		{
			name: config.name ?? "Assistant",
			description: config.description ?? "Personal AI assistant on 0G",
			systemPrompt: config.systemPrompt ?? `You are a helpful personal AI assistant running on the 0G decentralized network.
You have persistent memory across conversations. Use it to remember important context.
You can browse the web for information and check wallet balances.
Be helpful, concise, and proactive about saving important information to memory.`,
			model: config.inference.model,
			maxIterations: 10,
			temperature: 0.7,
		},
		{ memory, wallet, inference },
		tools,
	);
}
