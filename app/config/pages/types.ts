import React from "react";

/**
 * Page section definition - represents a content section within a tab
 */
export interface PageSection {
  id: string;
  label: string;
  icon?: React.ReactNode;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  badge?: number | string;
  disabled?: boolean;
}

/**
 * Tab configuration - represents a single tab with its sections
 */
export interface TabConfig {
  id: string;
  label: string;
  sections: PageSection[];
  defaultSection?: string;
  metadata?: Record<string, any>;
  badge?: number | string;
  disabled?: boolean;
}

/**
 * Page configuration - represents the entire page structure with all tabs
 */
export interface PageConfig {
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
  metadata?: Record<string, any>;
}

/**
 * Page context value - provides access to current page configuration and state
 */
export interface PageContextValue {
  config: PageConfig;
  currentTab: string;
  setCurrentTab: (tabId: string) => void;
  currentSection?: string;
  setCurrentSection?: (sectionId: string) => void;
}

/**
 * Validation result for configuration
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
