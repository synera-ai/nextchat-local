import React, { useState, useCallback } from "react";
import styles from "./Tabs.module.scss";
import clsx from "clsx";

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
  variant?: "underline" | "pill" | "vertical";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  variant = "underline",
  size = "md",
  disabled = false,
  className,
  ariaLabel = "Tabs",
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

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let newIndex: number | null = null;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        newIndex = (index + 1) % tabs.length;
        e.preventDefault();
        break;
      case "ArrowLeft":
      case "ArrowUp":
        newIndex = (index - 1 + tabs.length) % tabs.length;
        e.preventDefault();
        break;
      case "Home":
        newIndex = 0;
        e.preventDefault();
        break;
      case "End":
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
    >
      <div className={styles["tab-list"]} role="tablist" aria-label={ariaLabel}>
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
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
            tabIndex={activeTab === tab.id ? 0 : -1}
          >
            {tab.icon && <span className={styles["tab-icon"]}>{tab.icon}</span>}
            <span className={styles["tab-label"]}>{tab.label}</span>
            {tab.badge && (
              <span className={styles["tab-badge"]}>{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      <div className={styles["tab-panels"]}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`panel-${tab.id}`}
            className={clsx(styles["tab-panel"], {
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
