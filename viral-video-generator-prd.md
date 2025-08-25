# Product Requirements Document (PRD)
# Viral Video Generator – Top X Listicle Format Module

## Executive Summary
Develop an automated system to generate engaging, dopamine-driven short-form social media videos in "Top X" listicle format, optimized for TikTok, Instagram Reels, and YouTube Shorts.

## Core Requirements

### 1. Script Generation System
Implement a structured script generation engine that creates videos following this exact format:
- **Intro Segment** (3-5 seconds): Hook viewers with high-energy introduction
- **Countdown Segments** (5-7 seconds each): Present items from #X to #1 with increasing excitement
- **Closing CTA Segment** (3-5 seconds): Drive engagement with call-to-action

Each item in the countdown must include:
- Item Name (plain text string)
- Use-Case Scenario (one sentence description)
- Feature/Benefit A (short, punchy statement)
- Feature/Benefit B (second differentiator)
- Unique Selling Point (exclusive hook)
- Voiceover Instructions (tone, pacing, energy level)
- Visual Instructions (detailed, segment-specific)
- On-Screen Text (overlay specifications with positioning)

### 2. Visual Content Management
Build a sophisticated media sourcing system that:
- Searches stock footage using intelligent keyword logic
- Scores videos based on resolution (≥1080p), aspect ratio (9:16), and movement
- Implements fallback strategies for missing content
- Maintains local cache for B-roll alternation
- Ensures minimum 5-point quality threshold

### 3. Video Composition Engine
Create a video assembly system supporting:
- Format: 9:16 portrait (1080x1920)
- Duration: 25-40 seconds for Top 5 format
- Precise timing control per segment
- Dynamic text overlays with animation
- Audio ducking for background music
- Professional transitions (cuts, swooshes, pops)

### 4. Audio Processing
Develop voiceover generation with:
- Variable tone/energy levels per segment
- Crescendo delivery for #1 item
- Synchronized timing with visual cuts
- Background music integration at 30% volume

### 5. Text Overlay System
Implement dynamic text rendering:
- Large countdown numbers (#5 → #1) with animations
- Item names and features with customizable fonts
- CTA elements with engagement icons
- Default: Montserrat Bold, white with black outline

### 6. Batch Processing & CLI
Build command-line interface supporting:
- Single topic mode: `--topic "best noise-cancelling headphones"`
- List mode: `--topic-list topics.txt`
- Error recovery and graceful fallback
- Organized output structure: `/output/[date]/`

### 7. Export & Distribution
Configure export pipeline:
- File format: MP4 (H.264 codec, AAC audio)
- Naming convention: `[topic]_topX_[timestamp].mp4`
- Multiple quality profiles (1080p default, 720p fallback)
- Metadata embedding for platform optimization

## Technical Implementation Tasks

### Phase 1: Core Architecture
- Set up modular architecture for script, media, and composition engines
- Implement data models for video segments and transitions
- Create configuration system for templates and defaults
- Build error handling and logging framework

### Phase 2: Script Generation
- Develop template-based script generator
- Implement per-item field validation
- Create voiceover instruction parser
- Build visual instruction compiler

### Phase 3: Media Pipeline
- Integrate stock footage APIs (Pexels, Pixabay)
- Implement intelligent search algorithm
- Build quality scoring system
- Create local cache management

### Phase 4: Video Assembly
- Implement FFmpeg-based composition engine
- Build segment timing controller
- Create transition effect library
- Develop overlay animation system

### Phase 5: Audio Integration
- Integrate TTS API (ElevenLabs/OpenAI)
- Implement audio synchronization
- Build music bed mixer
- Create volume ducking system

### Phase 6: Text Rendering
- Develop text overlay engine
- Implement animation presets
- Create font management system
- Build positioning calculator

### Phase 7: CLI & Batch Processing
- Design command-line interface
- Implement batch processing queue
- Create progress tracking system
- Build output organization structure

### Phase 8: Testing & Optimization
- Develop comprehensive test suite
- Implement performance benchmarks
- Create quality assurance checks
- Build monitoring and analytics

## Success Criteria
- Generate complete 25-40 second videos in under 2 minutes
- Achieve 95% success rate for media sourcing
- Support batch processing of 100+ videos
- Maintain consistent quality across all outputs
- Enable easy template customization

## Dependencies
- FFmpeg for video processing
- ElevenLabs/OpenAI API for voiceover
- Pexels/Pixabay API for stock footage
- Node.js/TypeScript runtime
- 16GB+ RAM for batch processing

## Timeline Estimate
- Phase 1-2: 1 week (Architecture & Script Generation)
- Phase 3-4: 1 week (Media & Video Assembly)
- Phase 5-6: 1 week (Audio & Text)
- Phase 7-8: 1 week (CLI & Testing)
- Total: 4 weeks for complete implementation

## Risk Mitigation
- API rate limits: Implement caching and queuing
- Missing media: Develop robust fallback system
- Processing time: Add parallel processing support
- Quality variance: Create validation checkpoints