# Bug Fix Template

## Metadata

```yaml
projectId: bugfix-descriptive-name
title: "Descriptive Bug Fix Title"
stage: idea
createdDate: YYYY-MM-DD
lastUpdated: YYYY-MM-DD
assignedAgents: []
estimatedCompletion: YYYY-MM-DD
priority: high
tags: [bugfix, critical, regression, performance]
```

## Human Context

### Problem Statement
<!-- Clear description of the bug and its impact -->

### Business Impact
<!-- Business impact of this bug -->
- **Severity**: critical/high/medium/low
- **Affected Users**: Description of who is affected
- **Business Impact**: Financial, operational, or user experience impact

### Success Criteria
<!-- Measurable success criteria for the fix -->
- [ ] Bug is resolved and no longer occurs
- [ ] No regression in existing functionality
- [ ] Performance impact is acceptable
- [ ] User experience is restored

### Constraints
<!-- Business and technical constraints -->
- **Time Constraint**: When this must be fixed
- **Resource Constraint**: Available resources
- **Risk Constraint**: Maximum acceptable risk

### Stakeholders
<!-- Key stakeholders and their interests -->
- **Users**: Impact on user experience
- **Support Team**: Reduced support burden
- **Business**: Restored functionality

## AI Agent Context

### Technical Requirements
<!-- Technical requirements for the fix -->
- [ ] Identify root cause of the bug
- [ ] Implement fix without breaking existing functionality
- [ ] Add appropriate tests to prevent regression
- [ ] Verify fix resolves the issue

### Dependencies
<!-- Project dependencies -->
- **Investigation Tools** (type: tool)
  - Status: available
  - Description: Tools needed for debugging

### Acceptance Criteria
<!-- Technical acceptance criteria -->
- [ ] Bug reproduction steps no longer produce the issue
- [ ] All existing tests pass
- [ ] New tests cover the fix
- [ ] Code review completed

### Implementation Guidelines
<!-- Implementation guidelines and best practices -->
- Follow existing code patterns
- Maintain backward compatibility
- Add comprehensive tests
- Document the fix

### File References
<!-- Relevant codebase files -->
- **File Path**: Suspected location of bug
- **File Path**: Related test files
- **File Path**: Configuration files that might be relevant

## Current Stage

### Stage: idea
<!-- Current stage: idea/plan/design/implementation/testing/review/deployment/completion -->

### Description
<!-- Description of current stage activities -->

### Tasks
<!-- Current stage tasks -->
- **Task ID**: Task description
  - Status: pending/in-progress/completed/blocked
  - Assigned Agent: agent-name
  - Estimated Hours: X
  - Dependencies: [task-id-1, task-id-2]

### Deliverables
<!-- Expected deliverables for this stage -->
- [ ] Deliverable 1
- [ ] Deliverable 2

## Progress Log

<!-- Chronological log of project progress -->
- **YYYY-MM-DD** - **Agent Name**: Description of work completed
  - Stage: current-stage
  - Files Changed: [file1, file2]

## Decisions

<!-- Key architectural and technical decisions -->
- **YYYY-MM-DD** - **Decision**: Brief description
  - **Rationale**: Why this decision was made
  - **Impact**: What this affects
  - **Alternatives**: Other options considered
  - **Made By**: agent-name

## Blockers

<!-- Current issues and dependencies blocking progress -->
- **Blocker ID**: Description of blocker
  - Status: open/in-progress/resolved/deferred
  - Priority: low/medium/high/critical
  - Assigned To: agent-name
  - Created: YYYY-MM-DD
  - Impact: Description of impact

## Handoff Notes

<!-- Context for agent task transitions -->
- **YYYY-MM-DD** - **From**: agent-name **To**: agent-name
  - **Context**: What the receiving agent needs to know
  - **Completed Work**: [list of completed items]
  - **Next Steps**: [list of next actions]
  - **Important Notes**: [warnings, considerations, etc.]

## Enhanced Project Management (Optional)

### Tasks
<!-- Detailed task breakdown for the project -->
- **TASK-001**: Task title
  - **Description**: Detailed task description
  - **Type**: code/docs/config/test/review
  - **Status**: pending/in-progress/completed/blocked/cancelled
  - **Priority**: low/medium/high/critical
  - **Estimated Hours**: X
  - **Actual Hours**: X
  - **Assignee**: agent-name
  - **Dependencies**: [TASK-002, TASK-003]
  - **Blocks**: [TASK-004]
  - **Files**: [file1, file2]
  - **Commits**: [commit-hash-1, commit-hash-2]

### Checkpoints
<!-- Human review checkpoints and approval gates -->
- **CHECKPOINT-001**: Checkpoint name
  - **Type**: human_review/automated/milestone
  - **Description**: What this checkpoint validates
  - **Status**: pending/approved/rejected/bypassed
  - **Required**: true/false
  - **Approver**: stakeholder-name
  - **Criteria**: [criterion1, criterion2]

### Rollback Points
<!-- Rollback points for safe project recovery -->
- **ROLLBACK-001**: Rollback point name
  - **Description**: What this rollback point represents
  - **Created**: YYYY-MM-DD
  - **Commit Hash**: commit-hash
  - **Files**: [file1, file2]
  - **Actions**: [action1, action2]

### Automation
<!-- Automated workflows and rules for the project -->
- **Workflows**:
  - **Name**: workflow-name
    - **Trigger**: commit/pr/schedule/manual
    - **Conditions**: [condition1, condition2]
    - **Actions**: [action1, action2]
    - **Notifications**: [notification1, notification2]

- **Rules**:
  - **Name**: rule-name
    - **Condition**: condition description
    - **Action**: action to take
    - **Enabled**: true/false

---

## Bug-Specific Sections

### Bug Report
<!-- Original bug report details -->
- **Reported By**: User/team member
- **Reported Date**: YYYY-MM-DD
- **Bug ID**: Issue tracker ID
- **Environment**: Where the bug occurs
- **Browser/OS**: Specific environment details

### Reproduction Steps
<!-- Steps to reproduce the bug -->
1. Step 1
2. Step 2
3. Step 3
4. **Expected Result**: What should happen
5. **Actual Result**: What actually happens

### Root Cause Analysis
<!-- Analysis of the root cause -->
- **Suspected Cause**: Initial hypothesis
- **Investigation Results**: What was found
- **Root Cause**: Final determination
- **Contributing Factors**: Other factors that contributed

### Impact Assessment
<!-- Assessment of the bug's impact -->
- **User Impact**: How users are affected
- **System Impact**: System performance/stability impact
- **Data Impact**: Any data integrity issues
- **Security Impact**: Security implications

### Fix Strategy
<!-- Strategy for fixing the bug -->
- **Approach**: How the bug will be fixed
- **Risk Assessment**: Risks of the fix
- **Testing Strategy**: How the fix will be tested
- **Rollback Plan**: Plan if fix causes issues

### Regression Testing
<!-- Testing to ensure no new issues -->
- **Affected Areas**: Areas that might be impacted
- **Test Cases**: Specific tests to run
- **Automated Tests**: Tests to add/update
- **Manual Testing**: Manual verification steps

### Performance Impact
<!-- Performance considerations -->
- **Performance Baseline**: Current performance
- **Expected Impact**: Performance impact of fix
- **Monitoring**: How to monitor performance
- **Optimization**: Any optimizations needed

### Security Considerations
<!-- Security implications -->
- **Security Impact**: Security implications of bug
- **Fix Security**: Security implications of fix
- **Vulnerability**: If this is a security vulnerability
- **Disclosure**: Disclosure timeline if applicable

### Deployment Considerations
<!-- Deployment requirements -->
- **Hotfix Required**: If immediate deployment needed
- **Database Changes**: Any database changes required
- **Configuration Changes**: Configuration updates needed
- **Feature Flags**: Feature flags to control rollout

### Communication Plan
<!-- Communication about the fix -->
- **Internal Communication**: Team notifications
- **User Communication**: User notifications if needed
- **Status Updates**: Regular status updates
- **Resolution Communication**: Final resolution notice

### Lessons Learned
<!-- What was learned from this bug -->
- **Process Improvements**: Process changes to prevent similar bugs
- **Code Improvements**: Code quality improvements
- **Testing Improvements**: Testing improvements
- **Monitoring Improvements**: Monitoring improvements
