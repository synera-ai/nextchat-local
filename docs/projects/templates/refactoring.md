# Code Refactoring Template

## Metadata

```yaml
projectId: refactoring-descriptive-name
title: "Descriptive Refactoring Title"
stage: idea
createdDate: YYYY-MM-DD
lastUpdated: YYYY-MM-DD
assignedAgents: []
estimatedCompletion: YYYY-MM-DD
priority: medium
tags: [refactoring, code-quality, technical-debt, performance]
```

## Human Context

### Problem Statement
<!-- Clear description of the technical debt or code quality issues -->

### Business Value
<!-- Business value of the refactoring -->
- **Maintainability**: Easier to maintain and extend
- **Performance**: Improved performance
- **Developer Experience**: Better developer productivity
- **Risk Reduction**: Reduced risk of bugs

### Success Criteria
<!-- Measurable success criteria -->
- [ ] Code quality metrics improved
- [ ] No regression in functionality
- [ ] Performance maintained or improved
- [ ] Developer feedback positive

### Constraints
<!-- Business and technical constraints -->
- **Time Constraint**: Available time for refactoring
- **Risk Constraint**: Maximum acceptable risk
- **Resource Constraint**: Available resources

### Stakeholders
<!-- Key stakeholders and their interests -->
- **Development Team**: Improved code quality
- **Product Team**: Maintained functionality
- **Users**: Maintained or improved experience

## AI Agent Context

### Technical Requirements
<!-- Technical requirements for the refactoring -->
- [ ] Identify areas for improvement
- [ ] Plan refactoring approach
- [ ] Implement changes incrementally
- [ ] Maintain test coverage
- [ ] Ensure no functional regression

### Dependencies
<!-- Project dependencies -->
- **Code Analysis Tools** (type: tool)
  - Status: available
  - Description: Tools for analyzing code quality

### Acceptance Criteria
<!-- Technical acceptance criteria -->
- [ ] All existing tests pass
- [ ] Code quality metrics improved
- [ ] No performance regression
- [ ] Code review completed

### Implementation Guidelines
<!-- Implementation guidelines and best practices -->
- Follow incremental refactoring approach
- Maintain backward compatibility
- Preserve existing functionality
- Add tests for new patterns

### File References
<!-- Relevant codebase files -->
- **File Path**: Files to be refactored
- **File Path**: Related test files
- **File Path**: Configuration files

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

## Refactoring-Specific Sections

### Current State Analysis
<!-- Analysis of current code state -->
- **Code Quality Issues**: Specific problems identified
- **Performance Issues**: Performance bottlenecks
- **Maintainability Issues**: Areas difficult to maintain
- **Technical Debt**: Accumulated technical debt

### Refactoring Goals
<!-- Specific goals for the refactoring -->
- **Primary Goal**: Main objective
- **Secondary Goals**: Additional objectives
- **Quality Metrics**: Metrics to improve
- **Performance Targets**: Performance goals

### Refactoring Strategy
<!-- Strategy for the refactoring -->
- **Approach**: Incremental vs. big-bang
- **Risk Mitigation**: How to minimize risk
- **Testing Strategy**: How to ensure no regression
- **Rollback Plan**: Plan if issues arise

### Code Quality Metrics
<!-- Metrics to track improvement -->
- **Before Metrics**: Current state
  - Cyclomatic complexity
  - Code duplication
  - Test coverage
  - Code smells
- **Target Metrics**: Desired state
- **Measurement Tools**: Tools for measurement

### Architecture Changes
<!-- Architectural changes planned -->
- **Current Architecture**: Description of current state
- **Target Architecture**: Desired state
- **Migration Strategy**: How to get from current to target
- **Breaking Changes**: Any breaking changes

### Performance Considerations
<!-- Performance impact and optimization -->
- **Current Performance**: Baseline performance
- **Expected Impact**: Performance impact of refactoring
- **Optimization Opportunities**: Performance improvements
- **Monitoring**: How to monitor performance

### Testing Strategy
<!-- Testing approach for refactoring -->
- **Regression Testing**: Ensuring no functional regression
- **Performance Testing**: Performance validation
- **Integration Testing**: Integration validation
- **Code Coverage**: Maintaining test coverage

### Incremental Approach
<!-- Incremental refactoring plan -->
- **Phase 1**: First phase of refactoring
- **Phase 2**: Second phase
- **Phase 3**: Third phase
- **Validation Points**: Points to validate progress

### Risk Assessment
<!-- Risk analysis and mitigation -->
- **High Risk Areas**: Areas with high refactoring risk
- **Mitigation Strategies**: How to mitigate risks
- **Rollback Triggers**: When to rollback
- **Contingency Plans**: Backup plans

### Code Review Process
<!-- Code review approach -->
- **Review Criteria**: What to review
- **Review Process**: How reviews will be conducted
- **Reviewers**: Who will review
- **Review Timeline**: When reviews will happen

### Documentation Updates
<!-- Documentation that needs updating -->
- **API Documentation**: API docs to update
- **Architecture Documentation**: Architecture docs
- **Developer Documentation**: Developer guides
- **User Documentation**: User-facing docs

### Deployment Strategy
<!-- Deployment approach -->
- **Deployment Method**: How to deploy changes
- **Feature Flags**: Feature flags for gradual rollout
- **Monitoring**: Monitoring during deployment
- **Rollback Plan**: Plan for rollback if needed

### Success Metrics
<!-- How to measure success -->
- **Code Quality Metrics**: Quality improvements
- **Performance Metrics**: Performance improvements
- **Developer Metrics**: Developer productivity
- **User Metrics**: User experience metrics

### Lessons Learned
<!-- What was learned from the refactoring -->
- **Process Improvements**: Process changes
- **Tool Improvements**: Tool recommendations
- **Best Practices**: Best practices identified
- **Future Refactoring**: Recommendations for future work
