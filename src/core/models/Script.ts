/**
 * Script model definitions
 */

import { ScriptSegment } from './ScriptSegment';
import { VoiceProfile } from './stubs';

/**
 * Complete video script
 */
export interface IScript {
  /** Unique script ID */
  id: string;
  
  /** Video topic */
  topic: string;
  
  /** Script title */
  title: string;
  
  /** Intro segment */
  intro: ScriptSegment;
  
  /** Item segments (countdown items) */
  items: ScriptItem[];
  
  /** Outro segment */
  outro: ScriptSegment;
  
  /** Total duration in seconds */
  duration: number;
  
  /** Voice profile for narration */
  voiceProfile: VoiceProfile;
  
  /** Script metadata */
  metadata?: {
    /** Template used */
    templateId?: string;
    /** Generation timestamp */
    generatedAt?: Date;
    /** Script version */
    version?: number;
    /** Target platform */
    platform?: string;
  };
}

/**
 * Individual item in a listicle script
 */
export interface ScriptItem extends ScriptSegment {
  /** Position in countdown (5, 4, 3, 2, 1) */
  position: number;
  
  /** Item name */
  itemName: string;
  
  /** Use case scenario */
  useCase: string;
  
  /** First feature/benefit */
  featureA: string;
  
  /** Second feature/benefit */
  featureB: string;
  
  /** Unique selling point */
  uniqueSellingPoint: string;
  
  /** Item-specific voice instructions */
  voiceoverInstructions?: string;
  
  /** Item-specific visual instructions */
  visualInstructions?: string;
}