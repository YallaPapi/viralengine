import fs from 'fs';
import path from 'path';
import { logger, LogLevel, timeAsync, timeSync } from '../logger';

// Mock console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('Logger', () => {
  let consoleLogs: string[] = [];
  let consoleErrors: string[] = [];
  
  beforeEach(() => {
    consoleLogs = [];
    consoleErrors = [];
    
    // Set log level to DEBUG for testing
    logger.setLogLevel(LogLevel.DEBUG);
    
    console.log = jest.fn((message: string) => {
      consoleLogs.push(message);
    });
    
    console.error = jest.fn((message: string) => {
      consoleErrors.push(message);
    });
  });
  
  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe('Basic logging', () => {
    it('should log info messages', () => {
      logger.info('Test info message', 'TEST');
      
      expect(consoleLogs.length).toBe(1);
      expect(consoleLogs[0]).toContain('INFO');
      expect(consoleLogs[0]).toContain('[TEST]');
      expect(consoleLogs[0]).toContain('Test info message');
    });

    it('should log error messages with error objects', () => {
      const testError = new Error('Test error');
      logger.error('Test error message', testError, 'TEST');
      
      expect(consoleLogs.length).toBe(1);
      expect(consoleLogs[0]).toContain('ERROR');
      expect(consoleLogs[0]).toContain('[TEST]');
      expect(consoleLogs[0]).toContain('Test error message');
      expect(consoleLogs[0]).toContain('Test error');
    });

    it('should include operation ID in logs', () => {
      const opId = logger.generateOperationId();
      logger.info('Test with operation ID', 'TEST', opId);
      
      expect(consoleLogs.length).toBe(1);
      expect(consoleLogs[0]).toContain(`{${opId}}`);
    });

    it('should include data in logs', () => {
      const testData = { key: 'value', number: 42 };
      logger.info('Test with data', 'TEST', undefined, testData);
      
      expect(consoleLogs.length).toBe(1);
      expect(consoleLogs[0]).toContain('Data:');
      expect(consoleLogs[0]).toContain('{"key":"value","number":42}');
    });
  });

  describe('Context logger', () => {
    it('should create context logger with fixed context', () => {
      const contextLogger = logger.createContextLogger('CONTEXT_TEST');
      contextLogger.info('Test message');
      
      expect(consoleLogs.length).toBe(1);
      expect(consoleLogs[0]).toContain('[CONTEXT_TEST]');
      expect(consoleLogs[0]).toContain('Test message');
    });
  });

  describe('Performance timing', () => {
    it('should track operation timing', async () => {
      const opId = 'test-operation';
      
      logger.startTiming(opId, 'Test Operation');
      expect(consoleLogs.length).toBe(1);
      expect(consoleLogs[0]).toContain('Started Test Operation');
      
      // Wait a bit to ensure time passes
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const duration = logger.endTiming(opId);
      expect(duration).toBeGreaterThan(0);
      expect(consoleLogs.length).toBe(2);
      expect(consoleLogs[1]).toContain('Completed Test Operation');
    });
  });

  describe('Timing utilities', () => {
    it('should time async operations', async () => {
      const result = await timeAsync('TestAsyncOperation', async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'async result';
      });
      
      expect(result).toBe('async result');
      expect(consoleLogs.length).toBeGreaterThanOrEqual(2);
      expect(consoleLogs.some(log => log.includes('Started TestAsyncOperation'))).toBe(true);
      expect(consoleLogs.some(log => log.includes('Completed TestAsyncOperation'))).toBe(true);
    });

    it('should time sync operations', () => {
      const result = timeSync('TestSyncOperation', () => {
        return 'sync result';
      });
      
      expect(result).toBe('sync result');
      expect(consoleLogs.length).toBeGreaterThanOrEqual(2);
      expect(consoleLogs.some(log => log.includes('Started TestSyncOperation'))).toBe(true);
      expect(consoleLogs.some(log => log.includes('Completed TestSyncOperation'))).toBe(true);
    });

    it('should handle errors in async timing', async () => {
      await expect(timeAsync('ErrorAsyncOperation', async () => {
        throw new Error('Async test error');
      })).rejects.toThrow('Async test error');
      
      expect(consoleLogs.length).toBeGreaterThanOrEqual(2);
      expect(consoleLogs.some(log => log.includes('Started ErrorAsyncOperation'))).toBe(true);
      expect(consoleLogs.some(log => log.includes('Error in ErrorAsyncOperation'))).toBe(true);
    });

    it('should handle errors in sync timing', () => {
      expect(() => timeSync('ErrorSyncOperation', () => {
        throw new Error('Sync test error');
      })).toThrow('Sync test error');
      
      expect(consoleLogs.length).toBeGreaterThanOrEqual(2);
      expect(consoleLogs.some(log => log.includes('Started ErrorSyncOperation'))).toBe(true);
      expect(consoleLogs.some(log => log.includes('Error in ErrorSyncOperation'))).toBe(true);
    });
  });

  describe('Operation ID generation', () => {
    it('should generate unique operation IDs', () => {
      const id1 = logger.generateOperationId();
      const id2 = logger.generateOperationId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(id1.length).toBeGreaterThan(0);
      expect(id2.length).toBeGreaterThan(0);
    });
  });
});