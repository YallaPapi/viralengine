import axios from 'axios';
import { config } from '../config/index.js';
import fs from 'fs/promises';
import path from 'path';

interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
}

interface AudioOptions {
  text: string;
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

export class ElevenLabsAPI {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';
  private defaultVoiceId = 'EXAVITQu4vr4xnSDxMaL'; // Sarah - young female voice
  private defaultModelId = 'eleven_turbo_v2_5';

  constructor() {
    this.apiKey = config.elevenlabs.apiKey;
    if (!this.apiKey) {
      console.warn('ElevenLabs API key not configured');
    }
  }

  async generateAudio(options: AudioOptions): Promise<Buffer> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const {
      text,
      voiceId = this.defaultVoiceId,
      modelId = this.defaultModelId,
      stability = 0.5,
      similarityBoost = 0.75,
      style = 0,
      useSpeakerBoost = true
    } = options;

    try {
      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${voiceId}`,
        {
          text,
          model_id: modelId,
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style,
            use_speaker_boost: useSpeakerBoost
          }
        },
        {
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg'
          },
          responseType: 'arraybuffer'
        }
      );

      return Buffer.from(response.data);
    } catch (error: any) {
      console.error('Error generating audio with ElevenLabs:', error?.response?.data || error.message);
      throw error;
    }
  }

  async generateVoiceoverFromScript(scriptSegments: any[], outputDir: string): Promise<string[]> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const audioFiles: string[] = [];
    await fs.mkdir(outputDir, { recursive: true });

    for (let i = 0; i < scriptSegments.length; i++) {
      const segment = scriptSegments[i];
      const text = segment.voiceoverText || segment.text;
      
      if (!text) continue;

      console.log(`Generating audio for segment ${i + 1}/${scriptSegments.length}: "${text.substring(0, 50)}..."`);

      try {
        const audioBuffer = await this.generateAudio({
          text,
          voiceId: this.defaultVoiceId,
          modelId: this.defaultModelId,
          stability: 0.5,
          similarityBoost: 0.8,
          style: 0.2, // Slightly more expressive for viral content
          useSpeakerBoost: true
        });

        const audioPath = path.join(outputDir, `segment_${i + 1}.mp3`);
        await fs.writeFile(audioPath, audioBuffer);
        audioFiles.push(audioPath);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to generate audio for segment ${i + 1}:`, error);
        // Continue with other segments even if one fails
      }
    }

    console.log(`✅ Generated ${audioFiles.length} audio files`);
    return audioFiles;
  }

  async getVoices(): Promise<Voice[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      return response.data.voices;
    } catch (error) {
      console.error('Error fetching voices:', error);
      return [];
    }
  }

  async getVoiceByCategory(category: 'young' | 'middle_aged' | 'old', gender: 'male' | 'female'): Promise<string> {
    const voices = await this.getVoices();
    
    // Filter voices by rough category matching
    const filtered = voices.filter(v => {
      const name = v.name.toLowerCase();
      const desc = (v.description || '').toLowerCase();
      
      const matchesGender = gender === 'male' ? 
        (name.includes('male') || desc.includes('male') || desc.includes('man')) :
        (name.includes('female') || desc.includes('female') || desc.includes('woman'));
      
      const matchesAge = category === 'young' ?
        (name.includes('young') || desc.includes('young')) :
        category === 'middle_aged' ?
        (name.includes('middle') || !name.includes('young') && !name.includes('old')) :
        (name.includes('old') || desc.includes('old'));
        
      return matchesGender || matchesAge;
    });

    if (filtered.length > 0) {
      return filtered[0].voice_id;
    }

    // Return default if no match
    return this.defaultVoiceId;
  }
}