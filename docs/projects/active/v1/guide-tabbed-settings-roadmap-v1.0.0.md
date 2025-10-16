# Tabbed Settings Implementation Roadmap v1.0.0

**Related Documents**: 
- Main Project: `./feature-tabbed-settings-page-v1.0.0.md`
- Quick Summary: `./guide-tabbed-settings-summary-v1.0.0.md`

**Version**: 1.0.0  
**Last Updated**: 2025-10-16  
**Target**: NextChat Settings Page  
**Phases**: 6 (Component Dev → Documentation)

---

## Quick Start

### Phase 2: Component Development (Next Phase)

#### Step 1: Create Tab Component Structure
**File**: `./app/components/ui/base/Tabs.tsx`

```typescript
import React, { useState, useCallback } from 'react';
import styles from './Tabs.module.scss';
import clsx from 'clsx';

// Type definitions
export interface TabDefinition {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  badge?: number | string;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabDefinition[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'underline' | 'pill' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  variant = 'underline',
  size = 'md',
  disabled = false,
  className,
  ariaLabel = 'Tabs',
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabClick = useCallback(
    (tabId: string) => {
      if (!disabled) {
        setActiveTab(tabId);
        onChange?.(tabId);
      }
    },
    [disabled, onChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let newIndex: number | null = null;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        newIndex = (index + 1) % tabs.length;
        e.preventDefault();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        newIndex = (index - 1 + tabs.length) % tabs.length;
        e.preventDefault();
        break;
      case 'Home':
        newIndex = 0;
        e.preventDefault();
        break;
      case 'End':
        newIndex = tabs.length - 1;
        e.preventDefault();
        break;
      default:
        return;
    }

    if (newIndex !== null) {
      const newTabId = tabs[newIndex].id;
      setActiveTab(newTabId);
      onChange?.(newTabId);
    }
  };

  return (
    <div
      className={clsx(
        styles.tabs,
        styles[`variant-${variant}`],
        styles[`size-${size}`],
        className,
      )}
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          className={clsx(styles.tab, {
            [styles.active]: activeTab === tab.id,
            [styles.disabled]: tab.disabled || disabled,
          })}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          onClick={() => handleTabClick(tab.id)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          disabled={tab.disabled || disabled}
        >
          {tab.icon && <span className={styles['tab-icon']}>{tab.icon}</span>}
          <span className={styles['tab-label']}>{tab.label}</span>
          {tab.badge && <span className={styles['tab-badge']}>{tab.badge}</span>}
        </button>
      ))}

      <div className={styles['tab-panels']}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`panel-${tab.id}`}
            className={clsx(styles['tab-panel'], {
              [styles.active]: activeTab === tab.id,
            })}
            role="tabpanel"
            aria-labelledby={`tab-${tab.id}`}
            hidden={activeTab !== tab.id}
          >
            {activeTab === tab.id && tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
```

#### Step 2: Create Tab Styles
**File**: `./app/components/ui/base/Tabs.module.scss`

```scss
// Design tokens reference
// Colors: --primary-color, --text-color, --text-color-secondary, --border-color, --hover-color
// Spacing: --spacing-sm, --spacing-md, --spacing-lg
// Typography: --font-size-sm, --font-weight-medium
// Transitions: --transition-duration-normal

.tabs {
  display: flex;
  flex-direction: column;
  width: 100%;
}

// Tab List (container for tab buttons)
.tab-list {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  overflow-x: auto;
  overflow-y: hidden;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 2px;
  }
}

// Tab Buttons
.tab {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 12px 24px;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--text-color-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  border-bottom: 2px solid transparent;
  transition: all var(--transition-duration-normal) ease-in-out;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover:not(.disabled) {
    color: var(--text-color);
    background-color: var(--hover-color);
  }

  &.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
    background-color: var(--hover-color);
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      background-color: transparent;
      color: var(--text-color-secondary);
    }
  }

  // Focus indicator for accessibility
  &:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: -2px;
  }
}

// Tab Icon
.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;

  svg {
    width: 100%;
    height: 100%;
  }
}

// Tab Label
.tab-label {
  // Text is already sized by parent
}

// Tab Badge
.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 6px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 10px;
  font-size: 11px;
  font-weight: bold;
  min-width: 20px;
  height: 20px;
  flex-shrink: 0;
}

// Tab Panels
.tab-panels {
  padding: var(--spacing-md);
  background-color: var(--bg-color);
}

.tab-panel {
  display: none;

  &.active {
    display: block;
    animation: fadeIn 0.2s ease-in-out;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

// Variant: Underline (default, horizontal tabs with bottom border indicator)
.variant-underline {
  .tab {
    // Already styled in .tab base styles
  }
}

// Variant: Pill (rounded tabs with background highlight)
.variant-pill {
  .tab {
    border-radius: 20px;
    border-bottom: none;
    background-color: var(--bg-color-secondary);
    gap: var(--spacing-sm);
    padding: 8px 16px;

    &:hover:not(.disabled) {
      background-color: var(--hover-color);
    }

    &.active {
      background-color: var(--primary-color);
      color: white;
    }
  }
}

// Variant: Vertical (sidebar tabs)
.variant-vertical {
  flex-direction: row;

  .tab-list {
    flex-direction: column;
    border-right: 1px solid var(--border-color);
    border-bottom: none;
    width: 200px;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .tab {
    border-bottom: none;
    border-right: 2px solid transparent;
    justify-content: flex-start;

    &.active {
      border-right-color: var(--primary-color);
      border-bottom: none;
    }
  }

  .tab-panels {
    flex: 1;
  }
}

// Size variants
.size-sm {
  .tab {
    padding: 8px 16px;
    font-size: 12px;
  }
}

.size-md {
  // Default
}

.size-lg {
  .tab {
    padding: 16px 32px;
    font-size: 16px;
  }
}

// Responsive Design
@media (max-width: 768px) {
  .tab {
    padding: 10px 16px;
    font-size: 13px;
  }

  .tab-icon {
    width: 18px;
    height: 18px;
  }

  .tab-panels {
    padding: var(--spacing-sm);
  }

  .variant-vertical {
    flex-direction: column;

    .tab-list {
      flex-direction: row;
      border-right: none;
      border-bottom: 1px solid var(--border-color);
      width: 100%;
    }

    .tab {
      border-right: none;
      border-bottom: 2px solid transparent;

      &.active {
        border-right: none;
        border-bottom-color: var(--primary-color);
      }
    }
  }
}

@media (max-width: 480px) {
  .tab {
    padding: 8px 12px;
    font-size: 12px;
  }

  .tab-badge {
    font-size: 10px;
    min-width: 18px;
    height: 18px;
    padding: 1px 4px;
  }

  .tab-icon {
    width: 16px;
    height: 16px;
  }
}
```

#### Step 3: Export from UI Base Components
**File**: `./app/components/ui/base/index.ts`

Add to exports:
```typescript
export { Tabs, type TabsProps, type TabDefinition } from './Tabs';
```

---

### Phase 3: Settings Page Refactoring

#### Step 1: Create Tab Category Components

**File**: `./app/components/settings/SettingsGeneral.tsx`

```typescript
import { List, ListItem, Select, Input } from '../ui-lib';
import { InputRange } from '../input-range';
import { Locale, getLang, changeLang, AllLangs, ALL_LANG_OPTIONS } from '../../locales';
import { SubmitKey, Theme } from '../../store';

export function SettingsGeneral({ config, updateConfig }: SettingsGeneralProps) {
  return (
    <List>
      <ListItem title={Locale.Settings.SendKey}>
        <Select
          aria-label={Locale.Settings.SendKey}
          value={config.submitKey}
          onChange={(e) => {
            updateConfig((config) => (config.submitKey = e.target.value as any as SubmitKey));
          }}
        >
          {Object.values(SubmitKey).map((v) => (
            <option value={v} key={v}>
              {v}
            </option>
          ))}
        </Select>
      </ListItem>

      <ListItem title={Locale.Settings.Theme}>
        <Select
          aria-label={Locale.Settings.Theme}
          value={config.theme}
          onChange={(e) => {
            updateConfig((config) => (config.theme = e.target.value as any as Theme));
          }}
        >
          {Object.values(Theme).map((v) => (
            <option value={v} key={v}>
              {v}
            </option>
          ))}
        </Select>
      </ListItem>

      <ListItem title={Locale.Settings.Lang.Name}>
        <Select
          aria-label={Locale.Settings.Lang.Name}
          value={getLang()}
          onChange={(e) => {
            changeLang(e.target.value as any);
          }}
        >
          {AllLangs.map((lang) => (
            <option value={lang} key={lang}>
              {ALL_LANG_OPTIONS[lang]}
            </option>
          ))}
        </Select>
      </ListItem>

      <ListItem
        title={Locale.Settings.FontSize.Title}
        subTitle={Locale.Settings.FontSize.SubTitle}
      >
        <InputRange
          aria={Locale.Settings.FontSize.Title}
          title={`${config.fontSize ?? 14}px`}
          value={config.fontSize}
          min="12"
          max="40"
          step="1"
          onChange={(e) =>
            updateConfig(
              (config) =>
                (config.fontSize = Number.parseInt(e.currentTarget.value)),
            )
          }
        />
      </ListItem>

      <ListItem
        title={Locale.Settings.FontFamily.Title}
        subTitle={Locale.Settings.FontFamily.SubTitle}
      >
        <input
          aria-label={Locale.Settings.FontFamily.Title}
          type="text"
          value={config.fontFamily}
          placeholder={Locale.Settings.FontFamily.Placeholder}
          onChange={(e) =>
            updateConfig((config) => (config.fontFamily = e.currentTarget.value))
          }
        />
      </ListItem>
    </List>
  );
}

interface SettingsGeneralProps {
  config: AppConfig;
  updateConfig: (update: (config: AppConfig) => void) => void;
}
```

**File**: `./app/components/settings/SettingsDanger.tsx`

```typescript
import { List, ListItem, showConfirm } from '../ui-lib';
import { IconButton } from '../button';
import FireIcon from '../../icons/fire.svg';
import { Locale } from '../../locales';

export function SettingsDanger({ chatStore, appConfig }: SettingsDangerProps) {
  return (
    <List>
      <ListItem
        title={Locale.Settings.Danger.Reset.Title}
        subTitle={Locale.Settings.Danger.Reset.SubTitle}
      >
        <IconButton
          aria={Locale.Settings.Danger.Reset.Title}
          text={Locale.Settings.Danger.Reset.Action}
          onClick={async () => {
            if (await showConfirm(Locale.Settings.Danger.Reset.Confirm)) {
              appConfig.reset();
            }
          }}
          type="danger"
          icon={<FireIcon />}
        />
      </ListItem>

      <ListItem
        title={Locale.Settings.Danger.Clear.Title}
        subTitle={Locale.Settings.Danger.Clear.SubTitle}
      >
        <IconButton
          aria={Locale.Settings.Danger.Clear.Title}
          text={Locale.Settings.Danger.Clear.Action}
          onClick={async () => {
            if (await showConfirm(Locale.Settings.Danger.Clear.Confirm)) {
              chatStore.clearAllData();
            }
          }}
          type="danger"
          icon={<FireIcon />}
        />
      </ListItem>
    </List>
  );
}

interface SettingsDangerProps {
  chatStore: any;
  appConfig: any;
}
```

#### Step 2: Update Main Settings Component

**File**: `./app/components/settings.tsx` (Relevant section)

```typescript
import { Tabs, type TabDefinition } from './ui/base/Tabs';
import { SettingsGeneral } from './settings/SettingsGeneral';
import { SettingsChat } from './settings/SettingsChat';
import { SettingsAPI } from './settings/SettingsAPI';
import { SettingsSync } from './settings/SettingsSync';
import { SettingsDanger } from './settings/SettingsDanger';

export function Settings() {
  const navigate = useNavigate();
  const config = useAppConfig();
  const updateConfig = config.update;
  const chatStore = useChatStore();
  const accessStore = useAccessStore();
  // ... other hooks

  const settingsTabs: TabDefinition[] = [
    {
      id: 'general',
      label: 'General',
      content: (
        <SettingsGeneral config={config} updateConfig={updateConfig} />
      ),
    },
    {
      id: 'chat',
      label: 'Chat',
      content: (
        <SettingsChat config={config} updateConfig={updateConfig} />
      ),
    },
    {
      id: 'models',
      label: 'Models & APIs',
      content: (
        <SettingsAPI
          config={config}
          updateConfig={updateConfig}
          accessStore={accessStore}
          // ... other props
        />
      ),
    },
    {
      id: 'sync',
      label: 'Sync & Storage',
      content: (
        <SettingsSync
          syncStore={useSyncStore()}
          // ... other props
        />
      ),
    },
    {
      id: 'danger',
      label: 'Danger Zone',
      content: (
        <SettingsDanger
          chatStore={chatStore}
          appConfig={config}
        />
      ),
    },
  ];

  return (
    <ErrorBoundary>
      <div className="window-header" data-tauri-drag-region>
        {/* Header remains the same */}
      </div>
      <div className={styles['settings']}>
        <Tabs
          tabs={settingsTabs}
          defaultTab="general"
          variant="underline"
          ariaLabel="Settings"
        />
      </div>
    </ErrorBoundary>
  );
}
```

---

## Accessibility Checklist

- [ ] Tab component has `role="tablist"`
- [ ] Individual tabs have `role="tab"`
- [ ] Active tab has `aria-selected="true"`
- [ ] Inactive tabs have `aria-selected="false"`
- [ ] Tabs have `aria-controls` linking to panels
- [ ] Panels have `role="tabpanel"`
- [ ] Keyboard navigation works (Tab, Arrow, Home, End)
- [ ] Focus indicators visible
- [ ] Color contrast meets 4.5:1 minimum
- [ ] Screen reader announces active tab

---

## Testing Examples

### Unit Test Example
```typescript
describe('Tabs Component', () => {
  it('renders all tabs', () => {
    const tabs = [
      { id: '1', label: 'Tab 1', content: 'Content 1' },
      { id: '2', label: 'Tab 2', content: 'Content 2' },
    ];
    render(<Tabs tabs={tabs} />);
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
  });

  it('switches tabs on click', () => {
    const tabs = [
      { id: '1', label: 'Tab 1', content: 'Content 1' },
      { id: '2', label: 'Tab 2', content: 'Content 2' },
    ];
    render(<Tabs tabs={tabs} />);
    fireEvent.click(screen.getByText('Tab 2'));
    expect(screen.getByText('Content 2')).toBeVisible();
  });

  it('navigates with arrow keys', () => {
    const tabs = [
      { id: '1', label: 'Tab 1', content: 'Content 1' },
      { id: '2', label: 'Tab 2', content: 'Content 2' },
    ];
    render(<Tabs tabs={tabs} />);
    const tab1Button = screen.getByRole('tab', { name: /Tab 1/i });
    fireEvent.keyDown(tab1Button, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: /Tab 2/i })).toHaveFocus();
  });
});
```

---

## Migration Path

### From Old List Format to New Tab Format

**Before** (Linear List):
```typescript
<div className={styles['settings']}>
  <List>
    <ListItem title="Avatar">...</ListItem>
    <ListItem title="Theme">...</ListItem>
    <ListItem title="Language">...</ListItem>
    <!-- 50+ more items -->
  </List>
</div>
```

**After** (Tabbed):
```typescript
<div className={styles['settings']}>
  <Tabs
    tabs={[
      { id: 'general', label: 'General', content: <SettingsGeneral /> },
      { id: 'chat', label: 'Chat', content: <SettingsChat /> },
      { id: 'models', label: 'Models', content: <SettingsAPI /> },
      // ... more tabs
    ]}
  />
</div>
```

---

## Performance Optimizations

### Lazy Loading
```typescript
const [activeTab, setActiveTab] = useState('general');

// Only render active tab content
{tabs.map((tab) => (
  activeTab === tab.id && <div key={tab.id}>{tab.content}</div>
))}
```

### Memoization
```typescript
export const Tabs = React.memo(function Tabs(props: TabsProps) {
  // Component implementation
});
```

---

## Next Steps

1. ✅ Complete Phase 1 planning
2. **→ Phase 2**: Implement Tab component
3. Phase 3: Migrate settings
4. Phase 4: Test thoroughly
5. Phase 5: Document
6. Phase 6: Deploy

**Ready to begin Phase 2?** → Start with Step 1: Tab Component Structure

---

**For Questions**: Refer to `./feature-tabbed-settings-page-v1.0.0.md` for comprehensive project details.
