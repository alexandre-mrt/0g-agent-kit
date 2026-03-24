import { describe, expect, test } from "bun:test";
import { ethers } from "ethers";

describe("ethers utilities used in SDK", () => {
	test("ethers.id hashes event signatures correctly", () => {
		const sig = ethers.id("Transfer(address,address,uint256)");
		expect(sig).toMatch(/^0x[a-f0-9]{64}$/);
		// Known Transfer event topic
		expect(sig).toBe("0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef");
	});

	test("ethers.parseEther converts correctly", () => {
		expect(ethers.parseEther("1").toString()).toBe("1000000000000000000");
		expect(ethers.parseEther("0.5").toString()).toBe("500000000000000000");
		expect(ethers.parseEther("10").toString()).toBe("10000000000000000000");
	});

	test("ethers.formatEther converts back", () => {
		expect(ethers.formatEther(1000000000000000000n)).toBe("1.0");
		expect(ethers.formatEther(500000000000000000n)).toBe("0.5");
	});

	test("ethers.toUtf8Bytes encodes strings", () => {
		const bytes = ethers.toUtf8Bytes("hello");
		expect(bytes.length).toBe(5);
	});

	test("ethers.toBigInt handles hex strings", () => {
		expect(ethers.toBigInt("0x0a")).toBe(10n);
		expect(ethers.toBigInt("0xff")).toBe(255n);
	});

	test("ethers.formatUnits for token decimals", () => {
		expect(ethers.formatUnits(1000000n, 6)).toBe("1.0"); // USDC-like
		expect(ethers.formatUnits(1000000000000000000n, 18)).toBe("1.0"); // ETH-like
	});
});
