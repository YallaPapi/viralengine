import { VideoProject, ScriptSegment, CaptionStyle } from '../types/index.js';
export declare class VideoAssembler {
    private tempDir;
    private outputDir;
    constructor();
    assembleVideo(project: VideoProject, videoPaths: string[], audioPath: string, captionPath?: string): Promise<string>;
    private createConcatFile;
    trimAndResizeClips(clips: string[], segments: ScriptSegment[], targetWidth?: number, targetHeight?: number): Promise<string[]>;
    private processClip;
    addCaptions(videoPath: string, segments: ScriptSegment[], style: CaptionStyle): Promise<string>;
    private generateSRT;
    private formatSRTTime;
    private buildCaptionStyle;
    private colorToHex;
    addTransitions(videoPaths: string[]): Promise<string[]>;
    cleanup(): Promise<void>;
}
//# sourceMappingURL=videoAssembler.d.ts.map