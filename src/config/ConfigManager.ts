/**
 * ConfigManager - Comprehensive configuration management system
 * Handles loading, validation, hot-reloading, and type-safe access
 */

import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { z } from 'zod';
import { 
  ConfigSchema, 
  AppConfig, 
  PartialAppConfig,
  PartialConfigSchema 
} from './schemas';

export interface ConfigManagerOptions {
  envPath?: string;
  configPath?: string;
  defaultConfigPath?: string;
  productionConfigPath?: string;
  enableHotReload?: boolean;
  watchInterval?: number;
  validateOnLoad?: boolean;
  strict?: boolean;
}

export class ConfigManager extends EventEmitter {
  private config: AppConfig;
  private options: Required<ConfigManagerOptions>;
  private watchHandles: Map<string, fs.FSWatcher> = new Map();
  private lastConfigHash: string = '';
  private isInitialized: boolean = false;

  constructor(options: ConfigManagerOptions = {}) {
    super();
    
    this.options = {
      envPath: options.envPath || '.env',
      configPath: options.configPath || 'config/config.json',
      defaultConfigPath: options.defaultConfigPath || 'config/default.json',
      productionConfigPath: options.productionConfigPath || 'config/production.json',
      enableHotReload: options.enableHotReload !== false,
      watchInterval: options.watchInterval || 1000,
      validateOnLoad: options.validateOnLoad !== false,
      strict: options.strict || false
    };

    // Initialize with default configuration
    this.config = this.getDefaultConfig();
  }

  /**
   * Initialize the configuration manager
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Load environment variables
      this.loadEnvironment();

      // Load configuration files
      await this.loadConfiguration();

      // Validate configuration if required
      if (this.options.validateOnLoad) {
        this.validate();
      }

      // Setup hot reloading if enabled
      if (this.options.enableHotReload) {
        this.setupHotReload();
      }

      this.isInitialized = true;
      this.emit('initialized', this.config);
    } catch (error) {
      this.emit('error', error);
      if (this.options.strict) {
        throw error;
      }
    }
  }

  /**
   * Get the current configuration
   */
  public getConfig(): Readonly<AppConfig> {
    return Object.freeze(JSON.parse(JSON.stringify(this.config)));
  }

  /**
   * Get a specific configuration value by path
   */
  public get<T = any>(path: string): T {
    const keys = path.split('.');
    let value: any = this.config;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined as any;
      }
    }
    
    return value as T;
  }

  /**
   * Set a configuration value
   */
  public set(path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    let target: any = this.config;
    
    for (const key of keys) {
      if (!(key in target) || typeof target[key] !== 'object') {
        target[key] = {};
      }
      target = target[key];
    }
    
    const oldValue = target[lastKey];
    target[lastKey] = value;
    
    // Validate the new configuration
    try {
      this.validate();
      this.emit('changed', { path, oldValue, newValue: value });
    } catch (error) {
      // Rollback on validation failure
      target[lastKey] = oldValue;
      throw error;
    }
  }

  /**
   * Update multiple configuration values
   */
  public update(updates: PartialAppConfig): void {
    const oldConfig = JSON.parse(JSON.stringify(this.config));
    
    try {
      // Merge updates
      this.mergeConfig(updates);
      
      // Validate
      this.validate();
      
      this.emit('updated', { oldConfig, newConfig: this.config });
    } catch (error) {
      // Rollback on failure
      this.config = oldConfig;
      throw error;
    }
  }

  /**
   * Validate the current configuration
   */
  public validate(): void {
    try {
      ConfigSchema.parse(this.config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }));
        
        const validationError = new Error('Configuration validation failed');
        (validationError as any).issues = issues;
        throw validationError;
      }
      throw error;
    }
  }

  /**
   * Reset configuration to defaults
   */
  public reset(): void {
    const oldConfig = this.config;
    this.config = this.getDefaultConfig();
    this.emit('reset', { oldConfig, newConfig: this.config });
  }

  /**
   * Save current configuration to file
   */
  public async save(filePath?: string): Promise<void> {
    const targetPath = filePath || this.options.configPath;
    
    // Ensure directory exists
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Filter out sensitive data
    const configToSave = this.getSanitizedConfig();
    
    // Write to file
    await fs.promises.writeFile(
      targetPath,
      JSON.stringify(configToSave, null, 2),
      'utf8'
    );
    
    this.emit('saved', targetPath);
  }

  /**
   * Reload configuration from files
   */
  public async reload(): Promise<void> {
    const oldConfig = this.config;
    
    try {
      await this.loadConfiguration();
      
      if (this.options.validateOnLoad) {
        this.validate();
      }
      
      this.emit('reloaded', { oldConfig, newConfig: this.config });
    } catch (error) {
      this.config = oldConfig;
      throw error;
    }
  }

  /**
   * Stop watching configuration files
   */
  public stopWatching(): void {
    for (const [file, watcher] of this.watchHandles) {
      watcher.close();
    }
    this.watchHandles.clear();
    this.emit('watchingStopped');
  }

  /**
   * Load environment variables
   */
  private loadEnvironment(): void {
    if (fs.existsSync(this.options.envPath)) {
      const result = dotenv.config({ path: this.options.envPath });
      
      if (result.error && this.options.strict) {
        throw result.error;
      }
    }
    
    // Map environment variables to configuration
    this.mapEnvironmentVariables();
  }

  /**
   * Load configuration from files
   */
  private async loadConfiguration(): Promise<void> {
    // Start with default configuration
    this.config = this.getDefaultConfig();
    
    // Load default configuration file if exists
    if (fs.existsSync(this.options.defaultConfigPath)) {
      const defaultConfig = await this.loadConfigFile(this.options.defaultConfigPath);
      this.mergeConfig(defaultConfig);
    }
    
    // Load environment-specific configuration
    const env = process.env.NODE_ENV || 'development';
    if (env === 'production' && fs.existsSync(this.options.productionConfigPath)) {
      const prodConfig = await this.loadConfigFile(this.options.productionConfigPath);
      this.mergeConfig(prodConfig);
    }
    
    // Load user configuration file if exists
    if (fs.existsSync(this.options.configPath)) {
      const userConfig = await this.loadConfigFile(this.options.configPath);
      this.mergeConfig(userConfig);
    }
    
    // Apply environment variable overrides
    this.mapEnvironmentVariables();
  }

  /**
   * Load a configuration file
   */
  private async loadConfigFile(filePath: string): Promise<PartialAppConfig> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      const config = JSON.parse(content);
      
      // Validate partial configuration
      return PartialConfigSchema.parse(config);
    } catch (error) {
      if (this.options.strict) {
        throw new Error(`Failed to load config file ${filePath}: ${error}`);
      }
      return {};
    }
  }

  /**
   * Map environment variables to configuration
   */
  private mapEnvironmentVariables(): void {
    // API Keys
    if (process.env.OPENAI_API_KEY) {
      this.config.openai.apiKey = process.env.OPENAI_API_KEY;
    }
    if (process.env.ELEVENLABS_API_KEY) {
      this.config.elevenlabs.apiKey = process.env.ELEVENLABS_API_KEY;
    }
    if (process.env.PEXELS_API_KEY) {
      this.config.pexels.apiKey = process.env.PEXELS_API_KEY;
    }
    if (process.env.PIXABAY_API_KEY) {
      this.config.pixabay.apiKey = process.env.PIXABAY_API_KEY;
    }
    
    // Logging
    if (process.env.LOG_LEVEL) {
      this.config.logging.level = process.env.LOG_LEVEL as any;
    }
    
    // Feature flags
    if (process.env.DEBUG_MODE === 'true') {
      this.config.features.enableDebugMode = true;
    }
    
    // Processing
    if (process.env.MAX_CONCURRENCY) {
      this.config.processing.maxConcurrency = parseInt(process.env.MAX_CONCURRENCY, 10);
    }
    if (process.env.BATCH_SIZE) {
      this.config.processing.batchSize = parseInt(process.env.BATCH_SIZE, 10);
    }
  }

  /**
   * Merge configuration objects
   */
  private mergeConfig(updates: PartialAppConfig): void {
    this.config = this.deepMerge(this.config, updates) as AppConfig;
  }

  /**
   * Deep merge two objects
   */
  private deepMerge(target: any, source: any): any {
    if (!source) return target;
    
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] === null || source[key] === undefined) {
        continue;
      }
      
      if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): AppConfig {
    return {
      openai: {
        apiKey: '',
        model: 'gpt-4o',
        maxTokens: 2000,
        temperature: 0.7,
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000
      },
      elevenlabs: {
        apiKey: '',
        voiceId: '21m00Tcm4TlvDq8ikWAM',
        modelId: 'eleven_monolingual_v1',
        stability: 0.5,
        similarityBoost: 0.5,
        timeout: 60000,
        retryAttempts: 3
      },
      pexels: {
        apiKey: '',
        perPage: 15,
        orientation: 'portrait',
        size: 'large',
        timeout: 15000,
        retryAttempts: 3,
        cacheEnabled: true,
        cacheTTL: 3600000
      },
      pixabay: {
        apiKey: '',
        perPage: 20,
        videoType: 'all',
        minWidth: 1920,
        minHeight: 1080,
        timeout: 15000,
        retryAttempts: 3,
        cacheEnabled: true,
        cacheTTL: 3600000
      },
      video: {
        width: 1080,
        height: 1920,
        fps: 30,
        defaultDuration: 30,
        format: 'mp4',
        codec: 'libx264',
        preset: 'fast',
        crf: 23,
        audioBitrate: '128k',
        videoBitrate: undefined,
        aspectRatio: '9:16'
      },
      processing: {
        batchSize: 3,
        maxConcurrency: 3,
        queueSize: 10,
        workerThreads: 4,
        memoryLimit: 2048,
        cpuLimit: 0.8,
        gpuAcceleration: false,
        gpuDevice: undefined
      },
      paths: {
        templates: path.join(process.cwd(), 'data', 'templates.json'),
        output: path.join(process.cwd(), 'output'),
        temp: path.join(process.cwd(), 'temp'),
        assets: path.join(process.cwd(), 'assets'),
        cache: path.join(process.cwd(), 'cache'),
        logs: path.join(process.cwd(), 'logs'),
        ffmpegBinary: undefined,
        ffprobeBinary: undefined
      },
      features: {
        enableCaching: true,
        enableMetrics: true,
        enableDebugMode: false,
        enableAutoRetry: true,
        enableProgressiveDownload: true,
        enableParallelProcessing: true,
        enableQualityOptimization: true,
        enableWatermark: false,
        enableAutoCleanup: true,
        enableWebhooks: false
      },
      logging: {
        level: 'info',
        file: path.join(process.cwd(), 'logs', 'app.log'),
        maxFiles: 5,
        maxSize: '10m',
        datePattern: 'YYYY-MM-DD',
        colorize: true,
        timestamp: true,
        prettyPrint: false,
        handleExceptions: true,
        handleRejections: true
      },
      cache: {
        enabled: true,
        store: 'memory',
        ttl: 3600,
        maxSize: 100,
        checkPeriod: 600,
        redisUrl: undefined,
        fileStorePath: path.join(process.cwd(), 'cache', 'store')
      },
      webhooks: {
        enabled: false,
        endpoints: []
      },
      performance: {
        monitoring: true,
        metricsInterval: 60000,
        slowOperationThreshold: 5000,
        memoryWarningThreshold: 0.8,
        cpuWarningThreshold: 0.8
      }
    };
  }

  /**
   * Get sanitized configuration (without sensitive data)
   */
  private getSanitizedConfig(): PartialAppConfig {
    const config = JSON.parse(JSON.stringify(this.config));
    
    // Remove sensitive API keys
    if (config.openai) {
      delete config.openai.apiKey;
    }
    if (config.elevenlabs) {
      delete config.elevenlabs.apiKey;
    }
    if (config.pexels) {
      delete config.pexels.apiKey;
    }
    if (config.pixabay) {
      delete config.pixabay.apiKey;
    }
    if (config.cache && config.cache.redisUrl) {
      delete config.cache.redisUrl;
    }
    
    return config;
  }

  /**
   * Setup hot reloading of configuration files
   */
  private setupHotReload(): void {
    const filesToWatch = [
      this.options.envPath,
      this.options.configPath,
      this.options.defaultConfigPath,
      this.options.productionConfigPath
    ];
    
    for (const file of filesToWatch) {
      if (fs.existsSync(file)) {
        const watcher = fs.watch(file, { persistent: false }, (eventType) => {
          if (eventType === 'change') {
            this.handleFileChange(file);
          }
        });
        
        this.watchHandles.set(file, watcher);
      }
    }
  }

  /**
   * Handle configuration file change
   */
  private handleFileChange(filePath: string): void {
    // Debounce multiple rapid changes
    const currentHash = this.getFileHash(filePath);
    if (currentHash === this.lastConfigHash) {
      return;
    }
    
    this.lastConfigHash = currentHash;
    
    setTimeout(async () => {
      try {
        await this.reload();
        this.emit('hotReloaded', filePath);
      } catch (error) {
        this.emit('hotReloadError', { filePath, error });
      }
    }, this.options.watchInterval);
  }

  /**
   * Get file hash for change detection
   */
  private getFileHash(filePath: string): string {
    try {
      const stats = fs.statSync(filePath);
      return `${stats.size}-${stats.mtimeMs}`;
    } catch {
      return '';
    }
  }
}

// Singleton instance
let configManagerInstance: ConfigManager | null = null;

/**
 * Get the singleton ConfigManager instance
 */
export function getConfigManager(options?: ConfigManagerOptions): ConfigManager {
  if (!configManagerInstance) {
    configManagerInstance = new ConfigManager(options);
  }
  return configManagerInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetConfigManager(): void {
  if (configManagerInstance) {
    configManagerInstance.stopWatching();
    configManagerInstance = null;
  }
}

export default ConfigManager;