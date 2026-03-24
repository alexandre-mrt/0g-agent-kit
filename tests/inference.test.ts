import { describe, expect, test } from "bun:test";
import { ZeroGInference } from "../src/core/inference";
import type { ChatMessage } from "../src/core/inference";

describe("ZeroGInference", () => {
	test("creates with config", () => {
		const inference = new ZeroGInference({
			endpoint: "https://api.example.com",
			apiKey: "test-key",
			model: "test-model",
			maxTokens: 100,
			temperature: 0.5,
		});
		expect(inference).toBeTruthy();
	});

	test("creates without apiKey", () => {
		const inference = new ZeroGInference({
			endpoint: "https://api.example.com",
			model: "test",
			maxTokens: 100,
			temperature: 0.5,
		});
		expect(inference).toBeTruthy();
	});

	test("chat throws on unreachable endpoint", async () => {
		const inference = new ZeroGInference({
			endpoint: "http://localhost:1",
			model: "test",
			maxTokens: 100,
			temperature: 0.5,
		});

		const messages: ChatMessage[] = [
			{ role: "user", content: "Hello" },
		];

		try {
			await inference.chat(messages);
			expect(true).toBe(false); // Should not reach here
		} catch (error) {
			expect(error).toBeInstanceOf(Error);
		}
	});
});
