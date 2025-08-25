# Viral Engine

Automated viral video generation engine for TikTok, Instagram Reels, and YouTube Shorts.

## Status

✅ **Core Components Implemented:**
- Template management system (29 viral templates)
- Script generation with OpenAI GPT-4o
- Media APIs (Pexels, Pixabay)
- Voiceover generation with ElevenLabs
- Video assembly with FFmpeg
- CLI interface

⚠️ **Pending Requirements:**
- FFmpeg installation required for video processing

## Installation

### 1. Install FFmpeg (REQUIRED)

**Windows:**
1. Download FFmpeg from https://www.gyan.dev/ffmpeg/builds/
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to your system PATH
4. Restart your terminal

**Alternative for Windows (using Chocolatey):**
```bash
choco install ffmpeg
```

**Mac:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt update
sudo apt install ffmpeg
```

### 2. Install Node Dependencies

```bash
npm install
```

### 3. Configure API Keys

Create a `.env` file with:
```env
OPENAI_API_KEY=your_key_here
ELEVENLABS_API_KEY=your_key_here
PEXELS_API_KEY=your_key_here
PIXABAY_API_KEY=your_key_here
```

## Usage

### Check Configuration
```bash
npm run check
```

### Generate Test Video
```bash
npm test
```

### Generate Custom Video
```bash
npm run dev -- generate -t "5 Amazing Life Hacks"
```

### List Templates
```bash
npm run dev -- templates
```

### Batch Generation
Create a file `topics.txt`:
```
5 Morning Routine Tips
3 Productivity Hacks
Top AI Tools 2024
```

Then run:
```bash
npm run dev -- batch -f topics.txt
```

## Current Test Results

✅ **Working:**
- API key validation
- Template loading
- Script generation (OpenAI)
- Voiceover generation (ElevenLabs) 
- Video clip discovery (Pexels/Pixabay)
- Video clip downloading

❌ **Blocked by FFmpeg:**
- Video processing
- Audio merging
- Caption overlay
- Final video assembly

## Next Steps

1. Install FFmpeg using the instructions above
2. Run `npm test` again after FFmpeg is installed
3. The system will generate a complete viral video

## Architecture

```
Input (Topic) → Template Selection → Script Generation → Voiceover → Video Clips → Assembly → Output (MP4)
```

## Generated Files

Videos are saved to:
- `output/` - Final videos
- `temp/` - Temporary processing files (auto-cleaned)