"""
Run the Viral Video Engine Agency
This script starts the agency and provides different interaction modes.
"""

import os
import sys
from viral_video_agency import viral_video_agency

def main():
    print("""
╔══════════════════════════════════════════════════════════════╗
║          🎬 VIRAL VIDEO ENGINE - AGENCY SWARM 🎬              ║
║                                                              ║
║  Automated Multi-Agent System for Video Generation Pipeline  ║
╚══════════════════════════════════════════════════════════════╝
    """)
    
    print("Choose interaction mode:")
    print("1. Web Interface (Gradio)")
    print("2. Terminal Interface")
    print("3. Execute specific task")
    print("4. Full autonomous build")
    
    choice = input("\nEnter choice (1-4): ").strip()
    
    if choice == "1":
        print("\n🌐 Starting web interface...")
        print("Open browser at http://localhost:7860")
        viral_video_agency.demo_gradio(height=900)
    
    elif choice == "2":
        print("\n💻 Starting terminal interface...")
        viral_video_agency.run_demo()
    
    elif choice == "3":
        print("\n📋 Available tasks:")
        print("- Setup infrastructure (Task 11)")
        print("- Implement template parser (Task 12)")
        print("- Create script generator (Task 13)")
        print("- Build media processors (Tasks 14-15)")
        print("- Develop video assembly (Task 16)")
        print("- Create main application (Task 20)")
        
        task = input("\nEnter task command: ")
        result = viral_video_agency.get_completion(task)
        print(f"\n✅ Result: {result}")
    
    elif choice == "4":
        print("\n🚀 Starting full autonomous build...")
        print("The agency will now build the entire Viral Video Engine.\n")
        
        # Sequential task execution
        tasks = [
            "Check Task Master for the next available task and begin implementation of Task 11 (Setup Core Project Infrastructure). Create all required directories, files, and configurations as specified.",
            "Once infrastructure is complete, proceed with Task 12 (Implement Viral Template Parser). Create the JSON schema and TemplateManager class.",
            "After templates are ready, implement Task 13 (Develop Script Generation Module) with GPT-4o integration.",
            "Build Task 14 (Visual Asset Collection System) with Pexels and Pixabay integration.",
            "Implement Task 15 (Audio Processing Module) with ElevenLabs integration.",
            "Create Task 16 (Video Assembly Engine) using FFmpeg for video generation.",
            "Develop Task 17 (Multi-Variant Export System) for creating video variations.",
            "Build Task 20 (Main Application Interface) to tie everything together.",
            "Run comprehensive tests on all implemented features."
        ]
        
        for i, task in enumerate(tasks, 1):
            print(f"\n📌 Step {i}/{len(tasks)}: {task[:80]}...")
            result = viral_video_agency.get_completion(task)
            print(f"✅ Completed: {result[:200]}...")
            
            # Optional: Add a pause between tasks
            input("\nPress Enter to continue to next task...")
    
    else:
        print("Invalid choice. Exiting.")
        sys.exit(1)

if __name__ == "__main__":
    # Ensure we're in the project directory
    os.chdir("C:\\Users\\Stuart\\Desktop\\Projects\\viralengine")
    
    # Check for required API keys
    required_keys = ["OPENAI_API_KEY", "ELEVENLABS_API_KEY", "PEXELS_API_KEY", "PIXABAY_API_KEY"]
    missing_keys = [key for key in required_keys if not os.getenv(key)]
    
    if missing_keys:
        print(f"⚠️ Warning: Missing API keys: {', '.join(missing_keys)}")
        print("Some features may not work properly.\n")
    
    main()