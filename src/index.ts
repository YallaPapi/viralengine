/**
 * Main entry point for the Viral Video Generator
 */

import { Container, ServiceTokens } from './core/di/Container';
import { EventBus, PipelineEvent } from './core/EventBus';
import { logger } from './utils/logger';
import { validateConfig } from './config/index';

// Export core functionality
export * from './core/interfaces/index';
export * from './core/models/index';
export * from './core/errors/BaseError';
export { Container, ServiceTokens } from './core/di/Container';
export { EventBus, PipelineEvent } from './core/EventBus';
export * from './utils/index';

/**
 * Initialize the application
 */
export async function initialize(): Promise<void> {
  const opId = logger.generateOperationId();
  logger.info('Viral Video Generator - Initializing...', 'INIT', opId);
  
  try {
    // Validate configuration first
    logger.info('Validating configuration...', 'INIT', opId);
    const configResult = validateConfig();
    
    if (!configResult.isValid) {
      logger.error('Configuration validation failed', undefined, 'INIT', opId, configResult);
      throw new Error('Invalid configuration - check your API keys');
    }
    
    // Get container and event bus instances
    const container = Container.getInstance();
    const eventBus = EventBus.getInstance();
    
    // Register core services
    container.registerSingleton(ServiceTokens.EVENT_BUS, eventBus);
    logger.debug('Container services registered', 'INIT', opId);
    
    // Set up event handlers with logging
    eventBus.on(PipelineEvent.PROJECT_CREATED, (data) => {
      logger.info('Project created', 'EVENT', undefined, data);
    });
    
    eventBus.on(PipelineEvent.ERROR_OCCURRED, (error) => {
      logger.error('Pipeline error occurred', error as Error, 'EVENT');
    });
    
    logger.info('Event handlers configured', 'INIT', opId);
    logger.info('Initialization complete', 'INIT', opId);
  } catch (error) {
    logger.error('Initialization failed', error as Error, 'INIT', opId);
    throw error;
  }
}

/**
 * Shutdown the application
 */
export async function shutdown(): Promise<void> {
  const opId = logger.generateOperationId();
  logger.info('Shutting down application...', 'SHUTDOWN', opId);
  
  try {
    const eventBus = EventBus.getInstance();
    eventBus.clear();
    logger.debug('Event bus cleared', 'SHUTDOWN', opId);
    
    const container = Container.getInstance();
    container.clear();
    logger.debug('Container cleared', 'SHUTDOWN', opId);
    
    logger.info('Shutdown complete', 'SHUTDOWN', opId);
  } catch (error) {
    logger.error('Error during shutdown', error as Error, 'SHUTDOWN', opId);
    throw error;
  }
}

// Auto-initialize if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initialize().catch(console.error);
}