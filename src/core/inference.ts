import type { InferenceConfig } from "../utils/config";

export interface ChatMessage {
	role: "system" | "user" | "assistant" | "tool";
	content: string;
	name?: string;
	tool_call_id?: string;
}

export interface ToolDefinition {
	name: string;
	description: string;
	parameters: Record<string, unknown>;
	execute: (args: Record<string, unknown>) => Promise<string>;
}

export interface ToolCall {
	id: string;
	name: string;
	arguments: Record<string, unknown>;
}

export interface InferenceResponse {
	content: string | null;
	toolCalls: ToolCall[];
	usage?: { promptTokens: number; completionTokens: number };
}

export class ZeroGInference {
	private readonly endpoint: string;
	private readonly apiKey: string;
	private readonly model: string;
	private readonly maxTokens: number;
	private readonly temperature: number;

	constructor(config: InferenceConfig) {
		this.endpoint = config.endpoint;
		this.apiKey = config.apiKey ?? "";
		this.model = config.model;
		this.maxTokens = config.maxTokens;
		this.temperature = config.temperature;
	}

	async chat(
		messages: ChatMessage[],
		tools?: ToolDefinition[],
	): Promise<InferenceResponse> {
		const body: Record<string, unknown> = {
			model: this.model,
			messages,
			max_tokens: this.maxTokens,
			temperature: this.temperature,
		};

		if (tools && tools.length > 0) {
			body.tools = tools.map((t) => ({
				type: "function",
				function: {
					name: t.name,
					description: t.description,
					parameters: t.parameters,
				},
			}));
		}

		const response = await fetch(`${this.endpoint}/v1/chat/completions`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`Inference request failed (${response.status}): ${error}`);
		}

		const data = (await response.json()) as {
			choices: Array<{
				message: {
					content: string | null;
					tool_calls?: Array<{
						id: string;
						function: { name: string; arguments: string };
					}>;
				};
			}>;
			usage?: { prompt_tokens: number; completion_tokens: number };
		};

		const choice = data.choices[0];
		if (!choice) {
			throw new Error("No response from inference API");
		}

		const toolCalls: ToolCall[] =
			choice.message.tool_calls?.map((tc) => ({
				id: tc.id,
				name: tc.function.name,
				arguments: JSON.parse(tc.function.arguments) as Record<string, unknown>,
			})) ?? [];

		return {
			content: choice.message.content,
			toolCalls,
			usage: data.usage
				? {
						promptTokens: data.usage.prompt_tokens,
						completionTokens: data.usage.completion_tokens,
					}
				: undefined,
		};
	}
}
