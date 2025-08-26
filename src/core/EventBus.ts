/**
 * Event bus for pipeline communication
 */

/**
 * Pipeline events that can be emitted
 */
export enum PipelineEvent {
  PROJECT_CREATED = 'project.created',
  SCRIPT_GENERATED = 'script.generated',
  SCRIPT_VALIDATED = 'script.validated',
  MEDIA_SEARCH_STARTED = 'media.search.started',
  MEDIA_SOURCED = 'media.sourced',
  MEDIA_DOWNLOADED = 'media.downloaded',
  AUDIO_GENERATION_STARTED = 'audio.generation.started',
  AUDIO_PROCESSED = 'audio.processed',
  VIDEO_COMPOSITION_STARTED = 'video.composition.started',
  VIDEO_COMPOSED = 'video.composed',
  RENDERING_STARTED = 'rendering.started',
  RENDERING_PROGRESS = 'rendering.progress',
  RENDERING_COMPLETED = 'rendering.completed',
  PROJECT_COMPLETED = 'project.completed',
  ERROR_OCCURRED = 'error.occurred',
  WARNING_RAISED = 'warning.raised'
}

/**
 * Event handler function type
 */
export type EventHandler<T = any> = (data: T) => void | Promise<void>;

/**
 * Event subscription
 */
interface EventSubscription {
  id: string;
  event: PipelineEvent;
  handler: EventHandler;
  once: boolean;
}

/**
 * Singleton event bus for application-wide event handling
 */
export class EventBus {
  private static instance: EventBus;
  private handlers: Map<PipelineEvent, EventSubscription[]> = new Map();
  private subscriptionCounter = 0;
  
  /**
   * Get the singleton instance
   */
  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }
  
  /**
   * Private constructor to enforce singleton
   */
  private constructor() {
    // Initialize handlers map for all events
    Object.values(PipelineEvent).forEach(event => {
      this.handlers.set(event as PipelineEvent, []);
    });
  }
  
  /**
   * Subscribe to an event
   * @param event - Event to subscribe to
   * @param handler - Handler function
   * @returns Subscription ID for unsubscribing
   */
  on(event: PipelineEvent, handler: EventHandler): string {
    const subscription: EventSubscription = {
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
  once(event: PipelineEvent, handler: EventHandler): string {
    const subscription: EventSubscription = {
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
  off(subscriptionId: string): void {
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
  async emit<T = any>(event: PipelineEvent, data?: T): Promise<void> {
    const subscriptions = this.handlers.get(event) || [];
    const promises: Promise<void>[] = [];
    
    // Create a copy to handle once subscriptions
    const subscriptionsCopy = [...subscriptions];
    
    for (const subscription of subscriptionsCopy) {
      // Remove once subscriptions before executing
      if (subscription.once) {
        this.off(subscription.id);
      }
      
      // Execute handler with error handling
      try {
        const result = subscription.handler(data);
        if (result instanceof Promise) {
          promises.push(result.catch(() => {})); // Swallow errors to continue
        }
      } catch (error) {
        // Continue processing other handlers
      }
    }
    
    // Wait for all async handlers to complete
    await Promise.all(promises);
  }
  
  /**
   * Remove all event handlers
   */
  clear(): void {
    this.handlers.clear();
    Object.values(PipelineEvent).forEach(event => {
      this.handlers.set(event as PipelineEvent, []);
    });
  }
  
  /**
   * Get the number of handlers for an event
   * @param event - Event to check
   * @returns Number of handlers
   */
  getHandlerCount(event: PipelineEvent): number {
    return (this.handlers.get(event) || []).length;
  }
}