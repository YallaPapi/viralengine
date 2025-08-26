/**
 * Main entry point for the Viral Video Generator
 */
export * from './core/interfaces/index.js';
export * from './core/models/index.js';
export * from './core/errors/BaseError.js';
export { Container, ServiceTokens } from './core/di/Container.js';
export { EventBus, PipelineEvent } from './core/EventBus.js';
/**
 * Initialize the application
 */
export declare function initialize(): Promise<void>;
/**
 * Shutdown the application
 */
export declare function shutdown(): Promise<void>;
//# sourceMappingURL=index.d.ts.map