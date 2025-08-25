import { CaptionStyle } from '../types/index.js';
export interface GenerationOptions {
    topic: string;
    templateId?: number;
    duration?: number;
    voiceStyle?: 'young' | 'mature' | 'energetic';
    musicStyle?: 'upbeat' | 'chill' | 'dramatic' | 'energetic';
    captionStyle?: Partial<CaptionStyle>;
    outputFormat?: 'mp4' | 'mov' | 'webm';
}
export declare class ViralEngine {
    private templateManager;
    private scriptGenerator;
    private clipManager;
    private audioManager;
    private videoAssembler;
    constructor();
    initialize(): Promise<void>;
    generateVideo(options: GenerationOptions): Promise<string>;
    generateBatch(topics: string[], templateId?: number): Promise<string[]>;
    testGeneration(): Promise<string>;
}
//# sourceMappingURL=viralEngine.d.ts.map