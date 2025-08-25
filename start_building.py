#!/usr/bin/env python3
"""
Start Building the Viral Video Engine with Agency Swarm
This script initializes the agency and begins the automated development process.
"""

import os
import sys
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set OpenAI API key
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

from viral_video_agency import viral_video_agency

def print_header():
    print("""
╔═══════════════════════════════════════════════════════════════════════╗
║                   🎬 VIRAL VIDEO ENGINE BUILDER 🎬                     ║
║                                                                       ║
║           Automated Development with Agency Swarm Agents              ║
╚═══════════════════════════════════════════════════════════════════════╝
    """)

def automated_build():
    """Run the automated build process"""
    
    print("\n🚀 STARTING AUTOMATED BUILD PROCESS\n")
    print("=" * 70)
    
    # Phase 1: Project Setup
    print("\n📦 PHASE 1: PROJECT INFRASTRUCTURE")
    print("-" * 40)
    
    task_11_prompt = """
    Start building the Viral Video Engine project. 
    
    First, check Task Master for Task 11 (Setup Core Project Infrastructure).
    Then delegate to InfrastructureDev to:
    1. Create the complete directory structure as specified
    2. Set up requirements.txt with all dependencies
    3. Create config.py for API key management
    4. Implement the logging system
    5. Create main.py entry point
    
    Update Task Master status as subtasks are completed.
    Report back with the completed file structure.
    """
    
    print("🔧 Setting up project infrastructure...")
    result = viral_video_agency.get_completion(task_11_prompt)
    print(f"✅ Infrastructure setup complete")
    time.sleep(2)
    
    # Phase 2: Template System
    print("\n📋 PHASE 2: VIRAL TEMPLATE SYSTEM")
    print("-" * 40)
    
    task_12_prompt = """
    Now implement Task 12 (Viral Template Parser).
    
    Delegate to TemplateDev to:
    1. Create the JSON schema for viral templates
    2. Create templates/viral_templates.json with structure for all 29 templates
    3. Implement the TemplateManager class in scripts/template_manager.py
    4. Add template selection and recommendation methods
    
    The 29 templates are divided into:
    - Templates 1-14: Dopamine Listicles
    - Templates 15-29: Lazy Viral Templates
    
    Update Task Master as subtasks are completed.
    """
    
    print("📝 Building template system...")
    result = viral_video_agency.get_completion(task_12_prompt)
    print(f"✅ Template system implemented")
    time.sleep(2)
    
    # Phase 3: Script Generation
    print("\n✍️ PHASE 3: SCRIPT GENERATION MODULE")
    print("-" * 40)
    
    task_13_prompt = """
    Implement Task 13 (Script Generation Module).
    
    Delegate to ScriptGenDev to:
    1. Create scripts/script_generator.py with ScriptGenerator class
    2. Implement GPT-4o integration using OpenAI API
    3. Design prompt engineering for viral content
    4. Add batch processing capabilities
    5. Implement caching system
    
    Ensure it uses templates from the TemplateManager.
    Update Task Master status.
    """
    
    print("🤖 Creating script generation module...")
    result = viral_video_agency.get_completion(task_13_prompt)
    print(f"✅ Script generator ready")
    time.sleep(2)
    
    # Phase 4: Media Processing
    print("\n🎥 PHASE 4: MEDIA PROCESSING SYSTEMS")
    print("-" * 40)
    
    task_14_15_prompt = """
    Implement Tasks 14 and 15 (Visual and Audio Processing).
    
    Delegate to MediaDev to create:
    
    For Task 14 (Visual Assets):
    1. scripts/clip_manager.py with Pexels/Pixabay integration
    2. Clip categorization system
    3. Preprocessing pipeline for 9:16 format
    
    For Task 15 (Audio):
    1. scripts/audio_manager.py with ElevenLabs integration
    2. Voiceover generation methods
    3. Audio mixing capabilities
    
    Use the API keys from .env file.
    Update Task Master for both tasks.
    """
    
    print("📸 Building media processing systems...")
    result = viral_video_agency.get_completion(task_14_15_prompt)
    print(f"✅ Media processors implemented")
    time.sleep(2)
    
    # Phase 5: Video Assembly
    print("\n🎬 PHASE 5: VIDEO ASSEMBLY ENGINE")
    print("-" * 40)
    
    task_16_prompt = """
    Implement Task 16 (Video Assembly Engine).
    
    Delegate to VideoAssemblyDev to create:
    1. scripts/video_assembler.py with VideoAssembler class
    2. Caption generation with kinetic typography
    3. Clip sequencing algorithm
    4. FFmpeg integration for video creation
    5. Export functionality for MP4 output
    
    This is the core engine that combines everything.
    Update Task Master status.
    """
    
    print("🔨 Building video assembly engine...")
    result = viral_video_agency.get_completion(task_16_prompt)
    print(f"✅ Video assembly engine complete")
    time.sleep(2)
    
    # Phase 6: Main Application
    print("\n🎯 PHASE 6: MAIN APPLICATION")
    print("-" * 40)
    
    task_20_prompt = """
    Implement Task 20 (Main Application Interface).
    
    Delegate to IntegrationDev to:
    1. Update main.py with ViralVideoEngine class
    2. Create CLI interface with argparse
    3. Implement batch processing
    4. Add progress tracking
    5. Integrate all modules together
    
    Create a working command like:
    python main.py --topic "AI tools" --template 1 --variants 3
    
    Update Task Master when complete.
    """
    
    print("🔗 Creating main application...")
    result = viral_video_agency.get_completion(task_20_prompt)
    print(f"✅ Main application ready")
    time.sleep(2)
    
    # Final Testing
    print("\n🧪 PHASE 7: TESTING & VALIDATION")
    print("-" * 40)
    
    test_prompt = """
    Now test the complete system.
    
    Delegate to TestingAgent to:
    1. Verify all modules are properly integrated
    2. Test a sample video generation with topic "Top 5 AI Tools"
    3. Validate all API integrations work
    4. Check that output follows viral template structure
    5. Report any issues found
    
    Provide a final status report.
    """
    
    print("🔍 Running system tests...")
    result = viral_video_agency.get_completion(test_prompt)
    print(f"✅ Testing complete")
    
    print("\n" + "=" * 70)
    print("🎉 BUILD COMPLETE! The Viral Video Engine is ready to use.")
    print("=" * 70)
    print("\nTo generate a video, run:")
    print('  python main.py --topic "Your Topic" --template 1 --variants 3')
    print("\nCheck the output/ directory for generated videos.")

def interactive_mode():
    """Run in interactive mode"""
    print("\n💬 INTERACTIVE MODE")
    print("Type your commands for the agency. Type 'exit' to quit.\n")
    
    while True:
        command = input("📝 Enter command: ").strip()
        
        if command.lower() in ['exit', 'quit']:
            print("Goodbye!")
            break
        
        if not command:
            continue
        
        print("\n⏳ Processing...")
        result = viral_video_agency.get_completion(command)
        print(f"\n📤 Response:\n{result}\n")
        print("-" * 60)

def main():
    print_header()
    
    print("\nSelect mode:")
    print("1. 🚀 Automated Build (Recommended)")
    print("2. 💬 Interactive Mode")
    print("3. 🌐 Web Interface (Gradio)")
    print("4. 📊 Check Project Status")
    
    choice = input("\nEnter choice (1-4): ").strip()
    
    if choice == "1":
        automated_build()
    elif choice == "2":
        interactive_mode()
    elif choice == "3":
        print("\n🌐 Starting web interface at http://localhost:7860")
        viral_video_agency.demo_gradio(height=900)
    elif choice == "4":
        print("\n📊 Checking project status...")
        result = viral_video_agency.get_completion(
            "Check Task Master for current project status and list all pending tasks."
        )
        print(result)
    else:
        print("Invalid choice.")

if __name__ == "__main__":
    # Change to project directory
    os.chdir("C:\\Users\\Stuart\\Desktop\\Projects\\viralengine")
    
    # Check for OpenAI API key
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ Error: OPENAI_API_KEY not found in environment variables.")
        print("Please set it in your .env file.")
        sys.exit(1)
    
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Build interrupted by user.")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)