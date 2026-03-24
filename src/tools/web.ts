import type { ToolDefinition } from "../core/inference";

/**
 * Creates a tool for fetching web pages (read-only).
 */
export function createFetchWebTool(): ToolDefinition {
	return {
		name: "fetch_web_page",
		description: "Fetch a web page and return its text content. Useful for getting prices, news, or documentation.",
		parameters: {
			type: "object",
			properties: {
				url: { type: "string", description: "URL to fetch" },
				maxLength: { type: "number", description: "Max characters to return (default 5000)" },
			},
			required: ["url"],
		},
		execute: async (args) => {
			const { url, maxLength = 5000 } = args as { url: string; maxLength?: number };

			const response = await fetch(url, {
				headers: { "User-Agent": "0G-Agent-Kit/0.1.0" },
				signal: AbortSignal.timeout(10000),
			});

			if (!response.ok) {
				return JSON.stringify({
					success: false,
					error: `HTTP ${response.status}: ${response.statusText}`,
				});
			}

			const text = await response.text();
			const truncated = text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

			return JSON.stringify({
				success: true,
				url,
				contentLength: text.length,
				content: truncated,
			});
		},
	};
}

/**
 * Creates a tool for getting current time/date.
 */
export function createTimeTool(): ToolDefinition {
	return {
		name: "get_current_time",
		description: "Get the current date and time in UTC.",
		parameters: {
			type: "object",
			properties: {},
		},
		execute: async () => {
			const now = new Date();
			return JSON.stringify({
				iso: now.toISOString(),
				unix: Math.floor(now.getTime() / 1000),
				readable: now.toUTCString(),
			});
		},
	};
}
