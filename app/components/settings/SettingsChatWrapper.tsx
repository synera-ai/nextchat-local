import React from "react";
import { SettingsChat } from "./SettingsChat";
import { useAppConfig } from "../../store";

/**
 * Wrapper component for SettingsChat that provides the required props
 * This bridges the gap between the PageConfig system and the existing settings components
 */
export function SettingsChatWrapper() {
  const config = useAppConfig();
  const updateConfig = config.update;

  return <SettingsChat config={config} updateConfig={updateConfig} />;
}
