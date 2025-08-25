"""
Viral Video Engine Agency - Builds Node.js/TypeScript Implementation
This agency coordinates specialized agents to build the viral video generation pipeline in Node.js.
"""

import os
from agency_swarm import Agency, Agent, set_openai_key
from agency_swarm.tools import BaseTool
from pydantic import Field
from typing import List, Optional
import json
import subprocess

# Set OpenAI API key from environment
set_openai_key(os.getenv("OPENAI_API_KEY"))

# ===========================
# SHARED TOOLS
# ===========================

class NodeExecutorTool(BaseTool):
    """
    Executes Node.js/npm commands for the project.
    """
    command: str = Field(..., description="Command to execute (e.g., 'npm install', 'node script.js')")
    working_dir: Optional[str] = Field(".", description="Working directory for the command")
    
    def run(self):
        try:
            result = subprocess.run(
                self.command,
                shell=True,
                cwd=os.path.join("C:\\Users\\Stuart\\Desktop\\Projects\\viralengine", self.working_dir),
                capture_output=True,
                text=True
            )
            return result.stdout if result.returncode == 0 else f"Error: {result.stderr}"
        except Exception as e:
            return f"Error executing command: {str(e)}"

class TypeScriptFileTool(BaseTool):
    """
    Creates or modifies TypeScript/JavaScript files for the project.
    """
    operation: str = Field(..., description="Operation: 'create', 'read', 'write', 'append'")
    file_path: str = Field(..., description="Path to the file relative to project root")
    content: Optional[str] = Field(None, description="TypeScript/JavaScript content to write/append")
    
    def run(self):
        full_path = os.path.join("C:\\Users\\Stuart\\Desktop\\Projects\\viralengine", self.file_path)
        
        try:
            if self.operation == "create":
                os.makedirs(os.path.dirname(full_path), exist_ok=True)
                with open(full_path, 'w') as f:
                    f.write(self.content or "")
                return f"Created file: {self.file_path}"
            
            elif self.operation == "read":
                with open(full_path, 'r') as f:
                    return f.read()
            
            elif self.operation == "write":
                with open(full_path, 'w') as f:
                    f.write(self.content)
                return f"Updated file: {self.file_path}"
            
            elif self.operation == "append":
                with open(full_path, 'a') as f:
                    f.write(self.content)
                return f"Appended to file: {self.file_path}"
            
        except Exception as e:
            return f"Error: {str(e)}"

class PackageJsonTool(BaseTool):
    """
    Manages package.json and npm dependencies.
    """
    action: str = Field(..., description="Action: 'init', 'add-dependency', 'add-script', 'install'")
    package_name: Optional[str] = Field(None, description="Package name for add-dependency")
    is_dev: Optional[bool] = Field(False, description="Is it a dev dependency?")
    script_name: Optional[str] = Field(None, description="Script name for add-script")
    script_command: Optional[str] = Field(None, description="Script command for add-script")
    
    def run(self):
        try:
            if self.action == "init":
                # Initialize package.json with TypeScript configuration
                package_json = {
                    "name": "viral-video-engine",
                    "version": "1.0.0",
                    "description": "AI-powered viral video generation engine",
                    "main": "dist/index.js",
                    "type": "module",
                    "scripts": {
                        "build": "tsc",
                        "dev": "tsx watch src/index.ts",
                        "start": "node dist/index.js",
                        "test": "jest",
                        "generate": "tsx src/cli.ts"
                    },
                    "keywords": ["viral", "video", "ai", "generation"],
                    "author": "",
                    "license": "MIT",
                    "engines": {
                        "node": ">=18.0.0"
                    }
                }
                
                with open("package.json", 'w') as f:
                    json.dump(package_json, f, indent=2)
                return "Initialized package.json"
            
            elif self.action == "add-dependency":
                flag = "-D" if self.is_dev else ""
                cmd = f"npm install {flag} {self.package_name}"
                result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
                return f"Installed {self.package_name}" if result.returncode == 0 else result.stderr
            
            elif self.action == "add-script":
                with open("package.json", 'r') as f:
                    pkg = json.load(f)
                pkg["scripts"][self.script_name] = self.script_command
                with open("package.json", 'w') as f:
                    json.dump(pkg, f, indent=2)
                return f"Added script: {self.script_name}"
            
            elif self.action == "install":
                result = subprocess.run("npm install", shell=True, capture_output=True, text=True)
                return "Dependencies installed" if result.returncode == 0 else result.stderr
            
        except Exception as e:
            return f"Error: {str(e)}"

class TaskMasterTool(BaseTool):
    """
    Interacts with Task Master to track and manage development tasks.
    """
    task_id: str = Field(..., description="Task ID from Task Master (e.g., '11.1')")
    action: str = Field(..., description="Action to perform: 'show', 'set-status', 'update-subtask'")
    status: Optional[str] = Field(None, description="New status if action is 'set-status': 'in-progress', 'done'")
    notes: Optional[str] = Field(None, description="Notes to add if action is 'update-subtask'")
    
    def run(self):
        if self.action == "show":
            cmd = f"task-master show {self.task_id}"
        elif self.action == "set-status":
            cmd = f"task-master set-status --id={self.task_id} --status={self.status}"
        elif self.action == "update-subtask":
            cmd = f'task-master update-subtask --id={self.task_id} --prompt="{self.notes}"'
        else:
            return f"Unknown action: {self.action}"
        
        try:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            return result.stdout if result.returncode == 0 else f"Error: {result.stderr}"
        except Exception as e:
            return f"Error executing command: {str(e)}"

# ===========================
# AGENT DEFINITIONS
# ===========================

# Project Manager Agent
project_manager = Agent(
    name="ProjectManager",
    description="Manages the Viral Video Engine project, coordinates Node.js development, and tracks progress via Task Master.",
    instructions="""You are the Project Manager for the Viral Video Engine built in Node.js/TypeScript.

Key Responsibilities:
1. Use Task Master to track all development tasks
2. Coordinate agents to build Node.js/TypeScript components
3. Ensure all code follows modern Node.js best practices
4. Use ES modules and TypeScript throughout

Technology Stack:
- Node.js 18+ with TypeScript
- OpenAI SDK for Node.js
- ElevenLabs API (REST)
- Pexels/Pixabay Node clients
- fluent-ffmpeg for video processing
- Task Master for project management

Always start by checking task status and delegate to appropriate agents.""",
    tools=[TaskMasterTool, NodeExecutorTool],
    temperature=0.2
)

# Node.js Infrastructure Developer
infrastructure_dev = Agent(
    name="NodeInfrastructureDev",
    description="Sets up Node.js/TypeScript project structure, dependencies, and configuration (Task 11).",
    instructions="""You specialize in Node.js/TypeScript project setup. Your tasks:

1. Initialize npm project with TypeScript
2. Set up project structure:
   - src/ for TypeScript source
   - dist/ for compiled JavaScript  
   - src/lib/ for core modules
   - src/api/ for API integrations
   - src/types/ for TypeScript types
3. Configure TypeScript (tsconfig.json)
4. Install core dependencies:
   - typescript, tsx, @types/node
   - openai, axios, dotenv
   - fluent-ffmpeg, sharp
   - winston for logging
5. Create configuration management with dotenv

Follow Task 11 specifications but implement in Node.js.""",
    tools=[TypeScriptFileTool, PackageJsonTool, NodeExecutorTool, TaskMasterTool],
    temperature=0.1
)

# Template System Developer (Node.js)
template_dev = Agent(
    name="NodeTemplateDev",
    description="Develops the viral template system in TypeScript (Task 12).",
    instructions="""You build the template parsing system in TypeScript:

1. Create src/lib/templateManager.ts
2. Define TypeScript interfaces for viral templates
3. Load and parse templates from JSON
4. Implement template selection algorithms
5. Use TypeScript for type safety

Example structure:
```typescript
interface ViralTemplate {
  id: number;
  name: string;
  category: 'dopamine' | 'lazy';
  structure: TemplateSection[];
  performanceScore: number;
}

class TemplateManager {
  async loadTemplates(): Promise<ViralTemplate[]>
  selectTemplate(topic: string): ViralTemplate
  updatePerformance(id: number, score: number): void
}
```""",
    tools=[TypeScriptFileTool, NodeExecutorTool, TaskMasterTool],
    temperature=0.2
)

# Script Generation Developer (Node.js)
script_gen_dev = Agent(
    name="NodeScriptGenDev",
    description="Implements GPT-4o script generation in TypeScript (Task 13).",
    instructions="""You implement script generation using OpenAI's Node.js SDK:

1. Create src/lib/scriptGenerator.ts
2. Use OpenAI Node.js SDK for GPT-4o
3. Implement prompt engineering
4. Add TypeScript types for scripts
5. Implement caching with node-cache

Example:
```typescript
import OpenAI from 'openai';

class ScriptGenerator {
  private openai: OpenAI;
  
  async generateScript(
    topic: string,
    template: ViralTemplate
  ): Promise<VideoScript>
  
  async batchGenerate(
    topics: string[]
  ): Promise<VideoScript[]>
}
```""",
    tools=[TypeScriptFileTool, NodeExecutorTool, TaskMasterTool],
    temperature=0.3
)

# Media Processing Developer (Node.js)
media_dev = Agent(
    name="NodeMediaDev",
    description="Implements media processing with Node.js APIs (Tasks 14-15).",
    instructions="""You handle media processing in Node.js:

Visual Assets (Task 14):
1. Create src/lib/clipManager.ts
2. Integrate Pexels/Pixabay Node.js clients
3. Use sharp for image processing
4. Implement async/await for API calls

Audio Processing (Task 15):
1. Create src/lib/audioManager.ts  
2. Integrate ElevenLabs REST API
3. Use fluent-ffmpeg for audio processing
4. Implement streaming for large files

Use Node.js best practices:
- Promise-based APIs
- Error handling with try/catch
- Streaming for large files""",
    tools=[TypeScriptFileTool, NodeExecutorTool, TaskMasterTool],
    temperature=0.2
)

# Video Assembly Developer (Node.js)
video_assembly_dev = Agent(
    name="NodeVideoAssemblyDev",
    description="Creates video assembly engine with fluent-ffmpeg (Tasks 16-17).",
    instructions="""You build the video assembly system using Node.js:

1. Create src/lib/videoAssembler.ts
2. Use fluent-ffmpeg for video processing
3. Implement caption generation with canvas
4. Create video pipelines with streams
5. Handle async video rendering

Example:
```typescript
import ffmpeg from 'fluent-ffmpeg';

class VideoAssembler {
  async assembleVideo(
    script: VideoScript,
    clips: VideoClip[],
    audio: AudioTrack
  ): Promise<Buffer>
  
  private addCaptions(
    command: ffmpeg.FfmpegCommand,
    captions: Caption[]
  ): void
}
```

Use Node.js streams for efficient processing.""",
    tools=[TypeScriptFileTool, NodeExecutorTool, TaskMasterTool],
    temperature=0.2
)

# CLI Developer (Node.js)
cli_dev = Agent(
    name="NodeCLIDev",
    description="Creates the CLI interface and main application (Task 20).",
    instructions="""You create the Node.js CLI application:

1. Create src/cli.ts using commander or yargs
2. Create src/index.ts as main entry point
3. Implement the ViralVideoEngine class
4. Add progress bars with ora or cli-progress
5. Handle command-line arguments

Example CLI:
```bash
npm run generate -- --topic "AI tools" --template 1 --variants 3
```

Integrate all modules and ensure smooth operation.""",
    tools=[TypeScriptFileTool, PackageJsonTool, NodeExecutorTool, TaskMasterTool],
    temperature=0.2
)

# Testing Agent (Node.js)
testing_agent = Agent(
    name="NodeTestingAgent",
    description="Creates Jest tests for all TypeScript modules.",
    instructions="""You write tests using Jest and TypeScript:

1. Set up Jest with ts-jest
2. Create __tests__ directories
3. Write unit tests for each module
4. Mock external API calls
5. Test async operations

Ensure all code is properly tested before marking tasks complete.""",
    tools=[TypeScriptFileTool, NodeExecutorTool, TaskMasterTool],
    temperature=0.1
)

# ===========================
# AGENCY SETUP
# ===========================

viral_video_agency = Agency(
    [
        project_manager,
        [project_manager, infrastructure_dev],
        [project_manager, template_dev],
        [project_manager, script_gen_dev],
        [project_manager, media_dev],
        [project_manager, video_assembly_dev],
        [project_manager, cli_dev],
        [project_manager, testing_agent],
        
        # Inter-agent communication
        [infrastructure_dev, testing_agent],
        [template_dev, script_gen_dev],
        [script_gen_dev, video_assembly_dev],
        [media_dev, video_assembly_dev],
        [video_assembly_dev, cli_dev],
        [cli_dev, testing_agent],
    ],
    shared_instructions="""
    We are building the Viral Video Engine in Node.js/TypeScript.
    
    Key Requirements:
    - Use Node.js 18+ with TypeScript
    - ES modules throughout (type: "module")
    - Async/await for all async operations
    - Proper error handling
    - Type safety with TypeScript
    
    Available APIs (keys in .env):
    - OpenAI GPT-4o (Node.js SDK)
    - ElevenLabs (REST API)
    - Pexels/Pixabay (Node.js clients)
    
    Output: Node.js CLI tool for generating viral videos
    
    Always update Task Master when completing subtasks.
    """,
    temperature=0.2,
    max_prompt_tokens=25000
)

if __name__ == "__main__":
    print("🎬 Viral Video Engine Agency (Node.js) initialized!")
    print("\nThis agency will build the project in Node.js/TypeScript")
    print("\n" + "="*60)
    print("Start with: python start_building_nodejs.py")
    print("="*60)