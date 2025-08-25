import { ViralTemplate } from '../types/index.js';
export declare class TemplateManager {
    private templates;
    private loaded;
    loadTemplates(): Promise<void>;
    private createDefaultTemplates;
    getTemplateById(id: number): ViralTemplate | undefined;
    selectTemplate(topic: string): ViralTemplate;
    getAllTemplates(): ViralTemplate[];
    updatePerformanceScore(id: number, newScore: number): void;
}
//# sourceMappingURL=templateManager.d.ts.map