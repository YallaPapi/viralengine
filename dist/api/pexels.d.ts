import { VideoClip } from '../types/index.js';
export declare class PexelsAPI {
    private apiKey;
    private baseUrl;
    constructor();
    searchVideos(query: string, perPage?: number): Promise<VideoClip[]>;
    getPopularVideos(perPage?: number): Promise<VideoClip[]>;
    private selectBestVideoFile;
    searchByKeywords(keywords: string[]): Promise<VideoClip[]>;
}
//# sourceMappingURL=pexels.d.ts.map