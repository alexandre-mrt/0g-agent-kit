import { z } from "zod";

export const AgentConfigSchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
	model: z.string().default("meta-llama/llama-3.1-70b"),
	systemPrompt: z.string().optional(),
	maxIterations: z.number().int().positive().default(10),
	temperature: z.number().min(0).max(2).default(0.7),
});

export type AgentConfig = z.infer<typeof AgentConfigSchema>;

export const ZeroGConfigSchema = z.object({
	evmRpc: z.string().url().default("https://evmrpc-testnet.0g.ai"),
	indexerRpc: z.string().url(),
	privateKey: z.string().min(1),
});

export type ZeroGConfig = z.infer<typeof ZeroGConfigSchema>;

export const InferenceConfigSchema = z.object({
	endpoint: z.string().url(),
	apiKey: z.string().optional(),
	model: z.string().default("meta-llama/llama-3.1-70b"),
	maxTokens: z.number().int().positive().default(4096),
	temperature: z.number().min(0).max(2).default(0.7),
});

export type InferenceConfig = z.infer<typeof InferenceConfigSchema>;

export function loadConfigFromEnv(): {
	zeroG: ZeroGConfig;
	inference: InferenceConfig;
} {
	return {
		zeroG: ZeroGConfigSchema.parse({
			evmRpc: process.env.ZG_EVM_RPC,
			indexerRpc: process.env.ZG_INDEXER_RPC,
			privateKey: process.env.ZG_PRIVATE_KEY,
		}),
		inference: InferenceConfigSchema.parse({
			endpoint: process.env.INFERENCE_ENDPOINT || "https://inference.0g.ai",
			apiKey: process.env.INFERENCE_API_KEY,
			model: process.env.INFERENCE_MODEL,
		}),
	};
}
