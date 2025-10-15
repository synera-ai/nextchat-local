# Document-Driven Project Management Architecture

## Overview

This system provides a comprehensive documentation framework for managing software projects from ideation through deployment. Designed for one human developer coordinating with multiple AI coding agents, it ensures both strategic oversight and clear execution guidance.

## Philosophy

- **Documentation as Single Source of Truth**: All project information lives in structured markdown files
- **Human-AI Collaboration**: Documentation serves both human strategic needs and AI execution requirements
- **Staged Development**: Clear lifecycle stages with defined transitions
- **Agent Coordination**: Structured handoffs between AI agents with preserved context
- **Standalone System**: No code integration, pure documentation approach

## Directory Structure

```
/docs/projects/
├── README.md                          # This guide
├── .project-schema.json              # JSON schema for validation
├── templates/                         # Project templates
│   ├── feature.md                    # New feature template
│   ├── bugfix.md                     # Bug fix template
│   ├── refactoring.md                # Code refactoring template
│   └── documentation.md              # Documentation project template
├── active/                           # Currently active projects
├── completed/                        # Finished projects (archive)
└── ideas/                           # Project ideas and proposals
```

## Project Lifecycle

Each project follows these stages:

1. **Idea** - Initial concept with problem/opportunity statement
2. **Plan** - Detailed planning with architecture decisions
3. **Design** - Technical design and specifications
4. **Implementation** - Active development work
5. **Testing** - Testing and quality assurance
6. **Review** - Code review and refinement
7. **Deployment** - Release and deployment activities
8. **Completion** - Post-deployment and retrospective

## Quick Start

### For New Users
- **[User Guide](https://github.com/your-repo/docs/projects-guide/)** - Complete multi-page guide with visual diagrams
- **[Getting Started](https://github.com/your-repo/docs/projects-guide/getting-started.md)** - Quick setup and first project
- **[Agent Interaction](https://github.com/your-repo/docs/projects-guide/agent-interaction.md)** - Working with AI agents

### Quick Prompts
Use these 2-3 word prompts with AI agents:
- `project new` - Start new project workflow
- `project status` - Show current project status  
- `project continue` - Resume last active project
- `project backlog` - Review ideas and suggest next work
- `guide show` - Display user guide index

### Starting a New Project

1. **Choose Template**: Copy the appropriate template from `/templates/`
   - `feature.md` - For new features
   - `bugfix.md` - For bug fixes
   - `refactoring.md` - For code refactoring
   - `documentation.md` - For documentation projects

2. **Create Project File**: Save to `/ideas/` with naming convention:
   ```
   YYYY-MM-DD-descriptive-project-name.md
   ```
   Example: `2025-01-15-user-authentication-redesign.md`

3. **Fill Metadata**: Complete the metadata section with:
   - Project ID (kebab-case)
   - Title and description
   - Initial stage (usually "idea")
   - Creation date
   - Assigned agents (if known)

4. **Define Context**: Fill in both human and AI agent context sections

5. **Move to Active**: When planning is complete, move the file to `/active/`

### During Development

1. **Update Progress**: Add entries to the progress log regularly
2. **Document Decisions**: Record key decisions as they're made
3. **Track Blockers**: Update the blockers section with current issues
4. **Stage Transitions**: Update the stage field as the project advances
5. **Agent Handoffs**: Add handoff notes when switching between AI agents

### Completing a Project

1. **Final Updates**: Complete all remaining sections
2. **Lessons Learned**: Document what worked well and what didn't
3. **Archive**: Move the file to `/completed/`
4. **Cross-References**: Update any related projects with completion notes

## File Naming Conventions

### Project Files
- **Format**: `YYYY-MM-DD-descriptive-project-name.md`
- **Examples**:
  - `2025-01-15-user-authentication-redesign.md`
  - `2025-01-20-fix-login-validation-bug.md`
  - `2025-01-25-refactor-api-layer.md`

### Documentation Files
- **Human Documentation**: `lower-case.md` (getting-started.md, workflows.md)
- **AI Documentation**: `UPPER_CASE.md` (AGENT_PROMPTS.md, STATUS_TEMPLATE.md)
- **Project Files**: `YYYY-MM-DD-kebab-case.md`

## Document Structure

Each project document contains these sections:

### Metadata
- Project identification and basic info
- Current stage and dates
- Assigned agents and priority
- Tags for categorization

### Human Context
- Problem statement and business value
- Success criteria and constraints
- Stakeholder information
- Strategic considerations

### AI Agent Context
- Technical requirements and dependencies
- Acceptance criteria and implementation guidelines
- File references and code context
- Agent-specific instructions

### Current Stage
- Stage-specific details and tasks
- Deliverables and milestones
- Agent assignments per task
- Progress tracking

### Progress Log
- Chronological updates
- Agent contributions
- Files changed
- Stage transitions

### Decisions
- Key architectural decisions
- Rationale and alternatives
- Impact assessment
- Decision makers

### Blockers
- Current issues and dependencies
- Priority and status
- Assignment and resolution tracking
- Impact on timeline

### Handoff Notes
- Context for agent transitions
- Completed work summary
- Next steps and priorities
- Important notes and warnings

## AI Agent Coordination

### Agent Assignment
- Clearly specify which agents work on which tasks
- Define context boundaries for each agent
- Establish communication protocols

### Context Preservation
- Document all relevant context for handoffs
- Include file references and code locations
- Maintain decision history and rationale

### Success Verification
- Define clear acceptance criteria
- Establish testing and validation procedures
- Document verification steps

### Handoff Protocol
1. **Complete Current Work**: Finish assigned tasks
2. **Update Progress Log**: Record what was accomplished
3. **Document Context**: Add handoff notes with:
   - Current state and progress
   - Next steps and priorities
   - Important warnings or considerations
   - File changes and locations
4. **Notify Next Agent**: Update agent assignment

## Best Practices

### For Human Developers
- Review project status regularly
- Make strategic decisions promptly
- Document business context clearly
- Coordinate agent assignments effectively

### For AI Agents
- Read full project context before starting
- Update progress log after each session
- Document decisions and rationale
- Follow handoff protocol strictly
- Validate work against acceptance criteria

### Documentation Quality
- Use clear, concise language
- Include specific file paths and code references
- Maintain chronological order in logs
- Keep metadata current and accurate

## Validation

Use the JSON schema (`.project-schema.json`) to validate project documents:

```bash
# Example validation (requires json-schema-validator)
validate-json project-file.md .project-schema.json
```

## Integration Points

While this system is standalone, it integrates with the existing codebase through:

- **File References**: Absolute paths to relevant code files
- **Cross-References**: Links to existing documentation
- **Related Projects**: References between dependent projects
- **Codebase Structure**: Alignment with existing directory structure

## AI Agent Integration

### Status Reports
AI agents provide status reports after every code change:
```
**Status Report**
- Project: [name or "New Project Suggested"]
- Stage: [current stage]
- Files Changed: [count] files
- Tasks: [completed]/[total]
- Blockers: [count] active
- Next: [next immediate action]
```

### Quick Prompts Reference
- **[Complete Prompt Reference](https://github.com/your-repo/docs/projects-guide/prompts.md)** - All available prompts with examples
- **[Agent Prompts](AGENT_PROMPTS.md)** - AI-specific prompt reference
- **[Status Template](STATUS_TEMPLATE.md)** - Standard status report format

## Troubleshooting

### Common Issues

**Missing Context**: Ensure all sections are filled out completely
**Stale Information**: Update metadata and progress regularly
**Agent Confusion**: Provide clear handoff notes and context
**Lost Progress**: Maintain detailed progress logs

### Getting Help

1. **[Troubleshooting Guide](https://github.com/your-repo/docs/projects-guide/troubleshooting.md)** - Common issues and solutions
2. **[Visual Guide](https://github.com/your-repo/docs/projects-guide/visual-guide.md)** - System diagrams and flowcharts
3. Review example projects in `/ideas/` or `/completed/`
4. Use `project validate` to check document completeness
5. Use `guide show` to display help index

## Examples

See the example project in `/ideas/` for a complete demonstration of proper usage.

## Contributing

When adding new templates or improving the system:

1. Follow existing patterns and structure
2. Update this README with changes
3. Validate against the JSON schema
4. Test with example projects

## Version History

- **v1.0** - Initial implementation with basic templates and structure
