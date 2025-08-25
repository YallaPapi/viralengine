import { VideoScript, ViralTemplate } from '../types/index.js';
export declare class ScriptGenerator {
    private openai;
    private cache;
    constructor();
    generateScript(topic: string, template: ViralTemplate): Promise<VideoScript>;
    private buildPrompt;
    private parseScriptResponse;
    private createFallbackScript;
    batchGenerate(topics: string[], template: ViralTemplate): Promise<VideoScript[]>;
}
//# sourceMappingURL=scriptGenerator.d.ts.map