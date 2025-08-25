"""
Viral Video Engine Agency - Multi-Agent System for Automated Video Creation
This agency coordinates specialized agents to build and operate the viral video generation pipeline.
"""

import os
from agency_swarm import Agency, Agent, set_openai_key
from agency_swarm.tools import BaseTool
from pydantic import Field
from typing import List, Optional
import json

# Set OpenAI API key from environment
set_openai_key(os.getenv("OPENAI_API_KEY"))

# ===========================
# SHARED TOOLS
# ===========================

class TaskMasterTool(BaseTool):
    """
    Interacts with Task Master to track and manage development tasks.
    """
    task_id: str = Field(..., description="Task ID from Task Master (e.g., '11.1')")
    action: str = Field(..., description="Action to perform: 'show', 'set-status', 'update-subtask'")
    status: Optional[str] = Field(None, description="New status if action is 'set-status': 'in-progress', 'done'")
    notes: Optional[str] = Field(None, description="Notes to add if action is 'update-subtask'")
    
    def run(self):
        import subprocess
        
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

class FileOperationTool(BaseTool):
    """
    Creates, reads, and writes files for the project.
    """
    operation: str = Field(..., description="Operation: 'create', 'read', 'write', 'append'")
    file_path: str = Field(..., description="Path to the file relative to project root")
    content: Optional[str] = Field(None, description="Content to write/append")
    
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

class PythonExecutorTool(BaseTool):
    """
    Executes Python code and returns the result.
    """
    code: str = Field(..., description="Python code to execute")
    
    def run(self):
        try:
            # Create a safe execution environment
            exec_globals = {}
            exec_locals = {}
            exec(self.code, exec_globals, exec_locals)
            
            # Return any result stored in 'result' variable
            if 'result' in exec_locals:
                return str(exec_locals['result'])
            return "Code executed successfully"
        except Exception as e:
            return f"Error executing code: {str(e)}"

# ===========================
# AGENT DEFINITIONS
# ===========================

# Project Manager Agent - Oversees the entire project
project_manager = Agent(
    name="ProjectManager",
    description="Manages the overall Viral Video Engine project, coordinates agents, and tracks progress via Task Master.",
    instructions="""You are the Project Manager for the Viral Video Engine. Your responsibilities:
    
1. Use Task Master to track and manage all development tasks
2. Coordinate other agents to implement specific features
3. Ensure all tasks follow the project structure and requirements
4. Monitor progress and update task statuses
5. Review completed work and ensure quality

Always start by checking the current task status with Task Master.
Delegate implementation work to specialized agents.
Update task statuses as work progresses.""",
    tools=[TaskMasterTool, FileOperationTool],
    temperature=0.2
)

# Infrastructure Developer Agent - Handles setup and configuration
infrastructure_dev = Agent(
    name="InfrastructureDev",
    description="Specializes in project setup, environment configuration, and infrastructure tasks (Task 11).",
    instructions="""You are responsible for setting up the core project infrastructure. Your tasks include:

1. Creating directory structures
2. Setting up Python virtual environments
3. Managing dependencies and requirements.txt
4. Implementing configuration systems
5. Setting up logging infrastructure

Follow the exact specifications from Task 11 and its subtasks.
Create all necessary files and folders as specified in the PRD.""",
    tools=[FileOperationTool, PythonExecutorTool, TaskMasterTool],
    temperature=0.1
)

# Template System Developer - Handles viral template parsing
template_dev = Agent(
    name="TemplateDev",
    description="Develops the viral template parsing system (Task 12) to structure the 29 templates.",
    instructions="""You specialize in the template parsing system. Your responsibilities:

1. Create JSON schemas for viral templates
2. Implement the TemplateManager class
3. Parse and structure all 29 viral templates from the PDFs
4. Create template selection and recommendation systems

Focus on Task 12 and ensure templates are properly formatted for script generation.""",
    tools=[FileOperationTool, PythonExecutorTool, TaskMasterTool],
    temperature=0.2
)

# Script Generation Developer - Implements LLM script generation
script_gen_dev = Agent(
    name="ScriptGenDev",
    description="Develops the script generation module using GPT-4o (Task 13).",
    instructions="""You implement the script generation system. Your tasks:

1. Create the ScriptGenerator class
2. Design and implement prompt engineering for GPT-4o
3. Format script outputs with proper timing and captions
4. Implement batch processing and caching
5. Handle API interactions with OpenAI

Ensure scripts follow viral templates and are optimized for engagement.""",
    tools=[FileOperationTool, PythonExecutorTool, TaskMasterTool],
    temperature=0.3
)

# Media Processing Developer - Handles video/audio assets
media_dev = Agent(
    name="MediaDev",
    description="Develops visual asset collection (Task 14) and audio processing (Task 15) systems.",
    instructions="""You handle all media processing components:

Visual Assets (Task 14):
- Implement ClipManager for Pexels/Pixabay integration
- Create clip categorization and preprocessing
- Develop clip selection algorithms

Audio Processing (Task 15):
- Implement AudioManager for ElevenLabs integration
- Create audio mixing and preprocessing
- Develop trending audio integration

Ensure all media is properly formatted for video assembly.""",
    tools=[FileOperationTool, PythonExecutorTool, TaskMasterTool],
    temperature=0.2
)

# Video Assembly Developer - Creates the video generation engine
video_assembly_dev = Agent(
    name="VideoAssemblyDev",
    description="Develops the video assembly engine (Task 16) and multi-variant system (Task 17).",
    instructions="""You create the core video assembly system:

Task 16 - Video Assembly:
- Implement VideoAssembler class
- Create caption generation with kinetic typography
- Develop clip sequencing algorithms
- Implement video enhancement features

Task 17 - Multi-Variant Export:
- Create VariantGenerator class
- Implement variation strategies
- Develop batch export systems

Use FFmpeg for video processing and ensure high-quality output.""",
    tools=[FileOperationTool, PythonExecutorTool, TaskMasterTool],
    temperature=0.2
)

# Integration Developer - Handles main application and interfaces
integration_dev = Agent(
    name="IntegrationDev",
    description="Develops the main application interface (Task 20) and integrates all modules.",
    instructions="""You create the main application that ties everything together:

1. Implement the ViralVideoEngine class
2. Create command-line interface
3. Develop batch processing capabilities
4. Implement progress tracking
5. Create configuration management
6. Ensure all modules work together seamlessly

Focus on Task 20 and ensure smooth integration of all components.""",
    tools=[FileOperationTool, PythonExecutorTool, TaskMasterTool],
    temperature=0.2
)

# Testing Agent - Validates and tests implementations
testing_agent = Agent(
    name="TestingAgent",
    description="Creates and runs tests for all implemented features.",
    instructions="""You are responsible for testing and validation:

1. Write unit tests for each module
2. Create integration tests
3. Validate API interactions
4. Test video output quality
5. Ensure all components meet requirements

Report any issues found and work with developers to fix them.""",
    tools=[FileOperationTool, PythonExecutorTool, TaskMasterTool],
    temperature=0.1
)

# ===========================
# AGENCY SETUP
# ===========================

# Define the agency with communication flows
viral_video_agency = Agency(
    [
        project_manager,  # Entry point - manages overall project
        [project_manager, infrastructure_dev],  # PM can assign infrastructure tasks
        [project_manager, template_dev],  # PM can assign template tasks
        [project_manager, script_gen_dev],  # PM can assign script generation tasks
        [project_manager, media_dev],  # PM can assign media processing tasks
        [project_manager, video_assembly_dev],  # PM can assign video assembly tasks
        [project_manager, integration_dev],  # PM can assign integration tasks
        [project_manager, testing_agent],  # PM can request testing
        
        # Developers can communicate with each other for integration
        [infrastructure_dev, testing_agent],
        [template_dev, script_gen_dev],  # Template dev provides schemas to script gen
        [script_gen_dev, video_assembly_dev],  # Script gen provides scripts to video assembly
        [media_dev, video_assembly_dev],  # Media provides assets to video assembly
        [video_assembly_dev, integration_dev],  # Video assembly integrates with main app
        [integration_dev, testing_agent],  # Integration dev requests testing
    ],
    shared_instructions="""
    We are building the Viral Video Engine - an automated system for generating viral short-form videos.
    
    Key Requirements:
    - Follow Task Master tasks strictly
    - Use the provided API keys in .env
    - Implement according to the PRD specifications
    - Create production-ready, well-documented code
    - Test all implementations thoroughly
    
    Available APIs:
    - OpenAI GPT-4o for script generation
    - ElevenLabs for voiceover
    - Pexels/Pixabay for stock footage
    
    Always update Task Master when completing subtasks.
    """,
    temperature=0.2,
    max_prompt_tokens=25000
)

if __name__ == "__main__":
    print("🎬 Viral Video Engine Agency initialized!")
    print("\nAvailable agents:")
    print("- ProjectManager: Overall project coordination")
    print("- InfrastructureDev: Setup and configuration")
    print("- TemplateDev: Viral template system")
    print("- ScriptGenDev: Script generation module")
    print("- MediaDev: Video/audio asset processing")
    print("- VideoAssemblyDev: Video assembly engine")
    print("- IntegrationDev: Main application interface")
    print("- TestingAgent: Testing and validation")
    
    print("\n" + "="*60)
    print("AGENCY READY - Start with: agency.run_demo() or agency.demo_gradio()")
    print("="*60)