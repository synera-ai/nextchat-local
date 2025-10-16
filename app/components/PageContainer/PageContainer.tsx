import React, { useMemo } from "react";
import { PageConfig } from "../../config/pages";
import { PageConfigProvider } from "../../providers/PageConfigProvider";
import { usePageConfig } from "../../hooks/usePageConfig";
import { Tabs } from "../ui/base/Tabs";
import styles from "./PageContainer.module.scss";

interface PageContainerProps {
  config: PageConfig;
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

/**
 * PageContent renders the actual page content based on configuration
 * This is a separate component so it can use the usePageConfig hook
 */
function PageContent({ className }: { className?: string }) {
  const { config, currentTab, setCurrentTab } = usePageConfig();

  // Get current tab
  const activeTab = config.tabs.find((t) => t.id === currentTab);

  if (!activeTab) {
    return (
      <div className={`${styles.container} ${className || ""}`}>
        <div className={styles.error}>Tab not found: {currentTab}</div>
      </div>
    );
  }

  // Get first section of active tab
  const activeSection = activeTab.sections[0];

  if (!activeSection) {
    return (
      <div className={`${styles.container} ${className || ""}`}>
        <div className={styles.error}>No sections found in tab</div>
      </div>
    );
  }

  // Render section component
  const SectionComponent = activeSection.component;
  const sectionProps = activeSection.props || {};

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <SectionComponent {...sectionProps} />
    </div>
  );
}

/**
 * Generic PageContainer component that renders pages from configuration
 * Handles tab management and renders appropriate content
 */
export function PageContainer({
  config,
  defaultTab,
  onTabChange,
  className,
}: PageContainerProps) {
  // Convert tabs to format expected by Tabs component
  // Note: We include empty content as the actual content is rendered separately
  const tabsForDisplay = useMemo(
    () =>
      config.tabs.map((tab) => ({
        id: tab.id,
        label: tab.label,
        icon: undefined,
        content: null, // Content is rendered separately in PageContent
        badge: tab.badge,
        disabled: tab.disabled,
      })),
    [config.tabs],
  );

  return (
    <PageConfigProvider
      config={config}
      defaultTab={defaultTab}
      onTabChange={onTabChange}
    >
      <PageContent_WithTabs
        tabsForDisplay={tabsForDisplay}
        defaultTab={defaultTab}
        config={config}
        className={className}
      />
    </PageConfigProvider>
  );
}

/**
 * Separate component to access context inside provider
 */
function PageContent_WithTabs({
  tabsForDisplay,
  defaultTab,
  config,
  className,
}: {
  tabsForDisplay: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    content: React.ReactNode;
    badge?: number | string;
    disabled?: boolean;
  }>;
  defaultTab?: string;
  config: PageConfig;
  className?: string;
}) {
  const { currentTab, setCurrentTab } = usePageConfig();

  return (
    <div className={`${styles.pageContainer} ${className || ""}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>{config.title}</h1>
        {config.subtitle && (
          <p className={styles.subtitle}>{config.subtitle}</p>
        )}
      </div>

      <Tabs
        tabs={tabsForDisplay}
        defaultTab={defaultTab || currentTab}
        onChange={(tabId) => {
          setCurrentTab(tabId);
        }}
        variant="underline"
        className={styles.tabsContainer}
      />

      <PageContent className={styles.content} />
    </div>
  );
}
