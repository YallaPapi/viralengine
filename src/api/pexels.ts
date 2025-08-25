import axios from 'axios';
import { VideoClip } from '../types/index.js';
import { config } from '../config/index.js';
import { v4 as uuidv4 } from 'uuid';

interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  duration: number;
  url: string;
  video_files: Array<{
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    link: string;
  }>;
  video_pictures: Array<{
    id: number;
    picture: string;
  }>;
}

export class PexelsAPI {
  private apiKey: string;
  private baseUrl = 'https://api.pexels.com/videos';

  constructor() {
    this.apiKey = config.pexels.apiKey;
    if (!this.apiKey) {
      console.warn('Pexels API key not configured');
    }
  }

  async searchVideos(query: string, perPage: number = 10): Promise<VideoClip[]> {
    if (!this.apiKey) {
      console.warn('Pexels API key not configured, returning empty results');
      return [];
    }

    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        headers: {
          'Authorization': this.apiKey
        },
        params: {
          query,
          per_page: perPage,
          orientation: 'portrait' // For vertical videos
        }
      });

      const videos: VideoClip[] = response.data.videos.map((video: PexelsVideo) => {
        // Get the best quality video file that fits our needs
        const videoFile = this.selectBestVideoFile(video.video_files);
        
        return {
          id: uuidv4(),
          source: 'pexels',
          url: videoFile.link,
          duration: video.duration,
          width: videoFile.width || video.width,
          height: videoFile.height || video.height,
          tags: [query]
        };
      });

      console.log(`Found ${videos.length} videos from Pexels for query: ${query}`);
      return videos;
    } catch (error) {
      console.error('Error fetching from Pexels:', error);
      return [];
    }
  }

  async getPopularVideos(perPage: number = 10): Promise<VideoClip[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const response = await axios.get(`${this.baseUrl}/popular`, {
        headers: {
          'Authorization': this.apiKey
        },
        params: {
          per_page: perPage
        }
      });

      const videos: VideoClip[] = response.data.videos.map((video: PexelsVideo) => {
        const videoFile = this.selectBestVideoFile(video.video_files);
        
        return {
          id: uuidv4(),
          source: 'pexels',
          url: videoFile.link,
          duration: video.duration,
          width: videoFile.width || video.width,
          height: videoFile.height || video.height,
          tags: ['popular', 'trending']
        };
      });

      return videos;
    } catch (error) {
      console.error('Error fetching popular videos from Pexels:', error);
      return [];
    }
  }

  private selectBestVideoFile(files: any[]): any {
    // Prefer HD quality in portrait orientation
    const hdFiles = files.filter(f => 
      f.quality === 'hd' && 
      f.height > f.width // Portrait orientation
    );
    
    if (hdFiles.length > 0) {
      return hdFiles[0];
    }

    // Fallback to any HD file
    const anyHd = files.filter(f => f.quality === 'hd');
    if (anyHd.length > 0) {
      return anyHd[0];
    }

    // Return first available
    return files[0];
  }

  async searchByKeywords(keywords: string[]): Promise<VideoClip[]> {
    const allClips: VideoClip[] = [];
    
    for (const keyword of keywords) {
      const clips = await this.searchVideos(keyword, 5);
      allClips.push(...clips);
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Remove duplicates based on URL
    const unique = allClips.filter((clip, index, self) =>
      index === self.findIndex(c => c.url === clip.url)
    );
    
    return unique;
  }
}