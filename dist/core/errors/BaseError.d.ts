/**
 * Base error class for the application
 */
/**
 * Error categories for classification
 */
export declare enum ErrorCategory {
    CONFIGURATION = "CONFIGURATION",
    VALIDATION = "VALIDATION",
    EXTERNAL_SERVICE = "EXTERNAL_SERVICE",
    PROCESSING = "PROCESSING",
    RESOURCE = "RESOURCE",
    SYSTEM = "SYSTEM"
}
/**
 * Base error class that all custom errors extend
 */
export declare abstract class BaseError extends Error {
    readonly category: ErrorCategory;
    readonly code: string;
    readonly retryable: boolean;
    readonly context?: any | undefined;
    readonly timestamp: Date;
    constructor(message: string, category: ErrorCategory, code: string, retryable?: boolean, context?: any | undefined);
    /**
     * Convert error to JSON for logging
     */
    toJSON(): Record<string, any>;
}
/**
 * Configuration error - thrown when configuration is invalid or missing
 */
export declare class ConfigurationError extends BaseError {
    constructor(message: string, context?: any);
}
/**
 * Validation error - thrown when input validation fails
 */
export declare class ValidationError extends BaseError {
    constructor(message: string, context?: any);
}
/**
 * External service error - thrown when external API calls fail
 */
export declare class ExternalServiceError extends BaseError {
    constructor(message: string, serviceName: string, retryable?: boolean, context?: any);
}
/**
 * Processing error - thrown during video/audio processing
 */
export declare class ProcessingError extends BaseError {
    constructor(message: string, stage: string, retryable?: boolean, context?: any);
}
/**
 * Resource error - thrown when resources are unavailable or insufficient
 */
export declare class ResourceError extends BaseError {
    constructor(message: string, resource: string, context?: any);
}
/**
 * System error - thrown for unexpected system failures
 */
export declare class SystemError extends BaseError {
    constructor(message: string, context?: any);
}
//# sourceMappingURL=BaseError.d.ts.map