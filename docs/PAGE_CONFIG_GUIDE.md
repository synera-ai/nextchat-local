# Page-Configurable Tab System - Implementation Guide

## Overview

The Page-Configurable Tab System provides a declarative, reusable way to define page structures with tabs and sections. Instead of hardcoding tabs into each page component, you define them through configuration objects that work across different pages and contexts.

## Key Concepts

### Core Components

1. **PageConfig** - The root configuration defining an entire page
2. **TabConfig** - Configuration for a single tab within a page
3. **PageSection** - Configuration for a content section within a tab
4. **PageConfigProvider** - React context provider managing page state
5. **usePageConfig** - Hook to access page configuration and state
6. **PageContainer** - Generic component that renders pages from configuration

## Type System

### PageConfig

```typescript
interface PageConfig {
  id: string;                    // Unique identifier
  title: string;                 // Page title
  subtitle?: string;             // Optional page subtitle
  tabs: TabConfig[];            // Array of tab configurations
  layout?: "single" | "multi";  // Layout mode (default: "multi")
  headerConfig?: {              // Optional header configuration
    showClose?: boolean;
    showMinimize?: boolean;
    showMaximize?: boolean;
  };
  metadata?: Record<string, any>; // Custom metadata
}
```

### TabConfig

```typescript
interface TabConfig {
  id: string;                    // Unique identifier
  label: string;                 // Display label
  sections: PageSection[];      // Array of sections in this tab
  defaultSection?: string;       // Default section ID
  metadata?: Record<string, any>; // Custom metadata
  badge?: number | string;       // Optional badge
  disabled?: boolean;            // Whether tab is disabled
}
```

### PageSection

```typescript
interface PageSection {
  id: string;                    // Unique identifier
  label: string;                 // Display label
  component: React.ComponentType<any>; // React component to render
  props?: Record<string, any>;   // Props passed to component
  badge?: number | string;       // Optional badge
  disabled?: boolean;            // Whether section is disabled
  icon?: React.ReactNode;        // Optional icon
}
```

### PageContextValue

```typescript
interface PageContextValue {
  config: PageConfig;                    // Current configuration
  currentTab: string;                   // Currently active tab ID
  setCurrentTab: (tabId: string) => void; // Function to switch tabs
  currentSection?: string;              // Currently active section
  setCurrentSection?: (sectionId: string) => void; // Function to switch sections
}
```

## Creating Configurations

### Method 1: Using Factory Functions

Factory functions provide a cleaner, more intuitive API:

```typescript
import {
  createPageConfig,
  createTab,
  createSection,
} from "@/app/config/pages";

// Create individual sections
const generalSection = createSection(
  "general-id",
  "General Settings",
  SettingsGeneralComponent
);

// Create a tab with sections
const generalTab = createTab("general", "General", [generalSection]);

// Create full page config
const pageConfig = createPageConfig("settings", "Settings", [generalTab], {
  subtitle: "Configure your application",
  layout: "multi",
});
```

### Method 2: Direct Object Creation

You can also create configurations directly:

```typescript
const pageConfig: PageConfig = {
  id: "settings",
  title: "Settings",
  subtitle: "Configure your application",
  layout: "multi",
  tabs: [
    {
      id: "general",
      label: "General",
      sections: [
        {
          id: "general-section",
          label: "General Settings",
          component: SettingsGeneralComponent,
        },
      ],
    },
  ],
};
```

### Method 3: Convenience Function for Simple Pages

For pages with one section per tab:

```typescript
const pageConfig = createPageFromTabs("page-id", "Page Title", [
  {
    id: "tab1",
    label: "Tab 1",
    component: Tab1Component,
  },
  {
    id: "tab2",
    label: "Tab 2",
    component: Tab2Component,
  },
]);
```

## Using the Page Container

### Basic Usage

```typescript
import { PageContainer } from "@/app/components/PageContainer";
import { settingsPageConfig } from "@/app/config/pages";

export function SettingsPage() {
  return <PageContainer config={settingsPageConfig} />;
}
```

### With Event Handlers

```typescript
export function SettingsPage() {
  const handleTabChange = (tabId: string) => {
    console.log(`Switched to tab: ${tabId}`);
  };

  return (
    <PageContainer
      config={settingsPageConfig}
      defaultTab="general"
      onTabChange={handleTabChange}
    />
  );
}
```

### With Custom Styling

```typescript
export function SettingsPage() {
  return (
    <PageContainer
      config={settingsPageConfig}
      className="custom-page-class"
    />
  );
}
```

## Accessing Page Context in Components

Any component rendered within a `PageContainer` can access the page context:

```typescript
import { usePageConfig } from "@/app/hooks/usePageConfig";

function MySettingsComponent() {
  const { config, currentTab, setCurrentTab } = usePageConfig();

  return (
    <div>
      <p>Current tab: {currentTab}</p>
      <button onClick={() => setCurrentTab("chat")}>Switch to Chat Tab</button>
    </div>
  );
}
```

## Validation

Configurations are automatically validated when provided to `PageConfigProvider`. You can also validate manually:

```typescript
import { validatePageConfig, safeValidatePageConfig } from "@/app/config/pages";

// Throws errors if config is invalid
const result = validatePageConfig(config);
if (!result.valid) {
  console.error("Validation errors:", result.errors);
  console.warn("Warnings:", result.warnings);
}

// Safe validation that never throws
const safeResult = safeValidatePageConfig(config);
```

Validation checks:
- Required fields (id, title, tabs)
- No duplicate IDs across tabs and sections
- Valid layout values ("single" or "multi")
- All tabs have at least one section
- All sections have a component

## Merging Configurations

You can merge multiple configurations to combine tabs from different sources:

```typescript
import { mergePageConfigs } from "@/app/config/pages";

const baseConfig = createPageConfig("page", "Title", [tab1]);
const extendedConfig = mergePageConfigs(baseConfig, additionalConfig1, additionalConfig2);
```

## Best Practices

### 1. Organize Configurations by Feature

```typescript
// app/config/pages/settings.config.ts
export const settingsPageConfig = createPageConfig(...);

// app/config/pages/masks.config.tsx
export const masksPageConfig = createPageConfig(...);
```

### 2. Keep Components Isolated

Components used in configurations should be self-contained and not tightly coupled to page logic:

```typescript
// Good: Component receives all props it needs
function SettingsGeneral(props: { onSave?: () => void }) {
  // ...
}

// Avoid: Component depends on global state
function SettingsGeneral() {
  const { someState } = useSpecialStore(); // Too coupled
}
```

### 3. Use Descriptive IDs

Make IDs meaningful and unique:

```typescript
// Good
const generalSection = createSection("settings-general", "General", Component);

// Avoid
const section = createSection("section1", "Section", Component);
```

### 4. Document Configuration Structure

Include comments explaining the purpose of each tab and section:

```typescript
export const settingsPageConfig = createPageConfig(
  "settings",
  "Settings",
  [
    // General application settings
    createTab("general", "General", [...]),
    
    // Chat-specific configuration
    createTab("chat", "Chat", [...]),
    
    // API provider configuration
    createTab("api", "API", [...]),
  ]
);
```

### 5. Pass Configuration via Props

When creating reusable page containers, pass configuration as a prop:

```typescript
interface PageWrapperProps {
  config: PageConfig;
  title: string;
}

function PageWrapper({ config, title }: PageWrapperProps) {
  return <PageContainer config={config} />;
}
```

## Advanced Patterns

### Dynamic Sections

Conditionally include sections based on user permissions or feature flags:

```typescript
const sections = [
  createSection("basic", "Basic", BasicComponent),
  ...(isAdmin ? [createSection("admin", "Admin", AdminComponent)] : []),
];

const config = createPageConfig("page", "Title", [
  createTab("settings", "Settings", sections),
]);
```

### Multi-Section Tabs

Include multiple sections in a single tab:

```typescript
const tabConfig = createTab("advanced", "Advanced", [
  createSection("section1", "Section 1", Component1),
  createSection("section2", "Section 2", Component2),
  createSection("section3", "Section 3", Component3),
]);
```

### Configuration with Custom Props

Pass component-specific props through configuration:

```typescript
const section = createSection(
  "custom",
  "Custom",
  MyComponent,
  {
    props: {
      theme: "dark",
      onSave: handleSave,
      initialValues: { /* ... */ },
    },
  }
);
```

## File Structure

```
app/
├── config/
│   └── pages/
│       ├── types.ts              # Type definitions
│       ├── validation.ts         # Validation utilities
│       ├── factory.ts            # Factory functions
│       ├── settings.config.ts    # Settings page config
│       ├── masks.config.tsx      # Masks page config (example)
│       └── index.ts              # Exports
├── hooks/
│   └── usePageConfig.ts         # Context hook
├── providers/
│   └── PageConfigProvider.tsx   # Context provider
└── components/
    ├── PageContainer/
    │   ├── PageContainer.tsx
    │   ├── PageContainer.module.scss
    │   └── index.ts
    └── settings/
        ├── SettingsGeneral.tsx
        ├── SettingsChat.tsx
        ├── SettingsAPI.tsx
        ├── SettingsSync.tsx
        └── SettingsDanger.tsx
```

## Migration Guide

### From Hardcoded Tabs to Configuration

**Before:**
```typescript
function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  
  return (
    <div>
      <Tabs>
        <Tab onClick={() => setActiveTab("general")}>General</Tab>
        <Tab onClick={() => setActiveTab("chat")}>Chat</Tab>
      </Tabs>
      {activeTab === "general" && <SettingsGeneral />}
      {activeTab === "chat" && <SettingsChat />}
    </div>
  );
}
```

**After:**
```typescript
import { PageContainer } from "@/app/components/PageContainer";
import { settingsPageConfig } from "@/app/config/pages";

function SettingsPage() {
  return <PageContainer config={settingsPageConfig} />;
}
```

## Testing

### Testing with Configuration

```typescript
import { settingsPageConfig } from "@/app/config/pages";
import { validatePageConfig } from "@/app/config/pages";

describe("Settings Configuration", () => {
  it("should be valid", () => {
    const result = validatePageConfig(settingsPageConfig);
    expect(result.valid).toBe(true);
  });

  it("should have all required tabs", () => {
    const tabIds = settingsPageConfig.tabs.map((t) => t.id);
    expect(tabIds).toContain("general");
    expect(tabIds).toContain("chat");
    expect(tabIds).toContain("api");
  });
});
```

### Testing Components with PageContainer

```typescript
import { render, screen } from "@testing-library/react";
import { PageContainer } from "@/app/components/PageContainer";

describe("PageContainer", () => {
  it("renders tabs from configuration", () => {
    render(<PageContainer config={settingsPageConfig} />);
    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("Chat")).toBeInTheDocument();
  });
});
```

## Troubleshooting

### "usePageConfig must be used within a PageConfigProvider"

This error means the component is not within a `PageContainer`. Ensure the component is a child of `PageContainer`.

### Configuration validation failures

Check that all required fields are present and unique:
- Every `PageConfig` must have an `id`, `title`, and at least one tab
- Tab IDs must be unique within a page
- Section IDs must be unique within a tab
- All sections must have a valid `component`

### Tab content not rendering

Verify that:
1. The component is being passed correctly to `createSection`
2. The component is exported from its module
3. The component accepts any props (use `React.ComponentType<any>`)

## Additional Resources

- Source files: `./app/config/pages/`
- Hook documentation: `./app/hooks/usePageConfig.ts`
- Provider documentation: `./app/providers/PageConfigProvider.tsx`
- Example configurations: `./app/config/pages/settings.config.ts`
