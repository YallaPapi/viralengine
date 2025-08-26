/**
 * Base error class for the application
 */

/**
 * Error categories for classification
 */
export enum ErrorCategory {
  CONFIGURATION = 'CONFIGURATION',
  VALIDATION = 'VALIDATION',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  PROCESSING = 'PROCESSING',
  RESOURCE = 'RESOURCE',
  SYSTEM = 'SYSTEM'
}

/**
 * Base error class that all custom errors extend
 */
export abstract class BaseError extends Error {
  public readonly timestamp: Date;
  
  constructor(
    message: string,
    public readonly category: ErrorCategory,
    public readonly code: string,
    public readonly retryable: boolean = false,
    public readonly context?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
  
  /**
   * Convert error to JSON for logging
   */
  toJSON(): Record<string, any> {
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
  constructor(message: string, context?: any) {
    super(message, ErrorCategory.CONFIGURATION, 'CONFIG_ERROR', false, context);
  }
}

/**
 * Validation error - thrown when input validation fails
 */
export class ValidationError extends BaseError {
  constructor(message: string, context?: any) {
    super(message, ErrorCategory.VALIDATION, 'VALIDATION_ERROR', false, context);
  }
}

/**
 * External service error - thrown when external API calls fail
 */
export class ExternalServiceError extends BaseError {
  constructor(message: string, serviceName: string, retryable = true, context?: any) {
    super(
      message,
      ErrorCategory.EXTERNAL_SERVICE,
      `EXTERNAL_SERVICE_${serviceName.toUpperCase()}`,
      retryable,
      { ...context, service: serviceName }
    );
  }
}

/**
 * Processing error - thrown during video/audio processing
 */
export class ProcessingError extends BaseError {
  constructor(message: string, stage: string, retryable = false, context?: any) {
    super(
      message,
      ErrorCategory.PROCESSING,
      `PROCESSING_${stage.toUpperCase()}`,
      retryable,
      { ...context, stage }
    );
  }
}

/**
 * Resource error - thrown when resources are unavailable or insufficient
 */
export class ResourceError extends BaseError {
  constructor(message: string, resource: string, context?: any) {
    super(
      message,
      ErrorCategory.RESOURCE,
      `RESOURCE_${resource.toUpperCase()}`,
      false,
      { ...context, resource }
    );
  }
}

/**
 * System error - thrown for unexpected system failures
 */
export class SystemError extends BaseError {
  constructor(message: string, context?: any) {
    super(message, ErrorCategory.SYSTEM, 'SYSTEM_ERROR', true, context);
  }
}