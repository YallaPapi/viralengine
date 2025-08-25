import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

export const config = {
  // API Keys
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4o',
    maxTokens: 2000,
    temperature: 0.7
  },
  
  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY || '',
    voiceId: '21m00Tcm4TlvDq8ikWAM', // Default voice
    modelId: 'eleven_monolingual_v1'
  },
  
  pexels: {
    apiKey: process.env.PEXELS_API_KEY || ''
  },
  
  pixabay: {
    apiKey: process.env.PIXABAY_API_KEY || ''
  },
  
  // Paths
  paths: {
    templates: path.join(process.cwd(), 'data', 'templates.json'),
    output: path.join(process.cwd(), 'output'),
    temp: path.join(process.cwd(), 'temp'),
    assets: path.join(process.cwd(), 'assets')
  },
  
  // Video settings
  video: {
    width: 1080,
    height: 1920,
    fps: 30,
    defaultDuration: 30, // seconds
    format: 'mp4'
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: path.join(process.cwd(), 'logs', 'app.log')
  }
};

// Validate required API keys
export function validateConfig(): void {
  const required = [
    { key: config.openai.apiKey, name: 'OPENAI_API_KEY' },
    { key: config.pexels.apiKey, name: 'PEXELS_API_KEY' },
    { key: config.pixabay.apiKey, name: 'PIXABAY_API_KEY' }
  ];
  
  const missing = required.filter(r => !r.key).map(r => r.name);
  
  if (missing.length > 0) {
    console.warn(`⚠️ Missing API keys: ${missing.join(', ')}`);
    console.warn('Some features may not work properly.');
  }
}