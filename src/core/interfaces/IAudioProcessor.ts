/**
 * Core interface for audio processing functionality
 */

import { VoiceProfile, AudioFile, AudioTrack, AudioEffect } from '../models/stubs';

/**
 * Interface for audio processing and generation components
 */
export interface IAudioProcessor {
  /**
   * Generate voiceover from text using TTS
   * @param text - The text to convert to speech
   * @param profile - Voice profile with settings
   * @returns Promise resolving to generated audio file
   */
  generateVoiceover(text: string, profile: VoiceProfile): Promise<AudioFile>;

  /**
   * Mix multiple audio tracks together
   * @param tracks - Array of audio tracks to mix
   * @returns Promise resolving to mixed audio file
   */
  mixAudio(tracks: AudioTrack[]): Promise<AudioFile>;

  /**
   * Apply audio effects to an audio file
   * @param audio - The audio file to process
   * @param effects - Array of effects to apply
   * @returns Promise resolving to processed audio file
   */
  applyEffects(audio: AudioFile, effects: AudioEffect[]): Promise<AudioFile>;
}

/**
 * Interface for Text-to-Speech providers
 */
export interface ITTSProvider {
  /** Provider name */
  readonly name: string;
  
  /**
   * Synthesize speech from text
   * @param text - Text to convert
   * @param options - TTS options
   * @returns Promise resolving to audio buffer
   */
  synthesize(text: string, options: TTSOptions): Promise<Buffer>;
  
  /**
   * Get available voices
   * @returns Promise resolving to list of voices
   */
  getVoices(): Promise<Voice[]>;
  
  /**
   * Estimate cost for text synthesis
   * @param text - Text to estimate
   * @returns Estimated cost in USD
   */
  estimateCost(text: string): number;
}

/**
 * TTS synthesis options
 */
export interface TTSOptions {
  /** Voice ID or name */
  voiceId: string;
  /** Speech rate (0.5 - 2.0) */
  rate?: number;
  /** Speech pitch (-20 - 20) */
  pitch?: number;
  /** Voice stability (0 - 1) */
  stability?: number;
  /** Voice similarity boost (0 - 1) */
  similarity?: number;
  /** Output format */
  format?: 'mp3' | 'wav' | 'ogg';
}

/**
 * Voice information
 */
export interface Voice {
  /** Unique voice ID */
  id: string;
  /** Display name */
  name: string;
  /** Voice gender */
  gender?: 'male' | 'female' | 'neutral';
  /** Language code */
  language?: string;
  /** Voice description */
  description?: string;
  /** Preview URL */
  previewUrl?: string;
}