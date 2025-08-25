import { VideoClip, ScriptSegment } from '../types/index.js';
export declare class ClipManager {
    private pexels;
    private pixabay;
    private downloadedClips;
    constructor();
    findClipsForScript(segments: ScriptSegment[]): Promise<VideoClip[]>;
    private extractKeywords;
    private selectBestClip;
    downloadClip(clip: VideoClip, outputDir: string): Promise<string>;
    private getFileExtension;
    downloadAllClips(clips: VideoClip[], outputDir: string): Promise<string[]>;
    searchByKeywords(keywords: string[]): Promise<VideoClip[]>;
    clearCache(): void;
}
//# sourceMappingURL=clipManager.d.ts.map