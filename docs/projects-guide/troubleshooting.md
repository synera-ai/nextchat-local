# Troubleshooting

## Common Issues and Solutions

### AI Agents Not Following Project System

#### Problem
AI agents are not suggesting projects or updating project documents.

#### Symptoms
- No project suggestions for significant work
- Missing status reports after code changes
- Work happening outside project context
- No progress tracking in project documents

#### Solutions
1. **Check .cursorrules files**
   - Verify `/.cursorrules` exists and is readable
   - Check `/docs/projects/.cursorrules` is in place
   - Ensure `/app/.cursorrules` is present for code directory

2. **Validate project documents**
   ```
   project validate
   ```
   - Check that project documents follow template structure
   - Ensure all required sections are filled out
   - Verify metadata is complete and current

3. **Force project creation**
   ```
   project new
   ```
   - Manually start project for current work
   - Guide AI through project setup process

#### Prevention
- Regularly check that .cursorrules files are in place
- Validate project documents before starting work
- Use project prompts proactively

### Missing Status Reports

#### Problem
AI agents are not providing status reports after code changes.

#### Symptoms
- No status information after responses
- Missing progress tracking
- Unclear project state

#### Solutions
1. **Request manual status report**
   ```
   status report
   ```
   - Get detailed status information
   - Check current project state

2. **Check project context**
   ```
   project status
   ```
   - Verify AI is working within project context
   - Ensure project document exists

3. **Update .cursorrules**
   - Verify status report requirements are clear
   - Check that AI agents are reading rules

#### Prevention
- Use project prompts to maintain context
- Regularly check project status
- Ensure AI agents are following rules

### Context Loss Between Sessions

#### Problem
AI agents lose project context when switching between sessions or agents.

#### Symptoms
- Work starts from scratch each session
- Previous progress not recognized
- Missing handoff information
- Duplicate work or conflicting changes

#### Solutions
1. **Use project continue**
   ```
   project continue
   ```
   - Resume with full project context
   - Load previous work and progress

2. **Check handoff notes**
   - Review project document handoff section
   - Ensure context is properly documented
   - Update handoff notes if missing

3. **Validate project documents**
   ```
   project validate
   ```
   - Check that progress logs are current
   - Verify all sections are complete

#### Prevention
- Always use project handoff protocol
- Document context thoroughly
- Use project continue at start of sessions

### Incomplete Project Documents

#### Problem
Project documents are missing required sections or information.

#### Symptoms
- Validation errors when checking documents
- Missing context for AI agents
- Incomplete progress tracking
- Unclear requirements or acceptance criteria

#### Solutions
1. **Run validation**
   ```
   project validate
   ```
   - Identify missing sections
   - Get specific guidance on what to fill out

2. **Use templates**
   ```
   project templates
   ```
   - Check available templates
   - Copy template structure for new projects

3. **Fill out systematically**
   - Start with metadata section
   - Complete human context thoroughly
   - Fill out AI agent context
   - Add current stage information

#### Prevention
- Always start with appropriate template
- Fill out all sections before moving to active
- Validate documents regularly

### Project Organization Issues

#### Problem
Projects are not properly organized or difficult to find.

#### Symptoms
- Projects in wrong folders
- Inconsistent naming conventions
- Missing project files
- Difficulty finding relevant projects

#### Solutions
1. **Check project locations**
   ```
   project active
   project backlog
   ```
   - List projects in each folder
   - Identify misplaced projects

2. **Follow naming conventions**
   - Use format: `YYYY-MM-DD-descriptive-name.md`
   - Use kebab-case for project names
   - Include date for chronological ordering

3. **Organize systematically**
   - Move projects to correct folders
   - Update cross-references
   - Maintain consistent structure

#### Prevention
- Follow naming conventions strictly
- Use appropriate folders for project stage
- Regular cleanup and organization

### Blocker Management Issues

#### Problem
Blockers are not being tracked or resolved effectively.

#### Symptoms
- Work stalled without clear reasons
- Missing blocker documentation
- Unresolved dependencies
- Confusion about project status

#### Solutions
1. **Document blockers**
   ```
   project block
   ```
   - Add current blockers to project document
   - Include priority and impact information

2. **Review blocker status**
   - Check project document blockers section
   - Update status as blockers are resolved
   - Assign responsibility for resolution

3. **Plan blocker resolution**
   - Identify dependencies and constraints
   - Create action plans for resolution
   - Track progress on blocker resolution

#### Prevention
- Document blockers immediately when encountered
- Regular blocker review and updates
- Clear assignment of blocker resolution

### Decision Documentation Problems

#### Problem
Key decisions are not being documented or are lost.

#### Symptoms
- Repeated discussions of same decisions
- Missing rationale for choices
- Confusion about why decisions were made
- Inconsistent implementation

#### Solutions
1. **Document decisions**
   ```
   project decide
   ```
   - Record decision with rationale
   - Include alternatives considered
   - Note impact and decision maker

2. **Review decision history**
   - Check project document decisions section
   - Understand previous choices
   - Maintain decision consistency

3. **Update decisions**
   - Modify decisions when circumstances change
   - Document decision changes
   - Communicate updates to team

#### Prevention
- Document decisions immediately when made
- Include rationale and alternatives
- Regular review of decision history

## Getting Help

### System Resources
- **Guide index**: `guide show`
- **Project templates**: `project templates`
- **Status information**: `project status`
- **Validation**: `project validate`

### Manual Checks
- Verify .cursorrules files exist and are readable
- Check project document structure and completeness
- Ensure proper folder organization
- Validate naming conventions

### Escalation
- Review project document troubleshooting section
- Check guide documentation for specific issues
- Use project prompts to get system help
- Document issues for future reference

## Prevention Strategies

### Regular Maintenance
- Weekly project status reviews
- Monthly document validation
- Quarterly system cleanup
- Annual process review

### Best Practices
- Always use project prompts
- Maintain complete documentation
- Follow naming conventions
- Keep .cursorrules files current

### Quality Assurance
- Validate projects before starting work
- Check status reports regularly
- Review handoff notes for completeness
- Monitor system compliance
