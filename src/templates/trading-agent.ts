import { Agent } from "../core/agent";
import { ZeroGInference } from "../core/inference";
import { LocalMemory, ZeroGMemory } from "../core/memory";
import { AgentWallet } from "../core/wallet";
import { createBalanceTool, createPriceQuoteTool, createSwapTool, createTransferTool } from "../tools/defi";
import { createSaveMemoryTool, createLoadMemoryTool } from "../tools/storage";
import { createFetchWebTool, createTimeTool } from "../tools/web";
import type { InferenceConfig, ZeroGConfig } from "../utils/config";

export interface TradingAgentConfig {
	name?: string;
	description?: string;
	zeroG?: ZeroGConfig;
	inference: InferenceConfig;
	dexRouterAddress: string;
	maxTradeSize?: string;
	useLocalMemory?: boolean;
}

/**
 * Pre-built DeFi trading agent template.
 *
 * Capabilities:
 * - Check token balances
 * - Get price quotes
 * - Execute swaps via DEX
 * - Save/load trading state to 0G Storage
 * - Fetch market data from the web
 */
export function createTradingAgent(config: TradingAgentConfig): Agent {
	const wallet = new AgentWallet(
		config.zeroG?.privateKey ?? process.env.ZG_PRIVATE_KEY ?? "",
		config.zeroG?.evmRpc ?? process.env.ZG_EVM_RPC ?? "https://evmrpc-testnet.0g.ai",
	);

	const memory = config.useLocalMemory || !config.zeroG
		? new LocalMemory()
		: new ZeroGMemory(config.zeroG);

	const inference = new ZeroGInference(config.inference);

	const tools = [
		createBalanceTool(wallet),
		createTransferTool(wallet),
		createSwapTool(wallet, config.dexRouterAddress),
		createPriceQuoteTool(wallet, config.dexRouterAddress),
		createSaveMemoryTool(memory),
		createLoadMemoryTool(memory),
		createFetchWebTool(),
		createTimeTool(),
	];

	return new Agent(
		{
			name: config.name ?? "TradingBot",
			description: config.description ?? "Autonomous DeFi trading agent on 0G",
			model: config.inference.model,
			systemPrompt: `You are an autonomous DeFi trading agent on the 0G network.
Your job is to analyze market conditions and execute profitable trades.

Rules:
- Always check balances before trading
- Never trade more than ${config.maxTradeSize ?? "10"} tokens in a single swap
- Get price quotes before executing swaps
- Save important analysis and trade history to memory
- Explain your reasoning before executing trades`,
			maxIterations: 15,
			temperature: 0.3,
		},
		{ memory, wallet, inference },
		tools,
	);
}
