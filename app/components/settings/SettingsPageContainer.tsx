"use client";

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageConfig } from "../../config/pages";
import { PageConfigProvider } from "../../providers/PageConfigProvider";
import { usePageConfig } from "../../hooks/usePageConfig";
import { Tabs } from "../ui/base/Tabs";
import { IconButton } from "../button";
import CloseIcon from "../../icons/close.svg";
import { Path } from "../../constant";
import Locale from "../../locales";
import styles from "./PageContainer.module.scss";

interface SettingsPageContainerProps {
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
    <div
      className={`${styles.container} ${className || ""}`}
      style={{ padding: "24px 32px" }}
    >
      <SectionComponent {...sectionProps} />
    </div>
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
  const navigate = useNavigate();

  return (
    <div className={`${styles.pageContainer} ${className || ""}`}>
      {/* Window Header - matches original settings.tsx */}
      <div className="window-header" data-tauri-drag-region>
        <div className="window-header-title">
          <div className="window-header-main-title">
            {Locale.Settings.Title}
          </div>
          <div className="window-header-sub-title">
            {Locale.Settings.SubTitle}
          </div>
        </div>
        <div className="window-actions">
          <div className="window-action-button"></div>
          <div className="window-action-button"></div>
          <div className="window-action-button">
            <IconButton
              aria={Locale.UI.Close}
              icon={<CloseIcon />}
              onClick={() => navigate(Path.Home)}
              bordered
            />
          </div>
        </div>
      </div>

      {/* Tabs Container */}
      <div className={styles.tabsContainer}>
        <Tabs
          tabs={tabsForDisplay}
          defaultTab={defaultTab || currentTab}
          onChange={(tabId) => {
            setCurrentTab(tabId);
          }}
          variant="underline"
          ariaLabel="Settings Categories"
        />
      </div>

      {/* Content */}
      <PageContent className={styles.content} />
    </div>
  );
}

/**
 * Settings-specific PageContainer that includes the window header
 * Handles tab management and renders appropriate content
 */
export function SettingsPageContainer({
  config,
  defaultTab,
  onTabChange,
  className,
}: SettingsPageContainerProps) {
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
