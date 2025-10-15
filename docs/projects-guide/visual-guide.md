# Visual Guide

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Project Management System                │
├─────────────────────────────────────────────────────────────┤
│  Human Developer  ←→  AI Coding Agents  ←→  Project Docs   │
│                                                             │
│  • Strategic Control    • Execution        • Documentation │
│  • Decision Making     • Progress Tracking • Context       │
│  • Requirements        • Status Reports    • History       │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
/docs/
├── projects/                    # Main project directory
│   ├── active/                 # Currently active projects
│   │   ├── 2025-01-15-user-auth.md
│   │   └── 2025-01-20-theme-system.md
│   ├── ideas/                  # Project concepts and proposals
│   │   ├── 2025-01-25-mobile-ui.md
│   │   └── 2025-01-30-api-optimization.md
│   ├── completed/              # Finished projects (archive)
│   │   └── 2025-01-10-login-bugfix.md
│   ├── templates/              # Project templates
│   │   ├── feature.md
│   │   ├── bugfix.md
│   │   ├── refactoring.md
│   │   └── documentation.md
│   ├── .cursorrules            # Project-specific rules
│   ├── AGENT_PROMPTS.md        # AI prompt reference
│   ├── STATUS_TEMPLATE.md      # Status report format
│   └── README.md               # Main documentation
├── projects-guide/             # User guide (decoupled)
│   ├── index.md
│   ├── getting-started.md
│   ├── agent-interaction.md
│   ├── workflows.md
│   ├── prompts.md
│   ├── troubleshooting.md
│   └── visual-guide.md
└── .cursorrules                # Root enforcement rules
```

## Project Lifecycle Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Idea   │───▶│  Plan   │───▶│ Design  │───▶│Implement│
└─────────┘    └─────────┘    └─────────┘    └─────────┘
     │              │              │              │
     ▼              ▼              ▼              ▼
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│Testing  │───▶│ Review  │───▶│Deploy   │───▶│Complete │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
     │              │              │              │
     └──────────────┼──────────────┼──────────────┘
                    ▼              ▼
               ┌─────────┐    ┌─────────┐
               │ Archive │    │ Lessons │
               └─────────┘    └─────────┘
```

## Project Document Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    Project Document                         │
├─────────────────────────────────────────────────────────────┤
│  Metadata                                                   │
│  ├── Project ID, Title, Stage, Dates                       │
│  ├── Assigned Agents, Priority, Tags                       │
│  └── Estimated Completion                                  │
├─────────────────────────────────────────────────────────────┤
│  Human Context                                             │
│  ├── Problem Statement                                     │
│  ├── Business Value                                        │
│  ├── Success Criteria                                      │
│  ├── Constraints                                           │
│  └── Stakeholders                                          │
├─────────────────────────────────────────────────────────────┤
│  AI Agent Context                                          │
│  ├── Technical Requirements                                │
│  ├── Dependencies                                          │
│  ├── Acceptance Criteria                                   │
│  ├── Implementation Guidelines                             │
│  └── File References                                       │
├─────────────────────────────────────────────────────────────┤
│  Current Stage                                             │
│  ├── Stage Description                                     │
│  ├── Tasks (with status, assignment, estimates)           │
│  └── Deliverables                                          │
├─────────────────────────────────────────────────────────────┤
│  Progress Log                                              │
│  ├── Chronological Updates                                 │
│  ├── Agent Contributions                                   │
│  └── Files Changed                                         │
├─────────────────────────────────────────────────────────────┤
│  Decisions                                                 │
│  ├── Key Architectural Decisions                           │
│  ├── Rationale and Alternatives                            │
│  └── Impact Assessment                                     │
├─────────────────────────────────────────────────────────────┤
│  Blockers                                                  │
│  ├── Current Issues                                        │
│  ├── Priority and Status                                   │
│  └── Assignment and Resolution                             │
└─────────────────────────────────────────────────────────────┘
```

## AI Agent Interaction Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Human     │    │ AI Agent    │    │  Project    │
│  Request    │───▶│  Receives   │───▶│ Document    │
└─────────────┘    └─────────────┘    └─────────────┘
                           │                   │
                           ▼                   ▼
                   ┌─────────────┐    ┌─────────────┐
                   │  Checks     │    │  Updates    │
                   │ Existing    │    │ Progress    │
                   │ Projects    │    │ Log         │
                   └─────────────┘    └─────────────┘
                           │                   │
                           ▼                   ▼
                   ┌─────────────┐    ┌─────────────┐
                   │  Suggests   │    │  Provides   │
                   │ New Project │    │ Status      │
                   │ (if needed) │    │ Report      │
                   └─────────────┘    └─────────────┘
```

## Status Report Format

```
┌─────────────────────────────────────────────────────────────┐
│                    Status Report                            │
├─────────────────────────────────────────────────────────────┤
│  • Project: [name or "New Project Suggested"]              │
│  • Stage: [current stage]                                  │
│  • Files Changed: [count] files                            │
│  • Tasks: [completed]/[total]                              │
│  • Blockers: [count] active                                │
│  • Next: [next immediate action]                           │
└─────────────────────────────────────────────────────────────┘
```

## Quick Prompt Categories

```
┌─────────────────────────────────────────────────────────────┐
│                    Quick Prompts                           │
├─────────────────────────────────────────────────────────────┤
│  Project Management                                         │
│  ├── project new      ├── project status                   │
│  ├── project continue ├── project complete                 │
│  └── project backlog  └── project active                   │
├─────────────────────────────────────────────────────────────┤
│  Documentation & Tracking                                   │
│  ├── project progress ├── project decide                   │
│  ├── project block    ├── project handoff                  │
│  └── project validate └── status report                    │
├─────────────────────────────────────────────────────────────┤
│  Information & Help                                         │
│  ├── project templates ├── guide show                      │
│  └── project templates └── guide show                      │
└─────────────────────────────────────────────────────────────┘
```

## File Naming Conventions

```
┌─────────────────────────────────────────────────────────────┐
│                Naming Conventions                          │
├─────────────────────────────────────────────────────────────┤
│  Human Documentation                                        │
│  ├── lower-case.md (getting-started.md)                    │
│  ├── lower-case.md (agent-interaction.md)                  │
│  └── lower-case.md (workflows.md)                          │
├─────────────────────────────────────────────────────────────┤
│  AI Documentation                                           │
│  ├── UPPER_CASE.md (AGENT_PROMPTS.md)                      │
│  ├── UPPER_CASE.md (STATUS_TEMPLATE.md)                    │
│  └── UPPER_CASE.md (README.md)                             │
├─────────────────────────────────────────────────────────────┤
│  Project Files                                              │
│  ├── YYYY-MM-DD-kebab-case.md                              │
│  ├── 2025-01-15-user-authentication.md                     │
│  └── 2025-01-20-theme-system-redesign.md                   │
└─────────────────────────────────────────────────────────────┘
```

## Workflow Decision Tree

```
                    Start Work Request
                           │
                           ▼
                    Existing Project?
                    ┌─────┴─────┐
                    │           │
                    ▼           ▼
              Work Within    Suggest New
              Project        Project
                    │           │
                    ▼           ▼
              Update Progress  Create Project
                    │           │
                    ▼           ▼
              Status Report  Move to Active
                    │           │
                    └─────┬─────┘
                          ▼
                    Continue Work
                          │
                          ▼
                    Work Complete?
                    ┌─────┴─────┐
                    │           │
                    ▼           ▼
              Archive Project  Continue
                    │           │
                    ▼           │
              Lessons Learned   │
                    │           │
                    └───────────┘
```

## Integration Points

```
┌─────────────────────────────────────────────────────────────┐
│                System Integration                           │
├─────────────────────────────────────────────────────────────┤
│  .cursorrules Files                                         │
│  ├── /.cursorrules (root enforcement)                      │
│  ├── /docs/projects/.cursorrules (project rules)           │
│  └── /app/.cursorrules (code integration)                  │
├─────────────────────────────────────────────────────────────┤
│  Project Documents                                          │
│  ├── Absolute file paths for code references               │
│  ├── Cross-references to existing documentation            │
│  └── Related project dependencies                          │
├─────────────────────────────────────────────────────────────┤
│  AI Agent Coordination                                      │
│  ├── Context preservation across sessions                  │
│  ├── Handoff protocols for agent transitions               │
│  └── Progress tracking and status reporting                │
└─────────────────────────────────────────────────────────────┘
```

## Quality Assurance Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Validate  │───▶│   Test      │───▶│   Review    │
│  Document   │    │ Against     │    │   Code      │
│ Structure   │    │ Acceptance  │    │ Quality     │
│             │    │ Criteria    │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Update    │    │   Document  │    │   Archive   │
│  Progress   │    │  Results    │    │  Project    │
│    Log      │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Troubleshooting Decision Tree

```
                    Issue Encountered
                           │
                           ▼
                    Check .cursorrules
                    ┌─────┴─────┐
                    │           │
                    ▼           ▼
              Files Missing  Files Present
                    │           │
                    ▼           ▼
              Create Rules   Check Project
                    │           │
                    ▼           ▼
              Restart System  Document Valid?
                    │      ┌─────┴─────┐
                    │      │           │
                    │      ▼           ▼
                    │  Valid Doc   Invalid Doc
                    │      │           │
                    │      ▼           ▼
                    │  Continue    Fix Document
                    │  Work            │
                    │      │           ▼
                    │      │      Validate Again
                    │      │           │
                    │      └─────┬─────┘
                    │            │
                    └────────────┘
```
