import React from "react";
import { PageConfig, TabConfig, PageSection } from "./types";

/**
 * Create a tab configuration with sensible defaults
 */
export function createTab(
  id: string,
  label: string,
  sections: PageSection[],
  options?: {
    badge?: number | string;
    disabled?: boolean;
    metadata?: Record<string, any>;
  },
): TabConfig {
  return {
    id,
    label,
    sections,
    badge: options?.badge,
    disabled: options?.disabled,
    metadata: options?.metadata,
  };
}

/**
 * Create a page section with sensible defaults
 */
export function createSection(
  id: string,
  label: string,
  component: React.ComponentType<any>,
  options?: {
    icon?: React.ReactNode;
    props?: Record<string, any>;
    badge?: number | string;
    disabled?: boolean;
  },
): PageSection {
  return {
    id,
    label,
    component,
    icon: options?.icon,
    props: options?.props,
    badge: options?.badge,
    disabled: options?.disabled,
  };
}

/**
 * Create a page configuration with sensible defaults
 */
export function createPageConfig(
  id: string,
  title: string,
  tabs: TabConfig[],
  options?: {
    subtitle?: string;
    layout?: "single" | "multi";
    headerConfig?: {
      showClose?: boolean;
      showMinimize?: boolean;
      showMaximize?: boolean;
    };
    metadata?: Record<string, any>;
  },
): PageConfig {
  return {
    id,
    title,
    tabs,
    subtitle: options?.subtitle,
    layout: options?.layout || "multi",
    headerConfig: options?.headerConfig,
    metadata: options?.metadata,
  };
}

/**
 * Merge multiple page configurations (for combining sections from different sources)
 */
export function mergePageConfigs(
  baseConfig: PageConfig,
  ...configs: PageConfig[]
): PageConfig {
  const mergedTabs = [...baseConfig.tabs];
  const tabIds = new Set(mergedTabs.map((t) => t.id));

  for (const config of configs) {
    for (const tab of config.tabs) {
      if (tabIds.has(tab.id)) {
        // Merge sections into existing tab
        const existingTab = mergedTabs.find((t) => t.id === tab.id);
        if (existingTab) {
          const sectionIds = new Set(existingTab.sections.map((s) => s.id));
          for (const section of tab.sections) {
            if (!sectionIds.has(section.id)) {
              existingTab.sections.push(section);
            }
          }
        }
      } else {
        // Add new tab
        mergedTabs.push(tab);
        tabIds.add(tab.id);
      }
    }
  }

  return {
    ...baseConfig,
    tabs: mergedTabs,
  };
}

/**
 * Create a page configuration from tabs array for convenience
 */
export function createPageFromTabs(
  id: string,
  title: string,
  tabConfigs: Array<{
    id: string;
    label: string;
    component: React.ComponentType<any>;
    componentProps?: Record<string, any>;
    badge?: number | string;
  }>,
  options?: {
    subtitle?: string;
    layout?: "single" | "multi";
  },
): PageConfig {
  const tabs = tabConfigs.map((tabConfig) =>
    createTab(tabConfig.id, tabConfig.label, [
      createSection(
        `${tabConfig.id}-section`,
        tabConfig.label,
        tabConfig.component,
        {
          props: tabConfig.componentProps,
          badge: tabConfig.badge,
        },
      ),
    ]),
  );

  return createPageConfig(id, title, tabs, options);
}
