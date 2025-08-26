import fs from 'fs/promises';
import path from 'path';
import { ViralTemplate } from '../types/index';
import { config } from '../config/index';

export class TemplateManager {
  private templates: ViralTemplate[] = [];
  private loaded: boolean = false;

  async loadTemplates(): Promise<void> {
    try {
      // Try to load from JSON file first
      const templatePath = config.paths.templates;
      
      try {
        const data = await fs.readFile(templatePath, 'utf-8');
        this.templates = JSON.parse(data);
        this.loaded = true;
        console.log(`✅ Loaded ${this.templates.length} templates`);
      } catch (error) {
        // If file doesn't exist, create default templates
        console.log('Creating default templates...');
        await this.createDefaultTemplates();
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      throw error;
    }
  }

  private async createDefaultTemplates(): Promise<void> {
    // Create sample templates based on the 29 viral templates mentioned
    const defaultTemplates: ViralTemplate[] = [
      {
        id: 1,
        name: "Top 5 Dopamine List",
        category: "dopamine",
        description: "Classic countdown listicle format for maximum engagement",
        structure: [
          { type: 'hook', format: 'question', duration: 3 },
          { type: 'list_item', count: 5, duration: 5 },
          { type: 'cta', format: 'follow_for_more', duration: 2 }
        ],
        example: "You Won't Believe These 5 AI Tools...",
        performanceScore: 0.85,
        tags: ['listicle', 'countdown', 'engaging']
      },
      {
        id: 2,
        name: "Quick Tip Lazy Scroll",
        category: "lazy",
        description: "Simple scrollable tip that keeps viewers watching",
        structure: [
          { type: 'hook', format: 'statement', duration: 2 },
          { type: 'list_item', count: 3, duration: 7 },
          { type: 'cta', format: 'save_this', duration: 1 }
        ],
        example: "The Secret Nobody Tells You About...",
        performanceScore: 0.78,
        tags: ['tips', 'quick', 'educational']
      },
      {
        id: 3,
        name: "Story Time Hook",
        category: "story",
        description: "Narrative format that builds suspense",
        structure: [
          { type: 'hook', format: 'story_start', duration: 4 },
          { type: 'list_item', count: 1, duration: 20 },
          { type: 'cta', format: 'part_2_coming', duration: 2 }
        ],
        example: "This Changed Everything...",
        performanceScore: 0.82,
        tags: ['story', 'narrative', 'suspense']
      },
      {
        id: 4,
        name: "Before vs After",
        category: "educational",
        description: "Transformation or comparison format",
        structure: [
          { type: 'hook', format: 'comparison', duration: 3 },
          { type: 'list_item', count: 2, duration: 10 },
          { type: 'cta', format: 'try_this', duration: 2 }
        ],
        example: "Before I Knew This vs After...",
        performanceScore: 0.80,
        tags: ['comparison', 'transformation', 'educational']
      },
      {
        id: 5,
        name: "POV Relatable",
        category: "dopamine",
        description: "POV format for relatable content",
        structure: [
          { type: 'hook', format: 'pov', duration: 2 },
          { type: 'list_item', count: 1, duration: 10 },
          { type: 'cta', format: 'comment_below', duration: 1 }
        ],
        example: "POV: You Just Discovered...",
        performanceScore: 0.75,
        tags: ['pov', 'relatable', 'engagement']
      }
    ];

    // Save to file
    await fs.mkdir(path.dirname(config.paths.templates), { recursive: true });
    await fs.writeFile(
      config.paths.templates,
      JSON.stringify(defaultTemplates, null, 2),
      'utf-8'
    );
    
    this.templates = defaultTemplates;
    this.loaded = true;
    console.log(`✅ Created ${defaultTemplates.length} default templates`);
  }

  getTemplateById(id: number): ViralTemplate | undefined {
    if (!this.loaded) {
      throw new Error('Templates not loaded. Call loadTemplates() first.');
    }
    return this.templates.find(t => t.id === id);
  }

  selectTemplate(topic: string): ViralTemplate {
    if (!this.loaded) {
      throw new Error('Templates not loaded. Call loadTemplates() first.');
    }

    // Simple keyword matching for template selection
    const topicLower = topic.toLowerCase();
    
    // Find best matching template based on tags and keywords
    let bestMatch = this.templates[0];
    let bestScore = 0;

    for (const template of this.templates) {
      let score = template.performanceScore;
      
      // Check if topic matches template tags
      for (const tag of template.tags) {
        if (topicLower.includes(tag)) {
          score += 0.2;
        }
      }
      
      // Prefer listicles for number-based topics
      if (topicLower.match(/\d+|top|best|worst/) && template.category === 'dopamine') {
        score += 0.15;
      }
      
      // Prefer story format for personal topics
      if (topicLower.match(/story|experience|journey/) && template.category === 'story') {
        score += 0.15;
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = template;
      }
    }

    console.log(`Selected template: ${bestMatch.name} for topic: ${topic}`);
    return bestMatch;
  }

  getAllTemplates(): ViralTemplate[] {
    if (!this.loaded) {
      throw new Error('Templates not loaded. Call loadTemplates() first.');
    }
    return this.templates;
  }

  updatePerformanceScore(id: number, newScore: number): void {
    const template = this.templates.find(t => t.id === id);
    if (template) {
      template.performanceScore = Math.min(1, Math.max(0, newScore));
      // Save updated templates
      fs.writeFile(
        config.paths.templates,
        JSON.stringify(this.templates, null, 2),
        'utf-8'
      ).catch(console.error);
    }
  }
}