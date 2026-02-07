import { App, TFile, Notice, getFrontMatterInfo, parseYaml } from 'obsidian';
import { ReadItLaterApi, NoteService } from './ReadItLaterStubs';
import { UrlTransformer } from './url-transformer/url-transformer';
import { TransformationConfig } from './url-transformer/transformation-types';

/**
 * Script to extract metadata link from an Obsidian markdown file
 * and parse it using the ReadItLater plugin
 */
export class MetadataLinkParser {
    private app: App;
    private readItLaterApi: ReadItLaterApi;
    private urlTransformer: UrlTransformer | null = null;
    private transformationConfig: TransformationConfig | null = null;

    constructor(app: App, noteService: NoteService) {
        this.app = app;
        this.readItLaterApi = new ReadItLaterApi(noteService);
    }

    setTransformationConfig(config: TransformationConfig): void {
        this.transformationConfig = config;
        this.urlTransformer = new UrlTransformer(
            config.proxyHealthCacheTtlMinutes,
            config.proxyHealthTimeoutMs
        );
    }

    /**
     * Serialize a value to YAML format
     * Handles arrays, strings with special characters, and other types
     */
    private serializeYamlValue(key: string, value: any): string {
        if (Array.isArray(value)) {
            if (value.length === 0) {
                return `${key}: []`;
            }
            const items = value.map(item => `  - ${item}`).join('\n');
            return `${key}:\n${items}`;
        }
        
        if (typeof value === 'string' && (value.includes(':') || value.includes('#') || value.includes('\n'))) {
            return `${key}: "${value.replace(/"/g, '\\"')}"`;
        }
        
        if (typeof value === 'boolean' || typeof value === 'number') {
            return `${key}: ${value}`;
        }
        
        if (value === null || value === undefined) {
            return `${key}: null`;
        }
        
        return `${key}: ${value}`;
    }

    /**
     * Check if a file has already been processed
     * Looks for 'article_processed: true' in frontmatter
     */
    private async isFileProcessed(file: TFile): Promise<boolean> {
        try {
            const content = await this.app.vault.read(file);
            const frontMatterInfo = getFrontMatterInfo(content);
            
            if (!frontMatterInfo.exists) {
                return false;
            }

            const frontmatterText = content.substring(
                frontMatterInfo.from,
                frontMatterInfo.to
            );

            const frontmatter = parseYaml(frontmatterText);
            return frontmatter?.article_processed === true;
        } catch (error) {
            console.error('Error checking if file is processed:', error);
            return false;
        }
    }

    /**
     * Mark a file as processed by adding 'article_processed: true' to frontmatter
     */
    private async markFileAsProcessed(file: TFile): Promise<void> {
        try {
            const content = await this.app.vault.read(file);
            const frontMatterInfo = getFrontMatterInfo(content);
            
            if (!frontMatterInfo.exists) {
                // Add new frontmatter
                const newContent = `---\narticle_processed: true\n---\n\n${content}`;
                await this.app.vault.modify(file, newContent);
            } else {
                // Update existing frontmatter
                const frontmatterText = content.substring(
                    frontMatterInfo.from,
                    frontMatterInfo.to
                );
                const frontmatter = parseYaml(frontmatterText);
                
                // Only add if not already present
                if (frontmatter?.article_processed !== true) {
                    const updatedFrontmatter = { ...frontmatter, article_processed: true };
                    const yamlLines = Object.entries(updatedFrontmatter)
                        .map(([key, value]) => this.serializeYamlValue(key, value));
                    const newFrontmatter = `---\n${yamlLines.join('\n')}\n---\n`;
                    
                    const afterFrontmatter = content.substring(frontMatterInfo.contentStart ?? frontMatterInfo.to);
                    const newContent = newFrontmatter + afterFrontmatter;
                    
                    await this.app.vault.modify(file, newContent);
                }
            }
        } catch (error) {
            console.error('Error marking file as processed:', error);
        }
    }

    /**
     * Extract URL from file's frontmatter metadata
     * Supports both 'url', 'link', and 'source' fields
     */
    private extractUrlFromFrontmatter(fileContent: string): string | null {
        const frontMatterInfo = getFrontMatterInfo(fileContent);
        
        if (!frontMatterInfo.exists) {
            return null;
        }

        const frontmatterText = fileContent.substring(
            frontMatterInfo.from,
            frontMatterInfo.to
        );

        try {
            const frontmatter = parseYaml(frontmatterText);
            
            // Check common URL field names
            const urlFields = ['url', 'link', 'source', 'web_url', 'article_url'];
            for (const field of urlFields) {
                if (frontmatter && frontmatter[field]) {
                    return frontmatter[field];
                }
            }
        } catch (error) {
            console.error('Error extracting URL from frontmatter:', error);
        }

        return null;
    }

    /**
     * Extract URL from markdown content (first link found)
     */
    private extractUrlFromContent(content: string): string | null {
        // Match markdown links [text](url)
        const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
        const match = content.match(markdownLinkRegex);
        
        if (match && match[2]) {
            return match[2];
        }

        // Match plain URLs
        const urlRegex = /(https?:\/\/[^\s]+)/;
        const urlMatch = content.match(urlRegex);
        
        if (urlMatch && urlMatch[1]) {
            return urlMatch[1];
        }

        return null;
    }

    /**
     * Transform URL using configured transformation rules
     * Returns the transformed URL or null if proxy is down
     */
    private async transformUrlIfNeeded(url: string): Promise<{ url: string | null; originalUrl: string; appliedRule?: string; error?: string }> {
        if (!this.urlTransformer || !this.transformationConfig) {
            return { url, originalUrl: url };
        }

        const result = await this.urlTransformer.transformUrl(url, this.transformationConfig.rules);
        
        return {
            url: result.transformedUrl,
            originalUrl: result.originalUrl,
            appliedRule: result.appliedRule,
            error: result.error
        };
    }

    /**
     * Update file frontmatter with proxy information
     */
    private async updateFrontmatterWithProxyInfo(file: TFile, originalUrl: string, proxiedUrl: string, proxyRule: string): Promise<void> {
        try {
            const content = await this.app.vault.read(file);
            const frontMatterInfo = getFrontMatterInfo(content);
            
            if (!frontMatterInfo.exists) {
                const newFrontmatter = `---\noriginal_url: ${originalUrl}\nproxied_url: ${proxiedUrl}\nproxy_rule: "${proxyRule}"\n---\n\n`;
                const newContent = newFrontmatter + content;
                await this.app.vault.modify(file, newContent);
            } else {
                const frontmatterText = content.substring(
                    frontMatterInfo.from,
                    frontMatterInfo.to
                );
                const frontmatter = parseYaml(frontmatterText);
                
                const updatedFrontmatter = {
                    ...frontmatter,
                    original_url: originalUrl,
                    proxied_url: proxiedUrl,
                    proxy_rule: proxyRule
                };
                
                const yamlLines = Object.entries(updatedFrontmatter)
                    .map(([key, value]) => this.serializeYamlValue(key, value));
                const newFrontmatter = `---\n${yamlLines.join('\n')}\n---\n`;
                
                const afterFrontmatter = content.substring(frontMatterInfo.contentStart ?? frontMatterInfo.to);
                const newContent = newFrontmatter + afterFrontmatter;
                
                await this.app.vault.modify(file, newContent);
            }
        } catch (error) {
            console.error('Error updating frontmatter with proxy info:', error);
        }
    }

    /**
     * Process a file: extract URL and fetch article information via ReadItLater
     * Creates a new note with the article content
     */
    async processFile(file: TFile): Promise<void> {
        try {
            const content = await this.app.vault.read(file);
            
            // Try to extract URL from frontmatter first
            let url = this.extractUrlFromFrontmatter(content);
            
            // If not found in frontmatter, try content
            if (!url) {
                url = this.extractUrlFromContent(content);
            }

            if (!url) {
                new Notice(`No URL found in file: ${file.name}`);
                console.warn(`No URL found in file: ${file.path}`);
                return;
            }

            const transformResult = await this.transformUrlIfNeeded(url);
            
            if (!transformResult.url) {
                new Notice(`Proxy unavailable: ${transformResult.appliedRule}. Skipping article: ${file.name}`);
                console.warn(`Skipping ${file.path} - ${transformResult.error}`);
                return;
            }

            const urlToProcess = transformResult.url;

            new Notice(`Processing URL: ${urlToProcess}`);
            console.log(`Extracted URL from ${file.path}: ${transformResult.originalUrl}`);
            if (transformResult.appliedRule) {
                console.log(`Applied transformation: ${transformResult.appliedRule}`);
            }

            await this.readItLaterApi.processContent(urlToProcess);
            
            new Notice(`Successfully processed article from: ${urlToProcess}`);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            new Notice(`Error processing file: ${errorMessage}`);
            console.error(`Error processing file ${file.path}:`, error);
        }
    }

    /**
     * Process a file and append the retrieved article content to the existing file
     * instead of creating a new note.
     * Uses ReadItLater plugin's parser if available for better markdown generation.
     * 
     * @param file - The file to process
     * @param checkProcessed - If true, checks if file was already processed (for batch operations)
     */
    async processFileAndAppend(file: TFile, checkProcessed: boolean = false): Promise<void> {
        try {
            // Check if already processed (only in batch mode)
            if (checkProcessed && await this.isFileProcessed(file)) {
                console.log(`Skipping already processed file: ${file.path}`);
                return;
            }

            const content = await this.app.vault.read(file);
            
            // Try to extract URL from frontmatter first
            let url = this.extractUrlFromFrontmatter(content);
            
            // If not found in frontmatter, try content
            if (!url) {
                url = this.extractUrlFromContent(content);
            }

            if (!url) {
                new Notice(`No URL found in file: ${file.name}`);
                console.warn(`No URL found in file: ${file.path}`);
                return;
            }

            const transformResult = await this.transformUrlIfNeeded(url);
            
            if (!transformResult.url) {
                new Notice(`Proxy unavailable: ${transformResult.appliedRule}. Skipping article: ${file.name}`);
                console.warn(`Skipping ${file.path} - ${transformResult.error}`);
                return;
            }

            const urlToFetch = transformResult.url;
            const originalUrl = transformResult.originalUrl;

            new Notice(`Fetching and parsing article from: ${urlToFetch}`);
            console.log(`Extracted URL from ${file.path}: ${originalUrl}`);
            if (transformResult.appliedRule) {
                console.log(`Applied transformation: ${transformResult.appliedRule}`);
            }

            const articleMarkdown = await this.readItLaterApi.getMarkdownContent(urlToFetch);
            
            if (!articleMarkdown) {
                new Notice(`Failed to fetch content from: ${urlToFetch}`);
                return;
            }

            if (transformResult.appliedRule) {
                await this.updateFrontmatterWithProxyInfo(file, originalUrl, urlToFetch, transformResult.appliedRule);
            }

            const separator = '\n\n---\n\n## Retrieved Article Content\n\n';
            const contentToAppend = separator + articleMarkdown;
            
            await this.app.vault.append(file, contentToAppend);
            
            if (checkProcessed) {
                await this.markFileAsProcessed(file);
            }
            
            new Notice(`Successfully appended article content to: ${file.name}`);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            new Notice(`Error processing file: ${errorMessage}`);
            console.error(`Error processing file ${file.path}:`, error);
        }
    }


    /**
     * Process all files in a folder
     */
    async processFolderFiles(folderPath: string): Promise<void> {
        const files = this.app.vault.getMarkdownFiles().filter(
            (file: TFile) => file.path.startsWith(folderPath)
        );

        if (files.length === 0) {
            new Notice(`No markdown files found in: ${folderPath}`);
            return;
        }

        new Notice(`Processing ${files.length} files...`);

        for (const file of files) {
            await this.processFile(file);
        }

        new Notice(`Completed processing ${files.length} files`);
    }

    /**
     * Process current active file and create a new note
     */
    async processActiveFile(): Promise<void> {
        const activeFile = this.app.workspace.getActiveFile();
        
        if (!activeFile) {
            new Notice('No active file found');
            return;
        }

        await this.processFile(activeFile);
    }

    /**
     * Process current active file and append content to it
     */
    async processActiveFileAndAppend(): Promise<void> {
        const activeFile = this.app.workspace.getActiveFile();
        
        if (!activeFile) {
            new Notice('No active file found');
            return;
        }

        await this.processFileAndAppend(activeFile);
    }

    /**
     * Process all files in a folder and append content to each
     * Skips files that have already been processed (have article_processed: true)
     */
    async processFolderFilesAndAppend(folderPath: string): Promise<void> {
        const files = this.app.vault.getMarkdownFiles().filter(
            (file: TFile) => file.path.startsWith(folderPath)
        );

        if (files.length === 0) {
            new Notice(`No markdown files found in: ${folderPath}`);
            return;
        }

        new Notice(`Processing ${files.length} files...`);

        let processedCount = 0;
        let skippedCount = 0;

        for (const file of files) {
            const wasProcessed = await this.isFileProcessed(file);
            if (wasProcessed) {
                skippedCount++;
            } else {
                processedCount++;
            }
            // Pass checkProcessed: true to enable tracking
            await this.processFileAndAppend(file, true);
        }

        new Notice(`Completed: ${processedCount} processed, ${skippedCount} skipped (already processed)`);
    }

    /**
     * Get the body content length (excluding frontmatter)
     */
    private getBodyContentLength(fileContent: string): number {
        const frontMatterInfo = getFrontMatterInfo(fileContent);
        if (frontMatterInfo.exists) {
            return fileContent.substring(frontMatterInfo.to).trim().length;
        }
        return fileContent.trim().length;
    }

    /**
     * Auto-process a file only if fetched content is significantly longer
     * than existing content. Used for scheduled background processing.
     */
    async autoProcessFileIfLonger(file: TFile, minContentRatio: number): Promise<boolean> {
        try {
            if (await this.isFileProcessed(file)) {
                return false;
            }

            const content = await this.app.vault.read(file);
            const existingBodyLength = this.getBodyContentLength(content);

            let url = this.extractUrlFromFrontmatter(content);
            if (!url) {
                url = this.extractUrlFromContent(content);
            }

            if (!url) {
                return false;
            }

            const transformResult = await this.transformUrlIfNeeded(url);
            if (!transformResult.url) {
                return false;
            }

            const articleMarkdown = await this.readItLaterApi.getMarkdownContent(transformResult.url);
            if (!articleMarkdown) {
                return false;
            }

            const fetchedLength = articleMarkdown.length;
            const ratio = existingBodyLength > 0 ? fetchedLength / existingBodyLength : fetchedLength;

            if (ratio >= minContentRatio) {
                if (transformResult.appliedRule) {
                    await this.updateFrontmatterWithProxyInfo(file, transformResult.originalUrl, transformResult.url, transformResult.appliedRule);
                }

                const separator = '\n\n---\n\n## Retrieved Article Content\n\n';
                await this.app.vault.append(file, separator + articleMarkdown);
                await this.markFileAsProcessed(file);
                
                console.log(`Auto-processed ${file.path}: ratio ${ratio.toFixed(2)} >= ${minContentRatio}`);
                return true;
            }

            return false;
        } catch (error) {
            console.error(`Error auto-processing ${file.path}:`, error);
            return false;
        }
    }

    /**
     * Auto-process all files in a folder based on content length comparison
     */
    async autoProcessFolder(folderPath: string, minContentRatio: number): Promise<{ processed: number; skipped: number }> {
        const files = this.app.vault.getMarkdownFiles().filter(
            (file: TFile) => file.path.startsWith(folderPath)
        );

        let processed = 0;
        let skipped = 0;

        for (const file of files) {
            const wasProcessed = await this.autoProcessFileIfLonger(file, minContentRatio);
            if (wasProcessed) {
                processed++;
            } else {
                skipped++;
            }
        }

        return { processed, skipped };
    }

    /**
     * Batch process multiple URLs from a file
     * Expects URLs to be separated by newlines
     */
    async processUrlBatch(file: TFile): Promise<void> {
        try {
            const content = await this.app.vault.read(file);
            const urls = content
                .split('\n')
                .map((line: string) => line.trim())
                .filter((line: string) => line.match(/^https?:\/\//));

            if (urls.length === 0) {
                new Notice('No URLs found in file');
                return;
            }

            new Notice(`Processing ${urls.length} URLs...`);

            const transformedUrls: string[] = [];
            const skippedUrls: string[] = [];
            const downProxies = new Set<string>();

            for (const url of urls) {
                const transformResult = await this.transformUrlIfNeeded(url);
                
                if (!transformResult.url) {
                    if (transformResult.appliedRule && !downProxies.has(transformResult.appliedRule)) {
                        downProxies.add(transformResult.appliedRule);
                        new Notice(`Proxy unavailable: ${transformResult.appliedRule}. Skipping related URLs.`);
                    }
                    skippedUrls.push(url);
                    continue;
                }

                transformedUrls.push(transformResult.url);
            }

            if (transformedUrls.length === 0) {
                new Notice('All URLs skipped due to proxy unavailability');
                return;
            }

            const urlBatch = transformedUrls.join('\n');
            await this.readItLaterApi.processContentBatch(urlBatch);

            const message = skippedUrls.length > 0
                ? `Processed ${transformedUrls.length} URLs, skipped ${skippedUrls.length} due to proxy issues`
                : `Successfully processed ${transformedUrls.length} URLs`;
            
            new Notice(message);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            new Notice(`Error processing URL batch: ${errorMessage}`);
            console.error('Error processing URL batch:', error);
        }
    }
}

/**
 * Example usage function - can be called from Obsidian command palette
 * Creates a new note with the article content
 */
export async function parseMetadataLink(app: App, noteService: NoteService) {
    const parser = new MetadataLinkParser(app, noteService);
    await parser.processActiveFile();
}

/**
 * Parse metadata link and append to the existing file
 */
export async function parseMetadataLinkAndAppend(app: App, noteService: NoteService) {
    const parser = new MetadataLinkParser(app, noteService);
    await parser.processActiveFileAndAppend();
}

/**
 * Example usage for batch processing
 */
export async function parseMetadataLinksInFolder(
    app: App, 
    noteService: NoteService, 
    folderPath: string
) {
    const parser = new MetadataLinkParser(app, noteService);
    await parser.processFolderFiles(folderPath);
}
