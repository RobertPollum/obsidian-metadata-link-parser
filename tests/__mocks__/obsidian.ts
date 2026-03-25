/**
 * Mock implementation of the Obsidian API for testing.
 * Only the subset of APIs actually used by this plugin is mocked.
 */

import { vi } from "vitest";

// --- Notice ---
export class Notice {
    message: string;
    constructor(message: string, _timeout?: number) {
        this.message = message;
    }
}

// --- TFile / TFolder ---
export class TFile {
    path: string;
    name: string;
    basename: string;
    extension: string;

    constructor(path: string) {
        this.path = path;
        this.name = path.split("/").pop() || path;
        this.basename = this.name.replace(/\.[^.]+$/, "");
        this.extension = this.name.includes(".") ? this.name.split(".").pop()! : "";
    }
}

export class TFolder {
    path: string;
    name: string;

    constructor(path: string) {
        this.path = path;
        this.name = path.split("/").pop() || path;
    }
}

// --- Vault ---
export class Vault {
    private files: Map<string, string> = new Map();

    /** Preload file contents for testing */
    _setFileContent(path: string, content: string): void {
        this.files.set(path, content);
    }

    _getFileContent(path: string): string | undefined {
        return this.files.get(path);
    }

    async read(file: TFile): Promise<string> {
        const content = this.files.get(file.path);
        if (content === undefined) {
            throw new Error(`File not found: ${file.path}`);
        }
        return content;
    }

    async modify(file: TFile, content: string): Promise<void> {
        this.files.set(file.path, content);
    }

    async append(file: TFile, content: string): Promise<void> {
        const existing = this.files.get(file.path) || "";
        this.files.set(file.path, existing + content);
    }

    async create(path: string, content: string): Promise<TFile> {
        this.files.set(path, content);
        return new TFile(path);
    }

    getMarkdownFiles(): TFile[] {
        return Array.from(this.files.keys())
            .filter((p) => p.endsWith(".md"))
            .map((p) => new TFile(p));
    }
}

// --- Workspace ---
export class Workspace {
    private activeFile: TFile | null = null;

    _setActiveFile(file: TFile | null): void {
        this.activeFile = file;
    }

    getActiveFile(): TFile | null {
        return this.activeFile;
    }

    on(_event: string, _callback: (...args: any[]) => void): { unload(): void } {
        return { unload: () => {} };
    }
}

// --- App ---
export class App {
    vault: Vault;
    workspace: Workspace;
    plugins: any;

    constructor() {
        this.vault = new Vault();
        this.workspace = new Workspace();
        this.plugins = { plugins: {} };
    }
}

// --- Plugin ---
export class Plugin {
    app: App;
    private data: any = {};

    constructor(app?: App) {
        this.app = app || new App();
    }

    async loadData(): Promise<any> {
        return this.data;
    }

    async saveData(data: any): Promise<void> {
        this.data = data;
    }

    /** Test helper to seed plugin data */
    _setData(data: any): void {
        this.data = data;
    }

    addCommand(_cmd: any): void {}
    addSettingTab(_tab: any): void {}
    addRibbonIcon(_icon: string, _title: string, _callback: () => void): void {}
    registerEvent(_event: any): void {}
}

// --- Frontmatter helpers ---

/**
 * Minimal reimplementation of Obsidian's getFrontMatterInfo.
 * Parses YAML frontmatter delimited by --- lines.
 */
export function getFrontMatterInfo(content: string): {
    exists: boolean;
    from: number;
    to: number;
    contentStart?: number;
} {
    const trimmed = content;
    if (!trimmed.startsWith("---")) {
        return { exists: false, from: 0, to: 0 };
    }

    const endIndex = trimmed.indexOf("---", 3);
    if (endIndex === -1) {
        return { exists: false, from: 0, to: 0 };
    }

    // from = start of YAML content (after first ---\n)
    const from = trimmed.indexOf("\n", 0) + 1;
    // to = end of YAML content (before closing ---)
    const to = endIndex;
    // contentStart = after the closing ---\n
    const contentStart = trimmed.indexOf("\n", endIndex) + 1;

    return { exists: true, from, to, contentStart };
}

/**
 * Minimal YAML parser for frontmatter.
 * Handles simple key: value, arrays with "  - item", and quoted strings.
 */
export function parseYaml(yaml: string): Record<string, any> | null {
    if (!yaml || !yaml.trim()) {
        return null;
    }

    const result: Record<string, any> = {};
    const lines = yaml.split("\n");
    let currentKey: string | null = null;
    let currentArray: string[] | null = null;

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine === "---") {
            continue;
        }

        // Array item
        if (trimmedLine.startsWith("- ") && currentKey) {
            if (!currentArray) {
                currentArray = [];
            }
            currentArray.push(trimmedLine.substring(2).trim());
            continue;
        }

        // Save previous array
        if (currentKey && currentArray) {
            result[currentKey] = currentArray;
            currentArray = null;
        }

        // Key: value pair
        const colonIndex = trimmedLine.indexOf(":");
        if (colonIndex === -1) {
            continue;
        }

        const key = trimmedLine.substring(0, colonIndex).trim();
        let value: any = trimmedLine.substring(colonIndex + 1).trim();

        currentKey = key;

        if (value === "" || value === undefined) {
            // Could be start of array or empty value
            continue;
        }

        if (value === "[]") {
            result[key] = [];
            currentKey = null;
            continue;
        }

        // Remove surrounding quotes
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }

        // Parse booleans
        if (value === "true") {
            value = true;
        } else if (value === "false") {
            value = false;
        // Parse null
        } else if (value === "null") {
            value = null;
        // Parse numbers
        } else if (!isNaN(Number(value)) && value !== "") {
            value = Number(value);
        }

        result[key] = value;
        currentKey = key;
    }

    // Save trailing array
    if (currentKey && currentArray) {
        result[currentKey] = currentArray;
    }

    return result;
}

// --- requestUrl ---
export const requestUrl = vi.fn().mockResolvedValue({ status: 200 });

// --- Editor ---
export class Editor {
    private content = "";

    replaceSelection(text: string): void {
        this.content += text;
    }

    getSelection(): string {
        return this.content;
    }
}

// --- MarkdownView ---
export class MarkdownView {
    file: TFile | null = null;
}

// --- Menu ---
export class Menu {
    addItem(_callback: (item: any) => void): void {}
}
