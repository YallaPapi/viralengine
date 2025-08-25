# BMAD-METHOD™ Implementation Guide for Viral Video Generator

## 🚀 What We've Set Up

We've successfully integrated the **BMAD-METHOD™** (Breakthrough Method of Agile AI-Driven Development) into your Viral Video Generator project. This provides you with a complete AI agent team for building your video generation engine using advanced agentic planning and context-engineered development.

## 📁 Project Structure

```
viralengine/
├── .bmad-core/              # BMAD Core System
│   ├── agents/              # AI Agent definitions
│   ├── data/                # Project documents
│   │   ├── brief.md         # Project brief
│   │   ├── prd.md          # Product Requirements Document
│   │   └── architecture.md  # Technical architecture
│   ├── workflows/           # Development workflows
│   ├── templates/           # Story templates
│   └── project-config.yaml  # BMAD configuration
├── bmad-method/             # Cloned BMAD repository
├── tools/                   # BMAD tools
│   ├── bmad-flattener.js   # Code flattening tool
│   └── bmad-installer.js   # Installation utility
└── src/                     # Your application code
```

## 🤖 The BMAD Agent Team

Your project now has access to these specialized AI agents:

### Planning Phase Agents
1. **Analyst** - Helps define requirements and analyze the problem space
2. **PM (Product Manager)** - Creates and refines the PRD
3. **Architect** - Designs the technical architecture
4. **UX Designer** - (Optional) Creates user experience designs

### Development Phase Agents
5. **Scrum Master** - Transforms plans into detailed development stories
6. **Senior Dev** - Implements the actual code
7. **QA** - Tests and validates implementations
8. **DevOps** - Handles deployment and infrastructure

## 📋 How BMAD Works

### Phase 1: Planning (Web UI or IDE)
1. **Create Brief** - Work with the Analyst agent to define the project
2. **Generate PRD** - The PM agent creates detailed requirements
3. **Design Architecture** - The Architect agent creates technical specs
4. **Shard Documents** - Break down documents into manageable pieces

### Phase 2: Development (IDE)
1. **Story Generation** - Scrum Master creates detailed dev stories
2. **Implementation** - Senior Dev writes the code
3. **Testing** - QA validates the implementation
4. **Deployment** - DevOps handles release

## 🎯 Your Project Documents

We've created three essential BMAD documents for your project:

### 1. **Project Brief** (`.bmad-core/data/brief.md`)
- Executive summary of the viral video generator
- Problem statement and solution overview
- Target users and success criteria
- High-level requirements

### 2. **Product Requirements Document** (`.bmad-core/data/prd.md`)
- Detailed functional requirements
- User stories and personas
- Technical specifications
- Integration requirements
- Testing and documentation needs

### 3. **Architecture Document** (`.bmad-core/data/architecture.md`)
- System architecture overview
- Component designs
- Data models and APIs
- Security and performance considerations
- Deployment architecture

## 🛠️ Getting Started with Development

### Option 1: Use BMAD Web UI (Fastest)

1. **Create a new AI assistant** (Gemini Gem or CustomGPT)
2. **Upload the team bundle** from `bmad-method/dist/teams/team-fullstack.txt`
3. **Set instructions**: "Your critical operating instructions are attached, do not break character as directed"
4. **Start with**: Type `*analyst` to begin planning or `*help` for commands

### Option 2: Use BMAD in IDE

1. **Install dependencies**:
```bash
npm install
```

2. **Flatten your codebase** for AI context:
```bash
npm run bmad:flatten
```

3. **Work with agents** by providing them the flattened code and documents

## 📝 Development Workflow

### Step 1: Generate Development Stories
The Scrum Master agent will transform the PRD and Architecture into detailed stories:

```
Story Format:
- Title: Clear, actionable task name
- Context: Full background information
- Requirements: Detailed specifications
- Implementation: Step-by-step guide
- Testing: How to validate
- Dependencies: What's needed first
```

### Step 2: Implement with Senior Dev
Each story contains everything needed for implementation:
- Complete context from planning phase
- Architectural decisions
- Code examples and patterns
- Error handling requirements

### Step 3: Validate with QA
QA agent ensures:
- All requirements are met
- Tests pass successfully
- Performance benchmarks achieved
- Documentation is complete

## 🚀 Building the Video Generator

### Core Modules to Implement

1. **Script Generator** (`src/script/`)
   - Template-based script creation
   - Content validation
   - Variable tone/energy

2. **Media Sourcer** (`src/media/`)
   - Pexels/Pixabay integration
   - Quality scoring system
   - Local caching

3. **Audio Processor** (`src/audio/`)
   - TTS integration (ElevenLabs/OpenAI)
   - Audio mixing and ducking
   - Timing synchronization

4. **Video Compositor** (`src/video/`)
   - FFmpeg-based processing
   - Transitions and effects
   - Text overlay rendering

5. **CLI Interface** (`src/cli/`)
   - Command parsing
   - Batch processing
   - Progress reporting

## 💻 Available Commands

### BMAD Commands
```bash
# Flatten codebase for AI context
npm run bmad:flatten

# Update BMAD installation
npm run bmad:update
```

### Development Commands
```bash
# Build the project
npm run build

# Run in development mode
npm run dev

# Run tests
npm run test

# Start production server
npm run start
```

### Video Generation (Once Built)
```bash
# Generate single video
npm run dev -- --topic "Best Gaming Headphones"

# Batch processing
npm run dev -- --topic-list topics.txt

# With custom template
npm run dev -- --topic "Top 5 Smartphones" --template tech
```

## 📊 Project Configuration

The project is configured in `.bmad-core/project-config.yaml`:
- **Technology Stack**: Node.js, TypeScript, FFmpeg
- **External APIs**: ElevenLabs, OpenAI, Pexels, Pixabay
- **Architecture**: Event-driven modular pipeline
- **Quality Goals**: <2min generation, 95% success rate
- **Testing**: 80% unit coverage, integration tests

## 🎯 Next Steps

### Immediate Actions

1. **Choose your workflow**:
   - Web UI for planning and ideation
   - IDE for actual implementation

2. **Review the documents**:
   - Brief for project overview
   - PRD for detailed requirements
   - Architecture for technical design

3. **Start development**:
   - Begin with Task 21: Setup Core Architecture
   - Follow BMAD story generation process
   - Implement module by module

### Development Phases

**Week 1**: Foundation
- Project setup
- Core interfaces
- Configuration system
- Logging infrastructure

**Week 2-3**: Core Implementation
- Script generation
- Media sourcing
- Audio processing
- Video composition

**Week 4**: Integration & Polish
- CLI interface
- Batch processing
- Testing suite
- Documentation

## 🔧 Troubleshooting

### Common Issues

1. **FFmpeg not found**:
   - Install FFmpeg: https://ffmpeg.org/download.html
   - Add to PATH environment variable

2. **API keys missing**:
   - Create `.env` file
   - Add required keys (OPENAI_API_KEY, etc.)

3. **BMAD agents not responding correctly**:
   - Ensure you uploaded the correct team file
   - Check agent instructions are set properly

## 📚 Resources

- **BMAD Documentation**: `bmad-method/docs/`
- **User Guide**: `bmad-method/docs/user-guide.md`
- **Architecture Guide**: `bmad-method/docs/core-architecture.md`
- **Discord Community**: https://discord.gg/gk8jAdXWmj

## 🎉 You're Ready!

You now have:
- ✅ Complete BMAD-METHOD™ framework integrated
- ✅ Full AI agent team for development
- ✅ Comprehensive project documentation
- ✅ Clear development path forward
- ✅ All tools and workflows configured

Start by working with the BMAD agents to refine your requirements, then move into the development phase with context-engineered stories that contain everything needed for implementation.

**Remember**: The power of BMAD is in the collaboration between specialized agents and the preservation of context throughout the development process. Let the agents guide you!