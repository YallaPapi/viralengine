import { config } from './dist/config/index.js';
import { TemplateManager } from './dist/lib/templateManager.js';
import { ScriptGenerator } from './dist/lib/scriptGenerator.js';
import { PexelsAPI } from './dist/api/pexels.js';
import { PixabayAPI } from './dist/api/pixabay.js';
import { ElevenLabsAPI } from './dist/api/elevenlabs.js';

console.log('🧪 Testing Viral Engine APIs...\n');

async function testAPIs() {
  try {
    // Test Template Manager
    console.log('1. Testing Template Manager...');
    const templateManager = new TemplateManager();
    await templateManager.loadTemplates();
    const templates = templateManager.getAllTemplates();
    console.log(`   ✅ Loaded ${templates.length} templates\n`);

    // Test Script Generation
    console.log('2. Testing OpenAI Script Generation...');
    const scriptGen = new ScriptGenerator();
    const template = templates[0];
    const script = await scriptGen.generateScript('Test Topic', template);
    console.log(`   ✅ Generated script with ${script.segments.length} segments`);
    console.log(`   Preview: "${script.segments[0].text.substring(0, 50)}..."\n`);

    // Test Pexels
    console.log('3. Testing Pexels API...');
    const pexels = new PexelsAPI();
    const pexelsVideos = await pexels.searchVideos('technology', 2);
    console.log(`   ✅ Found ${pexelsVideos.length} videos from Pexels\n`);

    // Test Pixabay
    console.log('4. Testing Pixabay API...');
    const pixabay = new PixabayAPI();
    const pixabayVideos = await pixabay.searchVideos('nature', 2);
    console.log(`   ✅ Found ${pixabayVideos.length} videos from Pixabay\n`);

    // Test ElevenLabs
    console.log('5. Testing ElevenLabs API...');
    const elevenlabs = new ElevenLabsAPI();
    const audioBuffer = await elevenlabs.generateAudio({
      text: 'This is a test of the viral engine.',
      stability: 0.5,
      similarityBoost: 0.75
    });
    console.log(`   ✅ Generated audio (${audioBuffer.length} bytes)\n`);

    console.log('✅ All API tests passed!\n');
    console.log('⚠️  Note: Video assembly requires FFmpeg to be installed.');
    console.log('   Please install FFmpeg to generate complete videos.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAPIs();