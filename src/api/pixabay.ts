import axios from 'axios';
import { VideoClip } from '../types/index';
import { config } from '../config/index';
import { v4 as uuidv4 } from 'uuid';

interface PixabayVideo {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  duration: number;
  videos: {
    large?: {
      url: string;
      width: number;
      height: number;
      size: number;
    };
    medium?: {
      url: string;
      width: number;
      height: number;
      size: number;
    };
    small?: {
      url: string;
      width: number;
      height: number;
      size: number;
    };
  };
  views: number;
  downloads: number;
  likes: number;
}

export class PixabayAPI {
  private apiKey: string;
  private baseUrl = 'https://pixabay.com/api/videos/';

  constructor() {
    this.apiKey = config.pixabay.apiKey;
    if (!this.apiKey) {
      console.warn('Pixabay API key not configured');
    }
  }

  async searchVideos(query: string, perPage: number = 10): Promise<VideoClip[]> {
    // Pixabay requires minimum 3 per_page
    perPage = Math.max(3, perPage);
    if (!this.apiKey) {
      console.warn('Pixabay API key not configured, returning empty results');
      return [];
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          key: this.apiKey,
          q: query,
          per_page: perPage,
          video_type: 'all',
          min_width: 720,
          min_height: 1280
        }
      });

      const videos: VideoClip[] = response.data.hits.map((video: PixabayVideo) => {
        const videoFile = this.selectBestVideo(video.videos);
        
        return {
          id: uuidv4(),
          source: 'pixabay',
          url: videoFile.url,
          duration: video.duration || 10,
          width: videoFile.width,
          height: videoFile.height,
          tags: video.tags.split(',').map(tag => tag.trim())
        };
      });

      console.log(`Found ${videos.length} videos from Pixabay for query: ${query}`);
      return videos;
    } catch (error) {
      console.error('Error fetching from Pixabay:', error);
      return [];
    }
  }

  async getPopularVideos(category: string = '', perPage: number = 10): Promise<VideoClip[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          key: this.apiKey,
          order: 'popular',
          category,
          per_page: perPage,
          video_type: 'all'
        }
      });

      const videos: VideoClip[] = response.data.hits.map((video: PixabayVideo) => {
        const videoFile = this.selectBestVideo(video.videos);
        
        return {
          id: uuidv4(),
          source: 'pixabay',
          url: videoFile.url,
          duration: video.duration || 10,
          width: videoFile.width,
          height: videoFile.height,
          tags: ['popular', ...video.tags.split(',').map(tag => tag.trim())]
        };
      });

      return videos;
    } catch (error) {
      console.error('Error fetching popular videos from Pixabay:', error);
      return [];
    }
  }

  private selectBestVideo(videos: any): any {
    // Prefer large size
    if (videos.large) {
      return videos.large;
    }
    // Fallback to medium
    if (videos.medium) {
      return videos.medium;
    }
    // Last resort: small
    if (videos.small) {
      return videos.small;
    }
    
    // Default fallback
    return {
      url: '',
      width: 1080,
      height: 1920
    };
  }

  async searchByKeywords(keywords: string[]): Promise<VideoClip[]> {
    const allClips: VideoClip[] = [];
    
    for (const keyword of keywords) {
      const clips = await this.searchVideos(keyword, 5);
      allClips.push(...clips);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Remove duplicates
    const unique = allClips.filter((clip, index, self) =>
      index === self.findIndex(c => c.url === clip.url)
    );
    
    return unique;
  }
}