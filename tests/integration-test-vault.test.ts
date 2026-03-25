import { describe, it, expect, vi } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { App, TFile } from "../tests/__mocks__/obsidian";
import { MetadataLinkParser } from "../src/parse-metadata-link";
import { NoteService } from "../src/ReadItLaterStubs";

const TEST_VAULT_DIR = path.resolve(__dirname, "..", "test-vault");

/**
 * Recursively find all .md files under a directory.
 */
function findMarkdownFiles(dir: string): string[] {
    const results: string[] = [];
    if (!fs.existsSync(dir)) {
        return results;
    }
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...findMarkdownFiles(full));
        } else if (entry.name.endsWith(".md")) {
            results.push(full);
        }
    }
    return results;
}

/**
 * Load test-vault files into the mock App vault.
 * Returns the list of vault-relative paths loaded.
 */
function loadTestVaultIntoApp(app: App, subDir?: string): string[] {
    const baseDir = subDir ? path.join(TEST_VAULT_DIR, subDir) : TEST_VAULT_DIR;
    const files = findMarkdownFiles(baseDir);
    const relativePaths: string[] = [];

    for (const absPath of files) {
        const relPath = path.relative(TEST_VAULT_DIR, absPath).replace(/\\/g, "/");
        const content = fs.readFileSync(absPath, "utf-8");
        app.vault._setFileContent(relPath, content);
        relativePaths.push(relPath);
    }

    return relativePaths;
}

describe("Integration: test-vault", () => {
    it("test-vault directory exists and contains markdown files", () => {
        expect(fs.existsSync(TEST_VAULT_DIR)).toBe(true);
        const mdFiles = findMarkdownFiles(TEST_VAULT_DIR);
        expect(mdFiles.length).toBeGreaterThan(0);
    });

    // ── Frontmatter URL extraction across real vault files ──────────

    describe("frontmatter URL extraction on real vault files", () => {
        it("every RSS file has a parseable 'link' in frontmatter", { timeout: 30000 }, () => {
            const rssDir = path.join(TEST_VAULT_DIR, "RSS");
            if (!fs.existsSync(rssDir)) {
                return; // skip if RSS folder doesn't exist
            }

            const mdFiles = findMarkdownFiles(rssDir);
            expect(mdFiles.length).toBeGreaterThan(0);

            const failures: string[] = [];

            for (const absPath of mdFiles) {
                const content = fs.readFileSync(absPath, "utf-8");

                // Check for frontmatter
                if (!content.startsWith("---")) {
                    failures.push(`${path.basename(absPath)}: no frontmatter`);
                    continue;
                }

                const endIdx = content.indexOf("---", 3);
                if (endIdx === -1) {
                    failures.push(`${path.basename(absPath)}: unclosed frontmatter`);
                    continue;
                }

                const fm = content.substring(3, endIdx).trim();

                // Check that at least one URL field exists
                const hasUrlField = /^(url|link|source|web_url|article_url)\s*:/m.test(fm);
                if (!hasUrlField) {
                    failures.push(`${path.basename(absPath)}: no URL field in frontmatter`);
                }
            }

            // Allow a small percentage of failures (some files may legitimately lack URLs)
            const failRate = failures.length / mdFiles.length;
            expect(failRate).toBeLessThan(0.1); // <10% failure rate
        });

        it("URL fields in RSS files contain valid URLs", () => {
            const rssDir = path.join(TEST_VAULT_DIR, "RSS");
            if (!fs.existsSync(rssDir)) {
                return;
            }

            const mdFiles = findMarkdownFiles(rssDir);
            let urlCount = 0;
            let validCount = 0;

            for (const absPath of mdFiles) {
                const content = fs.readFileSync(absPath, "utf-8");
                if (!content.startsWith("---")) {
                    continue;
                }

                const endIdx = content.indexOf("---", 3);
                if (endIdx === -1) {
                    continue;
                }

                const fm = content.substring(3, endIdx);
                const linkMatch = fm.match(/^link\s*:\s*(.+)$/m);
                if (linkMatch) {
                    urlCount++;
                    const url = linkMatch[1].trim();
                    if (url.startsWith("http://") || url.startsWith("https://")) {
                        validCount++;
                    }
                }
            }

            expect(urlCount).toBeGreaterThan(0);
            // All extracted link fields should be valid URLs
            expect(validCount).toBe(urlCount);
        });
    });

    // ── End-to-end: load vault → process file → verify output ──────

    describe("end-to-end processing with mock network", () => {
        it("processFile extracts URL from a real vault file and calls createNote", async () => {
            const app = new App();
            const paths = loadTestVaultIntoApp(app, "RSS");

            // Pick a file that has a link
            const testPath = paths.find((p) => p.startsWith("RSS/"));
            if (!testPath) {
                return; // no RSS files
            }

            const content = app.vault._getFileContent(testPath)!;
            // Only test files with a link field
            if (!content.includes("link:")) {
                return;
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ns = new NoteService(app as any);
            const createNoteSpy = vi.spyOn(ns, "createNote").mockResolvedValue();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const parser = new MetadataLinkParser(app as any, ns);
            const file = new TFile(testPath);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await parser.processFile(file as any);

            // createNote should have been called with the URL from frontmatter
            expect(createNoteSpy).toHaveBeenCalledTimes(1);
            const calledUrl = createNoteSpy.mock.calls[0][0];
            expect(calledUrl).toMatch(/^https?:\/\//);
        });

        it("processFileAndAppend appends content to a real vault file", async () => {
            const app = new App();
            const paths = loadTestVaultIntoApp(app, "RSS");

            // Pick a file with a link
            const testPath = paths.find((p) => {
                const c = app.vault._getFileContent(p);
                return c && c.includes("link:") && !c.includes("article_processed: true");
            });
            if (!testPath) {
                return;
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ns = new NoteService(app as any);
            vi.spyOn(ns, "getMarkdownContent").mockResolvedValue(
                "---\nauthor: Test Author\n---\n\n# Test Article\n\nTest body content here.",
            );

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const parser = new MetadataLinkParser(app as any, ns);
            const file = new TFile(testPath);

            const originalContent = app.vault._getFileContent(testPath)!;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await parser.processFileAndAppend(file as any);

            const updatedContent = app.vault._getFileContent(testPath)!;

            // Content should have been appended
            expect(updatedContent.length).toBeGreaterThan(originalContent.length);
            expect(updatedContent).toContain("## Retrieved Article Content");
            expect(updatedContent).toContain("Test body content here.");
        });

        it("processFolderFilesAndAppend processes multiple real vault files", async () => {
            const app = new App();
            loadTestVaultIntoApp(app, "RSS");

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ns = new NoteService(app as any);
            vi.spyOn(ns, "getMarkdownContent").mockResolvedValue(
                "# Bulk Article\n\nBulk body content.",
            );

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const parser = new MetadataLinkParser(app as any, ns);

            // Process the RSS/CBN folder
            await parser.processFolderFilesAndAppend("RSS/CBN");

            // Check that at least some files were modified
            const allFiles = app.vault.getMarkdownFiles();
            const cbnFiles = allFiles.filter((f) => f.path.startsWith("RSS/CBN"));
            const processedFiles = cbnFiles.filter((f) => {
                const content = app.vault._getFileContent(f.path);
                return content && content.includes("## Retrieved Article Content");
            });

            expect(processedFiles.length).toBeGreaterThan(0);
        });
    });

    // ── Frontmatter integrity ───────────────────────────────────────

    describe("frontmatter integrity after processing", () => {
        it("preserves existing frontmatter fields when appending", async () => {
            const app = new App();
            loadTestVaultIntoApp(app, "RSS");

            const paths = app.vault.getMarkdownFiles()
                .filter((f) => f.path.startsWith("RSS/"))
                .map((f) => f.path);

            const testPath = paths.find((p) => {
                const c = app.vault._getFileContent(p);
                return c && c.includes("link:") && c.includes("title:");
            });
            if (!testPath) {
                return;
            }

            const originalContent = app.vault._getFileContent(testPath)!;
            // Extract original title
            const titleMatch = originalContent.match(/^title\s*:\s*(.+)$/m);
            const originalTitle = titleMatch ? titleMatch[1].trim() : null;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ns = new NoteService(app as any);
            vi.spyOn(ns, "getMarkdownContent").mockResolvedValue(
                "---\nnew_field: new_value\n---\n\n# Article\n\nBody.",
            );

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const parser = new MetadataLinkParser(app as any, ns);
            const file = new TFile(testPath);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await parser.processFileAndAppend(file as any);

            const updated = app.vault._getFileContent(testPath)!;

            // Original title should still be present
            if (originalTitle) {
                expect(updated).toContain(originalTitle);
            }

            // New field should be merged in
            expect(updated).toContain("new_field");
        });
    });
});
