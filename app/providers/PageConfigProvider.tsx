import React, {
  createContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import {
  PageConfig,
  PageContextValue,
  safeValidatePageConfig,
} from "../config/pages";

/**
 * Context for page configuration
 */
export const PageConfigContext = createContext<PageContextValue | null>(null);

interface PageConfigProviderProps {
  config: PageConfig;
  children: ReactNode;
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
}

/**
 * Provider component for page configuration
 * Manages tab state and provides configuration context to child components
 */
export function PageConfigProvider({
  config,
  children,
  defaultTab,
  onTabChange,
}: PageConfigProviderProps) {
  // Validate configuration
  const validation = useMemo(() => safeValidatePageConfig(config), [config]);

  if (!validation.valid) {
    console.error("Invalid page configuration:", validation.errors);
  }

  // Get first tab ID as default
  const firstTabId = config.tabs[0]?.id || "";
  const [currentTab, setCurrentTabState] = useState(defaultTab || firstTabId);
  const [currentSection, setCurrentSectionState] = useState<string | undefined>(
    config.tabs.find((t) => t.id === (defaultTab || firstTabId))?.sections[0]
      ?.id,
  );

  // Handle tab change
  const setCurrentTab = useCallback(
    (tabId: string) => {
      // Verify tab exists
      const tab = config.tabs.find((t) => t.id === tabId);
      if (!tab) {
        console.warn(`Tab not found: ${tabId}`);
        return;
      }

      setCurrentTabState(tabId);
      // Reset section to first section of new tab
      setCurrentSectionState(tab.sections[0]?.id);

      // Call optional callback
      onTabChange?.(tabId);
    },
    [config.tabs, onTabChange],
  );

  // Handle section change
  const setCurrentSection = useCallback((sectionId: string) => {
    setCurrentSectionState(sectionId);
  }, []);

  const value: PageContextValue = {
    config,
    currentTab,
    setCurrentTab,
    currentSection,
    setCurrentSection,
  };

  return (
    <PageConfigContext.Provider value={value}>
      {children}
    </PageConfigContext.Provider>
  );
}
