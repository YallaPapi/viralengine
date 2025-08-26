/**
 * Core interface for video composition functionality
 */
import { VideoProject } from '../models/VideoProject.js';
import { VideoFile, VideoSegment, Composition, TransitionType } from '../models/stubs.js';
/**
 * Interface for video composition and assembly components
 */
export interface IVideoCompositor {
    /**
     * Compose a complete video from project specifications
     * @param project - The video project with all assets
     * @returns Promise resolving to the composed video file
     */
    composeVideo(project: VideoProject): Promise<VideoFile>;
    /**
     * Apply transitions between video segments
     * @param segments - Array of video segments
     * @returns Promise resolving to segments with transitions
     */
    applyTransitions(segments: VideoSegment[]): Promise<VideoSegment[]>;
    /**
     * Render the final video output
     * @param composition - The complete composition to render
     * @returns Promise resolving to the rendered video file
     */
    renderOutput(composition: Composition): Promise<VideoFile>;
}
/**
 * Interface for video rendering engine
 */
export interface IVideoRenderer {
    /**
     * Render a video composition
     * @param composition - The composition to render
     * @param options - Rendering options
     * @returns Promise resolving to rendered video
     */
    render(composition: Composition, options?: RenderOptions): Promise<VideoFile>;
    /**
     * Get render progress
     * @param jobId - Render job ID
     * @returns Progress percentage (0-100)
     */
    getProgress(jobId: string): number;
    /**
     * Cancel a render job
     * @param jobId - Render job ID
     * @returns Promise resolving when cancelled
     */
    cancelRender(jobId: string): Promise<void>;
}
/**
 * Options for video rendering
 */
export interface RenderOptions {
    /** Output resolution */
    resolution?: {
        width: number;
        height: number;
    };
    /** Frame rate */
    framerate?: number;
    /** Video bitrate */
    videoBitrate?: string;
    /** Audio bitrate */
    audioBitrate?: string;
    /** Video codec */
    videoCodec?: string;
    /** Audio codec */
    audioCodec?: string;
    /** Output format */
    format?: 'mp4' | 'webm' | 'mov';
    /** Hardware acceleration */
    hardwareAcceleration?: boolean;
}
/**
 * Interface for transition effects
 */
export interface ITransitionEngine {
    /**
     * Apply a transition between two segments
     * @param from - Source segment
     * @param to - Target segment
     * @param type - Type of transition
     * @param duration - Transition duration in ms
     * @returns Promise resolving to transitioned segments
     */
    applyTransition(from: VideoSegment, to: VideoSegment, type: TransitionType, duration: number): Promise<VideoSegment[]>;
    /**
     * Get available transition types
     * @returns Array of available transitions
     */
    getAvailableTransitions(): TransitionType[];
}
//# sourceMappingURL=IVideoCompositor.d.ts.map