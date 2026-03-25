import { describe, it, expect, beforeEach } from "vitest";
import { App, Plugin } from "../tests/__mocks__/obsidian";
import { TransformationConfigManager } from "../src/url-transformer/transformation-config";

describe("TransformationConfigManager", () => {
    let app: App;
    let plugin: Plugin;
    let configManager: TransformationConfigManager;

    beforeEach(() => {
        app = new App();
        plugin = new Plugin(app);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        configManager = new TransformationConfigManager(app as any, plugin as any);
    });

    // ── Default config ──────────────────────────────────────────────

    describe("getDefaultConfig", () => {
        it("returns a config with default rules", () => {
            const config = configManager.getDefaultConfig();
            expect(config.rules.length).toBeGreaterThan(0);
            expect(config.enableProxyFallback).toBe(true);
            expect(config.proxyHealthCacheTtlMinutes).toBe(5);
            expect(config.proxyHealthTimeoutMs).toBe(5000);
        });

        it("returns default auto-processing config", () => {
            const config = configManager.getDefaultConfig();
            expect(config.autoProcessing.enabled).toBe(false);
            expect(config.autoProcessing.folderPaths).toEqual([]);
            expect(config.autoProcessing.frequencyMinutes).toBe(60);
            expect(config.autoProcessing.minContentLengthRatio).toBe(2.0);
        });
    });

    // ── Load config ─────────────────────────────────────────────────

    describe("loadConfig", () => {
        it("returns default config when no data is saved", async () => {
            const config = await configManager.loadConfig();
            expect(config.rules.length).toBeGreaterThan(0);
            expect(config.enableProxyFallback).toBe(true);
        });

        it("loads and merges saved config with defaults", async () => {
            const customRule = {
                id: "custom-rule",
                name: "Custom Rule",
                enabled: true,
                matchers: ["custom.com"],
                excludeMatchers: [],
                transformationType: "prefix" as const,
                template: "https://custom/{url}",
                priority: 50,
            };

            plugin._setData({
                transformationConfig: {
                    rules: [customRule],
                    enableProxyFallback: false,
                    proxyHealthCacheTtlMinutes: 10,
                    proxyHealthTimeoutMs: 3000,
                    autoProcessing: {
                        enabled: true,
                        folderPaths: ["Articles"],
                        frequencyMinutes: 30,
                        minContentLengthRatio: 1.5,
                    },
                },
            });

            const config = await configManager.loadConfig();

            // Custom rule should be present
            expect(config.rules.find((r) => r.id === "custom-rule")).toBeTruthy();

            // Default rules that aren't in saved config should be merged in
            const defaultRuleIds = configManager.getDefaultConfig().rules.map((r) => r.id);
            for (const id of defaultRuleIds) {
                expect(config.rules.find((r) => r.id === id)).toBeTruthy();
            }

            // Custom settings should be preserved
            expect(config.enableProxyFallback).toBe(false);
            expect(config.proxyHealthCacheTtlMinutes).toBe(10);
            expect(config.autoProcessing.enabled).toBe(true);
            expect(config.autoProcessing.folderPaths).toEqual(["Articles"]);
        });

        it("migrates old folderPath to folderPaths array", async () => {
            plugin._setData({
                transformationConfig: {
                    rules: [],
                    enableProxyFallback: true,
                    autoProcessing: {
                        enabled: true,
                        folderPath: "OldFolder",
                        frequencyMinutes: 60,
                        minContentLengthRatio: 2.0,
                    },
                },
            });

            const config = await configManager.loadConfig();
            expect(config.autoProcessing.folderPaths).toEqual(["OldFolder"]);
        });

        it("adds excludeMatchers to rules that lack it", async () => {
            plugin._setData({
                transformationConfig: {
                    rules: [
                        {
                            id: "no-exclude",
                            name: "No Exclude",
                            enabled: true,
                            matchers: ["*"],
                            // excludeMatchers intentionally missing
                            transformationType: "prefix",
                            template: "https://test/{url}",
                            priority: 1,
                        },
                    ],
                    enableProxyFallback: true,
                    autoProcessing: { enabled: false, folderPaths: [], frequencyMinutes: 60, minContentLengthRatio: 2.0 },
                },
            });

            const config = await configManager.loadConfig();
            const rule = config.rules.find((r) => r.id === "no-exclude");
            expect(rule).toBeTruthy();
            expect(rule!.excludeMatchers).toEqual([]);
        });
    });

    // ── Save config ─────────────────────────────────────────────────

    describe("saveConfig", () => {
        it("persists config via plugin.saveData", async () => {
            const config = configManager.getDefaultConfig();
            await configManager.loadConfig(); // initialize
            await configManager.saveConfig(config);

            const data = await plugin.loadData();
            expect(data.transformationConfig).toBeTruthy();
            expect(data.transformationConfig.rules.length).toBeGreaterThan(0);
        });
    });

    // ── CRUD operations ─────────────────────────────────────────────

    describe("rule CRUD operations", () => {
        beforeEach(async () => {
            await configManager.loadConfig();
        });

        it("addRule adds a new rule", async () => {
            const initialCount = configManager.getConfig().rules.length;
            await configManager.addRule({
                id: "new-rule",
                name: "New Rule",
                enabled: true,
                matchers: ["new.com"],
                excludeMatchers: [],
                transformationType: "prefix",
                template: "https://new/{url}",
                priority: 1,
            });
            expect(configManager.getConfig().rules.length).toBe(initialCount + 1);
        });

        it("updateRule updates an existing rule", async () => {
            const firstRule = configManager.getConfig().rules[0];
            await configManager.updateRule(firstRule.id, { name: "Updated Name" });
            const updated = configManager.getConfig().rules.find((r) => r.id === firstRule.id);
            expect(updated!.name).toBe("Updated Name");
        });

        it("updateRule throws for non-existent rule", async () => {
            await expect(configManager.updateRule("nonexistent", { name: "X" })).rejects.toThrow("not found");
        });

        it("deleteRule removes a rule", async () => {
            const firstRule = configManager.getConfig().rules[0];
            await configManager.deleteRule(firstRule.id);
            expect(configManager.getConfig().rules.find((r) => r.id === firstRule.id)).toBeUndefined();
        });

        it("toggleRule enables/disables a rule", async () => {
            const firstRule = configManager.getConfig().rules[0];
            const originalEnabled = firstRule.enabled;
            await configManager.toggleRule(firstRule.id, !originalEnabled);
            const toggled = configManager.getConfig().rules.find((r) => r.id === firstRule.id);
            expect(toggled!.enabled).toBe(!originalEnabled);
        });

        it("reorderRules changes rule order", async () => {
            const rules = configManager.getConfig().rules;
            if (rules.length < 2) {
                return;
            }
            const reversed = [...rules.map((r) => r.id)].reverse();
            await configManager.reorderRules(reversed);
            const reordered = configManager.getConfig().rules;
            expect(reordered[0].id).toBe(reversed[0]);
        });
    });

    // ── getConfig before load ───────────────────────────────────────

    describe("getConfig before loadConfig", () => {
        it("throws if config not loaded", () => {
            expect(() => configManager.getConfig()).toThrow("Config not loaded");
        });
    });
});
