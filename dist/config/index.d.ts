export declare const config: {
    openai: {
        apiKey: string;
        model: string;
        maxTokens: number;
        temperature: number;
    };
    elevenlabs: {
        apiKey: string;
        voiceId: string;
        modelId: string;
    };
    pexels: {
        apiKey: string;
    };
    pixabay: {
        apiKey: string;
    };
    paths: {
        templates: string;
        output: string;
        temp: string;
        assets: string;
    };
    video: {
        width: number;
        height: number;
        fps: number;
        defaultDuration: number;
        format: string;
    };
    logging: {
        level: string;
        file: string;
    };
};
export declare function validateConfig(): void;
//# sourceMappingURL=index.d.ts.map