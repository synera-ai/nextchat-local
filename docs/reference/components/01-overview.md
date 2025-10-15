---
title: "Component Library Overview"
description: "NextChat component library with organized component categories and usage"
audience: ["developers", "ai-agents"]
difficulty: "beginner"
estimated-read-time: 5
last-updated: 2025-10-15
version: 1.0.0
---

# Component Library Overview

## Component Organization

NextChat components are organized into three categories:

### 1. Primitive Components
Basic building blocks for constructing UIs.

- **Button** - Clickable button with variants
- **Input** - Text, number, password inputs
- **Select** - Dropdown selection
- **Checkbox** - Boolean checkbox
- **Radio** - Radio button group
- **Switch** - Toggle switch
- **Textarea** - Multi-line text input
- **Badge** - Label badges
- **Avatar** - User avatar display
- **Icon** - SVG icon component

### 2. Composite Components
More complex components built from primitives.

- **Card** - Container with styling
- **Modal** - Modal dialog
- **Dropdown** - Dropdown menu
- **Tooltip** - Hover tooltip
- **Popover** - Popup container
- **Alert** - Alert message
- **Progress** - Progress bar
- **Tabs** - Tabbed interface
- **Accordion** - Expandable sections
- **Breadcrumb** - Navigation breadcrumbs

### 3. Specialized Components
Domain-specific components for NextChat features.

- **ChatMessage** - Chat message display
- **AgentStatus** - AI agent status indicator
- **PluginCard** - Plugin display card
- **ModelSelector** - Model selection dropdown
- **ToolExecutor** - Tool execution display
- **ResourceViewer** - Resource viewer

## Component Structure

Each component includes:
- **Props** - Component properties/configuration
- **Events** - Emitted events/callbacks
- **Slots** - Content placeholders
- **Examples** - Usage examples
- **Accessibility** - A11y features
- **Styling** - Theming support

## Quick Links

### By Category
- [Primitives](./primitives/)
- [Composite](./composite/)
- [Specialized](./specialized/)

### Popular Components
- [Button](./primitives/Button.md)
- [Card](./composite/Card.md)
- [Modal](./composite/Modal.md)
- [Input](./primitives/Input.md)

## Usage Pattern

All components follow the same usage pattern:

```tsx
import { Button } from '@nextchat/components';

export function MyComponent() {
  return (
    <Button 
      variant="primary" 
      onClick={() => console.log('Clicked')}
    >
      Click me
    </Button>
  );
}
```

## Theming

All components support:
- **Dark Mode** - Automatic dark theme
- **Light Mode** - Automatic light theme
- **Custom Colors** - Via CSS variables
- **Custom Fonts** - Typography system

## Accessibility

All components include:
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Focus indicators
- ✅ Color contrast compliance

## Performance

Components are optimized for:
- Fast rendering
- Minimal re-renders
- Code splitting
- Tree shaking
- Bundle optimization

## Getting Started

1. **Explore** - Browse components by category
2. **Read Props** - Understand component properties
3. **View Examples** - See usage examples
4. **Copy Code** - Use in your project
5. **Customize** - Apply theming

---

**See Also**: [Primitives](./primitives/) | [Composite](./composite/) | [Specialized](./specialized/)

