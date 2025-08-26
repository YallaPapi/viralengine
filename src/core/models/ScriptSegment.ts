/**
 * Script segment model
 */

import { TextOverlay } from './stubs';

/**
 * A segment of a video script
 */
export interface ScriptSegment {
  /** Segment ID */
  id: string;
  
  /** Segment type */
  type: 'intro' | 'item' | 'outro' | 'transition';
  
  /** Segment text/narration */
  text: string;
  
  /** Duration in seconds */
  duration: number;
  
  /** Start time in seconds */
  startTime: number;
  
  /** End time in seconds */
  endTime: number;
  
  /** Visual instructions */
  visualInstructions?: string;
  
  /** Text overlays for this segment */
  textOverlays?: TextOverlay[];
  
  /** Transition type to next segment */
  transitionOut?: string;
  
  /** Energy level for this segment */
  energyLevel?: 'low' | 'medium' | 'high' | 'crescendo';
}