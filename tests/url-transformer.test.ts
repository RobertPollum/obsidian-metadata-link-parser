import { describe, it, expect, beforeEach } from "vitest";
import { UrlTransformer } from "../src/url-transformer/url-transformer";
import { TransformationRule } from "../src/url-transformer/transformation-types";
import { getDefaultTransformationRules } from "../src/url-transformer/default-templates";

function makeRule(overrides: Partial<TransformationRule> = {}): TransformationRule {
    return {
        id: "test-rule",
        name: "Test Rule",
        enabled: true,
        matchers: ["*"],
        excludeMatchers: [],
        transformationType: "prefix",
        template: "https://proxy.example.com/{url}",
        priority: 100,
        ...overrides,
    };
}

describe("UrlTransformer", () => {
    let transformer: UrlTransformer;

    beforeEach(() => {
        transformer = new UrlTransformer(5, 5000);
    });

    // ── Pattern matching ────────────────────────────────────────────

    describe("pattern matching via transformUrl", () => {
        it("should match wildcard '*' rule to any URL", async () => {
            const rule = makeRule({ matchers: ["*"] });
            const result = await transformer.transformUrl("https://example.com/article", [rule]);
            expect(result.appliedRule).toBe("Test Rule");
            expect(result.transformedUrl).toBe("https://proxy.example.com/https://example.com/article");
        });

        it("should match exact hostname", async () => {
            const rule = makeRule({ matchers: ["example.com"] });
            const result = await transformer.transformUrl("https://example.com/page", [rule]);
            expect(result.appliedRule).toBe("Test Rule");
        });

        it("should NOT match different hostname", async () => {
            const rule = makeRule({ matchers: ["other.com"] });
            const result = await transformer.transformUrl("https://example.com/page", [rule]);
            expect(result.appliedRule).toBeUndefined();
            expect(result.transformedUrl).toBe("https://example.com/page");
        });

        it("should match wildcard subdomain pattern '*.medium.com'", async () => {
            const rule = makeRule({ matchers: ["*.medium.com"] });

            const sub = await transformer.transformUrl("https://blog.medium.com/post", [rule]);
            expect(sub.appliedRule).toBe("Test Rule");

            const root = await transformer.transformUrl("https://medium.com/post", [rule]);
            expect(root.appliedRule).toBe("Test Rule");
        });

        it("should NOT match unrelated domain with subdomain wildcard", async () => {
            const rule = makeRule({ matchers: ["*.medium.com"] });
            const result = await transformer.transformUrl("https://notmedium.com/page", [rule]);
            expect(result.appliedRule).toBeUndefined();
        });

        it("should skip disabled rules", async () => {
            const rule = makeRule({ enabled: false, matchers: ["*"] });
            const result = await transformer.transformUrl("https://example.com", [rule]);
            expect(result.appliedRule).toBeUndefined();
        });

        it("should respect excludeMatchers", async () => {
            const rule = makeRule({
                matchers: ["*"],
                excludeMatchers: ["excluded.com"],
            });
            const included = await transformer.transformUrl("https://ok.com/page", [rule]);
            expect(included.appliedRule).toBe("Test Rule");

            const excluded = await transformer.transformUrl("https://excluded.com/page", [rule]);
            expect(excluded.appliedRule).toBeUndefined();
        });
    });

    // ── Transformation types ────────────────────────────────────────

    describe("transformation types", () => {
        it("prefix: replaces {url} in template", async () => {
            const rule = makeRule({
                transformationType: "prefix",
                template: "https://12ft.io/{url}",
            });
            const result = await transformer.transformUrl("https://paywall.com/article", [rule]);
            expect(result.transformedUrl).toBe("https://12ft.io/https://paywall.com/article");
        });

        it("path-extraction: replaces {url}, {path}, {domain}", async () => {
            const rule = makeRule({
                transformationType: "path-extraction",
                template: "https://proxy.com/{domain}{path}",
                matchers: ["*"],
            });
            const result = await transformer.transformUrl("https://example.com/foo/bar?q=1#sec", [rule]);
            expect(result.transformedUrl).toBe("https://proxy.com/example.com/foo/bar?q=1#sec");
        });
    });

    // ── Rule priority / ordering ────────────────────────────────────

    describe("rule ordering", () => {
        it("should use first matching rule in list order", async () => {
            const rules: TransformationRule[] = [
                makeRule({ id: "r1", name: "First", matchers: ["*"], template: "https://first/{url}" }),
                makeRule({ id: "r2", name: "Second", matchers: ["*"], template: "https://second/{url}" }),
            ];
            const result = await transformer.transformUrl("https://example.com", rules);
            expect(result.appliedRule).toBe("First");
            expect(result.transformedUrl).toBe("https://first/https://example.com");
        });

        it("should skip disabled first rule and use second", async () => {
            const rules: TransformationRule[] = [
                makeRule({ id: "r1", name: "Disabled", enabled: false, matchers: ["*"], template: "https://first/{url}" }),
                makeRule({ id: "r2", name: "Active", matchers: ["*"], template: "https://second/{url}" }),
            ];
            const result = await transformer.transformUrl("https://example.com", rules);
            expect(result.appliedRule).toBe("Active");
        });
    });

    // ── No matching rules ───────────────────────────────────────────

    describe("no matching rules", () => {
        it("returns original URL unchanged when no rules match", async () => {
            const result = await transformer.transformUrl("https://example.com/page", []);
            expect(result.transformedUrl).toBe("https://example.com/page");
            expect(result.originalUrl).toBe("https://example.com/page");
            expect(result.proxyHealthy).toBe(true);
            expect(result.appliedRule).toBeUndefined();
        });
    });

    // ── Default templates ───────────────────────────────────────────

    describe("default templates", () => {
        it("getDefaultTransformationRules returns valid rules", () => {
            const rules = getDefaultTransformationRules();
            expect(rules.length).toBeGreaterThan(0);
            for (const rule of rules) {
                expect(rule.id).toBeTruthy();
                expect(rule.name).toBeTruthy();
                expect(rule.matchers.length).toBeGreaterThan(0);
                expect(rule.template).toContain("{url}");
            }
        });

        it("Freedium rule matches medium.com subdomains", async () => {
            const rules = getDefaultTransformationRules().map((r) => ({
                ...r,
                enabled: true,
            }));
            const freediumRule = rules.find((r) => r.id === "freedium-medium")!;
            // Only test with the single freedium rule
            const result = await transformer.transformUrl("https://blog.medium.com/my-post", [freediumRule]);
            expect(result.appliedRule).toBe("Medium via Freedium");
            expect(result.transformedUrl).toContain("freedium");
        });
    });

    // ── Cache ───────────────────────────────────────────────────────

    describe("clearCache", () => {
        it("does not throw", () => {
            expect(() => transformer.clearCache()).not.toThrow();
        });
    });
});
