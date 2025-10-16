import { createPageConfig, createTab, createSection } from "./factory";
import { SettingsGeneralWrapper } from "../../components/settings/SettingsGeneralWrapper";
import { SettingsChatWrapper } from "../../components/settings/SettingsChatWrapper";
import { SettingsAPIWrapper } from "../../components/settings/SettingsAPIWrapper";
import { SettingsSyncWrapper } from "../../components/settings/SettingsSyncWrapper";
import { SettingsDangerWrapper } from "../../components/settings/SettingsDangerWrapper";

/**
 * Settings page configuration
 * Defines the tab structure and content components for the Settings page
 * Uses wrapper components that provide proper props to existing settings components
 */
export const settingsPageConfig = createPageConfig(
  "settings",
  "Settings",
  [
    createTab("general", "General", [
      createSection(
        "general-section",
        "General Settings",
        SettingsGeneralWrapper,
      ),
    ]),
    createTab("chat", "Chat", [
      createSection("chat-section", "Chat Settings", SettingsChatWrapper),
    ]),
    createTab("models", "Models & APIs", [
      createSection("models-section", "API Configuration", SettingsAPIWrapper),
    ]),
    createTab("sync", "Sync & Storage", [
      createSection("sync-section", "Sync & Storage", SettingsSyncWrapper),
    ]),
    createTab("danger", "Danger Zone", [
      createSection("danger-section", "Danger Zone", SettingsDangerWrapper),
    ]),
  ],
  {
    subtitle: "Configure your application",
    layout: "multi",
    headerConfig: {
      showClose: true,
    },
  },
);
