# Architecture Document - Viral Video Generator

## 1. System Overview

### 1.1 Architecture Vision
A modular, event-driven architecture that processes video generation requests through a pipeline of specialized components, ensuring scalability, maintainability, and extensibility.

### 1.2 Architecture Principles
- **Separation of Concerns**: Each module handles a specific domain
- **Dependency Injection**: Loose coupling through interfaces
- **Event-Driven Processing**: Asynchronous pipeline execution
- **Fail-Fast with Recovery**: Early error detection with retry logic
- **Cache-First Strategy**: Minimize external API calls
- **Configuration Over Code**: Behavior controlled through configuration

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLI Interface                         │
├─────────────────────────────────────────────────────────────┤
│                     Orchestration Layer                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Queue   │  │  Worker  │  │  Monitor │  │  Logger  │  │
│  │  Manager │  │   Pool   │  │  Service │  │  Service │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
├─────────────────────────────────────────────────────────────┤
│                      Processing Pipeline                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Script  │→ │  Media   │→ │  Audio   │→ │  Video   │  │
│  │Generator │  │  Sourcer │  │Processor │  │Compositor│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
├─────────────────────────────────────────────────────────────┤
│                      Service Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   TTS    │  │  Stock   │  │  Cache   │  │  Config  │  │
│  │ Adapter  │  │  Media   │  │  Manager │  │  Manager │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ File Sys │  │ Database │  │  FFmpeg  │  │   HTTP   │  │
│  │  Manager │  │  (Cache) │  │  Wrapper │  │  Client  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 3. Component Architecture

### 3.1 Core Components

#### Script Generator
```typescript
interface IScriptGenerator {
  generateScript(topic: string, template: ITemplate): Promise<IScript>;
  validateScript(script: IScript): ValidationResult;
  enhanceScript(script: IScript, hints: EnhancementHints): Promise<IScript>;
}

class ScriptGenerator implements IScriptGenerator {
  constructor(
    private templateEngine: ITemplateEngine,
    private contentGenerator: IContentGenerator,
    private validator: IScriptValidator
  ) {}
  
  async generateScript(topic: string, template: ITemplate): Promise<IScript> {
    const content = await this.contentGenerator.generate(topic, template);
    const script = this.templateEngine.apply(template, content);
    const validation = this.validator.validate(script);
    if (!validation.isValid) throw new ScriptValidationError(validation);
    return script;
  }
}
```

#### Media Sourcer
```typescript
interface IMediaSourcer {
  searchMedia(query: MediaQuery): Promise<MediaResult[]>;
  scoreMedia(media: MediaResult, criteria: ScoringCriteria): number;
  downloadMedia(media: MediaResult): Promise<MediaFile>;
}

class MediaSourcer implements IMediaSourcer {
  constructor(
    private providers: IMediaProvider[],
    private cache: IMediaCache,
    private scorer: IMediaScorer
  ) {}
  
  async searchMedia(query: MediaQuery): Promise<MediaResult[]> {
    // Check cache first
    const cached = await this.cache.search(query);
    if (cached.length > 0) return cached;
    
    // Search providers in parallel
    const results = await Promise.all(
      this.providers.map(p => p.search(query))
    );
    
    // Score and sort results
    const scored = results.flat().map(media => ({
      ...media,
      score: this.scorer.score(media, query.criteria)
    }));
    
    return scored.sort((a, b) => b.score - a.score);
  }
}
```

#### Audio Processor
```typescript
interface IAudioProcessor {
  generateVoiceover(text: string, profile: VoiceProfile): Promise<AudioFile>;
  mixAudio(tracks: AudioTrack[]): Promise<AudioFile>;
  applyEffects(audio: AudioFile, effects: AudioEffect[]): Promise<AudioFile>;
}

class AudioProcessor implements IAudioProcessor {
  constructor(
    private ttsProvider: ITTSProvider,
    private audioMixer: IAudioMixer,
    private effectsEngine: IEffectsEngine
  ) {}
  
  async generateVoiceover(text: string, profile: VoiceProfile): Promise<AudioFile> {
    const raw = await this.ttsProvider.synthesize(text, profile);
    const normalized = await this.audioMixer.normalize(raw);
    return this.effectsEngine.enhance(normalized, profile.effects);
  }
}
```

#### Video Compositor
```typescript
interface IVideoCompositor {
  composeVideo(project: VideoProject): Promise<VideoFile>;
  applyTransitions(segments: VideoSegment[]): Promise<VideoSegment[]>;
  renderOutput(composition: Composition): Promise<VideoFile>;
}

class VideoCompositor implements IVideoCompositor {
  constructor(
    private ffmpeg: IFFmpegWrapper,
    private transitionEngine: ITransitionEngine,
    private renderer: IVideoRenderer
  ) {}
  
  async composeVideo(project: VideoProject): Promise<VideoFile> {
    const segments = await this.createSegments(project);
    const transitioned = await this.transitionEngine.apply(segments);
    const composition = await this.buildComposition(transitioned, project);
    return this.renderer.render(composition);
  }
}
```

### 3.2 Service Layer

#### Cache Manager
```typescript
interface ICacheManager {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  invalidate(pattern: string): Promise<void>;
}

class CacheManager implements ICacheManager {
  private stores: Map<CacheType, ICacheStore> = new Map([
    [CacheType.Memory, new MemoryCache()],
    [CacheType.Disk, new DiskCache()],
    [CacheType.Database, new DatabaseCache()]
  ]);
  
  async get<T>(key: string): Promise<T | null> {
    // Check caches in order of speed
    for (const [type, store] of this.stores) {
      const value = await store.get<T>(key);
      if (value !== null) {
        // Promote to faster caches
        await this.promote(key, value, type);
        return value;
      }
    }
    return null;
  }
}
```

#### Configuration Manager
```typescript
interface IConfigurationManager {
  load(): Promise<Configuration>;
  get<T>(key: string): T;
  set<T>(key: string, value: T): void;
  validate(): ValidationResult;
}

class ConfigurationManager implements IConfigurationManager {
  private config: Configuration;
  private schema: ConfigSchema;
  
  async load(): Promise<Configuration> {
    const sources = [
      this.loadDefaults(),
      this.loadFile(),
      this.loadEnvironment(),
      this.loadArguments()
    ];
    
    this.config = await this.merge(sources);
    const validation = this.validate();
    if (!validation.isValid) {
      throw new ConfigurationError(validation);
    }
    
    return this.config;
  }
}
```

## 4. Data Flow Architecture

### 4.1 Request Processing Pipeline
```
[Topic Input] → [Queue] → [Worker Assignment] → [Script Generation]
                                                        ↓
[Output Export] ← [Video Rendering] ← [Composition] ← [Media Sourcing]
                         ↑                              ↓
                  [Text Overlays]              [Audio Processing]
```

### 4.2 Event Flow
```typescript
enum PipelineEvent {
  PROJECT_CREATED = 'project.created',
  SCRIPT_GENERATED = 'script.generated',
  MEDIA_SOURCED = 'media.sourced',
  AUDIO_PROCESSED = 'audio.processed',
  VIDEO_COMPOSED = 'video.composed',
  RENDERING_STARTED = 'rendering.started',
  RENDERING_COMPLETED = 'rendering.completed',
  PROJECT_COMPLETED = 'project.completed',
  ERROR_OCCURRED = 'error.occurred'
}

class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();
  
  on(event: PipelineEvent, handler: EventHandler): void {
    const handlers = this.handlers.get(event) || [];
    handlers.push(handler);
    this.handlers.set(event, handlers);
  }
  
  async emit(event: PipelineEvent, data: any): Promise<void> {
    const handlers = this.handlers.get(event) || [];
    await Promise.all(handlers.map(h => h(data)));
  }
}
```

## 5. Database Schema

### 5.1 Cache Database (SQLite)
```sql
-- Media cache table
CREATE TABLE media_cache (
  id TEXT PRIMARY KEY,
  query TEXT NOT NULL,
  provider TEXT NOT NULL,
  url TEXT NOT NULL,
  file_path TEXT,
  metadata JSON,
  score INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ttl INTEGER DEFAULT 86400
);

-- Project state table
CREATE TABLE project_state (
  id TEXT PRIMARY KEY,
  topic TEXT NOT NULL,
  status TEXT NOT NULL,
  script JSON,
  media_assets JSON,
  audio_tracks JSON,
  output_path TEXT,
  error JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Template cache table
CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  structure JSON NOT NULL,
  metadata JSON,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 6. API Design

### 6.1 Internal APIs

#### Pipeline API
```typescript
interface IPipelineAPI {
  createProject(request: ProjectRequest): Promise<Project>;
  getProjectStatus(projectId: string): Promise<ProjectStatus>;
  cancelProject(projectId: string): Promise<void>;
  retryProject(projectId: string, fromStage?: PipelineStage): Promise<void>;
}
```

#### Media API
```typescript
interface IMediaAPI {
  search(query: string, options?: SearchOptions): Promise<MediaResult[]>;
  download(mediaId: string): Promise<MediaFile>;
  getMetadata(mediaId: string): Promise<MediaMetadata>;
}
```

#### Rendering API
```typescript
interface IRenderingAPI {
  render(composition: Composition): Promise<RenderJob>;
  getRenderStatus(jobId: string): Promise<RenderStatus>;
  getRenderOutput(jobId: string): Promise<VideoFile>;
}
```

### 6.2 External API Adapters

#### TTS Provider Adapter
```typescript
abstract class TTSAdapter {
  abstract synthesize(text: string, options: TTSOptions): Promise<AudioBuffer>;
  abstract getVoices(): Promise<Voice[]>;
  abstract estimateCost(text: string): number;
}

class ElevenLabsAdapter extends TTSAdapter {
  async synthesize(text: string, options: TTSOptions): Promise<AudioBuffer> {
    const response = await this.client.textToSpeech({
      text,
      voice_id: options.voiceId,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: options.stability || 0.5,
        similarity_boost: options.similarity || 0.5
      }
    });
    return this.convertToAudioBuffer(response.audio);
  }
}
```

## 7. Security Architecture

### 7.1 API Key Management
```typescript
class SecureKeyStore {
  private keys: Map<string, EncryptedKey> = new Map();
  
  constructor(private encryptor: IEncryptor) {}
  
  setKey(provider: string, key: string): void {
    const encrypted = this.encryptor.encrypt(key);
    this.keys.set(provider, encrypted);
  }
  
  getKey(provider: string): string {
    const encrypted = this.keys.get(provider);
    if (!encrypted) throw new Error(`Key not found for ${provider}`);
    return this.encryptor.decrypt(encrypted);
  }
}
```

### 7.2 Input Validation
```typescript
class InputValidator {
  validateTopic(topic: string): ValidationResult {
    const rules = [
      { test: (t: string) => t.length > 0, message: 'Topic cannot be empty' },
      { test: (t: string) => t.length < 200, message: 'Topic too long' },
      { test: (t: string) => !this.containsMalicious(t), message: 'Invalid characters' }
    ];
    
    return this.runValidation(topic, rules);
  }
  
  private containsMalicious(input: string): boolean {
    const patterns = [/<script/i, /javascript:/i, /on\w+=/i];
    return patterns.some(p => p.test(input));
  }
}
```

## 8. Performance Optimization

### 8.1 Parallel Processing
```typescript
class ParallelProcessor {
  constructor(private maxConcurrency: number = 4) {}
  
  async processItems<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>
  ): Promise<R[]> {
    const queue = [...items];
    const results: R[] = [];
    const workers: Promise<void>[] = [];
    
    for (let i = 0; i < this.maxConcurrency; i++) {
      workers.push(this.worker(queue, processor, results));
    }
    
    await Promise.all(workers);
    return results;
  }
  
  private async worker<T, R>(
    queue: T[],
    processor: (item: T) => Promise<R>,
    results: R[]
  ): Promise<void> {
    while (queue.length > 0) {
      const item = queue.shift();
      if (item) {
        const result = await processor(item);
        results.push(result);
      }
    }
  }
}
```

### 8.2 Resource Pooling
```typescript
class ResourcePool<T> {
  private available: T[] = [];
  private inUse: Set<T> = new Set();
  
  constructor(
    private factory: () => T,
    private size: number
  ) {
    this.initialize();
  }
  
  async acquire(): Promise<T> {
    while (this.available.length === 0) {
      await this.wait(100);
    }
    
    const resource = this.available.pop()!;
    this.inUse.add(resource);
    return resource;
  }
  
  release(resource: T): void {
    this.inUse.delete(resource);
    this.available.push(resource);
  }
}
```

## 9. Error Handling Strategy

### 9.1 Error Categories
```typescript
enum ErrorCategory {
  CONFIGURATION = 'CONFIGURATION',
  VALIDATION = 'VALIDATION',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  PROCESSING = 'PROCESSING',
  RESOURCE = 'RESOURCE',
  SYSTEM = 'SYSTEM'
}

abstract class BaseError extends Error {
  constructor(
    message: string,
    public category: ErrorCategory,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
  }
}
```

### 9.2 Retry Strategy
```typescript
class RetryManager {
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const maxAttempts = options.maxAttempts || 3;
    const backoff = options.backoff || 1000;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (!this.isRetryable(error) || attempt === maxAttempts) {
          throw error;
        }
        
        await this.wait(backoff * Math.pow(2, attempt - 1));
      }
    }
    
    throw new Error('Retry failed');
  }
}
```

## 10. Deployment Architecture

### 10.1 Container Structure
```dockerfile
# Dockerfile
FROM node:20-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

# Install dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Copy application
COPY dist ./dist
COPY templates ./templates

# Runtime configuration
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### 10.2 Scaling Strategy
- **Horizontal Scaling**: Queue-based worker distribution
- **Vertical Scaling**: Resource pool management
- **Cache Distribution**: Redis for shared cache
- **Load Balancing**: Round-robin worker assignment

## 11. Monitoring & Observability

### 11.1 Metrics Collection
```typescript
interface IMetricsCollector {
  recordDuration(metric: string, duration: number): void;
  incrementCounter(metric: string): void;
  recordGauge(metric: string, value: number): void;
}

class MetricsCollector implements IMetricsCollector {
  private metrics: Map<string, Metric> = new Map();
  
  recordDuration(name: string, duration: number): void {
    this.getMetric(name, MetricType.Histogram).record(duration);
  }
  
  incrementCounter(name: string): void {
    this.getMetric(name, MetricType.Counter).increment();
  }
}
```

### 11.2 Health Checks
```typescript
interface IHealthCheck {
  check(): Promise<HealthStatus>;
}

class SystemHealthCheck implements IHealthCheck {
  constructor(
    private checks: Map<string, IHealthCheck>
  ) {}
  
  async check(): Promise<HealthStatus> {
    const results = await Promise.all(
      Array.from(this.checks.entries()).map(async ([name, check]) => ({
        name,
        status: await check.check()
      }))
    );
    
    return {
      healthy: results.every(r => r.status.healthy),
      checks: results
    };
  }
}
```

## 12. Testing Strategy

### 12.1 Test Architecture
```
tests/
├── unit/           # Component isolation tests
├── integration/    # Module interaction tests
├── e2e/           # Full pipeline tests
├── performance/   # Load and stress tests
├── fixtures/      # Test data and mocks
└── helpers/       # Test utilities
```

### 12.2 Test Patterns
```typescript
// Unit test example
describe('ScriptGenerator', () => {
  let generator: ScriptGenerator;
  let mockTemplateEngine: jest.Mocked<ITemplateEngine>;
  
  beforeEach(() => {
    mockTemplateEngine = createMock<ITemplateEngine>();
    generator = new ScriptGenerator(mockTemplateEngine);
  });
  
  it('should generate valid script from template', async () => {
    const topic = 'Best Headphones';
    const template = createTestTemplate();
    mockTemplateEngine.apply.mockResolvedValue(createTestScript());
    
    const script = await generator.generateScript(topic, template);
    
    expect(script).toHaveProperty('intro');
    expect(script.items).toHaveLength(5);
    expect(mockTemplateEngine.apply).toHaveBeenCalledWith(template, expect.any(Object));
  });
});
```

## 13. Documentation Structure

### 13.1 Code Documentation
- JSDoc for all public APIs
- Interface documentation
- Usage examples in comments
- Architecture decision records (ADRs)

### 13.2 API Documentation
- OpenAPI/Swagger specs
- Postman collections
- Integration guides
- SDK documentation

## 14. Future Architecture Considerations

### 14.1 Microservices Migration Path
- Script service
- Media service
- Rendering service
- Queue service

### 14.2 Cloud-Native Features
- Kubernetes deployment
- Service mesh integration
- Distributed tracing
- Cloud storage integration