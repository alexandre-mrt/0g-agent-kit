// Core
export { Agent } from "./core/agent";
export type { AgentContext, AgentRunResult } from "./core/agent";
export { ZeroGInference } from "./core/inference";
export type { ChatMessage, InferenceResponse, ToolCall, ToolDefinition } from "./core/inference";
export { LocalMemory, ZeroGMemory } from "./core/memory";
export type { MemoryEntry, MemoryProvider } from "./core/memory";
export { AgentWallet } from "./core/wallet";
export type { WalletInfo } from "./core/wallet";

// INFT
export { mintINFT, getINFTOwner } from "./inft/mint";
export type { MintOptions, MintResult } from "./inft/mint";
export { transferINFT, authorizeUsage, cloneINFT } from "./inft/transfer";
export type { TransferOptions, TransferResult } from "./inft/transfer";
export { encryptAgentMetadata, validateMetadata, createMetadataFromAgent } from "./inft/metadata";
export type { AgentMetadata, EncryptedMetadata } from "./inft/metadata";

// Tools
export {
	createBalanceTool,
	createTransferTool,
	createSwapTool,
	createPriceQuoteTool,
} from "./tools/defi";
export {
	createSaveMemoryTool,
	createLoadMemoryTool,
	createListMemoryTool,
} from "./tools/storage";
export { createFetchWebTool, createTimeTool } from "./tools/web";

// Templates
export { createTradingAgent } from "./templates/trading-agent";
export type { TradingAgentConfig } from "./templates/trading-agent";
export { createAssistantAgent } from "./templates/assistant-agent";
export type { AssistantAgentConfig } from "./templates/assistant-agent";

// Utils
export {
	AgentConfigSchema,
	ZeroGConfigSchema,
	InferenceConfigSchema,
	loadConfigFromEnv,
} from "./utils/config";
export type { AgentConfig, ZeroGConfig, InferenceConfig } from "./utils/config";
export { encrypt, decrypt, generateEncryptionKey, hashData } from "./utils/crypto";
export { quickAgent } from "./quick";
export type { QuickAgentOptions } from "./quick";
