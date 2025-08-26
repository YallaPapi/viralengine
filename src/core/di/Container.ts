/**
 * Dependency Injection Container
 */

import { BaseError, ErrorCategory } from '../errors/BaseError';

/**
 * Service lifetime
 */
export enum ServiceLifetime {
  /** Single instance for entire application */
  SINGLETON = 'singleton',
  /** New instance for each resolution */
  TRANSIENT = 'transient',
  /** Single instance per scope */
  SCOPED = 'scoped'
}

/**
 * Service registration
 */
interface ServiceRegistration {
  token: string;
  factory: () => any;
  lifetime: ServiceLifetime;
  instance?: any;
}

/**
 * Dependency injection error
 */
export class DIError extends BaseError {
  constructor(message: string, context?: any) {
    super(message, ErrorCategory.CONFIGURATION, 'DI_ERROR', false, context);
  }
}

/**
 * Dependency Injection Container
 */
export class Container {
  private static instance: Container;
  private registrations: Map<string, ServiceRegistration> = new Map();
  private scopedInstances: Map<string, any> = new Map();
  
  /**
   * Get the singleton instance
   */
  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }
  
  /**
   * Private constructor to enforce singleton
   */
  private constructor() {}
  
  /**
   * Register a service
   * @param token - Service token
   * @param factory - Factory function to create instance
   * @param lifetime - Service lifetime
   */
  register<T>(
    token: string,
    factory: () => T,
    lifetime: ServiceLifetime = ServiceLifetime.TRANSIENT
  ): void {
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
  registerSingleton<T>(token: string, instance: T): void {
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
  registerTransient<T>(token: string, factory: () => T): void {
    this.register(token, factory, ServiceLifetime.TRANSIENT);
  }
  
  /**
   * Register a scoped service
   * @param token - Service token
   * @param factory - Factory function
   */
  registerScoped<T>(token: string, factory: () => T): void {
    this.register(token, factory, ServiceLifetime.SCOPED);
  }
  
  /**
   * Resolve a service
   * @param token - Service token
   * @returns Service instance
   */
  resolve<T>(token: string): T {
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
  tryResolve<T>(token: string): T | undefined {
    try {
      return this.resolve<T>(token);
    } catch {
      return undefined;
    }
  }
  
  /**
   * Check if a service is registered
   * @param token - Service token
   * @returns True if registered
   */
  has(token: string): boolean {
    return this.registrations.has(token);
  }
  
  /**
   * Create a new scope
   * @returns Scoped container
   */
  createScope(): Container {
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
  clear(): void {
    this.registrations.clear();
    this.scopedInstances.clear();
  }
  
  /**
   * Clear scoped instances
   */
  clearScope(): void {
    this.scopedInstances.clear();
  }
  
  /**
   * Get all registered tokens
   * @returns Array of tokens
   */
  getTokens(): string[] {
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
} as const;