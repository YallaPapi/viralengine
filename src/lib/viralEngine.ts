import { v4 as uuidv4 } from 'uuid';
import { TemplateManager } from './templateManager.js';
import { ScriptGenerator } from './scriptGenerator.js';
import { ClipManager } from './clipManager.js';
import { AudioManager } from './audioManager.js';
import { VideoAssembler } from './videoAssembler.js';
import { VideoProject, VideoScript, VideoAssets, CaptionStyle } from '../types/index.js';
import { config } from '../config/index.js';
import path from 'path';
import fs from 'fs/promises';

export interface GenerationOptions {
  topic: string;
  templateId?: number;
  duration?: number;
  voiceStyle?: 'young' | 'mature' | 'energetic';
  musicStyle?: 'upbeat' | 'chill' | 'dramatic' | 'energetic';
  captionStyle?: Partial<CaptionStyle>;
  outputFormat?: 'mp4' | 'mov' | 'webm';
}

export class ViralEngine {
  private templateManager: TemplateManager;
  private scriptGenerator: ScriptGenerator;
  private clipManager: ClipManager;
  private audioManager: AudioManager;
  private videoAssembler: VideoAssembler;
  
  constructor() {
    this.templateManager = new TemplateManager();
    this.scriptGenerator = new ScriptGenerator();
    this.clipManager = new ClipManager();
    this.audioManager = new AudioManager();
    this.videoAssembler = new VideoAssembler();
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing Viral Engine...');
    
    // Load templates
    await this.templateManager.loadTemplates();
    
    // Validate configuration
    const requiredKeys = ['OPENAI_API_KEY', 'ELEVENLABS_API_KEY'];
    const missingKeys = requiredKeys.filter(key => !process.env[key]);
    
    if (missingKeys.length > 0) {
      console.warn(`⚠️ Missing API keys: ${missingKeys.join(', ')}`);
      console.warn('Some features may not work. Please check your .env file.');
    }
    
    // Create necessary directories
    const dirs = [
      config.paths.output,
      config.paths.temp || path.join(process.cwd(), 'temp'),
      config.paths.assets || path.join(process.cwd(), 'assets'),
      path.join(process.cwd(), 'logs')
    ];
    
    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
    
    console.log('✅ Viral Engine initialized');
  }

  async generateVideo(options: GenerationOptions): Promise<string> {
    console.log('\n=== Starting Video Generation ===');
    console.log(`Topic: ${options.topic}`);
    
    const project: VideoProject = {
      id: uuidv4(),
      topic: options.topic,
      templateId: options.templateId || 1,
      createdAt: new Date(),
      status: 'in_progress'
    };
    
    try {
      // Step 1: Select or get template
      console.log('\n📋 Step 1: Selecting template...');
      const template = options.templateId 
        ? this.templateManager.getTemplateById(options.templateId)
        : this.templateManager.selectTemplate(options.topic);
      
      if (!template) {
        throw new Error(`Template not found: ${options.templateId}`);
      }
      
      console.log(`✅ Using template: ${template.name}`);
      project.templateId = template.id;
      
      // Step 2: Generate script
      console.log('\n📝 Step 2: Generating script...');
      const script = await this.scriptGenerator.generateScript(options.topic, template);
      console.log(`✅ Script generated with ${script.segments.length} segments`);
      
      // Step 3: Generate voiceover
      console.log('\n🎤 Step 3: Generating voiceover...');
      const voiceoverDir = path.join(config.paths.temp || 'temp', project.id, 'audio');
      const audioAssets = await this.audioManager.generateVoiceover(script.segments, voiceoverDir);
      console.log(`✅ Generated ${audioAssets.length} audio segments`);
      
      // Step 4: Find and download video clips
      console.log('\n🎬 Step 4: Finding video clips...');
      const clips = await this.clipManager.findClipsForScript(script.segments);
      console.log(`✅ Found ${clips.length} video clips`);
      
      const clipDir = path.join(config.paths.temp || 'temp', project.id, 'clips');
      const clipPaths = await this.clipManager.downloadAllClips(clips, clipDir);
      console.log(`✅ Downloaded ${clipPaths.length} clips`);
      
      // Step 5: Process and trim clips
      console.log('\n✂️ Step 5: Processing video clips...');
      // Ensure we have enough clips by duplicating if necessary
      const adjustedClips = [...clipPaths];
      while (adjustedClips.length < script.segments.length) {
        adjustedClips.push(...clipPaths);
      }
      const clipsToProcess = adjustedClips.slice(0, script.segments.length);
      
      const processedClips = await this.videoAssembler.trimAndResizeClips(
        clipsToProcess,
        script.segments,
        config.video.width,
        config.video.height
      );
      console.log(`✅ Processed ${processedClips.length} clips`);
      
      // Step 6: Merge audio tracks
      console.log('\n🎵 Step 6: Merging audio...');
      const voiceoverPaths = audioAssets.map(a => a.path);
      const mergedAudioPath = path.join(config.paths.temp || 'temp', project.id, 'merged_audio.mp3');
      await this.audioManager.mergeAudioTracks(voiceoverPaths, mergedAudioPath, undefined);
      
      // Add background music if requested
      let finalAudioPath = mergedAudioPath;
      if (options.musicStyle) {
        const musicAddedPath = path.join(config.paths.temp || 'temp', project.id, 'audio_with_music.mp3');
        const musicStyle = options.musicStyle || this.audioManager.selectMusicStyle(template.category);
        
        try {
          finalAudioPath = await this.audioManager.addBackgroundMusic(
            mergedAudioPath,
            musicStyle,
            musicAddedPath,
            0.15 // Low volume for background
          );
        } catch (error) {
          console.warn('Could not add background music, continuing without it');
        }
      }
      console.log('✅ Audio processing complete');
      
      // Step 7: Add transitions
      console.log('\n✨ Step 7: Adding transitions...');
      const transitionedClips = await this.videoAssembler.addTransitions(processedClips);
      console.log('✅ Transitions added');
      
      // Step 8: Assemble final video
      console.log('\n🎥 Step 8: Assembling final video...');
      const outputPath = await this.videoAssembler.assembleVideo(
        project,
        transitionedClips,
        finalAudioPath
      );
      
      // Step 9: Add captions (skip for now due to subtitle filter issues)
      console.log('\n💬 Step 9: Skipping captions (subtitle filter not available)...');
      const finalVideoPath = outputPath;
      
      // TODO: Fix caption overlay with subtitles filter or use drawtext alternative
      
      // Step 10: Cleanup
      console.log('\n🧹 Step 10: Cleaning up...');
      await this.videoAssembler.cleanup();
      
      project.status = 'completed';
      console.log('\n✅ Video generation complete!');
      console.log(`📁 Output: ${finalVideoPath}`);
      
      // Save project metadata
      const metadataPath = finalVideoPath.replace('.mp4', '_metadata.json');
      await fs.writeFile(metadataPath, JSON.stringify({
        project,
        script,
        template,
        options,
        outputPath: finalVideoPath
      }, null, 2));
      
      return finalVideoPath;
      
    } catch (error) {
      project.status = 'failed';
      console.error('\n❌ Error generating video:', error);
      throw error;
    }
  }

  async generateBatch(topics: string[], templateId?: number): Promise<string[]> {
    const results: string[] = [];
    
    for (const topic of topics) {
      try {
        console.log(`\n📹 Generating video ${results.length + 1}/${topics.length}: ${topic}`);
        const videoPath = await this.generateVideo({ topic, templateId });
        results.push(videoPath);
        
        // Add delay between generations to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to generate video for topic "${topic}":`, error);
      }
    }
    
    console.log(`\n✅ Batch generation complete: ${results.length}/${topics.length} videos generated`);
    return results;
  }

  async testGeneration(): Promise<string> {
    // Generate a simple test video
    const testOptions: GenerationOptions = {
      topic: '3 Mind-Blowing AI Tools You Need to Try',
      templateId: 1, // Use the "Top 5 Dopamine List" template
      duration: 30,
      musicStyle: 'upbeat',
      captionStyle: {
        fontSize: 32,
        color: '#FFFF00',
        outlineColor: '#000000',
        outlineWidth: 3,
        position: 'center',
        bold: true
      }
    };
    
    console.log('🧪 Running test generation...');
    return await this.generateVideo(testOptions);
  }
}