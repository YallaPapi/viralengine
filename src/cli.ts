#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { ViralEngine } from './lib/viralEngine.js';
import { TemplateManager } from './lib/templateManager.js';
import { validateConfig } from './config/index.js';
import fs from 'fs/promises';
import path from 'path';

const program = new Command();

program
  .name('viralengine')
  .description('Generate viral short-form videos automatically')
  .version('1.0.0');

// Generate command
program
  .command('generate')
  .description('Generate a viral video')
  .requiredOption('-t, --topic <topic>', 'Topic for the video')
  .option('-i, --template-id <id>', 'Template ID to use', parseInt)
  .option('-d, --duration <seconds>', 'Video duration in seconds', parseInt, 30)
  .option('-m, --music <style>', 'Background music style (upbeat/chill/dramatic/energetic)')
  .option('-v, --voice <style>', 'Voice style (young/mature/energetic)')
  .option('-o, --output <path>', 'Output directory')
  .action(async (options) => {
    const spinner = ora('Initializing Viral Engine...').start();
    
    try {
      validateConfig();
      
      const engine = new ViralEngine();
      await engine.initialize();
      
      spinner.text = 'Generating video...';
      
      const videoPath = await engine.generateVideo({
        topic: options.topic,
        templateId: options.templateId,
        duration: options.duration,
        musicStyle: options.music as any,
        voiceStyle: options.voice as any
      });
      
      spinner.succeed(chalk.green('✅ Video generated successfully!'));
      console.log(chalk.blue('📁 Output:'), videoPath);
      
      if (options.output) {
        const outputPath = path.join(options.output, path.basename(videoPath));
        await fs.copyFile(videoPath, outputPath);
        console.log(chalk.blue('📁 Copied to:'), outputPath);
      }
    } catch (error) {
      spinner.fail(chalk.red('Failed to generate video'));
      console.error(error);
      process.exit(1);
    }
  });

// Batch generate command
program
  .command('batch')
  .description('Generate multiple videos from a list of topics')
  .requiredOption('-f, --file <path>', 'File containing topics (one per line)')
  .option('-i, --template-id <id>', 'Template ID to use for all videos', parseInt)
  .option('-o, --output <path>', 'Output directory')
  .action(async (options) => {
    const spinner = ora('Reading topics file...').start();
    
    try {
      validateConfig();
      
      const topicsContent = await fs.readFile(options.file, 'utf-8');
      const topics = topicsContent
        .split('\n')
        .map(t => t.trim())
        .filter(t => t.length > 0);
      
      spinner.text = `Found ${topics.length} topics. Initializing...`;
      
      const engine = new ViralEngine();
      await engine.initialize();
      
      spinner.text = 'Generating videos...';
      
      const results = await engine.generateBatch(topics, options.templateId);
      
      spinner.succeed(chalk.green(`✅ Generated ${results.length}/${topics.length} videos`));
      
      if (options.output) {
        await fs.mkdir(options.output, { recursive: true });
        for (const videoPath of results) {
          const outputPath = path.join(options.output, path.basename(videoPath));
          await fs.copyFile(videoPath, outputPath);
        }
        console.log(chalk.blue('📁 Videos saved to:'), options.output);
      }
    } catch (error) {
      spinner.fail(chalk.red('Batch generation failed'));
      console.error(error);
      process.exit(1);
    }
  });

// Test command
program
  .command('test')
  .description('Run a test generation with sample content')
  .action(async () => {
    const spinner = ora('Running test generation...').start();
    
    try {
      validateConfig();
      
      const engine = new ViralEngine();
      await engine.initialize();
      
      spinner.text = 'Generating test video...';
      
      const videoPath = await engine.testGeneration();
      
      spinner.succeed(chalk.green('✅ Test video generated successfully!'));
      console.log(chalk.blue('📁 Output:'), videoPath);
    } catch (error) {
      spinner.fail(chalk.red('Test generation failed'));
      console.error(error);
      process.exit(1);
    }
  });

// List templates command
program
  .command('templates')
  .description('List available viral templates')
  .action(async () => {
    try {
      const manager = new TemplateManager();
      await manager.loadTemplates();
      
      const templates = manager.getAllTemplates();
      
      console.log(chalk.blue('\n📋 Available Templates:\n'));
      
      for (const template of templates) {
        console.log(chalk.yellow(`ID: ${template.id}`));
        console.log(chalk.white(`Name: ${template.name}`));
        console.log(chalk.gray(`Category: ${template.category}`));
        console.log(chalk.gray(`Description: ${template.description}`));
        console.log(chalk.gray(`Performance Score: ${(template.performanceScore * 100).toFixed(0)}%`));
        console.log(chalk.gray(`Example: "${template.example}"`));
        console.log('---');
      }
    } catch (error) {
      console.error(chalk.red('Failed to load templates'), error);
      process.exit(1);
    }
  });

// Check config command
program
  .command('check')
  .description('Check configuration and API keys')
  .action(() => {
    console.log(chalk.blue('\n🔍 Checking configuration...\n'));
    
    const apiKeys = [
      { name: 'OPENAI_API_KEY', required: true },
      { name: 'ELEVENLABS_API_KEY', required: true },
      { name: 'PEXELS_API_KEY', required: false },
      { name: 'PIXABAY_API_KEY', required: false }
    ];
    
    let allGood = true;
    
    for (const key of apiKeys) {
      const value = process.env[key.name];
      if (value) {
        console.log(chalk.green(`✅ ${key.name}: Configured`));
      } else if (key.required) {
        console.log(chalk.red(`❌ ${key.name}: Missing (REQUIRED)`));
        allGood = false;
      } else {
        console.log(chalk.yellow(`⚠️ ${key.name}: Missing (optional)`));
      }
    }
    
    console.log();
    
    if (allGood) {
      console.log(chalk.green('✅ All required API keys are configured!'));
    } else {
      console.log(chalk.red('❌ Some required API keys are missing.'));
      console.log(chalk.gray('Please check your .env file.'));
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}