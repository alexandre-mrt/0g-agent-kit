import { describe, expect, test } from "bun:test";
import { ethers } from "ethers";

describe("Wallet address format", () => {
	const key = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

	test("address is checksummed", () => {
		const wallet = new ethers.Wallet(key);
		expect(wallet.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
		expect(wallet.address).toBe(ethers.getAddress(wallet.address));
	});

	test("address is 42 chars", () => {
		const wallet = new ethers.Wallet(key);
		expect(wallet.address.length).toBe(42);
	});
});
