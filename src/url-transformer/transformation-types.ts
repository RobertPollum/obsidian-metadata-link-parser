export type TransformationType = "prefix" | "path-extraction";

export interface TransformationRule {
    id: string;
    name: string;
    enabled: boolean;
    matchers: string[];
    transformationType: TransformationType;
    template: string;
    priority: number;
}

export interface TransformationResult {
    transformedUrl: string | null;
    originalUrl: string;
    appliedRule?: string;
    proxyHealthy: boolean;
    error?: string;
}

export interface AutoProcessingConfig {
    enabled: boolean;
    folderPath: string;
    frequencyMinutes: number;
    minContentLengthRatio: number;
}

export interface TransformationConfig {
    rules: TransformationRule[];
    proxyHealthCacheTtlMinutes: number;
    proxyHealthTimeoutMs: number;
    autoProcessing: AutoProcessingConfig;
}

export interface ProxyHealthCache {
    [proxyBaseUrl: string]: {
        healthy: boolean;
        lastChecked: number;
    };
}
