import React from "react";
import { SettingsAPI } from "./SettingsAPI";
import { useAppConfig, useAccessStore } from "../../store";

/**
 * Wrapper component for SettingsAPI that provides the required props
 * This bridges the gap between the PageConfig system and the existing settings components
 */
export function SettingsAPIWrapper() {
  const config = useAppConfig();
  const updateConfig = config.update;
  const accessStore = useAccessStore();

  return (
    <SettingsAPI
      config={config}
      updateConfig={updateConfig}
      accessStore={accessStore}
    />
  );
}
