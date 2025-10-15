// Design system tokens index

// Export all token modules
export { colors, type ColorScale, type SemanticColors } from './colors';
export { typographyTokens, type FontFamily, type FontSize, type FontWeight, type LineHeight, type LetterSpacing } from './typography';
export { spacingTokens, type SpacingScale, type LayoutSpacing } from './spacing';
export { shadowTokens, type ShadowScale, type ShadowColor } from './shadows';
export { breakpointTokens, type BreakpointScale, type ContainerMaxWidths } from './breakpoints';

// Re-export individual tokens for convenience
export { colors as colorTokens } from './colors';
export { typographyTokens as typography } from './typography';
export { spacingTokens as spacing } from './spacing';
export { shadowTokens as shadows } from './shadows';
export { breakpointTokens as breakpoints } from './breakpoints';

// Design system configuration
export const designSystemConfig = {
  // Version
  version: '1.0.0',
  
  // Theme support
  themes: ['light', 'dark'],
  
  // Default theme
  defaultTheme: 'light',
  
  // Breakpoint strategy
  breakpointStrategy: 'mobile-first',
  
  // Spacing strategy
  spacingStrategy: '4px-base',
  
  // Typography strategy
  typographyStrategy: 'fluid',
  
  // Color strategy
  colorStrategy: 'semantic',
  
  // Shadow strategy
  shadowStrategy: 'layered',
};

// Design system utilities
export const designSystemUtils = {
  // Get theme value
  getThemeValue: (theme: 'light' | 'dark', property: string, value: string): string => {
    // This would be implemented based on the specific property
    return value;
  },
  
  // Generate CSS custom properties
  generateCSSVars: (tokens: Record<string, any>, prefix: string = 'ds'): Record<string, string> => {
    const cssVars: Record<string, string> = {};
    
    const flatten = (obj: any, prefix: string = ''): void => {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        const newKey = prefix ? `${prefix}-${key}` : key;
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          flatten(value, newKey);
        } else {
          cssVars[`--${prefix}-${newKey}`] = value;
        }
      });
    };
    
    flatten(tokens, prefix);
    return cssVars;
  },
  
  // Generate theme CSS
  generateThemeCSS: (theme: 'light' | 'dark', tokens: Record<string, any>): string => {
    const cssVars = designSystemUtils.generateCSSVars(tokens, 'ds');
    const cssVarsString = Object.entries(cssVars)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n');
    
    return `[data-theme="${theme}"] {\n${cssVarsString}\n}`;
  },
  
  // Validate token structure
  validateTokens: (tokens: Record<string, any>): boolean => {
    // Basic validation logic
    return typeof tokens === 'object' && tokens !== null;
  },
  
  // Get token path
  getTokenPath: (tokens: Record<string, any>, path: string): any => {
    return path.split('.').reduce((obj, key) => obj?.[key], tokens);
  },
  
  // Set token value
  setTokenValue: (tokens: Record<string, any>, path: string, value: any): void => {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => {
      if (!obj[key]) obj[key] = {};
      return obj[key];
    }, tokens);
    
    if (lastKey) {
      target[lastKey] = value;
    }
  },
};

// Design system context
export const designSystemContext = {
  // Current theme
  currentTheme: 'light' as 'light' | 'dark',
  
  // Theme setter
  setTheme: (theme: 'light' | 'dark') => {
    designSystemContext.currentTheme = theme;
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  },
  
  // Theme getter
  getTheme: (): 'light' | 'dark' => {
    return designSystemContext.currentTheme;
  },
  
  // Initialize design system
  initialize: () => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', designSystemContext.currentTheme);
    }
  },
};

// Export everything
export const designSystem = {
  config: designSystemConfig,
  utils: designSystemUtils,
  context: designSystemContext,
  tokens: {
    colors: colorTokens,
    typography: typography,
    spacing: spacing,
    shadows: shadows,
    breakpoints: breakpoints,
  },
};

export default designSystem;
