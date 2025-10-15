# Enhanced Agent Rules for Projects System

## Overview
Enhanced rules for AI agents working with the projects system that includes nickname generation and project decomposition capabilities.

## Core Principles

### 1. Project-First Development (Unchanged)
- Every code change must be associated with a project
- All work must be tracked through the project management system
- No standalone changes without project context

### 2. Nickname Integration
- Always reference projects by their nickname in conversations
- Use nicknames in status reports and commit messages
- Generate nicknames for new projects automatically
- Handle nickname change requests from users

### 3. Decomposition Awareness
- Identify when projects can be decomposed for parallel work
- Create sub-projects when decomposition is beneficial
- Manage dependencies between sub-projects
- Enable "whomever picks it up first" parallel development

## Nickname System Rules

### Automatic Nickname Generation
**Rule**: Every new project MUST have a nickname generated automatically.

**Process**:
1. **Extract Project Context**: Analyze project type, title, and key terms
2. **Generate Nickname**: Use nickname generation algorithm
3. **Validate Uniqueness**: Ensure global and phonetic uniqueness
4. **Store Nickname**: Add to project metadata and global registry
5. **Reference Nickname**: Use nickname in all project references

**Example**:
```
Project: feature-user-authentication-v1.0.0
Generated Nickname: "Guardian-Gate"
Usage: "Working on Guardian-Gate (user authentication feature)"
```

### Nickname Reference Rules
**Rule**: Always use nicknames when referencing projects in conversations.

**Format**:
- **In Status Reports**: "Project: Guardian-Gate [v1.0.0]"
- **In Commit Messages**: "feat(Guardian-Gate): implement JWT authentication [v1.0.0]"
- **In Conversations**: "The Guardian-Gate project is progressing well"
- **In Handoffs**: "Handing off Guardian-Gate to next agent"

### User Nickname Change Requests
**Rule**: Handle user nickname change requests with confirmation.

**Process**:
1. **Recognize Request**: Identify nickname change prompts
2. **Validate Request**: Check uniqueness and format
3. **Confirm Change**: Ask user to confirm the change
4. **Update System**: Update project and registry if confirmed
5. **Notify Change**: Inform user of successful change

**Example Prompts**:
- "Call it Swift-Fox"
- "Rename to Bright-Star"
- "I prefer Quick-Fix"
- "Change nickname to Wise-Owl"

**Response Format**:
```
I'll change the nickname from "Guardian-Gate" to "Swift-Fox". 
This nickname is unique and available. Confirm this change?
```

## Project Decomposition Rules

### Decomposition Detection
**Rule**: Analyze projects for decomposition opportunities when they meet size criteria.

**Size Criteria**:
- **Task Count**: 10+ tasks in current stage
- **Estimated Hours**: 40+ hours of work
- **File Count**: 15+ files to be modified
- **Complexity**: High complexity based on multiple factors

**Decomposition Patterns**:
1. **Domain Separation**: Frontend/Backend, UI/API
2. **Feature/Infrastructure**: Core feature vs supporting infrastructure
3. **Implementation/Testing**: Development vs testing work
4. **Core/Integration**: Core functionality vs integrations

### Decomposition Process
**Rule**: When decomposition is identified, create sub-projects with clear dependencies.

**Process**:
1. **Analyze Project**: Identify independent work streams
2. **Create Sub-Projects**: Generate sub-project documents
3. **Define Dependencies**: Establish clear dependency relationships
4. **Generate Nicknames**: Create unique nicknames for each sub-project
5. **Make Available**: Make sub-projects available for agent pickup

**Example**:
```
Parent Project: feature-user-auth-v1.0.0 (Guardian-Gate)
Sub-Projects:
- feature-user-auth-frontend-v1.0.0 (Swift-Interface)
- feature-user-auth-backend-v1.0.0 (Secure-Vault)
- feature-user-auth-testing-v1.0.0 (Quality-Guard)
```

### Parallel Work Management
**Rule**: Enable "whomever picks it up first" parallel development model.

**Process**:
1. **List Available Projects**: Show available sub-projects
2. **Agent Selection**: First available agent picks up project
3. **Context Handoff**: Provide clear context and dependencies
4. **Progress Updates**: Regular updates to parent project
5. **Integration Coordination**: Coordinate with other sub-projects

**Handoff Format**:
```
Available Sub-Projects:
- Swift-Interface (frontend components) - Independent
- Secure-Vault (backend API) - Independent  
- Quality-Guard (testing) - Depends on Swift-Interface and Secure-Vault

Pick up Swift-Interface for parallel frontend development.
```

## Enhanced Status Reporting

### Status Report Format
**Rule**: Include nickname and decomposition information in all status reports.

**Format**:
```
**Status Report**
- Project: Guardian-Gate [v1.0.0] (Guardian-Gate)
- Stage: implementation
- Phase: frontend-development
- Files Changed: 8 files
- Tasks: 12/15 completed
- Blockers: 1 active
- Commits: 3 this phase
- Next: Complete authentication flow
- Version: v1.0.0
- Decomposition: 2 sub-projects active (Swift-Interface, Secure-Vault)
```

### Sub-Project Status
**Rule**: Include sub-project status in parent project reports.

**Format**:
```
**Sub-Project Status**
- Swift-Interface: 8/10 tasks completed, in-progress
- Secure-Vault: 5/8 tasks completed, in-progress
- Quality-Guard: 0/6 tasks completed, pending (depends on others)
```

## Commit Integration Rules

### Commit Message Format
**Rule**: Include nickname in commit messages for better tracking.

**Format**:
```
{type}({nickname}): {description} [v{major}.{minor}.{patch}]

Examples:
feat(Guardian-Gate): implement JWT authentication [v1.0.0]
refactor(Swift-Interface): optimize component rendering [v1.0.0]
fix(Secure-Vault): resolve password validation issue [v1.0.1]
```

### Sub-Project Commits
**Rule**: Reference parent project in sub-project commits.

**Format**:
```
feat(Swift-Interface): add login form component [v1.0.0]
Parent: Guardian-Gate
Dependencies: None
Integration: API endpoints
```

## Quick Commands (Enhanced)

### Nickname Commands
- `nickname generate` - Generate nickname for current project
- `nickname change [new-nickname]` - Request nickname change
- `nickname list` - List all project nicknames
- `nickname validate [nickname]` - Check nickname uniqueness

### Decomposition Commands
- `decompose analyze` - Analyze current project for decomposition
- `decompose create` - Create sub-projects from current project
- `decompose status` - Show sub-project status
- `decompose integrate` - Integrate completed sub-projects

### Enhanced Project Commands
- `project new [type] [name]` - Create new project with auto-generated nickname
- `project status [nickname]` - Show project status by nickname
- `project continue [nickname]` - Resume project by nickname
- `project complete [nickname]` - Mark project complete by nickname

## Quality Assurance Rules

### Nickname Quality
**Rule**: Ensure all nicknames meet quality criteria.

**Criteria**:
- **Uniqueness**: Globally and phonetically unique
- **Relevance**: Relates to project purpose
- **Memorability**: Easy to remember and recall
- **Brevity**: Short and concise (2-3 syllables)
- **Fun Factor**: Engaging and enjoyable

### Decomposition Quality
**Rule**: Ensure decomposed projects maintain quality standards.

**Criteria**:
- **Clear Boundaries**: Each sub-project has well-defined scope
- **Minimal Dependencies**: Sub-projects have minimal interdependencies
- **Parallel Potential**: Sub-projects can work independently
- **Integration Clarity**: Clear integration points and processes
- **Progress Visibility**: Clear progress tracking across all streams

## Error Handling Rules

### Nickname Conflicts
**Rule**: Handle nickname conflicts gracefully.

**Process**:
1. **Detect Conflict**: Identify nickname uniqueness violation
2. **Generate Alternative**: Create alternative nickname
3. **Notify User**: Inform user of conflict and alternative
4. **Update Registry**: Update global nickname registry

### Decomposition Issues
**Rule**: Handle decomposition problems effectively.

**Process**:
1. **Identify Issue**: Detect decomposition or integration problems
2. **Assess Impact**: Determine impact on project progress
3. **Propose Solution**: Suggest resolution approach
4. **Implement Fix**: Apply solution and update project status

## Migration Rules

### Existing Projects
**Rule**: Migrate existing projects to enhanced system.

**Process**:
1. **Generate Nicknames**: Create nicknames for all existing projects
2. **Validate Uniqueness**: Ensure all nicknames are unique
3. **Update References**: Update all project references to use nicknames
4. **Preserve History**: Maintain all existing project history and progress

### Backward Compatibility
**Rule**: Maintain backward compatibility with existing system.

**Requirements**:
- All existing functionality preserved
- Existing projects continue to work
- Gradual migration to enhanced features
- Fallback options available

## Best Practices

### Nickname Best Practices
- **Consistency**: Use nicknames consistently across all references
- **Context**: Include project context when using nicknames
- **Updates**: Update nickname references when nicknames change
- **Registry**: Maintain accurate global nickname registry

### Decomposition Best Practices
- **Analysis**: Thoroughly analyze projects before decomposing
- **Dependencies**: Clearly define and track dependencies
- **Communication**: Maintain clear communication between sub-projects
- **Integration**: Plan integration points carefully
- **Progress**: Track progress across all sub-projects

### Agent Coordination Best Practices
- **Handoffs**: Provide clear handoff documentation
- **Context**: Maintain project context across agent transitions
- **Updates**: Regular progress updates to parent projects
- **Coordination**: Coordinate with other agents working on related projects

## Automation Integration

### Automated Nickname Generation
- **Trigger**: New project creation
- **Action**: Generate and validate nickname
- **Update**: Store nickname in project metadata
- **Registry**: Update global nickname registry

### Automated Decomposition Detection
- **Trigger**: Project size/complexity threshold reached
- **Action**: Analyze project for decomposition opportunities
- **Suggestion**: Propose decomposition if beneficial
- **Creation**: Create sub-projects if approved

### Automated Progress Tracking
- **Trigger**: Sub-project progress updates
- **Action**: Aggregate progress to parent project
- **Notification**: Notify relevant agents of progress
- **Integration**: Coordinate integration when dependencies complete

## Success Metrics

### Nickname System Metrics
- **Generation Rate**: 100% of projects have nicknames
- **Uniqueness Rate**: 100% of nicknames are unique
- **User Satisfaction**: 80%+ users keep auto-generated nicknames
- **Reference Usage**: 90%+ of project references use nicknames

### Decomposition System Metrics
- **Detection Rate**: 95%+ of decomposable projects identified
- **Parallel Efficiency**: 30%+ time savings through parallel work
- **Integration Success**: 90%+ successful sub-project integrations
- **Agent Utilization**: Increased agent productivity through parallel work

## Support and Documentation

### Additional Resources
- **Nickname Generation**: `/plans/nickname-generation-system.md`
- **Decomposition System**: `/plans/project-decomposition-system.md`
- **Schema Updates**: `/.project-schema.json`
- **Migration Guide**: `/MIGRATION_LOG.md`

### Getting Help
- Review enhanced agent rules for guidance
- Check nickname generation system for nickname help
- Use decomposition system for parallel work guidance
- Refer to schema documentation for field definitions
