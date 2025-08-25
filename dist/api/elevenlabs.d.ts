interface Voice {
    voice_id: string;
    name: string;
    category: string;
    description?: string;
}
interface AudioOptions {
    text: string;
    voiceId?: string;
    modelId?: string;
    stability?: number;
    similarityBoost?: number;
    style?: number;
    useSpeakerBoost?: boolean;
}
export declare class ElevenLabsAPI {
    private apiKey;
    private baseUrl;
    private defaultVoiceId;
    private defaultModelId;
    constructor();
    generateAudio(options: AudioOptions): Promise<Buffer>;
    generateVoiceoverFromScript(scriptSegments: any[], outputDir: string): Promise<string[]>;
    getVoices(): Promise<Voice[]>;
    getVoiceByCategory(category: 'young' | 'middle_aged' | 'old', gender: 'male' | 'female'): Promise<string>;
}
export {};
//# sourceMappingURL=elevenlabs.d.ts.map