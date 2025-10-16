"use client";

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageConfig } from "../../config/pages";
import { PageConfigProvider } from "../../providers/PageConfigProvider";
import { usePageConfig } from "../../hooks/usePageConfig";
import { Tabs } from "../ui/base/Tabs";
import { IconButton } from "../button";
import CloseIcon from "../../icons/close.svg";
import DownloadIcon from "../../icons/download.svg";
import UploadIcon from "../../icons/upload.svg";
import { FileName } from "../../constant";
import Locale from "../../locales";
import { useMaskStore } from "../../store/mask";
import { downloadAs, readFromFile } from "../../utils";
import { MaskEditProvider } from "./MasksListWrapper";
import styles from "../PageContainer/PageContainer.module.scss";

interface MaskPageContainerProps {
  config: PageConfig;
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  onEditMask?: (maskId: string) => void;
  className?: string;
}

/**
 * PageContent renders the actual page content based on configuration
 * This is a separate component so it can use the usePageConfig hook
 */
function PageContent({ className }: { className?: string }) {
  const { config, currentTab } = usePageConfig();

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
 * Separate component to access context inside provider
 */
function PageContent_WithTabs({
  tabsForDisplay,
  defaultTab,
  config,
  onEditMask,
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
  onEditMask?: (maskId: string) => void;
  className?: string;
}) {
  const { currentTab, setCurrentTab } = usePageConfig();
  const navigate = useNavigate();
  const maskStore = useMaskStore();

  const allMasks = maskStore.getAll();

  const downloadAll = () => {
    downloadAs(
      JSON.stringify(allMasks.filter((v) => !v.builtin)),
      FileName.Masks,
    );
  };

  const importFromFile = () => {
    readFromFile().then((content) => {
      try {
        const importMasks = JSON.parse(content);
        if (Array.isArray(importMasks)) {
          for (const mask of importMasks) {
            if (mask.name) {
              maskStore.create(mask);
            }
          }
          return;
        }
        if (importMasks.name) {
          maskStore.create(importMasks);
        }
      } catch {}
    });
  };

  return (
    <MaskEditProvider onEditMask={onEditMask}>
      <div className={`${styles.pageContainer} ${className || ""}`}>
        {/* Window Header - matches original mask.tsx */}
        <div className="window-header" data-tauri-drag-region>
          <div className="window-header-title">
            <div className="window-header-main-title">
              {Locale.Mask.Page.Title}
            </div>
            <div className="window-header-sub-title">
              {Locale.Mask.Page.SubTitle(allMasks.length)}
            </div>
          </div>
          <div className="window-actions">
            <div className="window-action-button">
              <IconButton
                icon={<DownloadIcon />}
                bordered
                onClick={downloadAll}
                text={Locale.UI.Export}
              />
            </div>
            <div className="window-action-button">
              <IconButton
                icon={<UploadIcon />}
                text={Locale.UI.Import}
                bordered
                onClick={() => importFromFile()}
              />
            </div>
            <div className="window-action-button">
              <IconButton
                icon={<CloseIcon />}
                bordered
                onClick={() => navigate(-1)}
              />
            </div>
          </div>
        </div>

        {/* Tabs Container - single tab for now */}
        <div className={styles.tabsContainer}>
          <Tabs
            tabs={tabsForDisplay}
            defaultTab={defaultTab || currentTab}
            onChange={(tabId) => {
              setCurrentTab(tabId);
            }}
            variant="underline"
            ariaLabel="Masks Categories"
          />
        </div>

        {/* Content */}
        <PageContent className={styles.content} />
      </div>
    </MaskEditProvider>
  );
}

/**
 * Mask-specific PageContainer that includes window header and export/import
 * Handles tab management and renders appropriate content
 */
export function MaskPageContainer({
  config,
  defaultTab,
  onTabChange,
  onEditMask,
  className,
}: MaskPageContainerProps) {
  // Convert tabs to format expected by Tabs component
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
        onEditMask={onEditMask}
        className={className}
      />
    </PageConfigProvider>
  );
}
