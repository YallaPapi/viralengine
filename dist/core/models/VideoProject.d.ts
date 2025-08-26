/**
 * Video project model
 */
import { IScript } from './Script.js';
import { MediaFile, AudioFile } from './stubs.js';
/**
 * Complete video project with all assets
 */
export interface VideoProject {
    /** Project ID */
    id: string;
    /** Project topic/title */
    topic: string;
    /** Generated script */
    script: IScript;
    /** Media assets mapped by segment ID */
    mediaAssets: Map<string, MediaFile>;
    /** Audio tracks */
    audioTracks: {
        /** Voiceover track */
        voiceover?: AudioFile;
        /** Background music track */
        music?: AudioFile;
        /** Sound effects */
        effects?: AudioFile[];
    };
    /** Output configuration */
    outputConfig: {
        /** Resolution */
        resolution: {
            width: number;
            height: number;
        };
        /** Frame rate */
        framerate: number;
        /** Format */
        format: 'mp4' | 'webm' | 'mov';
        /** Quality settings */
        quality?: 'low' | 'medium' | 'high' | 'ultra';
    };
    /** Project status */
    status: ProjectStatus;
    /** Project metadata */
    metadata?: {
        /** Creation timestamp */
        createdAt: Date;
        /** Last update timestamp */
        updatedAt: Date;
        /** Template used */
        templateId?: string;
        /** Platform target */
        platform?: string;
    };
}
/**
 * Project status
 */
export declare enum ProjectStatus {
    CREATED = "created",
    SCRIPT_READY = "script_ready",
    MEDIA_SOURCED = "media_sourced",
    AUDIO_READY = "audio_ready",
    COMPOSING = "composing",
    RENDERING = "rendering",
    COMPLETED = "completed",
    FAILED = "failed"
}
//# sourceMappingURL=VideoProject.d.ts.map