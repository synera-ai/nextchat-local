import React from "react";
import { SettingsDanger } from "./SettingsDanger";
import { useAppConfig, useChatStore } from "../../store";

/**
 * Wrapper component for SettingsDanger that provides the required props
 * This bridges the gap between the PageConfig system and the existing settings components
 */
export function SettingsDangerWrapper() {
  const config = useAppConfig();
  const chatStore = useChatStore();

  return <SettingsDanger chatStore={chatStore} appConfig={config} />;
}
