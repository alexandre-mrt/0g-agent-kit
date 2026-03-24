import { describe, expect, test } from "bun:test";
import { ethers } from "ethers";

describe("INFT ABI consistency", () => {
	const INFT_ABI = [
		"function mint(address to, bytes memory encryptedMetadata, bytes32 metadataHash) external returns (uint256)",
		"function ownerOf(uint256 tokenId) external view returns (address)",
		"function tokenURI(uint256 tokenId) external view returns (string)",
		"function totalSupply() external view returns (uint256)",
		"event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
	];

	test("ABI is parseable by ethers", () => {
		const iface = new ethers.Interface(INFT_ABI);
		expect(iface).toBeTruthy();
	});

	test("mint function has correct signature", () => {
		const iface = new ethers.Interface(INFT_ABI);
		const mint = iface.getFunction("mint");
		expect(mint).toBeTruthy();
		expect(mint!.inputs.length).toBe(3);
		expect(mint!.inputs[0].type).toBe("address");
		expect(mint!.inputs[1].type).toBe("bytes");
		expect(mint!.inputs[2].type).toBe("bytes32");
	});

	test("ownerOf is a view function", () => {
		const iface = new ethers.Interface(INFT_ABI);
		const ownerOf = iface.getFunction("ownerOf");
		expect(ownerOf).toBeTruthy();
		expect(ownerOf!.stateMutability).toBe("view");
	});

	test("Transfer event has 3 indexed params", () => {
		const iface = new ethers.Interface(INFT_ABI);
		const transfer = iface.getEvent("Transfer");
		expect(transfer).toBeTruthy();
		expect(transfer!.inputs.length).toBe(3);
		expect(transfer!.inputs[0].indexed).toBe(true);
		expect(transfer!.inputs[1].indexed).toBe(true);
		expect(transfer!.inputs[2].indexed).toBe(true);
	});
});

describe("Transfer ABI consistency", () => {
	const TRANSFER_ABI = [
		"function transfer(address from, address to, uint256 tokenId, bytes memory newEncryptedMetadata, bytes memory proof) external",
		"function authorizeUsage(uint256 tokenId, address user, uint256 expiry) external",
		"function clone(uint256 tokenId, address to) external returns (uint256)",
	];

	test("transfer function has 5 params", () => {
		const iface = new ethers.Interface(TRANSFER_ABI);
		const transfer = iface.getFunction("transfer");
		expect(transfer).toBeTruthy();
		expect(transfer!.inputs.length).toBe(5);
	});

	test("authorizeUsage has tokenId, user, expiry", () => {
		const iface = new ethers.Interface(TRANSFER_ABI);
		const auth = iface.getFunction("authorizeUsage");
		expect(auth).toBeTruthy();
		expect(auth!.inputs[0].name).toBe("tokenId");
		expect(auth!.inputs[1].name).toBe("user");
		expect(auth!.inputs[2].name).toBe("expiry");
	});

	test("clone returns uint256", () => {
		const iface = new ethers.Interface(TRANSFER_ABI);
		const clone = iface.getFunction("clone");
		expect(clone).toBeTruthy();
		expect(clone!.outputs.length).toBe(1);
		expect(clone!.outputs[0].type).toBe("uint256");
	});
});
