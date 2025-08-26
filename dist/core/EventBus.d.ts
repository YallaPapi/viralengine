/**
 * Event bus for pipeline communication
 */
/**
 * Pipeline events that can be emitted
 */
export declare enum PipelineEvent {
    PROJECT_CREATED = "project.created",
    SCRIPT_GENERATED = "script.generated",
    SCRIPT_VALIDATED = "script.validated",
    MEDIA_SEARCH_STARTED = "media.search.started",
    MEDIA_SOURCED = "media.sourced",
    MEDIA_DOWNLOADED = "media.downloaded",
    AUDIO_GENERATION_STARTED = "audio.generation.started",
    AUDIO_PROCESSED = "audio.processed",
    VIDEO_COMPOSITION_STARTED = "video.composition.started",
    VIDEO_COMPOSED = "video.composed",
    RENDERING_STARTED = "rendering.started",
    RENDERING_PROGRESS = "rendering.progress",
    RENDERING_COMPLETED = "rendering.completed",
    PROJECT_COMPLETED = "project.completed",
    ERROR_OCCURRED = "error.occurred",
    WARNING_RAISED = "warning.raised"
}
/**
 * Event handler function type
 */
export type EventHandler<T = any> = (data: T) => void | Promise<void>;
/**
 * Singleton event bus for application-wide event handling
 */
export declare class EventBus {
    private static instance;
    private handlers;
    private subscriptionCounter;
    /**
     * Get the singleton instance
     */
    static getInstance(): EventBus;
    /**
     * Private constructor to enforce singleton
     */
    private constructor();
    /**
     * Subscribe to an event
     * @param event - Event to subscribe to
     * @param handler - Handler function
     * @returns Subscription ID for unsubscribing
     */
    on(event: PipelineEvent, handler: EventHandler): string;
    /**
     * Subscribe to an event once
     * @param event - Event to subscribe to
     * @param handler - Handler function
     * @returns Subscription ID
     */
    once(event: PipelineEvent, handler: EventHandler): string;
    /**
     * Unsubscribe from an event
     * @param subscriptionId - Subscription ID returned from on() or once()
     */
    off(subscriptionId: string): void;
    /**
     * Emit an event
     * @param event - Event to emit
     * @param data - Event data
     */
    emit<T = any>(event: PipelineEvent, data?: T): Promise<void>;
    /**
     * Remove all event handlers
     */
    clear(): void;
    /**
     * Get the number of handlers for an event
     * @param event - Event to check
     * @returns Number of handlers
     */
    getHandlerCount(event: PipelineEvent): number;
}
//# sourceMappingURL=EventBus.d.ts.map