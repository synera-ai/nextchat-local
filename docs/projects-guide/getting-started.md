# Getting Started

## First Time Setup

### 1. Understand the System
The project management system uses structured markdown documents to coordinate between human developers and AI coding agents. All development work happens within project documents that provide context, requirements, and progress tracking.

### 2. Explore the Structure
- **`/docs/projects/`** - Main project directory
  - `active/` - Currently active projects
  - `ideas/` - Project concepts and proposals
  - `completed/` - Finished projects (archive)
  - `templates/` - Project templates
- **`/docs/projects-guide/`** - This user guide
- **`.cursorrules`** - AI agent enforcement rules

### 3. Review Templates
Check available project templates:
```
project templates
```

## Creating Your First Project

### 1. Identify Work
Any significant development work should become a project:
- New features or enhancements
- Bug fixes requiring multiple files
- Refactoring or optimization work
- Documentation updates
- Configuration changes

### 2. Start New Project
Use the quick prompt:
```
project new
```

Or let AI agents suggest when they detect work that needs a project.

### 3. Fill Out Project Document
The AI will guide you through:
- **Metadata** - Project ID, title, dates, priority
- **Human Context** - Problem statement, business value, success criteria
- **AI Agent Context** - Technical requirements, dependencies, acceptance criteria
- **Current Stage** - Initial tasks and deliverables

### 4. Move to Active
When planning is complete, the project moves from `ideas/` to `active/` folder.

## Working with Projects

### Daily Workflow
1. **Check active projects** - Use `project active` to see current work
2. **Continue existing work** - Use `project continue` to resume
3. **Update progress** - AI agents automatically update project documents
4. **Handle blockers** - Use `project block` to document issues
5. **Make decisions** - Use `project decide` to record key choices

### Status Monitoring
- **Status reports** appear after every code change
- **Progress tracking** in project documents
- **Blocker management** for dependencies and issues

### Project Completion
1. **Final updates** - Complete all remaining sections
2. **Lessons learned** - Document what worked and what didn't
3. **Archive** - Use `project complete` to move to completed folder

## Quick Reference

### Essential Prompts
- `project new` - Start new project
- `project status` - Check current status
- `project continue` - Resume work
- `project complete` - Finish and archive
- `guide show` - Display guide index

### Project Lifecycle
1. **Idea** - Initial concept and planning
2. **Plan** - Detailed planning and architecture
3. **Design** - Technical specifications
4. **Implementation** - Active development
5. **Testing** - Quality assurance
6. **Review** - Code review and refinement
7. **Deployment** - Release activities
8. **Completion** - Post-deployment and retrospective

## Next Steps

- Read [Agent Interaction](agent-interaction.md) to understand AI collaboration
- Review [Workflows](workflows.md) for common patterns
- Check [Prompts](prompts.md) for complete command reference
- Explore [Visual Guide](visual-guide.md) for system diagrams
