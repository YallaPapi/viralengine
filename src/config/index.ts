/**
 * Configuration module - Provides centralized configuration management
 */

import { ConfigManager, getConfigManager } from './ConfigManager';
import type { 
  AppConfig,
  OpenAIConfig,
  ElevenLabsConfig,
  PexelsConfig,
  PixabayConfig,
  VideoConfig,
  ProcessingConfig,
  PathsConfig,
  FeatureFlags,
  LoggingConfig,
  CacheConfig,
  WebhookConfig,
  PerformanceConfig
} from './schemas';

// Initialize the configuration manager
const configManager = getConfigManager({
  enableHotReload: process.env.NODE_ENV !== 'production',
  strict: process.env.NODE_ENV === 'production',
  validateOnLoad: true
});

// Initialize configuration on module load
let initPromise: Promise<void> | null = null;

/**
 * Ensure configuration is initialized
 */
async function ensureInitialized(): Promise<void> {
  if (!initPromise) {
    initPromise = configManager.initialize();
  }
  await initPromise;
}

/**
 * Get the complete configuration
 */
export async function getConfig(): Promise<AppConfig> {
  await ensureInitialized();
  return configManager.getConfig();
}

/**
 * Get a specific configuration value
 */
export async function get<T = any>(path: string): Promise<T> {
  await ensureInitialized();
  return configManager.get<T>(path);
}

/**
 * Update configuration
 */
export async function updateConfig(updates: Partial<AppConfig>): Promise<void> {
  await ensureInitialized();
  configManager.update(updates);
}

/**
 * Save configuration to file
 */
export async function saveConfig(filePath?: string): Promise<void> {
  await ensureInitialized();
  await configManager.save(filePath);
}

/**
 * Reload configuration from files
 */
export async function reloadConfig(): Promise<void> {
  await ensureInitialized();
  await configManager.reload();
}

/**
 * Validate current configuration
 */
export async function validateConfig(): Promise<void> {
  await ensureInitialized();
  configManager.validate();
}

/**
 * Subscribe to configuration changes
 */
export function onConfigChange(callback: (event: any) => void): void {
  configManager.on('changed', callback);
}

/**
 * Subscribe to configuration updates
 */
export function onConfigUpdate(callback: (event: any) => void): void {
  configManager.on('updated', callback);
}

/**
 * Subscribe to hot reload events
 */
export function onHotReload(callback: (filePath: string) => void): void {
  configManager.on('hotReloaded', callback);
}

// Legacy compatibility layer for existing code
let cachedConfig: AppConfig | null = null;

/**
 * Legacy config object for backward compatibility
 * @deprecated Use getConfig() instead
 */
export const config = new Proxy({} as AppConfig, {
  get(target, prop: string) {
    if (!cachedConfig) {
      console.warn('Warning: Synchronous config access detected. Consider using async getConfig() instead.');
      // Return defaults for initial access
      return configManager.get(prop);
    }
    return (cachedConfig as any)[prop];
  }
});

// Initialize and cache config for legacy access
ensureInitialized().then(() => {
  cachedConfig = configManager.getConfig();
  
  // Update cached config on changes
  configManager.on('changed', () => {
    cachedConfig = configManager.getConfig();
  });
  
  configManager.on('updated', () => {
    cachedConfig = configManager.getConfig();
  });
  
  configManager.on('reloaded', () => {
    cachedConfig = configManager.getConfig();
  });
}).catch(error => {
  console.error('Failed to initialize configuration:', error);
});

// Export the configuration manager instance for advanced usage
export { configManager };

// Export types
export type {
  AppConfig,
  OpenAIConfig,
  ElevenLabsConfig,
  PexelsConfig,
  PixabayConfig,
  VideoConfig,
  ProcessingConfig,
  PathsConfig,
  FeatureFlags,
  LoggingConfig,
  CacheConfig,
  WebhookConfig,
  PerformanceConfig
};

// Export schema validation utilities
export { ConfigSchema, PartialConfigSchema } from './schemas';