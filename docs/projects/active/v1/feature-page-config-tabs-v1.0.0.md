# Page-Configurable Tab System v1.0.0

## Metadata

```yaml
projectId: feature-page-config-tabs
title: "Page-Configurable Tab System - Reusable Tab Architecture"
type: feature
stage: plan
version: v1.0.0
createdDate: 2025-10-16
lastUpdated: 2025-10-16
assignedAgents: []
estimatedCompletion: 2025-10-17
priority: HIGH
tags: [architecture, tabs, configuration, reusable, page-system]
relatedProjects:
  - feature-tabbed-settings-page-v1.0.0.md
  - feature-browser-takeover-test-v1.0.0.md
```

## Project Overview

Decouple tab functionality from specific content by creating a page configuration system. Instead of hardcoding tabs into each page component, define tabs through configuration objects that can be used across different pages and contexts. This creates a reusable, scalable architecture.

## Project Type
**feature** - Architecture and system design

## Version
**v1.0.0** - Initial page configuration system

## Priority
**HIGH** - Foundation for scalable, reusable page architecture

## Project Goals

- Decouple tab component from page content
- Create page configuration schema
- Enable tabs to be defined declaratively
- Make tabs reusable across multiple pages
- Simplify page component implementations
- Create examples for Settings, Prompts, and other pages
- Document configuration system thoroughly

## Success Criteria

- [x] Page configuration schema defined
- [ ] PageConfig type system created
- [ ] Tab configuration utilities built
- [ ] Settings page refactored to use config system
- [ ] Second page (Prompts/Masks) refactored using config
- [ ] Configuration system documented
- [ ] Examples and patterns documented
- [ ] Type safety verified

## Dependencies

- **Tabbed Settings Page** (type: project)
  - Status: completed
  - Description: Existing tabs implementation to refactor
  - Reference: `./feature-tabbed-settings-page-v1.0.0.md`

- **React** (type: library)
  - Status: installed
  - Version: 18.x

- **TypeScript** (type: library)
  - Status: installed
  - Version: 5.x

## Project Phases

### Phase 1: Design & Architecture (2-3 hours)

Design the configuration schema and type system.

**Deliverables:**
- [ ] PageConfig type definition
- [ ] TabConfig type definition
- [ ] PageSection type definition
- [ ] Configuration schema documentation
- [ ] Architecture diagrams

### Phase 2: Core System Implementation (3-4 hours)

Build the page configuration framework and utilities.

**Deliverables:**
- [ ] `usePageConfig` hook
- [ ] `PageConfigProvider` context
- [ ] Configuration validation utilities
- [ ] Page factory functions
- [ ] Type system complete

### Phase 3: Settings Page Refactoring (2-3 hours)

Refactor existing Settings page to use configuration system.

**Deliverables:**
- [ ] Settings configuration object created
- [ ] Settings page component refactored
- [ ] All functionality preserved
- [ ] Tests passing

### Phase 4: Additional Page Example (1-2 hours)

Demonstrate reusability with a second page.

**Deliverables:**
- [ ] Second page refactored (Prompts or Masks)
- [ ] Configuration example
- [ ] Pattern documentation

### Phase 5: Documentation (1-2 hours)

Create comprehensive documentation.

**Deliverables:**
- [ ] Configuration schema guide
- [ ] Implementation guide
- [ ] Best practices documentation
- [ ] Migration guide from old pattern

### Phase 6: Testing & Validation (1-2 hours)

Verify the system works correctly.

**Deliverables:**
- [ ] Unit tests for utilities
- [ ] Integration tests for pages
- [ ] Type safety validation
- [ ] Performance verified

## Architecture Overview

### Current Problem (Before)
```
Page Component (e.g., settings.tsx)
  ├─ Hardcoded Tabs component
  ├─ Hardcoded tab definitions
  ├─ Hardcoded content components
  ├─ State management mixed in
  └─ Not reusable for other pages
```

### Proposed Solution (After)
```
Page Configuration Object
  ├─ Tab definitions (declarative)
  ├─ Section mappings
  └─ Metadata

Generic Page Component
  ├─ usePageConfig() hook
  ├─ Reads configuration
  ├─ Renders tabs from config
  └─ Handles state generically

Content Components
  ├─ SettingsGeneral (isolated)
  ├─ SettingsChat (isolated)
  └─ PromptsSearch (isolated)
```

## Type System Design

```typescript
// Page section definition
interface PageSection {
  id: string;
  label: string;
  icon?: React.ReactNode;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  badge?: number | string;
  disabled?: boolean;
}

// Tab configuration
interface TabConfig {
  id: string;
  label: string;
  sections: PageSection[];
  defaultSection?: string;
  metadata?: Record<string, any>;
}

// Full page configuration
interface PageConfig {
  id: string;
  title: string;
  subtitle?: string;
  tabs: TabConfig[];
  layout?: "single" | "multi";
  headerConfig?: {
    showClose?: boolean;
    showMinimize?: boolean;
    showMaximize?: boolean;
  };
}

// Page context
interface PageContextValue {
  config: PageConfig;
  currentTab: string;
  setCurrentTab: (tabId: string) => void;
}
```

## File Structure

```
./app/
├── config/
│   └── pages/
│       ├── settings.config.ts        (Settings page config)
│       ├── prompts.config.ts         (Prompts page config)
│       └── index.ts                  (Config exports)
├── hooks/
│   └── usePageConfig.ts              (Page config hook)
├── providers/
│   └── PageConfigProvider.tsx        (Config context provider)
├── components/
│   ├── PageContainer/
│   │   ├── PageContainer.tsx         (Generic page component)
│   │   └── PageContainer.module.scss
│   ├── settings/
│   │   ├── SettingsGeneral.tsx
│   │   └── ...existing components
│   └── prompts/
│       ├── PromptsSearch.tsx         (Example content)
│       └── ...
└── pages/
    ├── settings.tsx                  (Refactored using config)
    └── prompts.tsx                   (Example using config)
```

## Key Benefits

✅ **Reusability**: Define tabs once, use across pages
✅ **Maintainability**: Configuration separate from logic
✅ **Scalability**: Add new pages with minimal code
✅ **Type Safety**: Full TypeScript support
✅ **Flexibility**: Works with any content
✅ **Testing**: Configuration can be mocked easily
✅ **Documentation**: Configuration IS documentation

## Example Configuration

```typescript
// settings.config.ts
export const settingsPageConfig: PageConfig = {
  id: "settings",
  title: "Settings",
  subtitle: "All Settings",
  tabs: [
    {
      id: "general",
      label: "General",
      sections: [{
        id: "general",
        label: "General",
        component: SettingsGeneral,
        props: { /* config props */ }
      }]
    },
    {
      id: "chat",
      label: "Chat",
      sections: [{
        id: "chat",
        label: "Chat",
        component: SettingsChat,
        props: { /* config props */ }
      }]
    },
    // ... more tabs
  ]
};
```

## Implementation Strategy

1. **Define types and interfaces** - Create type system
2. **Build context and hooks** - State management
3. **Create PageContainer** - Generic page component
4. **Refactor Settings** - First page using config
5. **Add example page** - Demonstrate reusability
6. **Test everything** - Validate functionality
7. **Document** - Complete documentation

## Current Status

### Stage: plan

### Description
Planning page-configurable tab system to decouple tabs from content and create reusable architecture.

### Next Steps
1. Define type system and configuration schema
2. Create hooks and context providers
3. Build generic PageContainer component
4. Refactor Settings page as first example
5. Document patterns and best practices

## Issues Found

None at planning stage.

## Progress Log

- **2025-10-16** - **AI Agent**: Created page-config-tabs project plan
  - Stage: plan
  - Designed architecture for decoupled tab system
  - Defined type system
  - Created implementation strategy
  - Time Spent: 0.5 hours

## Decisions

- **DECISION-001**: Configuration-Based Architecture
  - **Rationale**: Separates concerns, enables reusability across pages
  - **Impact**: More code structure but greater flexibility
  - **Alternatives**: Continue hardcoding tabs per page
  - **Made By**: Project Planning

- **DECISION-002**: TypeScript-First Design
  - **Rationale**: Type safety ensures correct configuration
  - **Impact**: Better developer experience and fewer runtime errors
  - **Alternatives**: Runtime validation only
  - **Made By**: Project Planning

## Blockers

None identified at planning stage.

---

**Status**: Planning Complete - Ready to Begin Implementation  
**Last Updated**: 2025-10-16  
**Next Phase**: Phase 1 - Design & Architecture
