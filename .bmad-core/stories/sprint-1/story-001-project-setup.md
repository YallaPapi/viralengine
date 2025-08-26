# Story 001: Project Setup and Core Architecture

## Story Details
- **ID**: VVG-001
- **Title**: Initialize Project Foundation and Core Architecture
- **Priority**: Critical
- **Estimate**: 3 hours
- **Sprint**: 1
- **Dependencies**: None

## Context from Planning Documents

### From PRD
The Viral Video Generator requires a modular, scalable system that can generate thousands of unique videos from simple topic inputs. The system must support Node.js v20+ with TypeScript 5+, using FFmpeg for video processing and various AI APIs for content generation.

### From Architecture Document
The system follows an event-driven architecture with these core principles:
- Separation of Concerns: Each module handles a specific domain
- Dependency Injection: Loose coupling through interfaces
- Event-Driven Processing: Asynchronous pipeline execution
- Fail-Fast with Recovery: Early error detection with retry logic
- Cache-First Strategy: Minimize external API calls
- Configuration Over Code: Behavior controlled through configuration

### Project Structure Required
```
viralengine/
├── src/
│   ├── core/           # Core modules and interfaces
│   │   ├── interfaces/ # Core interface definitions
│   │   ├── models/     # Data models and types
│   │   ├── errors/     # Custom error classes
│   │   └── di/         # Dependency injection
│   ├── script/         # Script generation engine
│   ├── media/          # Media sourcing and management
│   ├── video/          # Video composition engine
│   ├── audio/          # Audio processing
│   ├── text/           # Text overlay system
│   ├── cli/            # Command-line interface
│   └── utils/          # Shared utilities
├── config/             # Configuration files
├── templates/          # Video templates
├── cache/             # Local cache directory
└── output/            # Generated videos
```

## Requirements

### Functional Requirements
1. Create complete directory structure as specified
2. Set up TypeScript configuration with strict mode
3. Initialize core interfaces for all major components
4. Implement base error handling system
5. Create dependency injection container
6. Set up event bus for pipeline communication

### Technical Requirements
1. TypeScript 5+ with strict type checking
2. ES modules configuration
3. Path aliases for clean imports
4. Source maps for debugging
5. Build scripts for development and production

### Core Interfaces to Create

```typescript
// src/core/interfaces/IScriptGenerator.ts
interface IScriptGenerator {
  generateScript(topic: string, template: ITemplate): Promise<IScript>;
  validateScript(script: IScript): ValidationResult;
  enhanceScript(script: IScript, hints: EnhancementHints): Promise<IScript>;
}

// src/core/interfaces/IMediaSourcer.ts
interface IMediaSourcer {
  searchMedia(query: MediaQuery): Promise<MediaResult[]>;
  scoreMedia(media: MediaResult, criteria: ScoringCriteria): number;
  downloadMedia(media: MediaResult): Promise<MediaFile>;
}

// src/core/interfaces/IAudioProcessor.ts
interface IAudioProcessor {
  generateVoiceover(text: string, profile: VoiceProfile): Promise<AudioFile>;
  mixAudio(tracks: AudioTrack[]): Promise<AudioFile>;
  applyEffects(audio: AudioFile, effects: AudioEffect[]): Promise<AudioFile>;
}

// src/core/interfaces/IVideoCompositor.ts
interface IVideoCompositor {
  composeVideo(project: VideoProject): Promise<VideoFile>;
  applyTransitions(segments: VideoSegment[]): Promise<VideoSegment[]>;
  renderOutput(composition: Composition): Promise<VideoFile>;
}
```

## Implementation Steps

### Step 1: Update TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "paths": {
      "@core/*": ["./src/core/*"],
      "@script/*": ["./src/script/*"],
      "@media/*": ["./src/media/*"],
      "@video/*": ["./src/video/*"],
      "@audio/*": ["./src/audio/*"],
      "@text/*": ["./src/text/*"],
      "@cli/*": ["./src/cli/*"],
      "@utils/*": ["./src/utils/*"],
      "@config/*": ["./config/*"],
      "@templates/*": ["./templates/*"]
    }
  },
  "include": ["src/**/*", "config/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### Step 2: Create Directory Structure
```bash
mkdir -p src/core/{interfaces,models,errors,di}
mkdir -p src/{script,media,video,audio,text,cli,utils}
mkdir -p {config,templates,cache,output}
```

### Step 3: Implement Core Interfaces
Create all interface files with proper TypeScript definitions and JSDoc comments.

### Step 4: Implement Error System
```typescript
// src/core/errors/BaseError.ts
export enum ErrorCategory {
  CONFIGURATION = 'CONFIGURATION',
  VALIDATION = 'VALIDATION',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  PROCESSING = 'PROCESSING',
  RESOURCE = 'RESOURCE',
  SYSTEM = 'SYSTEM'
}

export abstract class BaseError extends Error {
  constructor(
    message: string,
    public category: ErrorCategory,
    public code: string,
    public retryable: boolean = false,
    public context?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### Step 5: Implement Event Bus
```typescript
// src/core/EventBus.ts
export enum PipelineEvent {
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

export class EventBus {
  private static instance: EventBus;
  private handlers: Map<string, EventHandler[]> = new Map();

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

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

### Step 6: Implement Dependency Injection Container
```typescript
// src/core/di/Container.ts
export class Container {
  private static instance: Container;
  private services: Map<string, any> = new Map();
  private factories: Map<string, () => any> = new Map();

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  register<T>(token: string, factory: () => T): void {
    this.factories.set(token, factory);
  }

  registerSingleton<T>(token: string, instance: T): void {
    this.services.set(token, instance);
  }

  resolve<T>(token: string): T {
    if (this.services.has(token)) {
      return this.services.get(token);
    }

    const factory = this.factories.get(token);
    if (!factory) {
      throw new Error(`No registration found for ${token}`);
    }

    const instance = factory();
    return instance;
  }
}
```

## Testing Requirements

### Unit Tests
```typescript
// src/core/__tests__/EventBus.test.ts
describe('EventBus', () => {
  it('should emit and handle events', async () => {
    const bus = EventBus.getInstance();
    const handler = jest.fn();
    
    bus.on(PipelineEvent.PROJECT_CREATED, handler);
    await bus.emit(PipelineEvent.PROJECT_CREATED, { id: '123' });
    
    expect(handler).toHaveBeenCalledWith({ id: '123' });
  });
});
```

### Integration Tests
- Verify all directories are created correctly
- Test that TypeScript compilation works with new configuration
- Ensure path aliases resolve correctly
- Validate dependency injection container works

## Acceptance Criteria

✅ Complete directory structure created and organized
✅ TypeScript configured with strict mode and path aliases
✅ All core interfaces defined with proper typing
✅ Error handling system implemented with custom error classes
✅ Event bus implemented and tested
✅ Dependency injection container functional
✅ All code follows established patterns from architecture document
✅ Build scripts work for both development and production
✅ Unit tests pass with >80% coverage

## Definition of Done

- [ ] All directories created as specified
- [ ] TypeScript configuration updated and working
- [ ] Core interfaces implemented with JSDoc
- [ ] Error system with all error classes created
- [ ] Event bus fully functional with tests
- [ ] DI container implemented and tested
- [ ] Package.json scripts updated for build/dev
- [ ] All tests passing
- [ ] Code reviewed and follows architecture patterns
- [ ] No ESLint errors or warnings

## Notes for Developer

- Start with the TypeScript configuration first to ensure proper compilation
- Create placeholder README.md files in each directory to maintain structure in git
- Use the provided interfaces as contracts - implementation will come in later stories
- Focus on getting the foundation right - this sets up everything else
- Remember to follow the event-driven pattern from the architecture document
- Keep the dependency injection simple for now - we can enhance it later

## Related Documents
- Architecture Document: `.bmad-core/data/architecture.md`
- PRD: `.bmad-core/data/prd.md`
- Next Story: Configuration System Implementation