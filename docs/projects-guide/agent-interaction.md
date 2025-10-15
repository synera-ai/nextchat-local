# Working with AI Agents

## How AI Agents Use the Project System

### Automatic Project Detection
AI agents automatically:
- Check for existing projects before starting work
- Suggest new projects for significant changes
- Work within project context when available
- Update project documents as work progresses

### Status Reporting
After every code-changing response, AI agents provide:
- Current project name and stage
- Files changed count
- Task completion progress
- Active blocker count
- Next immediate action

### Context Preservation
AI agents maintain context by:
- Reading full project documents before starting work
- Updating progress logs after each session
- Documenting decisions and rationale
- Following handoff protocols for context switches

## Communication Patterns

### Project Suggestions
AI agents will suggest starting new projects when they detect:
- Feature development or enhancements
- Bug fixes requiring multiple files
- Refactoring or optimization work
- Documentation spanning multiple files
- Configuration or integration changes

**Example**: "This looks like a significant feature addition. Should we start a new project for this?"

### Progress Updates
AI agents provide regular updates through:
- Status reports after code changes
- Progress log entries in project documents
- Blocker identification and tracking
- Decision documentation

### Handoff Preparation
When switching contexts, AI agents:
- Complete current work thoroughly
- Document context for receiving agent
- Include completed work summary
- Specify next steps and priorities
- Add important warnings or considerations

## Quick Prompts for AI Agents

### Project Management
- `project new` - Start new project workflow
- `project status` - Show current project status
- `project continue` - Resume last active project
- `project complete` - Mark project complete and archive

### Information Requests
- `project active` - List all active projects
- `project backlog` - Review ideas and suggest next work
- `project templates` - Show available templates
- `guide show` - Display user guide index

### Documentation
- `project progress` - Add progress log entry
- `project decide` - Document a key decision
- `project block` - Add/update blockers
- `project handoff` - Prepare handoff notes

### Validation
- `project validate` - Check document completeness
- `status report` - Generate detailed status report

## Best Practices for Human-AI Collaboration

### For Humans
- **Review project status regularly** - Use `project status` to check progress
- **Make strategic decisions promptly** - Don't let blockers accumulate
- **Provide clear business context** - Fill out human context sections thoroughly
- **Coordinate agent assignments** - Use handoff notes for context switches

### For AI Agents
- **Read full project context** - Understand requirements before starting
- **Update progress logs** - Record work after each session
- **Document decisions** - Include rationale and alternatives
- **Follow handoff protocol** - Provide clear context for next agent
- **Validate against criteria** - Ensure work meets acceptance criteria

## Common Interaction Patterns

### Starting New Work
1. Human requests work or AI detects need
2. AI checks for existing projects
3. AI suggests new project if needed
4. Human approves and provides context
5. AI creates project document
6. Work begins within project context

### Continuing Existing Work
1. Human uses `project continue` or AI detects active project
2. AI reads project document for context
3. AI identifies current tasks and blockers
4. Work continues with progress tracking
5. AI updates project document

### Handling Blockers
1. AI identifies blocker during work
2. AI documents blocker in project document
3. Human reviews and provides guidance
4. Blocker resolved or work redirected
5. AI updates blocker status

### Project Completion
1. All acceptance criteria met
2. AI suggests project completion
3. Human reviews and approves
4. AI moves project to completed folder
5. Lessons learned documented

## Troubleshooting AI Interactions

### AI Not Following Project System
- Check that `.cursorrules` files are in place
- Verify project documents exist and are complete
- Use `project validate` to check document structure

### Missing Status Reports
- Ensure AI agent is reading `.cursorrules` files
- Check that project documents are being updated
- Use `status report` prompt for manual reports

### Context Loss Between Sessions
- Verify handoff notes are complete
- Check that project documents are current
- Use `project continue` to resume with full context

### Incomplete Project Documents
- Use `project validate` to identify missing sections
- Fill out required metadata and context sections
- Ensure all templates are properly followed
