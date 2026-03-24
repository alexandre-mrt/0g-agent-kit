import { describe, expect, test } from "bun:test";

describe("Package version", () => {
	test("version is semver format", () => {
		const pkg = require("../package.json");
		expect(pkg.version).toMatch(/^\d+\.\d+\.\d+$/);
		expect(pkg.name).toBe("0g-agent-kit");
	});
});
