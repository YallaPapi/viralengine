/**
 * Dependency Injection Container
 */
import { BaseError } from '../errors/BaseError.js';
/**
 * Service lifetime
 */
export declare enum ServiceLifetime {
    /** Single instance for entire application */
    SINGLETON = "singleton",
    /** New instance for each resolution */
    TRANSIENT = "transient",
    /** Single instance per scope */
    SCOPED = "scoped"
}
/**
 * Dependency injection error
 */
export declare class DIError extends BaseError {
    constructor(message: string, context?: any);
}
/**
 * Dependency Injection Container
 */
export declare class Container {
    private static instance;
    private registrations;
    private scopedInstances;
    /**
     * Get the singleton instance
     */
    static getInstance(): Container;
    /**
     * Private constructor to enforce singleton
     */
    private constructor();
    /**
     * Register a service
     * @param token - Service token
     * @param factory - Factory function to create instance
     * @param lifetime - Service lifetime
     */
    register<T>(token: string, factory: () => T, lifetime?: ServiceLifetime): void;
    /**
     * Register a singleton service
     * @param token - Service token
     * @param instance - Service instance
     */
    registerSingleton<T>(token: string, instance: T): void;
    /**
     * Register a transient service
     * @param token - Service token
     * @param factory - Factory function
     */
    registerTransient<T>(token: string, factory: () => T): void;
    /**
     * Register a scoped service
     * @param token - Service token
     * @param factory - Factory function
     */
    registerScoped<T>(token: string, factory: () => T): void;
    /**
     * Resolve a service
     * @param token - Service token
     * @returns Service instance
     */
    resolve<T>(token: string): T;
    /**
     * Try to resolve a service
     * @param token - Service token
     * @returns Service instance or undefined
     */
    tryResolve<T>(token: string): T | undefined;
    /**
     * Check if a service is registered
     * @param token - Service token
     * @returns True if registered
     */
    has(token: string): boolean;
    /**
     * Create a new scope
     * @returns Scoped container
     */
    createScope(): Container;
    /**
     * Clear all registrations
     */
    clear(): void;
    /**
     * Clear scoped instances
     */
    clearScope(): void;
    /**
     * Get all registered tokens
     * @returns Array of tokens
     */
    getTokens(): string[];
}
/**
 * Service tokens for core services
 */
export declare const ServiceTokens: {
    readonly EVENT_BUS: "EventBus";
    readonly CONFIG: "Configuration";
    readonly LOGGER: "Logger";
    readonly SCRIPT_GENERATOR: "IScriptGenerator";
    readonly TEMPLATE_ENGINE: "ITemplateEngine";
    readonly MEDIA_SOURCER: "IMediaSourcer";
    readonly MEDIA_CACHE: "IMediaCache";
    readonly AUDIO_PROCESSOR: "IAudioProcessor";
    readonly TTS_PROVIDER: "ITTSProvider";
    readonly VIDEO_COMPOSITOR: "IVideoCompositor";
    readonly VIDEO_RENDERER: "IVideoRenderer";
    readonly FILE_MANAGER: "IFileManager";
    readonly HTTP_CLIENT: "IHttpClient";
};
//# sourceMappingURL=Container.d.ts.map