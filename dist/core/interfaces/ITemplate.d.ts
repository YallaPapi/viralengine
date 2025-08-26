/**
 * Interface for video templates
 */
/**
 * Template structure for video generation
 */
export interface ITemplate {
    /** Unique template ID */
    id: string;
    /** Template name */
    name: string;
    /** Template category */
    category: string;
    /** Template description */
    description?: string;
    /** Number of items in listicle */
    itemCount: number;
    /** Target duration in seconds */
    targetDuration: number;
    /** Template structure */
    structure: {
        /** Intro segment template */
        intro: SegmentTemplate;
        /** Item segment templates */
        items: SegmentTemplate[];
        /** Outro segment template */
        outro: SegmentTemplate;
    };
    /** Visual style preferences */
    visualStyle?: {
        /** Preferred transition types */
        transitions?: string[];
        /** Text overlay style */
        textStyle?: string;
        /** Color scheme */
        colorScheme?: string[];
    };
    /** Audio preferences */
    audioStyle?: {
        /** Voice energy level */
        voiceEnergy?: 'low' | 'medium' | 'high';
        /** Music genre */
        musicGenre?: string;
        /** Music volume level */
        musicVolume?: number;
    };
}
/**
 * Template for a script segment
 */
export interface SegmentTemplate {
    /** Segment type */
    type: 'intro' | 'item' | 'outro';
    /** Duration range in seconds */
    duration: {
        min: number;
        max: number;
    };
    /** Text template with placeholders */
    textTemplate?: string;
    /** Visual instructions template */
    visualTemplate?: string;
    /** Required fields for this segment */
    requiredFields?: string[];
    /** Voice instructions */
    voiceInstructions?: string;
}
//# sourceMappingURL=ITemplate.d.ts.map