// Design tokens for shadows

export interface ShadowScale {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

export interface ShadowColor {
  light: string;
  dark: string;
}

// Shadow definitions
export const shadows: ShadowScale = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
};

// Shadow colors for different themes
export const shadowColors: ShadowColor = {
  light: 'rgba(0, 0, 0, 0.1)',
  dark: 'rgba(0, 0, 0, 0.3)',
};

// Component-specific shadows
export const componentShadows = {
  // Button shadows
  button: {
    default: shadows.sm,
    hover: shadows.md,
    active: shadows.inner,
    focus: '0 0 0 3px rgba(59, 130, 246, 0.5)',
    disabled: shadows.none,
  },
  
  // Card shadows
  card: {
    default: shadows.sm,
    hover: shadows.md,
    elevated: shadows.lg,
    floating: shadows.xl,
  },
  
  // Modal shadows
  modal: {
    backdrop: '0 0 0 1000px rgba(0, 0, 0, 0.5)',
    content: shadows['2xl'],
  },
  
  // Dropdown shadows
  dropdown: {
    default: shadows.lg,
    menu: shadows.xl,
  },
  
  // Tooltip shadows
  tooltip: {
    default: shadows.md,
    arrow: shadows.sm,
  },
  
  // Input shadows
  input: {
    default: shadows.none,
    focus: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    error: '0 0 0 3px rgba(239, 68, 68, 0.1)',
    success: '0 0 0 3px rgba(34, 197, 94, 0.1)',
  },
  
  // Navigation shadows
  navigation: {
    header: shadows.sm,
    sidebar: shadows.md,
    breadcrumb: shadows.sm,
  },
  
  // Table shadows
  table: {
    header: shadows.sm,
    row: shadows.none,
    rowHover: shadows.sm,
  },
  
  // Progress shadows
  progress: {
    track: shadows.inner,
    bar: shadows.sm,
  },
  
  // Badge shadows
  badge: {
    default: shadows.sm,
    floating: shadows.md,
  },
  
  // Avatar shadows
  avatar: {
    default: shadows.sm,
    ring: '0 0 0 2px rgba(255, 255, 255, 0.8)',
  },
};

// Interactive shadows
export const interactiveShadows = {
  // Hover effects
  hover: {
    sm: shadows.md,
    md: shadows.lg,
    lg: shadows.xl,
  },
  
  // Active effects
  active: {
    sm: shadows.inner,
    md: shadows.sm,
    lg: shadows.md,
  },
  
  // Focus effects
  focus: {
    ring: '0 0 0 3px rgba(59, 130, 246, 0.5)',
    ringOffset: '0 0 0 2px rgba(255, 255, 255, 0.8), 0 0 0 4px rgba(59, 130, 246, 0.5)',
  },
  
  // Press effects
  press: {
    sm: shadows.inner,
    md: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
    lg: 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.1)',
  },
};

// Status shadows
export const statusShadows = {
  success: {
    default: '0 0 0 3px rgba(34, 197, 94, 0.1)',
    focus: '0 0 0 3px rgba(34, 197, 94, 0.3)',
  },
  warning: {
    default: '0 0 0 3px rgba(245, 158, 11, 0.1)',
    focus: '0 0 0 3px rgba(245, 158, 11, 0.3)',
  },
  error: {
    default: '0 0 0 3px rgba(239, 68, 68, 0.1)',
    focus: '0 0 0 3px rgba(239, 68, 68, 0.3)',
  },
  info: {
    default: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    focus: '0 0 0 3px rgba(59, 130, 246, 0.3)',
  },
};

// Theme-specific shadows
export const themeShadows = {
  light: {
    ...shadows,
    ...componentShadows,
    ...interactiveShadows,
    ...statusShadows,
  },
  dark: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
  },
};

// Shadow utilities
export const shadowUtils = {
  // Get shadow value
  get: (key: keyof ShadowScale): string => shadows[key],
  
  // Get component shadow
  getComponent: (component: keyof typeof componentShadows, state: string): string => {
    const comp = componentShadows[component];
    return (comp as any)[state] || shadows.none;
  },
  
  // Get interactive shadow
  getInteractive: (type: 'hover' | 'active' | 'focus' | 'press', size: 'sm' | 'md' | 'lg'): string => {
    const interactive = interactiveShadows[type];
    return (interactive as any)[size] || shadows.none;
  },
  
  // Get status shadow
  getStatus: (status: 'success' | 'warning' | 'error' | 'info', type: 'default' | 'focus'): string => {
    const statusShadow = statusShadows[status];
    return (statusShadow as any)[type] || shadows.none;
  },
  
  // Create custom shadow
  create: (x: number, y: number, blur: number, spread: number, color: string): string => {
    return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
  },
  
  // Create multiple shadows
  combine: (...shadows: string[]): string => {
    return shadows.filter(Boolean).join(', ');
  },
  
  // Get shadow for theme
  getForTheme: (theme: 'light' | 'dark', key: string): string => {
    const themeShadow = themeShadows[theme];
    return (themeShadow as any)[key] || shadows.none;
  },
  
  // Convert to CSS custom property
  toCSSVar: (value: string): string => `var(--shadow-${value})`,
  
  // Get shadow intensity
  getIntensity: (shadow: string): number => {
    const matches = shadow.match(/rgba\([^)]+\)/g);
    if (matches) {
      const alpha = matches[0].match(/,\s*([0-9.]+)\)/);
      return alpha ? parseFloat(alpha[1]) : 0;
    }
    return 0;
  },
};

// Export all shadows
export const shadowTokens = {
  shadows,
  shadowColors,
  componentShadows,
  interactiveShadows,
  statusShadows,
  themeShadows,
  utils: shadowUtils,
};

export default shadowTokens;
