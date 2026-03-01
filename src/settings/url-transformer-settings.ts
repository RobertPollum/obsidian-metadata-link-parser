import { App, PluginSettingTab, Setting, Notice, Modal } from "obsidian";
import { TransformationConfigManager } from "../url-transformer/transformation-config";
import { TransformationConfig, TransformationRule } from "../url-transformer/transformation-types";
import { UrlTransformer } from "../url-transformer/url-transformer";

export class UrlTransformerSettingTab extends PluginSettingTab {
    private configManager: TransformationConfigManager;
    private plugin: any;

    constructor(app: App, plugin: any, configManager: TransformationConfigManager) {
        super(app, plugin);
        this.plugin = plugin;
        this.configManager = configManager;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl("h2", { text: "URL Transformation Settings" });

        this.displayAutoProcessingSettings();
        this.displayHealthCheckSettings();
        this.displayRulesList();
        this.displayAddRuleButton();
    }

    private displayAutoProcessingSettings(): void {
        const { containerEl } = this;
        const config = this.configManager.getConfig();

        containerEl.createEl("h3", { text: "Auto Processing" });

        new Setting(containerEl)
            .setName("Enable auto processing")
            .setDesc("Automatically scan a folder and process files when fetched content is longer")
            .addToggle(toggle => toggle
                .setValue(config.autoProcessing.enabled)
                .onChange(async (value) => {
                    config.autoProcessing.enabled = value;
                    await this.configManager.saveConfig(config);
                    if (this.plugin.restartAutoProcessing) {
                        this.plugin.restartAutoProcessing();
                    }
                }));

        new Setting(containerEl)
            .setName("Watch folders")
            .setDesc("Folder paths to monitor for files with URLs");

        const foldersContainer = containerEl.createDiv({ cls: "watch-folders-container" });
        this.displayWatchFolders(foldersContainer, config);

        new Setting(containerEl)
            .setName("Check frequency (minutes)")
            .setDesc("How often to scan the folders for new content (5–360)")
            .addText(text => {
                text.inputEl.type = "number";
                text.inputEl.min = "5";
                text.inputEl.max = "360";
                text.inputEl.step = "5";
                text.inputEl.style.width = "80px";
                text.setValue(String(config.autoProcessing.frequencyMinutes))
                    .onChange(async (value) => {
                        const num = parseInt(value);
                        if (!isNaN(num) && num >= 5 && num <= 360) {
                            config.autoProcessing.frequencyMinutes = num;
                            await this.configManager.saveConfig(config);
                            if (this.plugin.restartAutoProcessing) {
                                this.plugin.restartAutoProcessing();
                            }
                        }
                    });
            });

        new Setting(containerEl)
            .setName("Minimum content ratio")
            .setDesc("Only append if fetched content is this many times longer than existing (e.g., 2.0 = twice as long, range: 1.5–10)")
            .addText(text => {
                text.inputEl.type = "number";
                text.inputEl.min = "1.5";
                text.inputEl.max = "10";
                text.inputEl.step = "0.5";
                text.inputEl.style.width = "80px";
                text.setValue(String(config.autoProcessing.minContentLengthRatio))
                    .onChange(async (value) => {
                        const num = parseFloat(value);
                        if (!isNaN(num) && num >= 1.5 && num <= 10) {
                            config.autoProcessing.minContentLengthRatio = num;
                            await this.configManager.saveConfig(config);
                        }
                    });
            });
    }

    private displayWatchFolders(container: HTMLElement, config: TransformationConfig): void {
        container.empty();

        const folderPaths = config.autoProcessing.folderPaths || [];

        for (let i = 0; i < folderPaths.length; i++) {
            const folderSetting = new Setting(container)
                .addText(text => text
                    .setValue(folderPaths[i])
                    .setPlaceholder("e.g., Articles or Inbox/RSS")
                    .onChange(async (value) => {
                        config.autoProcessing.folderPaths[i] = value;
                        await this.configManager.saveConfig(config);
                    }))
                .addButton(button => button
                    .setButtonText("Remove")
                    .setWarning()
                    .onClick(async () => {
                        config.autoProcessing.folderPaths.splice(i, 1);
                        await this.configManager.saveConfig(config);
                        this.displayWatchFolders(container, config);
                    }));
            folderSetting.settingEl.style.borderBottom = "none";
            folderSetting.settingEl.style.padding = "4px 0";
        }

        const addSetting = new Setting(container)
            .addButton(button => button
                .setButtonText("Add folder")
                .setCta()
                .onClick(async () => {
                    config.autoProcessing.folderPaths.push("");
                    await this.configManager.saveConfig(config);
                    this.displayWatchFolders(container, config);
                }));
        addSetting.settingEl.style.borderBottom = "none";
        addSetting.settingEl.style.padding = "4px 0";
    }

    private displayHealthCheckSettings(): void {
        const { containerEl } = this;
        const config = this.configManager.getConfig();

        containerEl.createEl("h3", { text: "Proxy Health Check" });

        new Setting(containerEl)
            .setName("Cache TTL (minutes)")
            .setDesc("How long to cache proxy health check results (1–30)")
            .addText(text => {
                text.inputEl.type = "number";
                text.inputEl.min = "1";
                text.inputEl.max = "30";
                text.inputEl.step = "1";
                text.inputEl.style.width = "80px";
                text.setValue(String(config.proxyHealthCacheTtlMinutes))
                    .onChange(async (value) => {
                        const num = parseInt(value);
                        if (!isNaN(num) && num >= 1 && num <= 30) {
                            config.proxyHealthCacheTtlMinutes = num;
                            await this.configManager.saveConfig(config);
                        }
                    });
            });

        new Setting(containerEl)
            .setName("Health check timeout (seconds)")
            .setDesc("Maximum time to wait for proxy health check (1–10)")
            .addText(text => {
                text.inputEl.type = "number";
                text.inputEl.min = "1";
                text.inputEl.max = "10";
                text.inputEl.step = "1";
                text.inputEl.style.width = "80px";
                text.setValue(String(config.proxyHealthTimeoutMs / 1000))
                    .onChange(async (value) => {
                        const num = parseInt(value);
                        if (!isNaN(num) && num >= 1 && num <= 10) {
                            config.proxyHealthTimeoutMs = num * 1000;
                            await this.configManager.saveConfig(config);
                        }
                    });
            });

        new Setting(containerEl)
            .setName("Test all proxies")
            .setDesc("Check the health of all enabled proxy services")
            .addButton(button => button
                .setButtonText("Test Now")
                .onClick(async () => {
                    button.setDisabled(true);
                    button.setButtonText("Testing...");

                    const transformer = new UrlTransformer(
                        config.proxyHealthCacheTtlMinutes,
                        config.proxyHealthTimeoutMs,
                    );

                    const results = await transformer.testAllProxies(config.rules);

                    let message = "Proxy Health Check Results:\n";
                    results.forEach((healthy, name) => {
                        message += `\n${name}: ${healthy ? "✓ Healthy" : "✗ Down"}`;
                    });

                    new Notice(message, 10000);

                    button.setDisabled(false);
                    button.setButtonText("Test Now");
                }));
    }

    private displayRulesList(): void {
        const { containerEl } = this;
        const config = this.configManager.getConfig();

        containerEl.createEl("h3", { text: "Transformation Rules" });

        const rulesContainer = containerEl.createDiv({ cls: "url-transformer-rules" });

        if (config.rules.length === 0) {
            rulesContainer.createEl("p", {
                text: "No transformation rules configured.",
                cls: "setting-item-description",
            });
            return;
        }

        const sortedRules = [...config.rules].sort((a, b) => b.priority - a.priority);

        for (const rule of sortedRules) {
            this.displayRule(rulesContainer, rule);
        }
    }

    private displayRule(container: HTMLElement, rule: TransformationRule): void {
        const ruleSetting = new Setting(container)
            .setName(rule.name)
            .setDesc(this.getRuleDescription(rule));

        ruleSetting.addToggle(toggle => toggle
            .setValue(rule.enabled)
            .onChange(async (value) => {
                await this.configManager.toggleRule(rule.id, value);
                new Notice(`${rule.name} ${value ? "enabled" : "disabled"}`);
            }));

        ruleSetting.addButton(button => button
            .setButtonText("Edit")
            .onClick(() => {
                this.showEditRuleModal(rule);
            }));

        const isDefaultRule = ["freedium-medium", "12ft-ladder", "archive-today"].includes(rule.id);
        if (!isDefaultRule) {
            ruleSetting.addButton(button => button
                .setButtonText("Delete")
                .setWarning()
                .onClick(async () => {
                    await this.configManager.deleteRule(rule.id);
                    new Notice(`Deleted rule: ${rule.name}`);
                    this.display();
                }));
        }
    }

    private getRuleDescription(rule: TransformationRule): string {
        const matchersText = rule.matchers.join(", ");
        const typeText = rule.transformationType === "prefix" ? "Prefix" : "Path Extraction";
        return `Type: ${typeText} | Matches: ${matchersText} | Priority: ${rule.priority}`;
    }

    private displayAddRuleButton(): void {
        const { containerEl } = this;

        new Setting(containerEl)
            .setName("Add custom rule")
            .setDesc("Create a new URL transformation rule")
            .addButton(button => button
                .setButtonText("Add Rule")
                .setCta()
                .onClick(() => {
                    this.showAddRuleModal();
                }));
    }

    private showAddRuleModal(): void {
        const modal = new RuleEditorModal(
            this.app,
            null,
            async (rule) => {
                await this.configManager.addRule(rule);
                new Notice(`Added rule: ${rule.name}`);
                this.display();
            },
        );
        modal.open();
    }

    private showEditRuleModal(rule: TransformationRule): void {
        const modal = new RuleEditorModal(
            this.app,
            rule,
            async (updatedRule) => {
                await this.configManager.updateRule(rule.id, updatedRule);
                new Notice(`Updated rule: ${updatedRule.name}`);
                this.display();
            },
        );
        modal.open();
    }
}

class RuleEditorModal extends Modal {
    private rule: TransformationRule | null;
    private onSave: (rule: TransformationRule) => void;

    private nameInput: HTMLInputElement;
    private matchersInput: HTMLTextAreaElement;
    private typeSelect: HTMLSelectElement;
    private templateInput: HTMLInputElement;
    private priorityInput: HTMLInputElement;

    constructor(app: App, rule: TransformationRule | null, onSave: (rule: TransformationRule) => void) {
        super(app);
        this.rule = rule;
        this.onSave = onSave;
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl("h2", { text: this.rule ? "Edit Rule" : "Add New Rule" });

        new Setting(contentEl)
            .setName("Rule name")
            .setDesc("Display name for this transformation rule")
            .addText(text => {
                this.nameInput = text.inputEl;
                text.setValue(this.rule?.name || "")
                    .setPlaceholder("e.g., Medium via Freedium");
            });

        new Setting(contentEl)
            .setName("URL matchers")
            .setDesc("Domain patterns to match (one per line). Use * for wildcard, *.domain.com for subdomains")
            .addTextArea(text => {
                this.matchersInput = text.inputEl;
                text.setValue(this.rule?.matchers.join("\n") || "")
                    .setPlaceholder("*.medium.com\nmedium.com");
                text.inputEl.rows = 4;
            });

        new Setting(contentEl)
            .setName("Transformation type")
            .setDesc("How to transform the URL")
            .addDropdown(dropdown => {
                this.typeSelect = dropdown.selectEl;
                dropdown
                    .addOption("prefix", "Prefix (prepend proxy URL)")
                    .addOption("path-extraction", "Path Extraction (extract and remap path)")
                    .setValue(this.rule?.transformationType || "prefix");
            });

        new Setting(contentEl)
            .setName("Template")
            .setDesc("URL template. Use {url} for full URL, {path} for path, {domain} for domain")
            .addText(text => {
                this.templateInput = text.inputEl;
                text.setValue(this.rule?.template || "")
                    .setPlaceholder("https://proxy.com/{url}");
            });

        new Setting(contentEl)
            .setName("Priority")
            .setDesc("Higher priority rules are applied first (1-1000)")
            .addText(text => {
                this.priorityInput = text.inputEl;
                text.setValue(String(this.rule?.priority || 100))
                    .setPlaceholder("100");
                text.inputEl.type = "number";
            });

        new Setting(contentEl)
            .addButton(button => button
                .setButtonText("Cancel")
                .onClick(() => this.close()))
            .addButton(button => button
                .setButtonText("Save")
                .setCta()
                .onClick(() => this.handleSave()));
    }

    private handleSave(): void {
        const name = this.nameInput.value.trim();
        const matchersText = this.matchersInput.value.trim();
        const template = this.templateInput.value.trim();
        const priority = parseInt(this.priorityInput.value) || 100;

        if (!name || !matchersText || !template) {
            new Notice("Please fill in all required fields");
            return;
        }

        const matchers = matchersText.split("\n").map(m => m.trim()).filter(m => m.length > 0);

        if (matchers.length === 0) {
            new Notice("Please provide at least one URL matcher");
            return;
        }

        const rule: TransformationRule = {
            id: this.rule?.id || `custom-${Date.now()}`,
            name,
            enabled: this.rule?.enabled ?? true,
            matchers,
            transformationType: this.typeSelect.value as any,
            template,
            priority,
        };

        this.onSave(rule);
        this.close();
    }

    onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }
}
