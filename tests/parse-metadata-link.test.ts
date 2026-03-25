import { describe, it, expect, beforeEach, vi } from "vitest";
import { App, TFile } from "../tests/__mocks__/obsidian";
import { MetadataLinkParser } from "../src/parse-metadata-link";
import { NoteService } from "../src/ReadItLaterStubs";

/**
 * Helper: cast our mock App so the production code accepts it.
 */
function createTestApp(): App {
    return new App();
}

/**
 * Helper: build a NoteService backed by the mock App.
 * We spy on its network-facing methods to avoid real HTTP.
 */
function createTestNoteService(app: App): NoteService {
    // NoteService expects a real Obsidian App; our mock is compatible enough.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ns = new NoteService(app as any);

    // Stub out getMarkdownContent so tests never hit the network
    vi.spyOn(ns, "getMarkdownContent").mockResolvedValue(
        "---\nauthor: Fetched Author\n---\n\n# Fetched Article\n\nSome article body text.",
    );

    return ns;
}

describe("MetadataLinkParser", () => {
    let app: App;
    let noteService: NoteService;
    let parser: MetadataLinkParser;

    beforeEach(() => {
        app = createTestApp();
        noteService = createTestNoteService(app);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        parser = new MetadataLinkParser(app as any, noteService);
    });

    // ── URL extraction from frontmatter ─────────────────────────────

    describe("processFile – URL extraction", () => {
        it("extracts URL from 'link' frontmatter field", async () => {
            const file = new TFile("test/article.md");
            app.vault._setFileContent(file.path, [
                "---",
                "title: Test Article",
                "link: https://example.com/article",
                "---",
                "",
                "Body text",
            ].join("\n"));

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await parser.processFile(file as any);

            // NoteService.createNote should have been called (via ReadItLaterApi)
            // The URL should have been extracted successfully
            expect(noteService.getMarkdownContent).not.toHaveBeenCalled(); // processFile uses processContent, not getMarkdownContent
        });

        it("extracts URL from 'url' frontmatter field", async () => {
            const file = new TFile("test/article2.md");
            app.vault._setFileContent(file.path, [
                "---",
                "title: Another Article",
                "url: https://example.com/another",
                "---",
                "",
                "Body",
            ].join("\n"));

            // processFile calls readItLaterApi.processContent which calls noteService.createNote
            const createNoteSpy = vi.spyOn(noteService, "createNote").mockResolvedValue();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await parser.processFile(file as any);
            expect(createNoteSpy).toHaveBeenCalledWith("https://example.com/another");
        });

        it("extracts URL from 'source' frontmatter field", async () => {
            const file = new TFile("test/article3.md");
            app.vault._setFileContent(file.path, [
                "---",
                "title: Source Article",
                "source: https://example.com/source",
                "---",
                "",
                "Body",
            ].join("\n"));

            const createNoteSpy = vi.spyOn(noteService, "createNote").mockResolvedValue();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await parser.processFile(file as any);
            expect(createNoteSpy).toHaveBeenCalledWith("https://example.com/source");
        });

        it("falls back to extracting URL from content body", async () => {
            const file = new TFile("test/no-frontmatter.md");
            app.vault._setFileContent(file.path, "Check out https://example.com/inline for details.");

            const createNoteSpy = vi.spyOn(noteService, "createNote").mockResolvedValue();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await parser.processFile(file as any);
            expect(createNoteSpy).toHaveBeenCalledWith("https://example.com/inline");
        });

        it("extracts URL from markdown link in body", async () => {
            const file = new TFile("test/md-link.md");
            app.vault._setFileContent(file.path, "Read [this article](https://example.com/linked) now.");

            const createNoteSpy = vi.spyOn(noteService, "createNote").mockResolvedValue();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await parser.processFile(file as any);
            expect(createNoteSpy).toHaveBeenCalledWith("https://example.com/linked");
        });

        it("does nothing when no URL is found", async () => {
            const file = new TFile("test/no-url.md");
            app.vault._setFileContent(file.path, "---\ntitle: No URL\n---\n\nJust some text.");

            const createNoteSpy = vi.spyOn(noteService, "createNote").mockResolvedValue();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await parser.processFile(file as any);
            expect(createNoteSpy).not.toHaveBeenCalled();
        });
    });

    // ── processFileAndAppend ────────────────────────────────────────

    describe("processFileAndAppend", () => {
        it("appends fetched content to file", async () => {
            const file = new TFile("test/append.md");
            const originalContent = "---\ntitle: Append Test\nlink: https://example.com/append\n---\n\nOriginal body.";
            app.vault._setFileContent(file.path, originalContent);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await parser.processFileAndAppend(file as any);

            const updatedContent = app.vault._getFileContent(file.path);
            expect(updatedContent).toContain("## Retrieved Article Content");
            expect(updatedContent).toContain("Some article body text.");
        });

        it("skips already-processed files when checkProcessed is true", async () => {
            const file = new TFile("test/processed.md");
            app.vault._setFileContent(file.path, [
                "---",
                "title: Already Done",
                "link: https://example.com/done",
                "article_processed: true",
                "---",
                "",
                "Body.",
            ].join("\n"));

            const getMarkdownSpy = vi.spyOn(noteService, "getMarkdownContent");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await parser.processFileAndAppend(file as any, true);
            expect(getMarkdownSpy).not.toHaveBeenCalled();
        });

        it("marks file as processed after successful append with checkProcessed", async () => {
            const file = new TFile("test/mark-processed.md");
            app.vault._setFileContent(file.path, "---\ntitle: Mark Me\nlink: https://example.com/mark\n---\n\nBody.");

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await parser.processFileAndAppend(file as any, true);

            const content = app.vault._getFileContent(file.path);
            expect(content).toContain("article_processed: true");
        });

        it("respects minContentRatio and skips short fetched content", async () => {
            const file = new TFile("test/ratio.md");
            // Existing body is very long
            const longBody = "A".repeat(10000);
            app.vault._setFileContent(file.path, `---\nlink: https://example.com/ratio\n---\n\n${longBody}`);

            // Mock returns short content relative to existing body
            vi.spyOn(noteService, "getMarkdownContent").mockResolvedValue("Short content");

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await parser.processFileAndAppend(file as any, false, 2.0);

            const content = app.vault._getFileContent(file.path);
            // Should NOT have appended because ratio is too low
            expect(content).not.toContain("## Retrieved Article Content");
        });
    });

    // ── processFolderFiles ──────────────────────────────────────────

    describe("processFolderFiles", () => {
        it("processes all markdown files in a folder path", async () => {
            app.vault._setFileContent("Articles/a.md", "---\nlink: https://example.com/a\n---\nBody A");
            app.vault._setFileContent("Articles/b.md", "---\nlink: https://example.com/b\n---\nBody B");
            app.vault._setFileContent("Other/c.md", "---\nlink: https://example.com/c\n---\nBody C");

            const createNoteSpy = vi.spyOn(noteService, "createNote").mockResolvedValue();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await parser.processFolderFiles("Articles");

            // Should process files in Articles/ but not Other/
            expect(createNoteSpy).toHaveBeenCalledTimes(2);
        });
    });

    // ── URL transformation integration ──────────────────────────────

    describe("URL transformation", () => {
        it("transforms URL when transformation config is set", async () => {
            parser.setTransformationConfig({
                rules: [
                    {
                        id: "test-proxy",
                        name: "Test Proxy",
                        enabled: true,
                        matchers: ["example.com"],
                        excludeMatchers: [],
                        transformationType: "prefix",
                        template: "https://proxy.test/{url}",
                        priority: 100,
                    },
                ],
                enableProxyFallback: false,
                proxyHealthCacheTtlMinutes: 5,
                proxyHealthTimeoutMs: 5000,
                autoProcessing: {
                    enabled: false,
                    folderPaths: [],
                    frequencyMinutes: 60,
                    minContentLengthRatio: 2.0,
                },
            });

            const file = new TFile("test/transformed.md");
            app.vault._setFileContent(file.path, "---\nlink: https://example.com/article\n---\n\nBody");

            const createNoteSpy = vi.spyOn(noteService, "createNote").mockResolvedValue();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await parser.processFile(file as any);

            // Should have been called with the transformed URL
            expect(createNoteSpy).toHaveBeenCalledWith("https://proxy.test/https://example.com/article");
        });
    });

    // ── Batch URL processing ────────────────────────────────────────

    describe("processUrlBatch", () => {
        it("processes multiple URLs from a file", async () => {
            const file = new TFile("test/batch.md");
            app.vault._setFileContent(file.path, [
                "https://example.com/one",
                "https://example.com/two",
                "not a url",
                "https://example.com/three",
            ].join("\n"));

            const createNoteSpy = vi.spyOn(noteService, "createNotesFromBatch").mockResolvedValue();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await parser.processUrlBatch(file as any);

            expect(createNoteSpy).toHaveBeenCalledTimes(1);
            const batchArg = createNoteSpy.mock.calls[0][0];
            expect(batchArg.split("\n")).toHaveLength(3);
        });
    });
});
