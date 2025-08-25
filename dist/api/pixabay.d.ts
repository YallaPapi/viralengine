import { VideoClip } from '../types/index.js';
export declare class PixabayAPI {
    private apiKey;
    private baseUrl;
    constructor();
    searchVideos(query: string, perPage?: number): Promise<VideoClip[]>;
    getPopularVideos(category?: string, perPage?: number): Promise<VideoClip[]>;
    private selectBestVideo;
    searchByKeywords(keywords: string[]): Promise<VideoClip[]>;
}
//# sourceMappingURL=pixabay.d.ts.map