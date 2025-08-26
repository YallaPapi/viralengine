/**
 * Dependency Injection Container
 */
import { BaseError, ErrorCategory } from '../errors/BaseError.js';
/**
 * Service lifetime
 */
export var ServiceLifetime;
(function (ServiceLifetime) {
    /** Single instance for entire application */
    ServiceLifetime["SINGLETON"] = "singleton";
    /** New instance for each resolution */
    ServiceLifetime["TRANSIENT"] = "transient";
    /** Single instance per scope */
    ServiceLifetime["SCOPED"] = "scoped";
})(ServiceLifetime || (ServiceLifetime = {}));
/**
 * Dependency injection error
 */
export class DIError extends BaseError {
    constructor(message, context) {
        super(message, ErrorCategory.CONFIGURATION, 'DI_ERROR', false, context);
    }
}
/**
 * Dependency Injection Container
 */
export class Container {
    static instance;
    registrations = new Map();
    scopedInstances = new Map();
    /**
     * Get the singleton instance
     */
    static getInstance() {
        if (!Container.instance) {
            Container.instance = new Container();
        }
        return Container.instance;
    }
    /**
     * Private constructor to enforce singleton
     */
    constructor() { }
    /**
     * Register a service
     * @param token - Service token
     * @param factory - Factory function to create instance
     * @param lifetime - Service lifetime
     */
    register(token, factory, lifetime = ServiceLifetime.TRANSIENT) {
        this.registrations.set(token, {
            token,
            factory,
            lifetime
        });
    }
    /**
     * Register a singleton service
     * @param token - Service token
     * @param instance - Service instance
     */
    registerSingleton(token, instance) {
        this.registrations.set(token, {
            token,
            factory: () => instance,
            lifetime: ServiceLifetime.SINGLETON,
            instance
        });
    }
    /**
     * Register a transient service
     * @param token - Service token
     * @param factory - Factory function
     */
    registerTransient(token, factory) {
        this.register(token, factory, ServiceLifetime.TRANSIENT);
    }
    /**
     * Register a scoped service
     * @param token - Service token
     * @param factory - Factory function
     */
    registerScoped(token, factory) {
        this.register(token, factory, ServiceLifetime.SCOPED);
    }
    /**
     * Resolve a service
     * @param token - Service token
     * @returns Service instance
     */
    resolve(token) {
        const registration = this.registrations.get(token);
        if (!registration) {
            throw new DIError(`No registration found for token: ${token}`, { token });
        }
        switch (registration.lifetime) {
            case ServiceLifetime.SINGLETON:
                if (!registration.instance) {
                    registration.instance = registration.factory();
                }
                return registration.instance;
            case ServiceLifetime.SCOPED:
                if (!this.scopedInstances.has(token)) {
                    this.scopedInstances.set(token, registration.factory());
                }
                return this.scopedInstances.get(token);
            case ServiceLifetime.TRANSIENT:
                return registration.factory();
            default:
                throw new DIError(`Unknown service lifetime: ${registration.lifetime}`, {
                    token,
                    lifetime: registration.lifetime
                });
        }
    }
    /**
     * Try to resolve a service
     * @param token - Service token
     * @returns Service instance or undefined
     */
    tryResolve(token) {
        try {
            return this.resolve(token);
        }
        catch {
            return undefined;
        }
    }
    /**
     * Check if a service is registered
     * @param token - Service token
     * @returns True if registered
     */
    has(token) {
        return this.registrations.has(token);
    }
    /**
     * Create a new scope
     * @returns Scoped container
     */
    createScope() {
        const scopedContainer = new Container();
        // Copy registrations but not instances
        this.registrations.forEach((registration, token) => {
            scopedContainer.registrations.set(token, {
                ...registration,
                instance: registration.lifetime === ServiceLifetime.SINGLETON
                    ? registration.instance
                    : undefined
            });
        });
        return scopedContainer;
    }
    /**
     * Clear all registrations
     */
    clear() {
        this.registrations.clear();
        this.scopedInstances.clear();
    }
    /**
     * Clear scoped instances
     */
    clearScope() {
        this.scopedInstances.clear();
    }
    /**
     * Get all registered tokens
     * @returns Array of tokens
     */
    getTokens() {
        return Array.from(this.registrations.keys());
    }
}
/**
 * Service tokens for core services
 */
export const ServiceTokens = {
    // Core
    EVENT_BUS: 'EventBus',
    CONFIG: 'Configuration',
    LOGGER: 'Logger',
    // Script
    SCRIPT_GENERATOR: 'IScriptGenerator',
    TEMPLATE_ENGINE: 'ITemplateEngine',
    // Media
    MEDIA_SOURCER: 'IMediaSourcer',
    MEDIA_CACHE: 'IMediaCache',
    // Audio
    AUDIO_PROCESSOR: 'IAudioProcessor',
    TTS_PROVIDER: 'ITTSProvider',
    // Video
    VIDEO_COMPOSITOR: 'IVideoCompositor',
    VIDEO_RENDERER: 'IVideoRenderer',
    // Utils
    FILE_MANAGER: 'IFileManager',
    HTTP_CLIENT: 'IHttpClient'
};
//# sourceMappingURL=Container.js.map