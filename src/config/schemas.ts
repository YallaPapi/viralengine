/**
 * Configuration validation schemas
 * Provides type-safe validation for all configuration categories
 */

import { z } from 'zod';

// API Configuration Schemas
export const OpenAIConfigSchema = z.object({
  apiKey: z.string().min(1, 'OpenAI API key is required'),
  model: z.string().default('gpt-4o'),
  maxTokens: z.number().int().positive().default(2000),
  temperature: z.number().min(0).max(2).default(0.7),
  timeout: z.number().int().positive().default(30000),
  retryAttempts: z.number().int().min(0).max(5).default(3),
  retryDelay: z.number().int().positive().default(1000)
});

export const ElevenLabsConfigSchema = z.object({
  apiKey: z.string().min(1, 'ElevenLabs API key is required'),
  voiceId: z.string().default('21m00Tcm4TlvDq8ikWAM'),
  modelId: z.string().default('eleven_monolingual_v1'),
  stability: z.number().min(0).max(1).default(0.5),
  similarityBoost: z.number().min(0).max(1).default(0.5),
  timeout: z.number().int().positive().default(60000),
  retryAttempts: z.number().int().min(0).max(5).default(3)
});

export const PexelsConfigSchema = z.object({
  apiKey: z.string().min(1, 'Pexels API key is required'),
  perPage: z.number().int().min(1).max(80).default(15),
  orientation: z.enum(['landscape', 'portrait', 'square']).default('portrait'),
  size: z.enum(['large', 'medium', 'small']).default('large'),
  timeout: z.number().int().positive().default(15000),
  retryAttempts: z.number().int().min(0).max(5).default(3),
  cacheEnabled: z.boolean().default(true),
  cacheTTL: z.number().int().positive().default(3600000) // 1 hour
});

export const PixabayConfigSchema = z.object({
  apiKey: z.string().min(1, 'Pixabay API key is required'),
  perPage: z.number().int().min(3).max(200).default(20),
  videoType: z.enum(['all', 'film', 'animation']).default('all'),
  minWidth: z.number().int().positive().default(1920),
  minHeight: z.number().int().positive().default(1080),
  timeout: z.number().int().positive().default(15000),
  retryAttempts: z.number().int().min(0).max(5).default(3),
  cacheEnabled: z.boolean().default(true),
  cacheTTL: z.number().int().positive().default(3600000) // 1 hour
});

// Video Output Settings Schema
export const VideoConfigSchema = z.object({
  width: z.number().int().positive().default(1080),
  height: z.number().int().positive().default(1920),
  fps: z.number().int().min(24).max(60).default(30),
  defaultDuration: z.number().positive().default(30),
  format: z.enum(['mp4', 'webm', 'mov']).default('mp4'),
  codec: z.string().default('libx264'),
  preset: z.enum(['ultrafast', 'superfast', 'veryfast', 'faster', 'fast', 'medium', 'slow', 'slower', 'veryslow']).default('fast'),
  crf: z.number().int().min(0).max(51).default(23),
  audioBitrate: z.string().default('128k'),
  videoBitrate: z.string().optional(),
  aspectRatio: z.enum(['9:16', '16:9', '1:1', '4:5']).default('9:16')
});

// Processing Options Schema
export const ProcessingConfigSchema = z.object({
  batchSize: z.number().int().min(1).max(10).default(3),
  maxConcurrency: z.number().int().min(1).max(10).default(3),
  queueSize: z.number().int().min(1).max(100).default(10),
  workerThreads: z.number().int().min(1).max(16).default(4),
  memoryLimit: z.number().int().positive().default(2048), // MB
  cpuLimit: z.number().min(0.1).max(1).default(0.8), // percentage
  gpuAcceleration: z.boolean().default(false),
  gpuDevice: z.string().optional()
});

// File Paths and Storage Schema
export const PathsConfigSchema = z.object({
  templates: z.string().default('./data/templates.json'),
  output: z.string().default('./output'),
  temp: z.string().default('./temp'),
  assets: z.string().default('./assets'),
  cache: z.string().default('./cache'),
  logs: z.string().default('./logs'),
  ffmpegBinary: z.string().optional(),
  ffprobeBinary: z.string().optional()
});

// Feature Flags Schema
export const FeatureFlagsSchema = z.object({
  enableCaching: z.boolean().default(true),
  enableMetrics: z.boolean().default(true),
  enableDebugMode: z.boolean().default(false),
  enableAutoRetry: z.boolean().default(true),
  enableProgressiveDownload: z.boolean().default(true),
  enableParallelProcessing: z.boolean().default(true),
  enableQualityOptimization: z.boolean().default(true),
  enableWatermark: z.boolean().default(false),
  enableAutoCleanup: z.boolean().default(true),
  enableWebhooks: z.boolean().default(false)
});

// Logging Configuration Schema
export const LoggingConfigSchema = z.object({
  level: z.enum(['error', 'warn', 'info', 'debug', 'verbose']).default('info'),
  file: z.string().default('./logs/app.log'),
  maxFiles: z.number().int().positive().default(5),
  maxSize: z.string().default('10m'),
  datePattern: z.string().default('YYYY-MM-DD'),
  colorize: z.boolean().default(true),
  timestamp: z.boolean().default(true),
  prettyPrint: z.boolean().default(false),
  handleExceptions: z.boolean().default(true),
  handleRejections: z.boolean().default(true)
});

// Cache Configuration Schema
export const CacheConfigSchema = z.object({
  enabled: z.boolean().default(true),
  store: z.enum(['memory', 'redis', 'file']).default('memory'),
  ttl: z.number().int().positive().default(3600), // seconds
  maxSize: z.number().int().positive().default(100), // MB for memory, count for redis
  checkPeriod: z.number().int().positive().default(600), // seconds
  redisUrl: z.string().optional(),
  fileStorePath: z.string().default('./cache/store')
});

// Webhook Configuration Schema
export const WebhookConfigSchema = z.object({
  enabled: z.boolean().default(false),
  endpoints: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    events: z.array(z.enum(['start', 'progress', 'complete', 'error'])),
    headers: z.record(z.string()).optional(),
    retryAttempts: z.number().int().min(0).max(5).default(3),
    timeout: z.number().int().positive().default(5000)
  })).default([])
});

// Performance Configuration Schema
export const PerformanceConfigSchema = z.object({
  monitoring: z.boolean().default(true),
  metricsInterval: z.number().int().positive().default(60000), // ms
  slowOperationThreshold: z.number().int().positive().default(5000), // ms
  memoryWarningThreshold: z.number().min(0).max(1).default(0.8), // percentage
  cpuWarningThreshold: z.number().min(0).max(1).default(0.8) // percentage
});

// Complete Configuration Schema
export const ConfigSchema = z.object({
  openai: OpenAIConfigSchema,
  elevenlabs: ElevenLabsConfigSchema,
  pexels: PexelsConfigSchema,
  pixabay: PixabayConfigSchema,
  video: VideoConfigSchema,
  processing: ProcessingConfigSchema,
  paths: PathsConfigSchema,
  features: FeatureFlagsSchema,
  logging: LoggingConfigSchema,
  cache: CacheConfigSchema,
  webhooks: WebhookConfigSchema,
  performance: PerformanceConfigSchema
});

// Type exports
export type OpenAIConfig = z.infer<typeof OpenAIConfigSchema>;
export type ElevenLabsConfig = z.infer<typeof ElevenLabsConfigSchema>;
export type PexelsConfig = z.infer<typeof PexelsConfigSchema>;
export type PixabayConfig = z.infer<typeof PixabayConfigSchema>;
export type VideoConfig = z.infer<typeof VideoConfigSchema>;
export type ProcessingConfig = z.infer<typeof ProcessingConfigSchema>;
export type PathsConfig = z.infer<typeof PathsConfigSchema>;
export type FeatureFlags = z.infer<typeof FeatureFlagsSchema>;
export type LoggingConfig = z.infer<typeof LoggingConfigSchema>;
export type CacheConfig = z.infer<typeof CacheConfigSchema>;
export type WebhookConfig = z.infer<typeof WebhookConfigSchema>;
export type PerformanceConfig = z.infer<typeof PerformanceConfigSchema>;
export type AppConfig = z.infer<typeof ConfigSchema>;

// Partial schemas for updates
export const PartialConfigSchema = ConfigSchema.partial();
export type PartialAppConfig = z.infer<typeof PartialConfigSchema>;