import { describe, expect, test } from "bun:test";

describe("Package version", () => {
	test("version is semver format", () => {
		const pkg = require("../package.json");
		expect(pkg.version).toMatch(/^\d+\.\d+\.\d+$/);
		expect(pkg.name).toBe("0g-agent-kit");
	});

	test("has required package fields", () => {
		const pkg = require("../package.json");
		expect(pkg).toHaveProperty("description");
		expect(pkg).toHaveProperty("license", "MIT");
		expect(pkg).toHaveProperty("dependencies");
		expect(pkg.description.length).toBeGreaterThan(10);
	});

	test("has ethers and zod as dependencies", () => {
		const pkg = require("../package.json");
		expect(pkg.dependencies).toHaveProperty("ethers");
		expect(pkg.dependencies).toHaveProperty("zod");
	});
});
