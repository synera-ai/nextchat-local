// Design tokens for colors

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface SemanticColors {
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;
}

// Primary color palette
export const primary: ColorScale = {
  50: '#f0f9ff',
  100: '#e0f2fe',
  200: '#bae6fd',
  300: '#7dd3fc',
  400: '#38bdf8',
  500: '#0ea5e9',
  600: '#0284c7',
  700: '#0369a1',
  800: '#075985',
  900: '#0c4a6e',
  950: '#082f49',
};

// Secondary color palette
export const secondary: ColorScale = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
  950: '#020617',
};

// Neutral color palette
export const neutral: ColorScale = {
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#e5e5e5',
  300: '#d4d4d4',
  400: '#a3a3a3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
  950: '#0a0a0a',
};

// Semantic colors
export const semantic: SemanticColors = {
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
};

// Theme-specific color mappings
export const lightTheme = {
  // Background colors
  background: {
    primary: neutral[50],
    secondary: neutral[100],
    tertiary: neutral[200],
    elevated: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Text colors
  text: {
    primary: neutral[900],
    secondary: neutral[700],
    tertiary: neutral[500],
    disabled: neutral[400],
    inverse: neutral[50],
  },
  
  // Border colors
  border: {
    primary: neutral[200],
    secondary: neutral[300],
    focus: primary[500],
    error: error[500],
    success: success[500],
  },
  
  // Interactive colors
  interactive: {
    primary: primary[500],
    primaryHover: primary[600],
    primaryActive: primary[700],
    secondary: neutral[200],
    secondaryHover: neutral[300],
    secondaryActive: neutral[400],
  },
  
  // Status colors
  status: {
    success: success[500],
    warning: warning[500],
    error: error[500],
    info: info[500],
  },
};

export const darkTheme = {
  // Background colors
  background: {
    primary: neutral[900],
    secondary: neutral[800],
    tertiary: neutral[700],
    elevated: neutral[950],
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  
  // Text colors
  text: {
    primary: neutral[50],
    secondary: neutral[300],
    tertiary: neutral[400],
    disabled: neutral[600],
    inverse: neutral[900],
  },
  
  // Border colors
  border: {
    primary: neutral[700],
    secondary: neutral[600],
    focus: primary[400],
    error: error[400],
    success: success[400],
  },
  
  // Interactive colors
  interactive: {
    primary: primary[400],
    primaryHover: primary[300],
    primaryActive: primary[500],
    secondary: neutral[700],
    secondaryHover: neutral[600],
    secondaryActive: neutral[500],
  },
  
  // Status colors
  status: {
    success: success[400],
    warning: warning[400],
    error: error[400],
    info: info[400],
  },
};

// Color utilities
export const colorUtils = {
  // Get color with opacity
  withOpacity: (color: string, opacity: number): string => {
    // Convert hex to rgba
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  },
  
  // Get contrast color
  getContrastColor: (backgroundColor: string): string => {
    // Simple contrast calculation
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? neutral[900] : neutral[50];
  },
  
  // Get hover color
  getHoverColor: (color: string): string => {
    // Simple hover effect - make color slightly darker
    return colorUtils.withOpacity(color, 0.8);
  },
  
  // Get active color
  getActiveColor: (color: string): string => {
    // Simple active effect - make color darker
    return colorUtils.withOpacity(color, 0.6);
  },
};

// Export all colors
export const colors = {
  primary,
  secondary,
  neutral,
  semantic,
  lightTheme,
  darkTheme,
  utils: colorUtils,
};

export default colors;
