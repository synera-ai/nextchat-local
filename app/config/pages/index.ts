export type {
  PageConfig,
  PageSection,
  TabConfig,
  PageContextValue,
  ValidationResult,
} from "./types";

export { validatePageConfig, safeValidatePageConfig } from "./validation";

export {
  createTab,
  createSection,
  createPageConfig,
  mergePageConfigs,
  createPageFromTabs,
} from "./factory";

// Page configurations
export { settingsPageConfig } from "./settings.config";
export { masksPageConfig } from "./masks.config";
