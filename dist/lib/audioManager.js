import { ElevenLabsAPI } from '../api/elevenlabs.js';
import fs from 'fs/promises';
import ffmpeg from 'fluent-ffmpeg';
// Set FFmpeg path if available
const ffmpegPath = 'C:/Program Files/Shutter Encoder/Library/ffmpeg.exe';
const ffprobePath = 'C:/Program Files/Shutter Encoder/Library/ffprobe.exe';
try {
    ffmpeg.setFfmpegPath(ffmpegPath);
    ffmpeg.setFfprobePath(ffprobePath);
}
catch (error) {
    console.warn('Could not set FFmpeg path:', error);
}
export class AudioManager {
    elevenLabs;
    musicLibrary = new Map();
    constructor() {
        this.elevenLabs = new ElevenLabsAPI();
        this.initializeMusicLibrary();
    }
    initializeMusicLibrary() {
        // Placeholder for background music paths
        // In production, these would be actual audio files
        this.musicLibrary.set('upbeat', 'assets/music/upbeat.mp3');
        this.musicLibrary.set('chill', 'assets/music/chill.mp3');
        this.musicLibrary.set('dramatic', 'assets/music/dramatic.mp3');
        this.musicLibrary.set('energetic', 'assets/music/energetic.mp3');
    }
    async generateVoiceover(segments, outputDir) {
        const audioAssets = [];
        const audioFiles = await this.elevenLabs.generateVoiceoverFromScript(segments, outputDir);
        for (let i = 0; i < audioFiles.length; i++) {
            const duration = await this.getAudioDuration(audioFiles[i]);
            audioAssets.push({
                type: 'voiceover',
                path: audioFiles[i],
                duration,
                volume: 1.0
            });
        }
        return audioAssets;
    }
    async getAudioDuration(audioPath) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(audioPath, (err, metadata) => {
                if (err) {
                    console.error(`Error getting audio duration for ${audioPath}:`, err);
                    resolve(5); // Default fallback duration
                }
                else {
                    resolve(metadata.format.duration || 5);
                }
            });
        });
    }
    async mergeAudioTracks(voiceover, outputPath, music) {
        // Check if music file exists before creating promise
        const musicExists = music ? await this.fileExists(music) : false;
        return new Promise((resolve, reject) => {
            const command = ffmpeg();
            // Add all voiceover segments
            voiceover.forEach(track => {
                command.input(track);
            });
            // Add background music if provided
            if (musicExists && music) {
                command.input(music);
                command.complexFilter([
                    {
                        filter: 'amix',
                        options: {
                            inputs: voiceover.length + 1,
                            duration: 'longest',
                            dropout_transition: 2,
                            weights: [...Array(voiceover.length).fill(1), 0.3].join(' ') // Lower volume for music
                        }
                    }
                ]);
            }
            else {
                // Just concatenate voiceover tracks
                if (voiceover.length > 1) {
                    const filterInputs = voiceover.map((_, i) => `[${i}:a]`).join('');
                    command.complexFilter(`${filterInputs}concat=n=${voiceover.length}:v=0:a=1[outa]`);
                    command.outputOptions('-map', '[outa]');
                }
            }
            command
                .outputOptions([
                '-f', 'mp3',
                '-acodec', 'libmp3lame',
                '-b:a', '128k'
            ])
                .on('start', (cmd) => {
                console.log('Starting audio merge');
            })
                .on('error', (err) => {
                console.error('Error merging audio:', err);
                reject(err);
            })
                .on('end', () => {
                console.log('✅ Audio merge complete');
                resolve(outputPath);
            })
                .save(outputPath);
        });
    }
    async addBackgroundMusic(voiceoverPath, musicStyle, outputPath, musicVolume = 0.2) {
        return new Promise((resolve, reject) => {
            const musicPath = this.musicLibrary.get(musicStyle);
            if (!musicPath) {
                console.warn(`Music style ${musicStyle} not found, skipping background music`);
                // Just copy the voiceover
                fs.copyFile(voiceoverPath, outputPath)
                    .then(() => resolve(outputPath))
                    .catch(reject);
                return;
            }
            ffmpeg()
                .input(voiceoverPath)
                .input(musicPath)
                .complexFilter([
                `[1:a]volume=${musicVolume}[music]`,
                '[0:a][music]amix=inputs=2:duration=first:dropout_transition=2[out]'
            ])
                .outputOptions('-map', '[out]')
                .audioCodec('aac')
                .audioBitrate('128k')
                .on('error', (err) => {
                console.error('Error adding background music:', err);
                reject(err);
            })
                .on('end', () => {
                console.log('✅ Background music added');
                resolve(outputPath);
            })
                .save(outputPath);
        });
    }
    async normalizeAudio(inputPath, outputPath) {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .audioFilters('loudnorm=I=-16:TP=-1.5:LRA=11')
                .audioCodec('aac')
                .audioBitrate('128k')
                .on('error', (err) => {
                console.error('Error normalizing audio:', err);
                reject(err);
            })
                .on('end', () => {
                console.log('✅ Audio normalized');
                resolve(outputPath);
            })
                .save(outputPath);
        });
    }
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    selectMusicStyle(templateCategory) {
        // Map template categories to music styles
        const styleMap = {
            'dopamine': 'upbeat',
            'lazy': 'chill',
            'story': 'dramatic',
            'educational': 'chill',
            'default': 'energetic'
        };
        return styleMap[templateCategory] || styleMap.default;
    }
}
//# sourceMappingURL=audioManager.js.map