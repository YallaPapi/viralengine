/**
 * Unit tests for BaseError and derived error classes
 */

import {
  BaseError,
  ErrorCategory,
  ConfigurationError,
  ValidationError,
  ExternalServiceError,
  ProcessingError,
  ResourceError,
  SystemError
} from '../BaseError';

describe('BaseError', () => {
  // Create a concrete implementation for testing
  class TestError extends BaseError {
    constructor(message: string) {
      super(message, ErrorCategory.SYSTEM, 'TEST_ERROR', false, { test: true });
    }
  }

  describe('BaseError properties', () => {
    it('should set all properties correctly', () => {
      const error = new TestError('Test error message');
      
      expect(error.message).toBe('Test error message');
      expect(error.name).toBe('TestError');
      expect(error.category).toBe(ErrorCategory.SYSTEM);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.retryable).toBe(false);
      expect(error.context).toEqual({ test: true });
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.stack).toBeDefined();
    });

    it('should capture stack trace', () => {
      const error = new TestError('Test error');
      
      expect(error.stack).toContain('TestError');
      expect(error.stack).toContain('Test error');
    });

    it('should handle optional context', () => {
      class NoContextError extends BaseError {
        constructor(message: string) {
          super(message, ErrorCategory.SYSTEM, 'NO_CONTEXT', true);
        }
      }
      
      const error = new NoContextError('No context error');
      
      expect(error.context).toBeUndefined();
      expect(error.retryable).toBe(true);
    });
  });

  describe('toJSON', () => {
    it('should serialize error to JSON', () => {
      const error = new TestError('Test error');
      const json = error.toJSON();
      
      expect(json).toHaveProperty('name', 'TestError');
      expect(json).toHaveProperty('message', 'Test error');
      expect(json).toHaveProperty('category', ErrorCategory.SYSTEM);
      expect(json).toHaveProperty('code', 'TEST_ERROR');
      expect(json).toHaveProperty('retryable', false);
      expect(json).toHaveProperty('context', { test: true });
      expect(json).toHaveProperty('timestamp');
      expect(json).toHaveProperty('stack');
      
      // Check timestamp is ISO string
      expect(new Date(json.timestamp)).toBeInstanceOf(Date);
    });
  });
});

describe('ConfigurationError', () => {
  it('should create configuration error with correct properties', () => {
    const error = new ConfigurationError('Invalid config', { file: 'config.json' });
    
    expect(error.name).toBe('ConfigurationError');
    expect(error.message).toBe('Invalid config');
    expect(error.category).toBe(ErrorCategory.CONFIGURATION);
    expect(error.code).toBe('CONFIG_ERROR');
    expect(error.retryable).toBe(false);
    expect(error.context).toEqual({ file: 'config.json' });
  });

  it('should work without context', () => {
    const error = new ConfigurationError('Missing API key');
    
    expect(error.context).toBeUndefined();
    expect(error.message).toBe('Missing API key');
  });
});

describe('ValidationError', () => {
  it('should create validation error with correct properties', () => {
    const error = new ValidationError('Invalid input', { field: 'email' });
    
    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('Invalid input');
    expect(error.category).toBe(ErrorCategory.VALIDATION);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.retryable).toBe(false);
    expect(error.context).toEqual({ field: 'email' });
  });

  it('should work without context', () => {
    const error = new ValidationError('Validation failed');
    
    expect(error.context).toBeUndefined();
    expect(error.message).toBe('Validation failed');
  });
});

describe('ExternalServiceError', () => {
  it('should create external service error with default retryable true', () => {
    const error = new ExternalServiceError('API call failed', 'OpenAI');
    
    expect(error.name).toBe('ExternalServiceError');
    expect(error.message).toBe('API call failed');
    expect(error.category).toBe(ErrorCategory.EXTERNAL_SERVICE);
    expect(error.code).toBe('EXTERNAL_SERVICE_OPENAI');
    expect(error.retryable).toBe(true);
    expect(error.context).toEqual({ service: 'OpenAI' });
  });

  it('should handle custom retryable setting', () => {
    const error = new ExternalServiceError('Rate limit exceeded', 'ElevenLabs', false);
    
    expect(error.code).toBe('EXTERNAL_SERVICE_ELEVENLABS');
    expect(error.retryable).toBe(false);
    expect(error.context).toEqual({ service: 'ElevenLabs' });
  });

  it('should merge additional context', () => {
    const error = new ExternalServiceError(
      'Request failed',
      'Pexels',
      true,
      { statusCode: 429, endpoint: '/videos/search' }
    );
    
    expect(error.context).toEqual({
      service: 'Pexels',
      statusCode: 429,
      endpoint: '/videos/search'
    });
  });

  it('should uppercase service name in code', () => {
    const error = new ExternalServiceError('Error', 'my-service');
    
    expect(error.code).toBe('EXTERNAL_SERVICE_MY-SERVICE');
  });
});

describe('ProcessingError', () => {
  it('should create processing error with default retryable false', () => {
    const error = new ProcessingError('FFmpeg failed', 'video-encoding');
    
    expect(error.name).toBe('ProcessingError');
    expect(error.message).toBe('FFmpeg failed');
    expect(error.category).toBe(ErrorCategory.PROCESSING);
    expect(error.code).toBe('PROCESSING_VIDEO-ENCODING');
    expect(error.retryable).toBe(false);
    expect(error.context).toEqual({ stage: 'video-encoding' });
  });

  it('should handle custom retryable setting', () => {
    const error = new ProcessingError('Temporary failure', 'audio-mixing', true);
    
    expect(error.code).toBe('PROCESSING_AUDIO-MIXING');
    expect(error.retryable).toBe(true);
  });

  it('should merge additional context', () => {
    const error = new ProcessingError(
      'Processing failed',
      'caption-generation',
      false,
      { duration: 60, format: 'srt' }
    );
    
    expect(error.context).toEqual({
      stage: 'caption-generation',
      duration: 60,
      format: 'srt'
    });
  });
});

describe('ResourceError', () => {
  it('should create resource error with correct properties', () => {
    const error = new ResourceError('Out of memory', 'memory');
    
    expect(error.name).toBe('ResourceError');
    expect(error.message).toBe('Out of memory');
    expect(error.category).toBe(ErrorCategory.RESOURCE);
    expect(error.code).toBe('RESOURCE_MEMORY');
    expect(error.retryable).toBe(false);
    expect(error.context).toEqual({ resource: 'memory' });
  });

  it('should merge additional context', () => {
    const error = new ResourceError(
      'Disk space exhausted',
      'disk',
      { available: 0, required: 1000000 }
    );
    
    expect(error.context).toEqual({
      resource: 'disk',
      available: 0,
      required: 1000000
    });
  });

  it('should uppercase resource name in code', () => {
    const error = new ResourceError('Resource unavailable', 'gpu-memory');
    
    expect(error.code).toBe('RESOURCE_GPU-MEMORY');
  });
});

describe('SystemError', () => {
  it('should create system error with retryable true by default', () => {
    const error = new SystemError('Unexpected error');
    
    expect(error.name).toBe('SystemError');
    expect(error.message).toBe('Unexpected error');
    expect(error.category).toBe(ErrorCategory.SYSTEM);
    expect(error.code).toBe('SYSTEM_ERROR');
    expect(error.retryable).toBe(true);
    expect(error.context).toBeUndefined();
  });

  it('should handle context', () => {
    const error = new SystemError('System failure', { component: 'EventBus' });
    
    expect(error.context).toEqual({ component: 'EventBus' });
  });
});

describe('Error inheritance', () => {
  it('should all errors be instanceof Error', () => {
    const errors = [
      new ConfigurationError('test'),
      new ValidationError('test'),
      new ExternalServiceError('test', 'service'),
      new ProcessingError('test', 'stage'),
      new ResourceError('test', 'resource'),
      new SystemError('test')
    ];
    
    errors.forEach(error => {
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(BaseError);
    });
  });

  it('should maintain error chain with cause', () => {
    const cause = new Error('Original error');
    
    class CausedError extends BaseError {
      constructor(message: string, cause: Error) {
        super(message, ErrorCategory.SYSTEM, 'CAUSED_ERROR', false, { cause });
      }
    }
    
    const error = new CausedError('Wrapped error', cause);
    
    expect(error.context.cause).toBe(cause);
  });
});