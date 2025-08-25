import { VideoClip, ScriptSegment } from '../types/index.js';
import { PexelsAPI } from '../api/pexels.js';
import { PixabayAPI } from '../api/pixabay.js';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export class ClipManager {
  private pexels: PexelsAPI;
  private pixabay: PixabayAPI;
  private downloadedClips: Map<string, string> = new Map();

  constructor() {
    this.pexels = new PexelsAPI();
    this.pixabay = new PixabayAPI();
  }

  async findClipsForScript(segments: ScriptSegment[]): Promise<VideoClip[]> {
    const allClips: VideoClip[] = [];
    
    for (const segment of segments) {
      console.log(`Finding clips for segment: ${segment.type}`);
      
      // Extract keywords from segment text
      const keywords = this.extractKeywords(segment.text);
      
      // Try Pexels first
      let clips = await this.pexels.searchVideos(keywords[0] || 'trending', 3);
      
      // If not enough clips, try Pixabay
      if (clips.length < 2) {
        const pixabayClips = await this.pixabay.searchVideos(keywords[0] || 'viral', 3);
        clips = [...clips, ...pixabayClips];
      }
      
      // Take the best clip for this segment
      if (clips.length > 0) {
        const selectedClip = this.selectBestClip(clips, segment);
        allClips.push(selectedClip);
      }
      
      // Small delay between API calls
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    return allClips;
  }

  private extractKeywords(text: string): string[] {
    // Remove emojis and special characters
    const cleanText = text.replace(/[^\w\s]/g, '').toLowerCase();
    
    // Common words to filter out
    const stopWords = ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'for', 'with', 'to', 'from'];
    
    // Extract meaningful words
    const words = cleanText.split(' ')
      .filter(word => word.length > 2 && !stopWords.includes(word));
    
    // Return top 3 keywords
    return words.slice(0, 3);
  }

  private selectBestClip(clips: VideoClip[], segment: ScriptSegment): VideoClip {
    // Score clips based on various factors
    const scoredClips = clips.map(clip => {
      let score = 0;
      
      // Prefer portrait orientation (9:16 aspect ratio)
      const aspectRatio = clip.width / clip.height;
      if (aspectRatio < 0.6) score += 3; // Strong portrait
      else if (aspectRatio < 1) score += 1; // Weak portrait
      
      // Prefer clips that match segment duration
      const durationDiff = Math.abs(clip.duration - segment.duration);
      if (durationDiff < 2) score += 2;
      else if (durationDiff < 5) score += 1;
      
      // Prefer HD quality
      if (clip.width >= 1080 || clip.height >= 1920) score += 2;
      
      return { clip, score };
    });
    
    // Sort by score and return best
    scoredClips.sort((a, b) => b.score - a.score);
    return scoredClips[0].clip;
  }

  async downloadClip(clip: VideoClip, outputDir: string): Promise<string> {
    // Check if already downloaded
    if (this.downloadedClips.has(clip.url)) {
      return this.downloadedClips.get(clip.url)!;
    }

    try {
      console.log(`Downloading clip from ${clip.source}: ${clip.url.substring(0, 50)}...`);
      
      const response = await axios.get(clip.url, {
        responseType: 'arraybuffer',
        timeout: 60000, // 60 second timeout
        maxContentLength: 500 * 1024 * 1024, // 500MB max
        maxBodyLength: 500 * 1024 * 1024, // 500MB max
      });
      
      const extension = this.getFileExtension(clip.url);
      const filename = `${clip.id}.${extension}`;
      const filePath = path.join(outputDir, filename);
      
      await fs.mkdir(outputDir, { recursive: true });
      await fs.writeFile(filePath, response.data);
      
      this.downloadedClips.set(clip.url, filePath);
      console.log(`✅ Downloaded clip to ${filePath}`);
      
      return filePath;
    } catch (error) {
      console.error(`Failed to download clip: ${error}`);
      throw error;
    }
  }

  private getFileExtension(url: string): string {
    const match = url.match(/\.([a-z0-9]+)(?:\?|$)/i);
    return match ? match[1] : 'mp4';
  }

  async downloadAllClips(clips: VideoClip[], outputDir: string): Promise<string[]> {
    const downloadedPaths: string[] = [];
    
    for (const clip of clips) {
      try {
        const path = await this.downloadClip(clip, outputDir);
        downloadedPaths.push(path);
      } catch (error) {
        console.error(`Failed to download clip ${clip.id}:`, error);
        // Continue with other clips
      }
    }
    
    return downloadedPaths;
  }

  async searchByKeywords(keywords: string[]): Promise<VideoClip[]> {
    const allClips: VideoClip[] = [];
    
    // Try both APIs for each keyword
    for (const keyword of keywords) {
      const [pexelsClips, pixabayClips] = await Promise.all([
        this.pexels.searchVideos(keyword, 5),
        this.pixabay.searchVideos(keyword, 5)
      ]);
      
      allClips.push(...pexelsClips, ...pixabayClips);
    }
    
    // Remove duplicates based on URL
    const unique = allClips.filter((clip, index, self) =>
      index === self.findIndex(c => c.url === clip.url)
    );
    
    return unique;
  }

  clearCache(): void {
    this.downloadedClips.clear();
  }
}