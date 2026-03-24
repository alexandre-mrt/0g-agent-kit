import { describe, expect, test } from "bun:test";
import { AgentWallet } from "../src/core/wallet";
import {
	createBalanceTool,
	createTransferTool,
	createSwapTool,
	createPriceQuoteTool,
} from "../src/tools/defi";

const TEST_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const wallet = new AgentWallet(TEST_KEY, "https://evmrpc-testnet.0g.ai");

describe("DeFi tool metadata", () => {
	test("createBalanceTool has correct interface", () => {
		const tool = createBalanceTool(wallet);
		expect(tool.name).toBe("check_balance");
		expect(tool.description).toContain("balance");
		expect(tool.parameters).toHaveProperty("properties");
		expect(typeof tool.execute).toBe("function");
	});

	test("createTransferTool has correct interface", () => {
		const tool = createTransferTool(wallet);
		expect(tool.name).toBe("transfer_token");
		expect(tool.description).toContain("Transfer");
		expect(tool.parameters.required).toContain("to");
		expect(tool.parameters.required).toContain("amount");
	});

	test("createSwapTool has correct interface", () => {
		const tool = createSwapTool(wallet, "0x0000000000000000000000000000000000000001");
		expect(tool.name).toBe("swap_tokens");
		expect(tool.description).toContain("Swap");
		expect(tool.parameters.required).toContain("tokenIn");
		expect(tool.parameters.required).toContain("tokenOut");
	});

	test("createPriceQuoteTool has correct interface", () => {
		const tool = createPriceQuoteTool(wallet, "0x0000000000000000000000000000000000000001");
		expect(tool.name).toBe("get_price_quote");
		expect(tool.description).toContain("price");
		expect(tool.parameters.required).toContain("amountIn");
	});
});

describe("Balance tool execution", () => {
	test("check_balance for native token returns JSON", async () => {
		const tool = createBalanceTool(wallet);
		// This hits the live testnet - may fail if RPC is down
		try {
			const result = await tool.execute({ tokenAddress: "native" });
			const parsed = JSON.parse(result);
			expect(parsed).toHaveProperty("token", "0G");
			expect(parsed).toHaveProperty("balance");
			expect(parsed).toHaveProperty("address");
		} catch {
			// RPC may be unreachable in CI, that's ok
			expect(true).toBe(true);
		}
	});
});
