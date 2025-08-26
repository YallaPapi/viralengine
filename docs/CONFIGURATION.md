# Configuration Guide

This document explains how to configure the Viral Video Engine for optimal performance.

## Environment Variables (.env file)

### Required API Keys

```bash
# OpenAI API key for script generation
OPENAI_API_KEY="sk-proj-your_openai_key_here"

# ElevenLabs API key for text-to-speech
ELEVENLABS_API_KEY="your_elevenlabs_key_here"

# Pexels API key for stock videos
PEXELS_API_KEY="your_pexels_key_here"

# Pixabay API key for additional stock clips
PIXABAY_API_KEY="your_pixabay_key_here"
```

### Optional Configuration

```bash
# Logging level (debug, info, warn, error)
LOG_LEVEL="info"
```

## Configuration Settings

### Video Settings

```typescript
video: {
  width: 1080,        // Video width in pixels (portrait mode)
  height: 1920,       // Video height in pixels (9:16 aspect ratio)
  fps: 30,            // Frames per second
  defaultDuration: 30, // Default video duration in seconds
  format: 'mp4'       // Output format
}
```

### API Settings

```typescript
openai: {
  model: 'gpt-4o',     // GPT model for script generation
  maxTokens: 2000,     // Maximum tokens per request
  temperature: 0.7     // Creativity level (0-1)
}

elevenlabs: {
  voiceId: '21m00Tcm4TlvDq8ikWAM',  // Default voice ID
  modelId: 'eleven_monolingual_v1'   // TTS model
}
```

### File Paths

```typescript
paths: {
  templates: './data/templates.json',  // Viral templates file
  output: './output',                  // Generated videos folder
  temp: './temp',                      // Temporary processing files
  assets: './assets'                   // Media assets folder
}
```

### Logging

```typescript
logging: {
  level: 'info',           // Log level
  file: './logs/app.log'   // Log file location
}
```

## Configuration Validation

The system automatically validates configuration on startup and provides warnings for:

- Missing required API keys
- Invalid video dimensions
- Unusual FPS settings
- Missing file paths

## Advanced Configuration

### Custom Voice Selection

To use a different ElevenLabs voice:

1. Browse available voices in your ElevenLabs dashboard
2. Copy the voice ID
3. Update the `ELEVENLABS_VOICE_ID` environment variable

### Video Quality Settings

For higher quality output, adjust:

- `fps`: Higher values (60) for smoother motion
- `width`/`height`: Higher resolutions (1440x2560 for 2K)

### Performance Tuning

- Set `LOG_LEVEL=error` for production to reduce log verbosity
- Use SSD storage for `temp` and `output` directories
- Ensure sufficient disk space for video processing

## Troubleshooting

### Common Issues

1. **"Missing API keys" error**
   - Check your `.env` file exists
   - Verify API keys are correctly formatted
   - Ensure no extra spaces or quotes

2. **"Invalid video dimensions" warning**
   - Check width and height are positive numbers
   - Recommended aspect ratios: 9:16 (vertical), 16:9 (horizontal)

3. **Path not found errors**
   - Ensure all directories in `paths` configuration exist
   - Check file permissions for write access

### Getting API Keys

- **OpenAI**: https://platform.openai.com/api-keys
- **ElevenLabs**: https://elevenlabs.io/app/settings/api-keys
- **Pexels**: https://www.pexels.com/api/
- **Pixabay**: https://pixabay.com/api/docs/