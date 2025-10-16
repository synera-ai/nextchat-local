import { useEffect } from "react";
import { SettingsPageContainer } from "./settings/SettingsPageContainer";
import { settingsPageConfig } from "../config/pages/settings.config";
import { useNavigate } from "react-router-dom";
import { getClientConfig } from "../config/client";
import { useAccessStore } from "../store";
import { Path } from "../constant";
import { ErrorBoundary } from "./error";

/**
 * Settings - Main settings page component
 * Now uses the PageContainer system for tab management
 *
 * Migration from v1.0.0 (hardcoded tabs) to v2.0.0 (PageContainer):
 * - Tabs are now defined in settingsPageConfig
 * - Tab state is managed by PageConfigProvider
 * - Content components are wrapped to provide required props
 * - All functionality preserved (General, Chat, API, Sync, Danger tabs)
 */
export function Settings() {
  const navigate = useNavigate();
  const accessStore = useAccessStore();
  const clientConfig = getClientConfig();

  // Handle Escape key to close settings
  useEffect(() => {
    const keydownEvent = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        navigate(Path.Home);
      }
    };

    if (clientConfig?.isApp) {
      // Force to set custom endpoint to true if it's app
      accessStore.update((state) => {
        state.useCustomConfig = true;
      });
    }

    document.addEventListener("keydown", keydownEvent);
    return () => {
      document.removeEventListener("keydown", keydownEvent);
    };
  }, [navigate, accessStore, clientConfig]);

  return (
    <ErrorBoundary>
      <SettingsPageContainer config={settingsPageConfig} defaultTab="general" />
    </ErrorBoundary>
  );
}
