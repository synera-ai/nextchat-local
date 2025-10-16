import { createPageConfig, createTab, createSection } from "./factory";
import { SettingsGeneral } from "../../components/settings/SettingsGeneral";
import { SettingsChat } from "../../components/settings/SettingsChat";
import { SettingsAPI } from "../../components/settings/SettingsAPI";
import { SettingsSync } from "../../components/settings/SettingsSync";
import { SettingsDanger } from "../../components/settings/SettingsDanger";

/**
 * Settings page configuration
 * Defines the tab structure and content components for the Settings page
 */
export const settingsPageConfig = createPageConfig(
  "settings",
  "Settings",
  [
    createTab("general", "General", [
      createSection("general-section", "General Settings", SettingsGeneral),
    ]),
    createTab("chat", "Chat", [
      createSection("chat-section", "Chat Settings", SettingsChat),
    ]),
    createTab("api", "API", [
      createSection("api-section", "API Configuration", SettingsAPI),
    ]),
    createTab("sync", "Sync", [
      createSection("sync-section", "Sync & Storage", SettingsSync),
    ]),
    createTab("danger", "Danger Zone", [
      createSection("danger-section", "Danger Zone", SettingsDanger),
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
