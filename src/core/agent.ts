import type { AgentConfig } from "../utils/config";
import type { ChatMessage, ToolDefinition, ZeroGInference } from "./inference";
import type { MemoryProvider } from "./memory";
import type { AgentWallet } from "./wallet";

export interface AgentRunResult {
	output: string;
	toolCalls: Array<{ tool: string; args: Record<string, unknown>; result: string }>;
	iterations: number;
	tokensUsed: { prompt: number; completion: number };
}

export interface AgentContext {
	memory: MemoryProvider;
	wallet: AgentWallet;
	inference: ZeroGInference;
}

/**
 * Core Agent class. Orchestrates LLM inference with tool execution
 * in an agentic loop, backed by 0G infrastructure.
 */
export class Agent {
	readonly name: string;
	readonly description: string;
	private readonly model: string;
	private readonly systemPrompt: string;
	private readonly maxIterations: number;
	private readonly temperature: number;

	private readonly memory: MemoryProvider;
	private readonly wallet: AgentWallet;
	private readonly inference: ZeroGInference;
	private readonly tools: ToolDefinition[];

	private conversationHistory: ChatMessage[] = [];

	constructor(
		config: AgentConfig,
		context: AgentContext,
		tools: ToolDefinition[] = [],
	) {
		this.name = config.name;
		this.description = config.description ?? "";
		this.model = config.model;
		this.systemPrompt = config.systemPrompt ?? this.defaultSystemPrompt();
		this.maxIterations = config.maxIterations;
		this.temperature = config.temperature;

		this.memory = context.memory;
		this.wallet = context.wallet;
		this.inference = context.inference;
		this.tools = tools;
	}

	private defaultSystemPrompt(): string {
		return `You are ${this.name}, an autonomous AI agent running on the 0G decentralized network.
${this.description ? `Your purpose: ${this.description}` : ""}
You have access to tools for interacting with the blockchain, managing files, and performing DeFi operations.
Think step by step. Use tools when needed. Be concise and precise.`;
	}

	/**
	 * Run the agent with a user message.
	 * Executes an agentic loop: inference -> tool calls -> inference -> ... until done.
	 */
	async run(userMessage: string): Promise<AgentRunResult> {
		const messages: ChatMessage[] = [
			{ role: "system", content: this.systemPrompt },
			...this.conversationHistory,
			{ role: "user", content: userMessage },
		];

		const toolCallLog: AgentRunResult["toolCalls"] = [];
		let totalPrompt = 0;
		let totalCompletion = 0;
		let iterations = 0;

		while (iterations < this.maxIterations) {
			iterations++;

			const response = await this.inference.chat(messages, this.tools);

			if (response.usage) {
				totalPrompt += response.usage.promptTokens;
				totalCompletion += response.usage.completionTokens;
			}

			// If no tool calls, we have the final response
			if (response.toolCalls.length === 0) {
				const output = response.content ?? "";

				this.conversationHistory.push(
					{ role: "user", content: userMessage },
					{ role: "assistant", content: output },
				);

				return {
					output,
					toolCalls: toolCallLog,
					iterations,
					tokensUsed: { prompt: totalPrompt, completion: totalCompletion },
				};
			}

			// Add assistant message with tool calls
			messages.push({
				role: "assistant",
				content: response.content ?? "",
			});

			// Execute each tool call
			for (const tc of response.toolCalls) {
				const tool = this.tools.find((t) => t.name === tc.name);
				let result: string;

				if (!tool) {
					result = `Error: Tool '${tc.name}' not found`;
				} else {
					try {
						result = await tool.execute(tc.arguments);
					} catch (error) {
						result = `Error: ${error instanceof Error ? error.message : String(error)}`;
					}
				}

				toolCallLog.push({ tool: tc.name, args: tc.arguments, result });

				messages.push({
					role: "tool",
					content: result,
					tool_call_id: tc.id,
				});
			}
		}

		// Max iterations reached
		const lastMessage = messages.at(-1);
		const output =
			lastMessage?.role === "assistant"
				? lastMessage.content
				: `Agent reached max iterations (${this.maxIterations})`;

		return {
			output,
			toolCalls: toolCallLog,
			iterations,
			tokensUsed: { prompt: totalPrompt, completion: totalCompletion },
		};
	}

	/**
	 * Save the agent's conversation history and state to memory.
	 */
	async saveState(sessionId: string): Promise<string> {
		return this.memory.save(`agent-state:${sessionId}`, {
			name: this.name,
			history: this.conversationHistory,
			savedAt: Date.now(),
		});
	}

	/**
	 * Restore agent state from memory.
	 */
	async loadState(sessionId: string): Promise<void> {
		const state = (await this.memory.load(`agent-state:${sessionId}`)) as {
			history: ChatMessage[];
		} | null;

		if (state?.history) {
			this.conversationHistory = state.history;
		}
	}

	/**
	 * Clear conversation history.
	 */
	resetHistory(): void {
		this.conversationHistory = [];
	}

	getWallet(): AgentWallet {
		return this.wallet;
	}

	getMemory(): MemoryProvider {
		return this.memory;
	}
}
