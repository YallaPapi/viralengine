import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import path from 'path';
import { VideoProject, VideoAssets, ScriptSegment, VideoClip, CaptionStyle } from '../types/index';
import { config } from '../config/index';
import { promisify } from 'util';

// Set FFmpeg path if available
const ffmpegPath = 'C:/Program Files/Shutter Encoder/Library/ffmpeg.exe';
const ffprobePath = 'C:/Program Files/Shutter Encoder/Library/ffprobe.exe';

try {
  ffmpeg.setFfmpegPath(ffmpegPath);
  ffmpeg.setFfprobePath(ffprobePath);
} catch (error) {
  console.warn('Could not set FFmpeg path:', error);
}

export class VideoAssembler {
  private tempDir: string;
  private outputDir: string;

  constructor() {
    this.tempDir = config.paths.temp || path.join(process.cwd(), 'temp');
    this.outputDir = config.paths.output || path.join(process.cwd(), 'output');
  }

  async assembleVideo(
    project: VideoProject,
    videoPaths: string[],
    audioPath: string,
    captionPath?: string
  ): Promise<string> {
    const outputPath = path.join(this.outputDir, `${project.id}_final.mp4`);
    
    // Ensure output directory exists
    await fs.mkdir(this.outputDir, { recursive: true });
    
    return new Promise((resolve, reject) => {
      const command = ffmpeg();
      
      // Create concat file for videos
      this.createConcatFile(videoPaths).then(concatFile => {
        command
          .input(concatFile)
          .inputOptions(['-f', 'concat', '-safe', '0'])
          .input(audioPath)
          .outputOptions([
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-crf', '23',
            '-c:a', 'aac',
            '-b:a', '128k',
            '-ar', '44100',
            '-shortest',
            '-movflags', '+faststart'
          ]);
        
        // Add subtitles if provided
        if (captionPath) {
          command.outputOptions([
            '-vf', `subtitles=${captionPath.replace(/\\/g, '/')}:force_style='FontName=Arial,FontSize=24,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,Outline=2,Alignment=2,MarginV=50'`
          ]);
        }
        
        command
          .on('start', (cmd) => {
            console.log('Starting video assembly:', cmd);
          })
          .on('progress', (progress) => {
            console.log(`Assembly progress: ${progress.percent?.toFixed(1)}%`);
          })
          .on('error', (err) => {
            console.error('Error assembling video:', err);
            reject(err);
          })
          .on('end', async () => {
            console.log('✅ Video assembly complete');
            // Clean up temp concat file
            try {
              await fs.unlink(concatFile);
            } catch {}
            resolve(outputPath);
          })
          .save(outputPath);
      }).catch(reject);
    });
  }

  private async createConcatFile(videoPaths: string[]): Promise<string> {
    const concatPath = path.join(this.tempDir, `concat_${Date.now()}.txt`);
    await fs.mkdir(this.tempDir, { recursive: true });
    
    const content = videoPaths
      .map(p => `file '${p.replace(/\\/g, '/')}'`)
      .join('\n');
    
    await fs.writeFile(concatPath, content);
    return concatPath;
  }

  async trimAndResizeClips(
    clips: string[],
    segments: ScriptSegment[],
    targetWidth: number = config.video.width,
    targetHeight: number = config.video.height
  ): Promise<string[]> {
    const processedClips: string[] = [];
    
    for (let i = 0; i < clips.length && i < segments.length; i++) {
      const inputPath = clips[i];
      const outputPath = path.join(this.tempDir, `processed_${i}.mp4`);
      const duration = segments[i].duration;
      
      await this.processClip(inputPath, outputPath, duration, targetWidth, targetHeight);
      processedClips.push(outputPath);
    }
    
    return processedClips;
  }

  private async processClip(
    inputPath: string,
    outputPath: string,
    duration: number,
    width: number,
    height: number
  ): Promise<void> {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setDuration(duration)
        .videoFilters([
          `scale=${width}:${height}:force_original_aspect_ratio=increase`,
          `crop=${width}:${height}`,
          'unsharp=5:5:1.0:5:5:0.0'
        ])
        .outputOptions([
          '-c:v', 'libx264',
          '-preset', 'fast',
          '-crf', '23',
          '-an' // Remove audio from clips
        ])
        .on('error', (err) => {
          console.error(`Error processing clip ${inputPath}:`, err);
          reject(err);
        })
        .on('end', () => {
          console.log(`✅ Processed clip: ${path.basename(outputPath)}`);
          resolve();
        })
        .save(outputPath);
    });
  }

  async addCaptions(
    videoPath: string,
    segments: ScriptSegment[],
    style: CaptionStyle
  ): Promise<string> {
    // Generate SRT file
    const srtPath = await this.generateSRT(segments);
    const outputPath = videoPath.replace('.mp4', '_captioned.mp4');
    
    return new Promise((resolve, reject) => {
      const filterStyle = this.buildCaptionStyle(style);
      
      ffmpeg(videoPath)
        .outputOptions([
          '-vf', `subtitles=${srtPath.replace(/\\/g, '/')}:force_style='${filterStyle}'`,
          '-c:a', 'copy'
        ])
        .on('error', (err) => {
          console.error('Error adding captions:', err);
          reject(err);
        })
        .on('end', async () => {
          console.log('✅ Captions added');
          // Clean up SRT file
          try {
            await fs.unlink(srtPath);
          } catch {}
          resolve(outputPath);
        })
        .save(outputPath);
    });
  }

  private async generateSRT(segments: ScriptSegment[]): Promise<string> {
    const srtPath = path.join(this.tempDir, `captions_${Date.now()}.srt`);
    await fs.mkdir(this.tempDir, { recursive: true });
    
    let srtContent = '';
    let currentTime = 0;
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const startTime = this.formatSRTTime(currentTime);
      const endTime = this.formatSRTTime(currentTime + segment.duration);
      
      srtContent += `${i + 1}\n`;
      srtContent += `${startTime} --> ${endTime}\n`;
      srtContent += `${segment.caption || segment.text}\n\n`;
      
      currentTime += segment.duration;
    }
    
    await fs.writeFile(srtPath, srtContent);
    return srtPath;
  }

  private formatSRTTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${millis.toString().padStart(3, '0')}`;
  }

  private buildCaptionStyle(style: CaptionStyle): string {
    const styles = [];
    
    styles.push(`FontName=${style.fontFamily || 'Arial'}`);
    styles.push(`FontSize=${style.fontSize || 24}`);
    styles.push(`PrimaryColour=&H${this.colorToHex(style.color || '#FFFFFF')}&`);
    styles.push(`OutlineColour=&H${this.colorToHex(style.outlineColor || '#000000')}&`);
    styles.push(`BorderStyle=${style.borderStyle || 3}`);
    styles.push(`Outline=${style.outlineWidth || 2}`);
    styles.push(`Shadow=${style.shadow || 1}`);
    styles.push(`Alignment=${style.position === 'top' ? 8 : style.position === 'bottom' ? 2 : 5}`);
    styles.push(`MarginV=${style.marginV || 50}`);
    
    if (style.bold) styles.push('Bold=1');
    if (style.italic) styles.push('Italic=1');
    
    return styles.join(',');
  }

  private colorToHex(color: string): string {
    // Convert #RRGGBB to BBGGRR for ASS format
    const hex = color.replace('#', '');
    const r = hex.substr(0, 2);
    const g = hex.substr(2, 2);
    const b = hex.substr(4, 2);
    return b + g + r;
  }

  async addTransitions(videoPaths: string[]): Promise<string[]> {
    // Add fade transitions between clips
    const transitionedClips: string[] = [];
    
    for (let i = 0; i < videoPaths.length; i++) {
      const outputPath = path.join(this.tempDir, `transition_${i}.mp4`);
      
      await new Promise<void>((resolve, reject) => {
        const filters = [];
        
        // Add fade in at the beginning
        if (i === 0) {
          filters.push('fade=t=in:st=0:d=0.5');
        }
        
        // Add fade out at the end
        if (i === videoPaths.length - 1) {
          filters.push('fade=t=out:st=4.5:d=0.5');
        }
        
        const command = ffmpeg(videoPaths[i]);
        
        if (filters.length > 0) {
          command.videoFilters(filters);
        }
        
        command
          .outputOptions(['-c:v', 'libx264', '-preset', 'fast', '-crf', '23'])
          .on('error', reject)
          .on('end', () => {
            transitionedClips.push(outputPath);
            resolve();
          })
          .save(outputPath);
      });
    }
    
    return transitionedClips;
  }

  async cleanup(): Promise<void> {
    try {
      // Clean up temp directory
      const files = await fs.readdir(this.tempDir);
      for (const file of files) {
        await fs.unlink(path.join(this.tempDir, file));
      }
      console.log('✅ Cleaned up temporary files');
    } catch (error) {
      console.error('Error cleaning up:', error);
    }
  }
}