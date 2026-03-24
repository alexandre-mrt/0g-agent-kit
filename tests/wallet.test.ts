import { describe, expect, test } from "bun:test";
import { AgentWallet } from "../src/core/wallet";
import { ethers } from "ethers";

const TEST_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const TEST_RPC = "https://evmrpc-testnet.0g.ai";

describe("AgentWallet construction", () => {
	test("derives deterministic address from key", () => {
		const w1 = new AgentWallet(TEST_KEY, TEST_RPC);
		const w2 = new AgentWallet(TEST_KEY, TEST_RPC);
		expect(w1.address).toBe(w2.address);
		expect(w1.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
	});

	test("different keys produce different addresses", () => {
		const w1 = new AgentWallet(
			"0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
			TEST_RPC,
		);
		const w2 = new AgentWallet(
			"0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
			TEST_RPC,
		);
		expect(w1.address).not.toBe(w2.address);
	});

	test("rejects empty private key", () => {
		expect(() => new AgentWallet("", TEST_RPC)).toThrow();
	});

	test("rejects key without 0x", () => {
		expect(() => new AgentWallet("abc123", TEST_RPC)).toThrow("0x");
	});

	test("rejects empty RPC URL", () => {
		expect(() => new AgentWallet(TEST_KEY, "")).toThrow();
	});

	test("rejects non-HTTP RPC URL", () => {
		expect(() => new AgentWallet(TEST_KEY, "ws://localhost")).toThrow("URL");
	});
});

describe("AgentWallet signer and provider", () => {
	const wallet = new AgentWallet(TEST_KEY, TEST_RPC);

	test("signer has correct address", () => {
		expect(wallet.getSigner().address).toBe(wallet.address);
	});

	test("provider is connected", () => {
		const provider = wallet.getProvider();
		expect(provider).toBeTruthy();
	});

	test("address matches ethers.Wallet derivation", () => {
		const directWallet = new ethers.Wallet(TEST_KEY);
		expect(wallet.address).toBe(directWallet.address);
	});
});
