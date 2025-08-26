/**
 * Core interface for media sourcing functionality
 */

import { MediaQuery, MediaResult, MediaFile, ScoringCriteria } from '../models/stubs';

/**
 * Interface for media sourcing and management components
 */
export interface IMediaSourcer {
  /**
   * Search for media assets based on query parameters
   * @param query - The search query with keywords and filters
   * @returns Promise resolving to array of media results
   */
  searchMedia(query: MediaQuery): Promise<MediaResult[]>;

  /**
   * Score a media result based on quality and relevance criteria
   * @param media - The media result to score
   * @param criteria - The criteria for scoring
   * @returns Numerical score (0-10)
   */
  scoreMedia(media: MediaResult, criteria: ScoringCriteria): number;

  /**
   * Download a media file to local storage
   * @param media - The media result to download
   * @returns Promise resolving to the downloaded file information
   */
  downloadMedia(media: MediaResult): Promise<MediaFile>;
}

/**
 * Interface for media providers (Pexels, Pixabay, etc.)
 */
export interface IMediaProvider {
  /** Provider name */
  readonly name: string;
  
  /**
   * Search for media on this provider
   * @param query - Search query
   * @returns Promise resolving to media results
   */
  search(query: string, options?: MediaSearchOptions): Promise<MediaResult[]>;
  
  /**
   * Download media from this provider
   * @param url - Media URL
   * @param destination - Local file path
   * @returns Promise resolving to downloaded file path
   */
  download(url: string, destination: string): Promise<string>;
  
  /**
   * Check if provider is available
   * @returns Promise resolving to availability status
   */
  isAvailable(): Promise<boolean>;
}

/**
 * Options for media search
 */
export interface MediaSearchOptions {
  /** Number of results to return */
  limit?: number;
  /** Page number for pagination */
  page?: number;
  /** Minimum quality score */
  minQuality?: number;
  /** Preferred orientation */
  orientation?: 'landscape' | 'portrait' | 'square';
  /** Minimum resolution */
  minResolution?: { width: number; height: number };
}