#!/usr/bin/env python3
"""
Start Building the Viral Video Engine with Node.js/TypeScript
Agency Swarm orchestrates Node.js development
"""

import os
import sys
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set OpenAI API key
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

from viral_video_agency_nodejs import viral_video_agency

def print_header():
    print("""
╔═══════════════════════════════════════════════════════════════════════╗
║              🎬 VIRAL VIDEO ENGINE - NODE.JS BUILDER 🎬                ║
║                                                                       ║
║         Agency Swarm → Node.js/TypeScript Implementation              ║
╚═══════════════════════════════════════════════════════════════════════╝
    """)

def automated_build():
    """Run the automated Node.js build process"""
    
    print("\n🚀 STARTING NODE.JS/TYPESCRIPT BUILD\n")
    print("=" * 70)
    
    # Phase 1: Node.js Project Setup
    print("\n📦 PHASE 1: NODE.JS PROJECT SETUP")
    print("-" * 40)
    
    setup_prompt = """
    Start building the Viral Video Engine in Node.js/TypeScript.
    
    First, check Task Master for Task 11, then delegate to NodeInfrastructureDev to:
    1. Initialize npm project with package.json
    2. Install TypeScript and core dependencies:
       - typescript, tsx, @types/node
       - openai (official SDK)
       - fluent-ffmpeg
       - axios, dotenv
       - winston (logging)
    3. Create tsconfig.json with ES module configuration
    4. Set up the directory structure:
       - src/lib/ (core modules)
       - src/api/ (API integrations)  
       - src/types/ (TypeScript types)
       - src/config/ (configuration)
    5. Create src/config/index.ts for environment variables
    
    Update Task Master as you complete subtasks.
    """
    
    print("🔧 Setting up Node.js project...")
    result = viral_video_agency.get_completion(setup_prompt)
    print("✅ Node.js project initialized")
    time.sleep(2)
    
    # Phase 2: Template System in TypeScript
    print("\n📋 PHASE 2: TEMPLATE SYSTEM (TYPESCRIPT)")
    print("-" * 40)
    
    template_prompt = """
    Implement Task 12 in TypeScript.
    
    Delegate to NodeTemplateDev to create:
    1. src/types/template.ts with TypeScript interfaces:
       - ViralTemplate interface
       - TemplateSection interface
       - TemplateCategory type
    2. src/lib/templateManager.ts with TemplateManager class:
       - loadTemplates() method
       - selectTemplate(topic) method
       - getTemplateById(id) method
    3. data/templates.json with all 29 template structures
    
    Use TypeScript for full type safety.
    Update Task Master status.
    """
    
    print("📝 Building TypeScript template system...")
    result = viral_video_agency.get_completion(template_prompt)
    print("✅ Template system implemented")
    time.sleep(2)
    
    # Phase 3: OpenAI Integration
    print("\n✍️ PHASE 3: OPENAI SCRIPT GENERATION")
    print("-" * 40)
    
    openai_prompt = """
    Implement Task 13 using OpenAI's Node.js SDK.
    
    Delegate to NodeScriptGenDev to create:
    1. src/types/script.ts with VideoScript interface
    2. src/lib/scriptGenerator.ts using OpenAI Node.js SDK:
       - Initialize OpenAI client with API key
       - generateScript(topic, template) method
       - batchGenerate(topics) method
       - Implement caching with Map or node-cache
    3. src/lib/promptBuilder.ts for prompt engineering
    
    Use async/await for all API calls.
    Update Task Master.
    """
    
    print("🤖 Integrating OpenAI SDK...")
    result = viral_video_agency.get_completion(openai_prompt)
    print("✅ Script generation ready")
    time.sleep(2)
    
    # Phase 4: Media APIs
    print("\n🎥 PHASE 4: MEDIA PROCESSING APIS")
    print("-" * 40)
    
    media_prompt = """
    Implement Tasks 14 and 15 with Node.js APIs.
    
    Delegate to NodeMediaDev to create:
    
    Visual (Task 14):
    1. src/api/pexels.ts - Pexels API client
    2. src/api/pixabay.ts - Pixabay API client  
    3. src/lib/clipManager.ts - manages video clips
    
    Audio (Task 15):
    1. src/api/elevenlabs.ts - ElevenLabs REST API
    2. src/lib/audioManager.ts - audio processing with fluent-ffmpeg
    
    Use axios for HTTP requests, handle errors properly.
    Update Task Master for both tasks.
    """
    
    print("📸 Building media processing...")
    result = viral_video_agency.get_completion(media_prompt)
    print("✅ Media APIs integrated")
    time.sleep(2)
    
    # Phase 5: Video Assembly with FFmpeg
    print("\n🎬 PHASE 5: VIDEO ASSEMBLY (FLUENT-FFMPEG)")
    print("-" * 40)
    
    ffmpeg_prompt = """
    Implement Task 16 using fluent-ffmpeg.
    
    Delegate to NodeVideoAssemblyDev to create:
    1. src/lib/videoAssembler.ts with VideoAssembler class:
       - assembleVideo(script, clips, audio) method
       - addCaptions() using drawtext filter
       - addTransitions() for smooth cuts
       - exportVideo() returning Buffer or file path
    2. src/lib/captionGenerator.ts for caption timing
    3. Handle async video rendering with Promises
    
    Use fluent-ffmpeg's chain API for video processing.
    Update Task Master.
    """
    
    print("🔨 Building video assembly engine...")
    result = viral_video_agency.get_completion(ffmpeg_prompt)
    print("✅ Video assembly complete")
    time.sleep(2)
    
    # Phase 6: CLI Application
    print("\n🎯 PHASE 6: CLI APPLICATION")
    print("-" * 40)
    
    cli_prompt = """
    Implement Task 20 as a Node.js CLI.
    
    Delegate to NodeCLIDev to create:
    1. src/cli.ts using commander.js:
       - --topic flag for video topic
       - --template flag for template ID
       - --variants flag for number of variants
       - --output flag for output directory
    2. src/index.ts with ViralVideoEngine class that:
       - Orchestrates all modules
       - Shows progress with ora spinner
       - Handles errors gracefully
    3. Update package.json scripts:
       - "generate": "tsx src/cli.ts"
       - "build": "tsc"
    
    Make it work with: npm run generate -- --topic "AI tools" --template 1
    Update Task Master.
    """
    
    print("🔗 Creating CLI application...")
    result = viral_video_agency.get_completion(cli_prompt)
    print("✅ CLI ready")
    time.sleep(2)
    
    # Phase 7: Testing
    print("\n🧪 PHASE 7: JEST TESTING")
    print("-" * 40)
    
    test_prompt = """
    Set up testing with Jest and TypeScript.
    
    Delegate to NodeTestingAgent to:
    1. Install jest, ts-jest, @types/jest
    2. Configure jest.config.js for TypeScript
    3. Create src/__tests__/ directory
    4. Write basic tests for:
       - templateManager.test.ts
       - scriptGenerator.test.ts
       - videoAssembler.test.ts
    5. Mock external API calls
    
    Run tests with: npm test
    Report results.
    """
    
    print("🔍 Setting up tests...")
    result = viral_video_agency.get_completion(test_prompt)
    print("✅ Testing complete")
    
    print("\n" + "=" * 70)
    print("🎉 NODE.JS BUILD COMPLETE!")
    print("=" * 70)
    print("\nTo generate a video:")
    print('  npm run generate -- --topic "Your Topic" --template 1 --variants 3')
    print("\nTo run in development:")
    print('  npm run dev')
    print("\nTo build for production:")
    print('  npm run build && npm start')

def main():
    print_header()
    
    print("\nSelect mode:")
    print("1. 🚀 Automated Node.js Build")
    print("2. 💬 Interactive Mode")
    print("3. 🌐 Web Interface")
    print("4. 📊 Check Status")
    
    choice = input("\nChoice (1-4): ").strip()
    
    if choice == "1":
        automated_build()
    elif choice == "2":
        print("\n💬 Interactive Mode - Give commands to the agency\n")
        while True:
            command = input("📝 Command (or 'exit'): ").strip()
            if command.lower() in ['exit', 'quit']:
                break
            result = viral_video_agency.get_completion(command)
            print(f"\n{result}\n")
    elif choice == "3":
        print("\n🌐 Starting Gradio interface...")
        viral_video_agency.demo_gradio(height=900)
    elif choice == "4":
        result = viral_video_agency.get_completion(
            "Check Task Master status and list pending tasks"
        )
        print(result)

if __name__ == "__main__":
    os.chdir("C:\\Users\\Stuart\\Desktop\\Projects\\viralengine")
    
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ OPENAI_API_KEY not found in .env")
        sys.exit(1)
    
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Interrupted")
    except Exception as e:
        print(f"\n❌ Error: {e}")