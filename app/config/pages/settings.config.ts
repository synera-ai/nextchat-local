import { PageConfig } from "./types";
import { SettingsGeneral } from "../../components/settings/SettingsGeneral";
import { SettingsChat } from "../../components/settings/SettingsChat";
import { SettingsAPI } from "../../components/settings/SettingsAPI";
import { SettingsSync } from "../../components/settings/SettingsSync";
import { SettingsDanger } from "../../components/settings/SettingsDanger";

/**
 * Settings page configuration
 * Defines the tab structure and content components for the Settings page
 */
export const settingsPageConfig: PageConfig = {
  id: "settings",
  title: "Settings",
  subtitle: "Configure your application",
  layout: "multi",
  tabs: [
    {
      id: "general",
      label: "General",
      sections: [
        {
          id: "general-section",
          label: "General Settings",
          component: SettingsGeneral,
        },
      ],
    },
    {
      id: "chat",
      label: "Chat",
      sections: [
        {
          id: "chat-section",
          label: "Chat Settings",
          component: SettingsChat,
        },
      ],
    },
    {
      id: "api",
      label: "API",
      sections: [
        {
          id: "api-section",
          label: "API Configuration",
          component: SettingsAPI,
        },
      ],
    },
    {
      id: "sync",
      label: "Sync",
      sections: [
        {
          id: "sync-section",
          label: "Sync & Storage",
          component: SettingsSync,
        },
      ],
    },
    {
      id: "danger",
      label: "Danger Zone",
      sections: [
        {
          id: "danger-section",
          label: "Danger Zone",
          component: SettingsDanger,
        },
      ],
    },
  ],
  headerConfig: {
    showClose: true,
  },
};
