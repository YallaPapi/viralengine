import fs from 'fs';
import path from 'path';
import { config } from '../config';

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

// Log entry interface
export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: string;
  operationId?: string;
  data?: any;
  error?: Error;
}

// Performance timing entry
export interface TimingEntry {
  operationId: string;
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  private logFile: string;
  private timings: Map<string, TimingEntry> = new Map();

  private constructor() {
    // Parse log level from config
    const levelStr = config.logging.level.toLowerCase();
    this.logLevel = this.parseLogLevel(levelStr);
    this.logFile = config.logging.file;
    
    // Ensure log directory exists
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  private parseLogLevel(levelStr: string): LogLevel {
    switch (levelStr) {
      case 'debug': return LogLevel.DEBUG;
      case 'info': return LogLevel.INFO;
      case 'warn': return LogLevel.WARN;
      case 'error': return LogLevel.ERROR;
      default: return LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatLogEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const levelName = LogLevel[entry.level];
    const context = entry.context ? `[${entry.context}]` : '';
    const opId = entry.operationId ? `{${entry.operationId}}` : '';
    
    let logLine = `${timestamp} ${levelName}${context}${opId} ${entry.message}`;
    
    if (entry.data) {
      logLine += ` | Data: ${JSON.stringify(entry.data)}`;
    }
    
    if (entry.error) {
      logLine += ` | Error: ${entry.error.message}`;
      if (entry.error.stack) {
        logLine += `\\nStack: ${entry.error.stack}`;
      }
    }
    
    return logLine;
  }

  private writeLog(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const logLine = this.formatLogEntry(entry);
    
    // Console output with colors
    this.logToConsole(entry, logLine);
    
    // File output
    this.logToFile(logLine);
  }

  private logToConsole(entry: LogEntry, logLine: string): void {
    const colors = {
      [LogLevel.DEBUG]: '\\x1b[36m', // Cyan
      [LogLevel.INFO]: '\\x1b[32m',  // Green
      [LogLevel.WARN]: '\\x1b[33m',  // Yellow
      [LogLevel.ERROR]: '\\x1b[31m'  // Red
    };
    
    const reset = '\\x1b[0m';
    const color = colors[entry.level] || '';
    
    console.log(`${color}${logLine}${reset}`);
  }

  private logToFile(logLine: string): void {
    try {
      fs.appendFileSync(this.logFile, logLine + '\\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  // Public logging methods
  public debug(message: string, context?: string, operationId?: string, data?: any): void {
    this.writeLog({
      timestamp: new Date(),
      level: LogLevel.DEBUG,
      message,
      context,
      operationId,
      data
    });
  }

  public info(message: string, context?: string, operationId?: string, data?: any): void {
    this.writeLog({
      timestamp: new Date(),
      level: LogLevel.INFO,
      message,
      context,
      operationId,
      data
    });
  }

  public warn(message: string, context?: string, operationId?: string, data?: any): void {
    this.writeLog({
      timestamp: new Date(),
      level: LogLevel.WARN,
      message,
      context,
      operationId,
      data
    });
  }

  public error(message: string, error?: Error, context?: string, operationId?: string, data?: any): void {
    this.writeLog({
      timestamp: new Date(),
      level: LogLevel.ERROR,
      message,
      context,
      operationId,
      data,
      error
    });
  }

  // Performance timing methods
  public startTiming(operationId: string, operation: string): void {
    this.timings.set(operationId, {
      operationId,
      operation,
      startTime: Date.now()
    });
    
    this.debug(`Started ${operation}`, 'TIMING', operationId);
  }

  public endTiming(operationId: string): number | null {
    const timing = this.timings.get(operationId);
    if (!timing) {
      this.warn(`No timing found for operation ID: ${operationId}`, 'TIMING');
      return null;
    }

    timing.endTime = Date.now();
    timing.duration = timing.endTime - timing.startTime;
    
    this.info(`Completed ${timing.operation} in ${timing.duration}ms`, 'TIMING', operationId);
    
    this.timings.delete(operationId);
    return timing.duration;
  }

  // Utility methods
  public generateOperationId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  public createContextLogger(context: string) {
    return {
      debug: (message: string, operationId?: string, data?: any) => 
        this.debug(message, context, operationId, data),
      info: (message: string, operationId?: string, data?: any) => 
        this.info(message, context, operationId, data),
      warn: (message: string, operationId?: string, data?: any) => 
        this.warn(message, context, operationId, data),
      error: (message: string, error?: Error, operationId?: string, data?: any) => 
        this.error(message, error, context, operationId, data)
    };
  }

  // Log rotation (simple implementation)
  public rotateLog(): void {
    try {
      if (fs.existsSync(this.logFile)) {
        const stats = fs.statSync(this.logFile);
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (stats.size > maxSize) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const rotatedFile = this.logFile.replace('.log', `_${timestamp}.log`);
          fs.renameSync(this.logFile, rotatedFile);
          
          this.info('Log file rotated', 'LOGGER', undefined, { rotatedTo: rotatedFile });
        }
      }
    } catch (error) {
      console.error('Failed to rotate log file:', error);
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Performance timing utility
export async function timeAsync<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: string
): Promise<T> {
  const operationId = logger.generateOperationId();
  logger.startTiming(operationId, operation);
  
  try {
    const result = await fn();
    logger.endTiming(operationId);
    return result;
  } catch (error) {
    logger.endTiming(operationId);
    logger.error(`Error in ${operation}`, error as Error, context || 'TIMING', operationId);
    throw error;
  }
}

// Synchronous timing utility
export function timeSync<T>(
  operation: string,
  fn: () => T,
  context?: string
): T {
  const operationId = logger.generateOperationId();
  logger.startTiming(operationId, operation);
  
  try {
    const result = fn();
    logger.endTiming(operationId);
    return result;
  } catch (error) {
    logger.endTiming(operationId);
    logger.error(`Error in ${operation}`, error as Error, context || 'TIMING', operationId);
    throw error;
  }
}