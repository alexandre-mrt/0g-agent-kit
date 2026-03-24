import { describe, expect, test } from "bun:test";
import { mintINFT, getINFTOwner } from "../src/inft/mint";
import { transferINFT, authorizeUsage, cloneINFT } from "../src/inft/transfer";
import { AgentWallet } from "../src/core/wallet";
import { Agent } from "../src/core/agent";
import { ZeroGInference } from "../src/core/inference";
import { LocalMemory } from "../src/core/memory";

const TEST_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const wallet = new AgentWallet(TEST_KEY, "https://evmrpc-testnet.0g.ai");
const memory = new LocalMemory();
const inference = new ZeroGInference({
	endpoint: "https://api.example.com",
	model: "test",
	maxTokens: 100,
	temperature: 0.5,
});

const agent = new Agent(
	{ name: "TestMintAgent", description: "For mint testing", model: "test", maxIterations: 1, temperature: 0 },
	{ memory, wallet, inference },
);

describe("mintINFT validation", () => {
	test("rejects missing contract address", async () => {
		expect(
			mintINFT(wallet, {
				contractAddress: "",
				agent,
				capabilities: ["trade"],
			}),
		).rejects.toThrow("contractAddress");
	});

	test("rejects invalid contract address", async () => {
		expect(
			mintINFT(wallet, {
				contractAddress: "not_an_address",
				agent,
				capabilities: ["trade"],
			}),
		).rejects.toThrow("0x");
	});

	test("rejects empty capabilities", async () => {
		expect(
			mintINFT(wallet, {
				contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
				agent,
				capabilities: [],
			}),
		).rejects.toThrow("capability");
	});
});

describe("transferINFT", () => {
	test("function exists and is callable", () => {
		expect(typeof transferINFT).toBe("function");
	});
});

describe("authorizeUsage", () => {
	test("function exists and is callable", () => {
		expect(typeof authorizeUsage).toBe("function");
	});
});

describe("cloneINFT", () => {
	test("function exists and is callable", () => {
		expect(typeof cloneINFT).toBe("function");
	});
});

describe("getINFTOwner", () => {
	test("function exists and is callable", () => {
		expect(typeof getINFTOwner).toBe("function");
	});
});
