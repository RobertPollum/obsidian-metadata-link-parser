import { describe, it, expect, vi, beforeEach } from "vitest";
import { App, TFile } from "../tests/__mocks__/obsidian";
import { MetadataLinkParser } from "../src/parse-metadata-link";
import { NoteService } from "../src/ReadItLaterStubs";

/**
 * Build a set of realistic RSS-style markdown files in the mock vault.
 * Mimics what the old test-vault/RSS/ directory used to contain.
 */
function seedRssFiles(vault: App["vault"]): string[] {
    const files: Array<{ path: string; content: string }> = [
        // Well-formed file with link and title
        {
            path: "RSS/tech-blog.md",
            content: [
                "---",
                "title: Understanding Rust's Borrow Checker",
                "link: https://example.com/rust-borrow-checker",
                "author: Jane Doe",
                "published: 2025-03-15",
                "tags:",
                "  - rust",
                "  - programming",
                "---",
                "",
                "Notes about the article go here.",
            ].join("\n"),
        },
        // File using 'url' field instead of 'link'
        {
            path: "RSS/data-science.md",
            content: [
                "---",
                "title: Machine Learning at Scale",
                "url: https://example.com/ml-at-scale",
                "author: John Smith",
                "---",
                "",
                "Interesting read on distributed training.",
            ].join("\n"),
        },
        // File using 'source' field
        {
            path: "RSS/devops-weekly.md",
            content: [
                "---",
                "title: DevOps Weekly Roundup",
                "source: https://example.com/devops-weekly-42",
                "published: 2025-06-01",
                "---",
                "",
                "Weekly newsletter summary.",
            ].join("\n"),
        },
        // File with URL only in body content
        {
            path: "RSS/quick-link.md",
            content: [
                "---",
                "title: Quick Link",
                "tags:",
                "  - bookmark",
                "---",
                "",
                "Check out https://example.com/interesting-article for more.",
            ].join("\n"),
        },
        // File with no URL at all
        {
            path: "RSS/empty-feed.md",
            content: [
                "---",
                "title: Empty Feed Item",
                "published: 2025-01-01",
                "---",
                "",
                "This file has no URL to process.",
            ].join("\n"),
        },
        // File with markdown link in body
        {
            path: "RSS/markdown-link.md",
            content: [
                "---",
                "title: Referenced Article",
                "---",
                "",
                "See [this article](https://example.com/referenced-article) for context.",
            ].join("\n"),
        },
    ];

    const paths: string[] = [];
    for (const { path, content } of files) {
        vault._setFileContent(path, content);
        paths.push(path);
    }
    return paths;
}

/**
 * Seed files in a nested subfolder (RSS/CBN) for folder-level tests.
 */
function seedCbnFiles(vault: App["vault"]): string[] {
    const files: Array<{ path: string; content: string }> = [
        {
            path: "RSS/CBN/article-1.md",
            content: [
                "---",
                "title: CBN Article One",
                "link: https://example.com/cbn/one",
                "author: CBN Author",
                "---",
                "",
                "First CBN article.",
            ].join("\n"),
        },
        {
            path: "RSS/CBN/article-2.md",
            content: [
                "---",
                "title: CBN Article Two",
                "link: https://example.com/cbn/two",
                "---",
                "",
                "Second CBN article.",
            ].join("\n"),
        },
        {
            path: "RSS/CBN/article-3.md",
            content: [
                "---",
                "title: CBN Article Three",
                "link: https://example.com/cbn/three",
                "article_processed: true",
                "---",
                "",
                "Already processed.",
            ].join("\n"),
        },
    ];

    const paths: string[] = [];
    for (const { path, content } of files) {
        vault._setFileContent(path, content);
        paths.push(path);
    }
    return paths;
}

/**
 * Helper: build a NoteService backed by the mock App with network stubbed out.
 */
function createTestNoteService(app: App): NoteService {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ns = new NoteService(app as any);
    vi.spyOn(ns, "getMarkdownContent").mockResolvedValue(
        "---\nauthor: Fetched Author\n---\n\n# Fetched Article\n\nFull article body content for testing.",
    );
    return ns;
}

describe("Integration: test-vault", () => {
    let app: App;
    let noteService: NoteService;
    let parser: MetadataLinkParser;

    beforeEach(() => {
        app = new App();
        noteService = createTestNoteService(app);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        parser = new MetadataLinkParser(app as any, noteService);
    });

    // ── Frontmatter URL extraction across RSS-style files ──────────

    describe("frontmatter URL extraction on RSS-style files", () => {
        it("extracts URLs from all well-formed RSS files in a folder", async () => {
            seedRssFiles(app.vault);

            const createNoteSpy = vi.spyOn(noteService, "createNote").mockResolvedValue();

            await parser.processFolderFiles("RSS");

            // All files except empty-feed.md have URLs
            // (5 out of 6 files have URLs: tech-blog, data-science, devops-weekly, quick-link, markdown-link)
            expect(createNoteSpy).toHaveBeenCalledTimes(5);
        });

        it("handles files with 'link' frontmatter field", async () => {
            app.vault._setFileContent("RSS/test.md", [
                "---",
                "title: Test",
                "link: https://example.com/test-link",
                "---",
                "",
                "Body.",
            ].join("\n"));

            const createNoteSpy = vi.spyOn(noteService, "createNote").mockResolvedValue();
            const file = new TFile("RSS/test.md");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await parser.processFile(file as any);

            expect(createNoteSpy).toHaveBeenCalledWith("https://example.com/test-link");
        });

        it("handles files with 'url' frontmatter field", async () => {
            app.vault._setFileContent("RSS/test.md", [
                "---",
                "title: Test",
                "url: https://example.com/test-url",
                "---",
                "",
                "Body.",
            ].join("\n"));

            const createNoteSpy = vi.spyOn(noteService, "createNote").mockResolvedValue();
            const file = new TFile("RSS/test.md");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await parser.processFile(file as any);

            expect(createNoteSpy).toHaveBeenCalledWith("https://example.com/test-url");
        });

        it("handles files with 'source' frontmatter field", async () => {
            app.vault._setFileContent("RSS/test.md", [
                "---",
                "title: Test",
                "source: https://example.com/test-source",
                "---",
                "",
                "Body.",
            ].join("\n"));

            const createNoteSpy = vi.spyOn(noteService, "createNote").mockResolvedValue();
            const file = new TFile("RSS/test.md");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await parser.processFile(file as any);

            expect(createNoteSpy).toHaveBeenCalledWith("https://example.com/test-source");
        });

        it("falls back to body content when no frontmatter URL exists", async () => {
            app.vault._setFileContent("RSS/test.md", [
                "---",
                "title: No URL in frontmatter",
                "---",
                "",
                "Read more at https://example.com/body-url",
            ].join("\n"));

            const createNoteSpy = vi.spyOn(noteService, "createNote").mockResolvedValue();
            const file = new TFile("RSS/test.md");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await parser.processFile(file as any);

            expect(createNoteSpy).toHaveBeenCalledWith("https://example.com/body-url");
        });

        it("skips files that have no URL at all", async () => {
            app.vault._setFileContent("RSS/test.md", [
                "---",
                "title: No URL",
                "published: 2025-01-01",
                "---",
                "",
                "Just some text.",
            ].join("\n"));

            const createNoteSpy = vi.spyOn(noteService, "createNote").mockResolvedValue();
            const file = new TFile("RSS/test.md");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await parser.processFile(file as any);

            expect(createNoteSpy).not.toHaveBeenCalled();
        });
    });

    // ── End-to-end: batch folder processing ────────────────────────

    describe("end-to-end processing with mock network", () => {
        it("processFileAndAppend appends content and preserves frontmatter", async () => {
            app.vault._setFileContent("RSS/test.md", [
                "---",
                "title: My Article",
                "link: https://example.com/append-test",
                "author: Original Author",
                "---",
                "",
                "My personal notes about this article.",
            ].join("\n"));

            const file = new TFile("RSS/test.md");
            const originalContent = app.vault._getFileContent(file.path)!;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await parser.processFileAndAppend(file as any);

            const updatedContent = app.vault._getFileContent(file.path)!;

            // Content was appended
            expect(updatedContent.length).toBeGreaterThan(originalContent.length);
            expect(updatedContent).toContain("## Retrieved Article Content");
            expect(updatedContent).toContain("Full article body content for testing.");

            // Original frontmatter preserved
            expect(updatedContent).toContain("My Article");
            expect(updatedContent).toContain("Original Author");
            expect(updatedContent).toContain("My personal notes");
        });

        it("processFolderFilesAndAppend processes multiple files in a subfolder", async () => {
            seedCbnFiles(app.vault);

            await parser.processFolderFilesAndAppend("RSS/CBN");

            const allFiles = app.vault.getMarkdownFiles();
            const cbnFiles = allFiles.filter((f) => f.path.startsWith("RSS/CBN"));
            const processedFiles = cbnFiles.filter((f) => {
                const content = app.vault._getFileContent(f.path);
                return content && content.includes("## Retrieved Article Content");
            });

            // 3 files total: 2 unprocessed get content, 1 already-processed is skipped
            expect(processedFiles.length).toBe(2);
        });

        it("skips already-processed files during batch folder processing", async () => {
            seedCbnFiles(app.vault);

            await parser.processFolderFilesAndAppend("RSS/CBN");

            // article-3 was pre-marked as processed, should not have been appended
            const processedFile = app.vault._getFileContent("RSS/CBN/article-3.md");
            expect(processedFile).not.toContain("## Retrieved Article Content");
        });

        it("marks files as processed after successful batch append", async () => {
            app.vault._setFileContent("RSS/fresh.md", [
                "---",
                "title: Fresh Article",
                "link: https://example.com/fresh",
                "---",
                "",
                "Body.",
            ].join("\n"));

            await parser.processFolderFilesAndAppend("RSS");

            const content = app.vault._getFileContent("RSS/fresh.md");
            expect(content).toContain("article_processed: true");
        });

        it("handles empty folders gracefully", async () => {
            // No files in this path — should not throw
            await expect(
                parser.processFolderFilesAndAppend("RSS/NonExistent"),
            ).resolves.toBeUndefined();
        });
    });

    // ── Frontmatter integrity ───────────────────────────────────────

    describe("frontmatter integrity after processing", () => {
        it("preserves existing frontmatter fields when appending", async () => {
            app.vault._setFileContent("RSS/rich.md", [
                "---",
                "title: Rich Frontmatter File",
                "link: https://example.com/rich",
                "author: Original Author",
                "published: 2025-02-10",
                "tags:",
                "  - important",
                "  - reference",
                "---",
                "",
                "Notes before fetching.",
            ].join("\n"));

            const file = new TFile("RSS/rich.md");

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await parser.processFileAndAppend(file as any);

            const updated = app.vault._getFileContent(file.path)!;

            // All original fields should still be present
            expect(updated).toContain("title: Rich Frontmatter File");
            expect(updated).toContain("link: https://example.com/rich");
            expect(updated).toContain("author: Original Author");
            expect(updated).toContain("published: 2025-02-10");
            expect(updated).toContain("- important");
            expect(updated).toContain("- reference");
            expect(updated).toContain("Notes before fetching.");

            // Fetched metadata (author: Fetched Author) should NOT overwrite existing
            expect(updated).toContain("author: Original Author");
            expect(updated).not.toMatch(/author: Fetched Author/);
        });

        it("merges fetched metadata keys that don't already exist", async () => {
            app.vault._setFileContent("RSS/sparse.md", [
                "---",
                "title: Sparse Frontmatter",
                "link: https://example.com/sparse",
                "---",
                "",
                "Minimal metadata.",
            ].join("\n"));

            vi.spyOn(noteService, "getMarkdownContent").mockResolvedValue(
                "---\nauthor: New Author\npublished: 2025-06-15\ndescription: A great read\n---\n\n# Article\n\nBody.",
            );

            const file = new TFile("RSS/sparse.md");

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await parser.processFileAndAppend(file as any);

            const updated = app.vault._getFileContent(file.path)!;

            // Original fields preserved
            expect(updated).toContain("title: Sparse Frontmatter");

            // New fields from fetched metadata merged in
            expect(updated).toContain("author: New Author");
            expect(updated).toContain("published: 2025-06-15");
            expect(updated).toContain("description: A great read");
        });
    });
});
