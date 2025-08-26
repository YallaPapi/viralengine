/**
 * Core interface for script generation functionality
 */
import { ITemplate } from './ITemplate.js';
import { IScript } from '../models/Script.js';
import { ValidationResult } from '../models/ValidationResult.js';
import { EnhancementHints } from '../models/stubs.js';
/**
 * Interface for script generation components
 */
export interface IScriptGenerator {
    /**
     * Generate a complete video script from a topic and template
     * @param topic - The topic for the video (e.g., "Best Gaming Headphones")
     * @param template - The template structure to follow
     * @returns Promise resolving to the generated script
     */
    generateScript(topic: string, template: ITemplate): Promise<IScript>;
    /**
     * Validate that a script meets all requirements
     * @param script - The script to validate
     * @returns Validation result with any errors or warnings
     */
    validateScript(script: IScript): ValidationResult;
    /**
     * Enhance an existing script with additional content or improvements
     * @param script - The script to enhance
     * @param hints - Hints for enhancement (tone, style, etc.)
     * @returns Promise resolving to the enhanced script
     */
    enhanceScript(script: IScript, hints: EnhancementHints): Promise<IScript>;
}
/**
 * Options for script generation
 */
export interface ScriptGenerationOptions {
    /** Target duration in seconds */
    targetDuration: number;
    /** Number of items in the listicle */
    itemCount: number;
    /** Style of the script (energetic, calm, professional, etc.) */
    style?: string;
    /** Target audience */
    audience?: string;
    /** Platform-specific optimizations */
    platform?: 'tiktok' | 'reels' | 'shorts';
}
//# sourceMappingURL=IScriptGenerator.d.ts.map