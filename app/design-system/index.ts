// Design system main index

// Export tokens
export * from "./tokens";

// Export themes
export * from "./themes";

// Export design system configuration
export {
  designSystemConfig,
  designSystemUtils,
  designSystemContext,
  designSystem,
} from "./tokens";

// Export theme system
export { designSystemThemes } from "./themes";

// Design system version
export const DESIGN_SYSTEM_VERSION = "1.0.0";

// Design system metadata
export const designSystemMetadata = {
  name: "NextChat Design System",
  version: DESIGN_SYSTEM_VERSION,
  description: "Comprehensive design system for NextChat application",
  author: "NextChat Team",
  license: "MIT",
  repository: "https://github.com/nextchat/nextchat-clean",
  documentation: "https://docs.nextchat.com/design-system",

  // Features
  features: [
    "Comprehensive token system",
    "Light and dark themes",
    "Responsive breakpoints",
    "Component theming",
    "Accessibility support",
    "TypeScript support",
    "CSS custom properties",
    "Theme switching",
  ],

  // Browser support
  browserSupport: {
    modern: ["Chrome 90+", "Firefox 88+", "Safari 14+", "Edge 90+"],
    legacy: ["Chrome 60+", "Firefox 60+", "Safari 12+", "Edge 79+"],
  },

  // Dependencies
  dependencies: {
    peer: ["react", "react-dom"],
    dev: ["typescript", "sass", "postcss"],
  },
};

// Design system initialization
export const initializeDesignSystem = () => {
  // Initialize theme context
  if (typeof document !== "undefined") {
    // Set default theme
    document.documentElement.setAttribute("data-theme", "light");

    // Add design system class
    document.documentElement.classList.add("design-system");

    // Inject CSS custom properties
    const style = document.createElement("style");
    style.textContent = `
      :root {
        --design-system-version: ${DESIGN_SYSTEM_VERSION};
        --design-system-initialized: true;
      }
    `;
    document.head.appendChild(style);
  }

  return {
    version: DESIGN_SYSTEM_VERSION,
    initialized: true,
    timestamp: new Date().toISOString(),
  };
};

// Design system utilities
export const designSystemAPI = {
  // Version info
  getVersion: () => DESIGN_SYSTEM_VERSION,

  // Metadata
  getMetadata: () => designSystemMetadata,

  // Initialization
  initialize: initializeDesignSystem,

  // Theme management
  themes: {
    get: (name: string) =>
      designSystemThemes.themes[name as keyof typeof designSystemThemes.themes],
    getAll: () => Object.keys(designSystemThemes.themes),
    set: (name: string) =>
      designSystemThemes.context.setTheme(
        name as keyof typeof designSystemThemes.themes,
      ),
    getCurrent: () => designSystemThemes.context.getTheme(),
    toggle: () => designSystemThemes.context.toggleTheme(),
  },

  // Token access
  tokens: {
    colors: () => designSystem.tokens.colors,
    typography: () => designSystem.tokens.typography,
    spacing: () => designSystem.tokens.spacing,
    shadows: () => designSystem.tokens.shadows,
    breakpoints: () => designSystem.tokens.breakpoints,
  },

  // Utilities
  utils: {
    ...designSystemUtils,
    ...designSystemThemes.utils,
  },

  // Context
  context: {
    ...designSystemContext,
    ...designSystemThemes.context,
  },
};

// Default export
export default designSystemAPI;
