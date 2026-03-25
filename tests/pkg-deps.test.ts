import { describe, expect, test } from "bun:test";
describe("Package deps", () => {
	const pkg = require("../package.json");
	test("has 0g-ts-sdk", () => { expect(pkg.dependencies["@0gfoundation/0g-ts-sdk"]).toBeDefined(); });
	test("has ethers", () => { expect(pkg.dependencies.ethers).toBeDefined(); });
});
