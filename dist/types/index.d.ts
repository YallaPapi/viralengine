export interface TemplateSection {
    type: 'hook' | 'list_item' | 'cta' | 'transition';
    format?: string;
    duration?: number;
    count?: number;
}
export interface ViralTemplate {
    id: number;
    name: string;
    category: 'dopamine' | 'lazy' | 'story' | 'educational';
    description: string;
    structure: TemplateSection[];
    example?: string;
    performanceScore: number;
    tags: string[];
}
export interface ScriptSegment {
    index: number;
    type: 'hook' | 'content' | 'cta';
    text: string;
    duration: number;
    caption?: string;
    emoji?: string;
    voiceoverText?: string;
}
export interface VideoScript {
    id: string;
    templateId: number;
    topic: string;
    segments: ScriptSegment[];
    totalDuration: number;
    generatedAt: Date;
}
export interface VideoClip {
    id: string;
    source: 'pexels' | 'pixabay' | 'user';
    url: string;
    localPath?: string;
    duration: number;
    width: number;
    height: number;
    tags: string[];
}
export interface AudioTrack {
    id: string;
    type: 'voiceover' | 'background' | 'effect';
    url?: string;
    localPath: string;
    duration: number;
}
export interface Caption {
    text: string;
    startTime: number;
    endTime: number;
    style: CaptionStyle;
    position: 'top' | 'center' | 'bottom';
}
export interface CaptionStyle {
    fontSize: number;
    fontFamily: string;
    color: string;
    backgroundColor?: string;
    outlineColor?: string;
    outlineWidth?: number;
    borderStyle?: number;
    shadow?: number;
    position?: 'top' | 'center' | 'bottom';
    marginV?: number;
    bold?: boolean;
    italic?: boolean;
    animation?: 'fade' | 'slide' | 'zoom' | 'kinetic' | 'none';
}
export interface VideoConfig {
    script: VideoScript;
    clips: VideoClip[];
    audio: AudioTrack[];
    captions: Caption[];
    outputPath: string;
}
export interface VideoOutput {
    path: string;
    duration: number;
    size: number;
    format: string;
    variants?: string[];
}
export interface VideoProject {
    id: string;
    topic: string;
    templateId: number;
    createdAt: Date;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    outputPath?: string;
}
export interface VideoAssets {
    clips: VideoClip[];
    audio: AudioTrack[];
    captions: Caption[];
}
//# sourceMappingURL=index.d.ts.map