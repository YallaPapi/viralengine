// Temporary stub interfaces - will be fully implemented in next stories

export interface EnhancementHints {
  tone?: string;
  style?: string;
  targetAudience?: string;
}

export interface MediaQuery {
  keywords: string[];
  limit?: number;
  minQuality?: number;
}

export interface MediaResult {
  id: string;
  url: string;
  provider: string;
  score?: number;
}

export interface MediaFile {
  id: string;
  path: string;
  url?: string;
  size?: number;
  duration?: number;
}

export interface ScoringCriteria {
  resolution?: number;
  aspectRatio?: string;
  quality?: number;
}

export interface VoiceProfile {
  voiceId: string;
  energy: 'low' | 'medium' | 'high';
  rate?: number;
  pitch?: number;
}

export interface AudioFile {
  id: string;
  path: string;
  duration: number;
  format: string;
}

export interface AudioTrack {
  file: AudioFile;
  volume: number;
  startTime: number;
}

export interface AudioEffect {
  type: string;
  parameters: Record<string, any>;
}

export interface VideoFile {
  id: string;
  path: string;
  duration: number;
  resolution: { width: number; height: number };
}

export interface VideoSegment {
  id: string;
  file: VideoFile;
  startTime: number;
  endTime: number;
}

export interface Composition {
  id: string;
  segments: VideoSegment[];
  duration: number;
}

export enum TransitionType {
  CUT = 'cut',
  FADE = 'fade',
  DISSOLVE = 'dissolve',
  WIPE = 'wipe',
  ZOOM = 'zoom'
}

export interface TextOverlay {
  text: string;
  position: { x: number; y: number };
  style: {
    font?: string;
    size?: number;
    color?: string;
    outline?: boolean;
  };
  timing: {
    startTime: number;
    duration: number;
  };
}
