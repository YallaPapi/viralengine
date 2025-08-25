import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import NodeCache from 'node-cache';
import { VideoScript, ViralTemplate, ScriptSegment } from '../types/index.js';
import { config } from '../config/index.js';

export class ScriptGenerator {
  private openai: OpenAI;
  private cache: NodeCache;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey
    });
    
    // Cache for 1 hour
    this.cache = new NodeCache({ stdTTL: 3600 });
  }

  async generateScript(topic: string, template: ViralTemplate): Promise<VideoScript> {
    // Check cache first
    const cacheKey = `${topic}-${template.id}`;
    const cached = this.cache.get<VideoScript>(cacheKey);
    if (cached) {
      console.log('Using cached script');
      return cached;
    }

    try {
      const prompt = this.buildPrompt(topic, template);
      
      const completion = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are a viral video script writer. Create engaging, concise scripts optimized for short-form video platforms.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: config.openai.temperature,
        max_tokens: config.openai.maxTokens
      });

      const scriptContent = completion.choices[0].message.content || '';
      const script = this.parseScriptResponse(scriptContent, topic, template);
      
      // Cache the result
      this.cache.set(cacheKey, script);
      
      return script;
    } catch (error) {
      console.error('Error generating script:', error);
      // Return a fallback script
      return this.createFallbackScript(topic, template);
    }
  }

  private buildPrompt(topic: string, template: ViralTemplate): string {
    return `Create a viral video script about "${topic}" using this template structure:

Template: ${template.name}
Category: ${template.category}
Structure: ${JSON.stringify(template.structure, null, 2)}

Requirements:
1. Hook must grab attention in first 3 seconds
2. Keep text concise - max 10 words per caption
3. Include relevant emojis
4. Total duration: 30 seconds
5. Make it highly engaging and shareable

Format your response as JSON with this structure:
{
  "segments": [
    {
      "type": "hook",
      "text": "visible caption text",
      "voiceoverText": "what to say (if different from text)",
      "emoji": "relevant emoji",
      "duration": 3
    },
    ...
  ]
}

Create ${template.structure.filter(s => s.type === 'list_item')[0]?.count || 3} engaging points.`;
  }

  private parseScriptResponse(response: string, topic: string, template: ViralTemplate): VideoScript {
    try {
      // Try to parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const segments: ScriptSegment[] = parsed.segments.map((seg: any, index: number) => ({
        index,
        type: seg.type || 'content',
        text: seg.text || '',
        duration: seg.duration || 5,
        caption: seg.text,
        emoji: seg.emoji || '',
        voiceoverText: seg.voiceoverText || seg.text
      }));

      return {
        id: uuidv4(),
        templateId: template.id,
        topic,
        segments,
        totalDuration: segments.reduce((sum, seg) => sum + seg.duration, 0),
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Error parsing script response:', error);
      return this.createFallbackScript(topic, template);
    }
  }

  private createFallbackScript(topic: string, template: ViralTemplate): VideoScript {
    // Create a basic fallback script
    const segments: ScriptSegment[] = [
      {
        index: 0,
        type: 'hook',
        text: `Discover ${topic} 🔥`,
        duration: 3,
        caption: `Discover ${topic}`,
        emoji: '🔥',
        voiceoverText: `Let me show you something amazing about ${topic}`
      },
      {
        index: 1,
        type: 'content',
        text: `First important point 💡`,
        duration: 7,
        caption: 'First important point',
        emoji: '💡',
        voiceoverText: 'Here\'s the first thing you need to know'
      },
      {
        index: 2,
        type: 'content',
        text: `Second key insight 🚀`,
        duration: 7,
        caption: 'Second key insight',
        emoji: '🚀',
        voiceoverText: 'This is what makes it special'
      },
      {
        index: 3,
        type: 'content',
        text: `Third game-changer ⚡`,
        duration: 7,
        caption: 'Third game-changer',
        emoji: '⚡',
        voiceoverText: 'And this changes everything'
      },
      {
        index: 4,
        type: 'cta',
        text: `Follow for more! 👆`,
        duration: 3,
        caption: 'Follow for more!',
        emoji: '👆',
        voiceoverText: 'Follow for more tips like this'
      }
    ];

    return {
      id: uuidv4(),
      templateId: template.id,
      topic,
      segments,
      totalDuration: 27,
      generatedAt: new Date()
    };
  }

  async batchGenerate(topics: string[], template: ViralTemplate): Promise<VideoScript[]> {
    const scripts: VideoScript[] = [];
    
    for (const topic of topics) {
      console.log(`Generating script for: ${topic}`);
      const script = await this.generateScript(topic, template);
      scripts.push(script);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return scripts;
  }
}