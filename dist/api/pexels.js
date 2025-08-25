import axios from 'axios';
import { config } from '../config/index.js';
import { v4 as uuidv4 } from 'uuid';
export class PexelsAPI {
    apiKey;
    baseUrl = 'https://api.pexels.com/videos';
    constructor() {
        this.apiKey = config.pexels.apiKey;
        if (!this.apiKey) {
            console.warn('Pexels API key not configured');
        }
    }
    async searchVideos(query, perPage = 10) {
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
            const videos = response.data.videos.map((video) => {
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
        }
        catch (error) {
            console.error('Error fetching from Pexels:', error);
            return [];
        }
    }
    async getPopularVideos(perPage = 10) {
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
            const videos = response.data.videos.map((video) => {
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
        }
        catch (error) {
            console.error('Error fetching popular videos from Pexels:', error);
            return [];
        }
    }
    selectBestVideoFile(files) {
        // Prefer HD quality in portrait orientation
        const hdFiles = files.filter(f => f.quality === 'hd' &&
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
    async searchByKeywords(keywords) {
        const allClips = [];
        for (const keyword of keywords) {
            const clips = await this.searchVideos(keyword, 5);
            allClips.push(...clips);
            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        // Remove duplicates based on URL
        const unique = allClips.filter((clip, index, self) => index === self.findIndex(c => c.url === clip.url));
        return unique;
    }
}
//# sourceMappingURL=pexels.js.map