/**
 * Base error class for the application
 */
/**
 * Error categories for classification
 */
export var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["CONFIGURATION"] = "CONFIGURATION";
    ErrorCategory["VALIDATION"] = "VALIDATION";
    ErrorCategory["EXTERNAL_SERVICE"] = "EXTERNAL_SERVICE";
    ErrorCategory["PROCESSING"] = "PROCESSING";
    ErrorCategory["RESOURCE"] = "RESOURCE";
    ErrorCategory["SYSTEM"] = "SYSTEM";
})(ErrorCategory || (ErrorCategory = {}));
/**
 * Base error class that all custom errors extend
 */
export class BaseError extends Error {
    category;
    code;
    retryable;
    context;
    timestamp;
    constructor(message, category, code, retryable = false, context) {
        super(message);
        this.category = category;
        this.code = code;
        this.retryable = retryable;
        this.context = context;
        this.name = this.constructor.name;
        this.timestamp = new Date();
        // Maintains proper stack trace for where our error was thrown
        Error.captureStackTrace(this, this.constructor);
    }
    /**
     * Convert error to JSON for logging
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            category: this.category,
            code: this.code,
            retryable: this.retryable,
            context: this.context,
            timestamp: this.timestamp.toISOString(),
            stack: this.stack
        };
    }
}
/**
 * Configuration error - thrown when configuration is invalid or missing
 */
export class ConfigurationError extends BaseError {
    constructor(message, context) {
        super(message, ErrorCategory.CONFIGURATION, 'CONFIG_ERROR', false, context);
    }
}
/**
 * Validation error - thrown when input validation fails
 */
export class ValidationError extends BaseError {
    constructor(message, context) {
        super(message, ErrorCategory.VALIDATION, 'VALIDATION_ERROR', false, context);
    }
}
/**
 * External service error - thrown when external API calls fail
 */
export class ExternalServiceError extends BaseError {
    constructor(message, serviceName, retryable = true, context) {
        super(message, ErrorCategory.EXTERNAL_SERVICE, `EXTERNAL_SERVICE_${serviceName.toUpperCase()}`, retryable, { ...context, service: serviceName });
    }
}
/**
 * Processing error - thrown during video/audio processing
 */
export class ProcessingError extends BaseError {
    constructor(message, stage, retryable = false, context) {
        super(message, ErrorCategory.PROCESSING, `PROCESSING_${stage.toUpperCase()}`, retryable, { ...context, stage });
    }
}
/**
 * Resource error - thrown when resources are unavailable or insufficient
 */
export class ResourceError extends BaseError {
    constructor(message, resource, context) {
        super(message, ErrorCategory.RESOURCE, `RESOURCE_${resource.toUpperCase()}`, false, { ...context, resource });
    }
}
/**
 * System error - thrown for unexpected system failures
 */
export class SystemError extends BaseError {
    constructor(message, context) {
        super(message, ErrorCategory.SYSTEM, 'SYSTEM_ERROR', true, context);
    }
}
//# sourceMappingURL=BaseError.js.map