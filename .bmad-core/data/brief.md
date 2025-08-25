# Viral Video Generator - Project Brief

## Executive Summary
Build an automated system that generates engaging "Top X" listicle-style videos for social media platforms (TikTok, Instagram Reels, YouTube Shorts). The system will create complete 25-40 second videos with AI-generated scripts, professional voiceovers, stock footage, and dynamic text overlays - all optimized for viral engagement.

## Problem Statement
Content creators need to produce high volumes of engaging short-form video content to maintain relevance on social media platforms. Manual video creation is time-consuming, expensive, and difficult to scale. Current solutions require significant manual effort in scripting, editing, and asset sourcing.

## Solution Overview
An AI-powered video generation engine that:
- Automatically generates scripts following proven viral formulas
- Sources relevant stock footage intelligently
- Generates professional voiceovers with variable energy levels
- Assembles complete videos with transitions and text overlays
- Supports batch processing for content at scale

## Target Users
- Content creators and influencers
- Digital marketing agencies
- Social media managers
- E-commerce brands
- Educational content producers

## Success Criteria
- Generate complete videos in under 2 minutes
- 95% success rate for media sourcing
- Support batch processing of 100+ videos
- Maintain consistent quality across outputs
- Easy template customization for different niches

## Technical Requirements
- Node.js/TypeScript implementation
- FFmpeg for video processing
- AI-powered voice synthesis (ElevenLabs/OpenAI)
- Stock media APIs (Pexels/Pixabay)
- 9:16 aspect ratio output (1080x1920)
- MP4 format with H.264/AAC codecs

## Key Features
1. **Template-Based Script Generation**
   - Customizable "Top X" formats (Top 3, 5, 10)
   - Hook-driven intro sequences
   - Progressive excitement building
   - CTA closing segments

2. **Intelligent Media Sourcing**
   - Keyword-based search algorithms
   - Quality scoring system (5-point threshold)
   - Fallback strategies for missing content
   - Local caching for efficiency

3. **Professional Audio Production**
   - Variable tone and energy levels
   - Synchronized timing with visuals
   - Background music with ducking
   - Multiple voice options

4. **Dynamic Visual Assembly**
   - Professional transitions
   - Animated text overlays
   - Countdown graphics
   - Brand customization options

5. **Batch Processing & Automation**
   - Command-line interface
   - Topic list processing
   - Error recovery
   - Progress tracking

## Constraints
- Videos must be 25-40 seconds (platform limits)
- Must maintain dopamine-driven pacing
- Requires high-quality stock footage availability
- API rate limits for external services
- Processing power for video rendering

## Deliverables
1. Core video generation engine
2. Template library for different content types
3. CLI for batch processing
4. Configuration system for customization
5. Documentation and examples
6. Testing suite and benchmarks

## Timeline
- Week 1: Architecture and script generation
- Week 2: Media sourcing and audio processing
- Week 3: Video assembly and text overlays
- Week 4: CLI, testing, and optimization

## Budget Considerations
- API costs for voice synthesis (~$0.05 per video)
- Stock media API usage (free tiers available)
- Cloud infrastructure for scaling (optional)
- Development time: ~160 hours