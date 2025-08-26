/**
 * Event bus for pipeline communication
 */
/**
 * Pipeline events that can be emitted
 */
export var PipelineEvent;
(function (PipelineEvent) {
    PipelineEvent["PROJECT_CREATED"] = "project.created";
    PipelineEvent["SCRIPT_GENERATED"] = "script.generated";
    PipelineEvent["SCRIPT_VALIDATED"] = "script.validated";
    PipelineEvent["MEDIA_SEARCH_STARTED"] = "media.search.started";
    PipelineEvent["MEDIA_SOURCED"] = "media.sourced";
    PipelineEvent["MEDIA_DOWNLOADED"] = "media.downloaded";
    PipelineEvent["AUDIO_GENERATION_STARTED"] = "audio.generation.started";
    PipelineEvent["AUDIO_PROCESSED"] = "audio.processed";
    PipelineEvent["VIDEO_COMPOSITION_STARTED"] = "video.composition.started";
    PipelineEvent["VIDEO_COMPOSED"] = "video.composed";
    PipelineEvent["RENDERING_STARTED"] = "rendering.started";
    PipelineEvent["RENDERING_PROGRESS"] = "rendering.progress";
    PipelineEvent["RENDERING_COMPLETED"] = "rendering.completed";
    PipelineEvent["PROJECT_COMPLETED"] = "project.completed";
    PipelineEvent["ERROR_OCCURRED"] = "error.occurred";
    PipelineEvent["WARNING_RAISED"] = "warning.raised";
})(PipelineEvent || (PipelineEvent = {}));
/**
 * Singleton event bus for application-wide event handling
 */
export class EventBus {
    static instance;
    handlers = new Map();
    subscriptionCounter = 0;
    /**
     * Get the singleton instance
     */
    static getInstance() {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }
    /**
     * Private constructor to enforce singleton
     */
    constructor() {
        // Initialize handlers map for all events
        Object.values(PipelineEvent).forEach(event => {
            this.handlers.set(event, []);
        });
    }
    /**
     * Subscribe to an event
     * @param event - Event to subscribe to
     * @param handler - Handler function
     * @returns Subscription ID for unsubscribing
     */
    on(event, handler) {
        const subscription = {
            id: `sub_${++this.subscriptionCounter}`,
            event,
            handler,
            once: false
        };
        const handlers = this.handlers.get(event) || [];
        handlers.push(subscription);
        this.handlers.set(event, handlers);
        return subscription.id;
    }
    /**
     * Subscribe to an event once
     * @param event - Event to subscribe to
     * @param handler - Handler function
     * @returns Subscription ID
     */
    once(event, handler) {
        const subscription = {
            id: `sub_${++this.subscriptionCounter}`,
            event,
            handler,
            once: true
        };
        const handlers = this.handlers.get(event) || [];
        handlers.push(subscription);
        this.handlers.set(event, handlers);
        return subscription.id;
    }
    /**
     * Unsubscribe from an event
     * @param subscriptionId - Subscription ID returned from on() or once()
     */
    off(subscriptionId) {
        this.handlers.forEach((subscriptions, event) => {
            const filtered = subscriptions.filter(sub => sub.id !== subscriptionId);
            this.handlers.set(event, filtered);
        });
    }
    /**
     * Emit an event
     * @param event - Event to emit
     * @param data - Event data
     */
    async emit(event, data) {
        const subscriptions = this.handlers.get(event) || [];
        const promises = [];
        // Create a copy to handle once subscriptions
        const subscriptionsCopy = [...subscriptions];
        for (const subscription of subscriptionsCopy) {
            // Remove once subscriptions before executing
            if (subscription.once) {
                this.off(subscription.id);
            }
            // Execute handler
            const result = subscription.handler(data);
            if (result instanceof Promise) {
                promises.push(result);
            }
        }
        // Wait for all async handlers to complete
        await Promise.all(promises);
    }
    /**
     * Remove all event handlers
     */
    clear() {
        this.handlers.clear();
        Object.values(PipelineEvent).forEach(event => {
            this.handlers.set(event, []);
        });
    }
    /**
     * Get the number of handlers for an event
     * @param event - Event to check
     * @returns Number of handlers
     */
    getHandlerCount(event) {
        return (this.handlers.get(event) || []).length;
    }
}
//# sourceMappingURL=EventBus.js.map