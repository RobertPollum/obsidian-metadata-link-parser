import { requestUrl } from "obsidian";
import { TransformationRule, TransformationResult, ProxyHealthCache } from "./transformation-types";

const TEST_URL = "https://example.com/test";

export class UrlTransformer {
    private healthCache: ProxyHealthCache = {};
    private cacheTtlMs: number;
    private timeoutMs: number;

    constructor(cacheTtlMinutes = 5, timeoutMs = 5000) {
        this.cacheTtlMs = cacheTtlMinutes * 60 * 1000;
        this.timeoutMs = timeoutMs;
    }

    private matchesPattern(url: string, pattern: string): boolean {
        try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname;

            if (pattern === "*") {
                return true;
            }

            if (pattern.startsWith("*.")) {
                const domain = pattern.substring(2);
                return hostname === domain || hostname.endsWith("." + domain);
            }

            return hostname === pattern;
        } catch (error) {
            console.error("Error matching pattern:", error);
            return false;
        }
    }

    private matchesRule(url: string, rule: TransformationRule): boolean {
        if (!rule.enabled) {
            return false;
        }

        const included = rule.matchers.some(matcher => this.matchesPattern(url, matcher));
        if (!included) {
            return false;
        }

        if (rule.excludeMatchers && rule.excludeMatchers.length > 0) {
            const excluded = rule.excludeMatchers.some(matcher => this.matchesPattern(url, matcher));
            if (excluded) {
                return false;
            }
        }

        return true;
    }

    private findMatchingRules(url: string, rules: TransformationRule[]): TransformationRule[] {
        const matchingRules = rules.filter(rule => this.matchesRule(url, rule));
        matchingRules.sort((a, b) => b.priority - a.priority);
        return matchingRules;
    }

    private applyTransformation(url: string, rule: TransformationRule): string {
        const template = rule.template;

        switch (rule.transformationType) {
            case "prefix":
                return template.replace("{url}", url);

            case "path-extraction":
                try {
                    const urlObj = new URL(url);
                    const path = urlObj.pathname + urlObj.search + urlObj.hash;
                    const domain = urlObj.hostname;

                    return template
                        .replace("{url}", url)
                        .replace("{path}", path)
                        .replace("{domain}", domain);
                } catch (error) {
                    console.error("Error extracting path:", error);
                    return template.replace("{url}", url);
                }

            default:
                return template.replace("{url}", url);
        }
    }

    private extractProxyBaseUrl(transformedUrl: string): string {
        try {
            const urlObj = new URL(transformedUrl);
            return `${urlObj.protocol}//${urlObj.hostname}`;
        } catch (error) {
            console.error("Error extracting proxy base URL:", error);
            return transformedUrl;
        }
    }

    private isCacheValid(proxyBaseUrl: string): boolean {
        const cached = this.healthCache[proxyBaseUrl];
        if (!cached) {
            return false;
        }

        const now = Date.now();
        return (now - cached.lastChecked) < this.cacheTtlMs;
    }

    private async checkProxyHealthWithTimeout(url: string): Promise<boolean> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
            const response = await requestUrl({
                url: url,
                method: "HEAD",
            });

            clearTimeout(timeoutId);
            return response.status >= 200 && response.status < 400;
        } catch (error) {
            clearTimeout(timeoutId);
            console.warn(`Proxy health check failed for ${url}:`, error);
            return false;
        }
    }

    private async checkProxyHealth(proxyBaseUrl: string, rule: TransformationRule): Promise<boolean> {
        if (this.isCacheValid(proxyBaseUrl)) {
            return this.healthCache[proxyBaseUrl].healthy;
        }

        const testTransformedUrl = this.applyTransformation(TEST_URL, rule);
        let healthy = await this.checkProxyHealthWithTimeout(testTransformedUrl);

        if (!healthy) {
            healthy = await this.checkProxyHealthWithTimeout(proxyBaseUrl);
        }

        this.healthCache[proxyBaseUrl] = {
            healthy,
            lastChecked: Date.now(),
        };

        return healthy;
    }

    async transformUrl(url: string, rules: TransformationRule[], enableFallback = false): Promise<TransformationResult> {
        const matchingRules = this.findMatchingRules(url, rules);

        if (matchingRules.length === 0) {
            return {
                transformedUrl: url,
                originalUrl: url,
                proxyHealthy: true,
            };
        }

        const failedRules: string[] = [];

        const rulesToTry = enableFallback ? matchingRules : [matchingRules[0]];

        for (const rule of rulesToTry) {
            const transformedUrl = this.applyTransformation(url, rule);
            const proxyBaseUrl = this.extractProxyBaseUrl(transformedUrl);

            const isHealthy = await this.checkProxyHealth(proxyBaseUrl, rule);

            if (isHealthy) {
                if (failedRules.length > 0) {
                    console.log(`Proxy fallback: "${failedRules.join('", "')}" failed, using "${rule.name}"`);
                }
                return {
                    transformedUrl,
                    originalUrl: url,
                    appliedRule: rule.name,
                    proxyHealthy: true,
                };
            }

            failedRules.push(rule.name);
            console.warn(`Proxy "${rule.name}" is unhealthy for ${url}${enableFallback ? ", trying next..." : ""}`);
        }

        return {
            transformedUrl: null,
            originalUrl: url,
            appliedRule: failedRules.join(", "),
            proxyHealthy: false,
            error: `All matching proxy services are currently unavailable: ${failedRules.join(", ")}`,
        };
    }

    clearCache(): void {
        this.healthCache = {};
    }

    async testAllProxies(rules: TransformationRule[]): Promise<Map<string, boolean>> {
        const results = new Map<string, boolean>();

        for (const rule of rules) {
            if (!rule.enabled) {
                continue;
            }

            const testUrl = this.applyTransformation(TEST_URL, rule);
            const proxyBaseUrl = this.extractProxyBaseUrl(testUrl);

            delete this.healthCache[proxyBaseUrl];

            const healthy = await this.checkProxyHealth(proxyBaseUrl, rule);
            results.set(rule.name, healthy);
        }

        return results;
    }
}
