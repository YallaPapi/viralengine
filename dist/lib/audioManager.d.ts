import { ScriptSegment } from '../types/index.js';
interface AudioAsset {
    type: 'voiceover' | 'music' | 'sfx';
    path: string;
    duration: number;
    volume?: number;
}
export declare class AudioManager {
    private elevenLabs;
    private musicLibrary;
    constructor();
    private initializeMusicLibrary;
    generateVoiceover(segments: ScriptSegment[], outputDir: string): Promise<AudioAsset[]>;
    getAudioDuration(audioPath: string): Promise<number>;
    mergeAudioTracks(voiceover: string[], outputPath: string, music?: string): Promise<string>;
    addBackgroundMusic(voiceoverPath: string, musicStyle: 'upbeat' | 'chill' | 'dramatic' | 'energetic', outputPath: string, musicVolume?: number): Promise<string>;
    normalizeAudio(inputPath: string, outputPath: string): Promise<string>;
    private fileExists;
    selectMusicStyle(templateCategory: string): 'upbeat' | 'chill' | 'dramatic' | 'energetic';
}
export {};
//# sourceMappingURL=audioManager.d.ts.map