/**
 * Main entry point for the Viral Video Generator
 */
import { Container, ServiceTokens } from './core/di/Container.js';
import { EventBus, PipelineEvent } from './core/EventBus.js';
// Export core functionality
export * from './core/interfaces/index.js';
export * from './core/models/index.js';
export * from './core/errors/BaseError.js';
export { Container, ServiceTokens } from './core/di/Container.js';
export { EventBus, PipelineEvent } from './core/EventBus.js';
/**
 * Initialize the application
 */
export async function initialize() {
    console.log('🚀 Viral Video Generator - Initializing...');
    // Get container and event bus instances
    const container = Container.getInstance();
    const eventBus = EventBus.getInstance();
    // Register core services
    container.registerSingleton(ServiceTokens.EVENT_BUS, eventBus);
    // Set up event handlers
    eventBus.on(PipelineEvent.PROJECT_CREATED, (data) => {
        console.log('📝 Project created:', data);
    });
    eventBus.on(PipelineEvent.ERROR_OCCURRED, (error) => {
        console.error('❌ Error occurred:', error);
    });
    console.log('✅ Initialization complete');
}
/**
 * Shutdown the application
 */
export async function shutdown() {
    console.log('👋 Shutting down...');
    const eventBus = EventBus.getInstance();
    eventBus.clear();
    const container = Container.getInstance();
    container.clear();
    console.log('✅ Shutdown complete');
}
// Auto-initialize if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
    initialize().catch(console.error);
}
//# sourceMappingURL=index.js.map