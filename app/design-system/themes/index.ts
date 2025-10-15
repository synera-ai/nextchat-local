// Design system themes index

import { lightTheme } from "./light";
import { darkTheme } from "./dark";

// Export individual themes
export { lightTheme } from "./light";
export { darkTheme } from "./dark";

// Theme registry
export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

// Theme utilities
export const themeUtils = {
  // Get theme by name
  getTheme: (name: keyof typeof themes) => themes[name],

  // Get all available themes
  getAvailableThemes: () => Object.keys(themes),

  // Check if theme exists
  hasTheme: (name: string) => name in themes,

  // Get theme metadata
  getThemeMetadata: (name: keyof typeof themes) => {
    const theme = themes[name];
    return {
      name: theme.name,
      displayName: theme.displayName,
      description: theme.description,
    };
  },

  // Get theme colors
  getThemeColors: (name: keyof typeof themes) => themes[name].colors,

  // Get theme typography
  getThemeTypography: (name: keyof typeof themes) => themes[name].typography,

  // Get theme spacing
  getThemeSpacing: (name: keyof typeof themes) => themes[name].spacing,

  // Get theme shadows
  getThemeShadows: (name: keyof typeof themes) => themes[name].shadows,

  // Get theme breakpoints
  getThemeBreakpoints: (name: keyof typeof themes) => themes[name].breakpoints,

  // Get theme components
  getThemeComponents: (name: keyof typeof themes) => themes[name].components,

  // Get theme animations
  getThemeAnimations: (name: keyof typeof themes) => themes[name].animations,

  // Get theme z-index
  getThemeZIndex: (name: keyof typeof themes) => themes[name].zIndex,

  // Generate theme CSS variables
  generateThemeCSSVars: (name: keyof typeof themes) => {
    const theme = themes[name];
    const cssVars: Record<string, string> = {};

    // Flatten theme object and create CSS variables
    const flatten = (obj: any, prefix: string = ""): void => {
      Object.keys(obj).forEach((key) => {
        const value = obj[key];
        const newKey = prefix ? `${prefix}-${key}` : key;

        if (
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          flatten(value, newKey);
        } else {
          cssVars[`--theme-${newKey}`] = value;
        }
      });
    };

    flatten(theme, "");
    return cssVars;
  },

  // Generate theme CSS
  generateThemeCSS: (name: keyof typeof themes) => {
    const cssVars = themeUtils.generateThemeCSSVars(name);
    const cssVarsString = Object.entries(cssVars)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join("\n");

    return `[data-theme="${name}"] {\n${cssVarsString}\n}`;
  },

  // Compare themes
  compareThemes: (theme1: keyof typeof themes, theme2: keyof typeof themes) => {
    const t1 = themes[theme1];
    const t2 = themes[theme2];

    return {
      colors: t1.colors === t2.colors,
      typography: t1.typography === t2.typography,
      spacing: t1.spacing === t2.spacing,
      shadows: t1.shadows === t2.shadows,
      breakpoints: t1.breakpoints === t2.breakpoints,
      components: t1.components === t2.components,
      animations: t1.animations === t2.animations,
      zIndex: t1.zIndex === t2.zIndex,
    };
  },

  // Validate theme
  validateTheme: (name: keyof typeof themes) => {
    const theme = themes[name];
    const requiredKeys = [
      "name",
      "displayName",
      "description",
      "colors",
      "typography",
      "spacing",
      "shadows",
      "breakpoints",
      "components",
    ];

    return requiredKeys.every((key) => key in theme);
  },

  // Get theme contrast ratio
  getThemeContrastRatio: (name: keyof typeof themes) => {
    const theme = themes[name];
    const primaryText = theme.colors.text.primary;
    const primaryBackground = theme.colors.background.primary;

    // Simple contrast ratio calculation
    // This would need a proper implementation for accurate results
    return {
      primary: 4.5, // Placeholder
      secondary: 3.0, // Placeholder
      tertiary: 2.0, // Placeholder
    };
  },

  // Get theme accessibility score
  getThemeAccessibilityScore: (name: keyof typeof themes) => {
    const contrastRatio = themeUtils.getThemeContrastRatio(name);
    const score = Object.values(contrastRatio).reduce(
      (acc, ratio) => acc + (ratio >= 4.5 ? 1 : 0),
      0,
    );

    return {
      score: score / Object.keys(contrastRatio).length,
      level: score >= 2 ? "AA" : score >= 1 ? "A" : "F",
    };
  },
};

// Theme context
export const themeContext = {
  // Current theme
  currentTheme: "light" as keyof typeof themes,

  // Theme setter
  setTheme: (name: keyof typeof themes) => {
    themeContext.currentTheme = name;
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", name);
    }
  },

  // Theme getter
  getTheme: (): keyof typeof themes => themeContext.currentTheme,

  // Get current theme object
  getCurrentTheme: () => themes[themeContext.currentTheme],

  // Initialize theme
  initialize: () => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute(
        "data-theme",
        themeContext.currentTheme,
      );
    }
  },

  // Toggle theme
  toggleTheme: () => {
    const newTheme = themeContext.currentTheme === "light" ? "dark" : "light";
    themeContext.setTheme(newTheme);
  },

  // Listen for theme changes
  onThemeChange: (callback: (theme: keyof typeof themes) => void) => {
    if (typeof document !== "undefined") {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "data-theme"
          ) {
            const newTheme = document.documentElement.getAttribute(
              "data-theme",
            ) as keyof typeof themes;
            if (newTheme && newTheme !== themeContext.currentTheme) {
              themeContext.currentTheme = newTheme;
              callback(newTheme);
            }
          }
        });
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });

      return () => observer.disconnect();
    }

    return () => {};
  },
};

// Export everything
export const designSystemThemes = {
  themes,
  utils: themeUtils,
  context: themeContext,
};

export default designSystemThemes;
