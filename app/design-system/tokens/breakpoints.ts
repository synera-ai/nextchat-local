// Design tokens for breakpoints

export interface BreakpointScale {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface ContainerMaxWidths {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

// Breakpoint definitions
export const breakpoints: BreakpointScale = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Container max widths
export const containerMaxWidths: ContainerMaxWidths = {
  xs: '100%',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Media query helpers
export const mediaQueries = {
  // Mobile first approach
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
  
  // Max width queries
  xsMax: `@media (max-width: ${parseInt(breakpoints.sm) - 1}px)`,
  smMax: `@media (max-width: ${parseInt(breakpoints.md) - 1}px)`,
  mdMax: `@media (max-width: ${parseInt(breakpoints.lg) - 1}px)`,
  lgMax: `@media (max-width: ${parseInt(breakpoints.xl) - 1}px)`,
  xlMax: `@media (max-width: ${parseInt(breakpoints['2xl']) - 1}px)`,
  
  // Range queries
  smToMd: `@media (min-width: ${breakpoints.sm}) and (max-width: ${parseInt(breakpoints.md) - 1}px)`,
  mdToLg: `@media (min-width: ${breakpoints.md}) and (max-width: ${parseInt(breakpoints.lg) - 1}px)`,
  lgToXl: `@media (min-width: ${breakpoints.lg}) and (max-width: ${parseInt(breakpoints.xl) - 1}px)`,
  xlTo2xl: `@media (min-width: ${breakpoints.xl}) and (max-width: ${parseInt(breakpoints['2xl']) - 1}px)`,
  
  // Orientation queries
  portrait: '@media (orientation: portrait)',
  landscape: '@media (orientation: landscape)',
  
  // Device queries
  touch: '@media (hover: none) and (pointer: coarse)',
  noTouch: '@media (hover: hover) and (pointer: fine)',
  
  // Reduced motion
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
  noReducedMotion: '@media (prefers-reduced-motion: no-preference)',
  
  // High contrast
  highContrast: '@media (prefers-contrast: high)',
  lowContrast: '@media (prefers-contrast: low)',
  
  // Color scheme
  dark: '@media (prefers-color-scheme: dark)',
  light: '@media (prefers-color-scheme: light)',
};

// Responsive utilities
export const responsiveUtils = {
  // Get breakpoint value
  get: (key: keyof BreakpointScale): string => breakpoints[key],
  
  // Get container max width
  getContainerMaxWidth: (key: keyof ContainerMaxWidths): string => containerMaxWidths[key],
  
  // Get media query
  getMediaQuery: (key: keyof typeof mediaQueries): string => mediaQueries[key],
  
  // Check if breakpoint is active
  isBreakpointActive: (breakpoint: keyof BreakpointScale, width: number): boolean => {
    const breakpointValue = parseInt(breakpoints[breakpoint]);
    return width >= breakpointValue;
  },
  
  // Get current breakpoint
  getCurrentBreakpoint: (width: number): keyof BreakpointScale => {
    if (width >= parseInt(breakpoints['2xl'])) return '2xl';
    if (width >= parseInt(breakpoints.xl)) return 'xl';
    if (width >= parseInt(breakpoints.lg)) return 'lg';
    if (width >= parseInt(breakpoints.md)) return 'md';
    if (width >= parseInt(breakpoints.sm)) return 'sm';
    return 'xs';
  },
  
  // Get responsive value
  getResponsiveValue: <T>(
    values: Partial<Record<keyof BreakpointScale, T>>,
    currentBreakpoint: keyof BreakpointScale
  ): T | undefined => {
    const breakpointOrder: (keyof BreakpointScale)[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
    
    for (let i = currentIndex; i >= 0; i--) {
      const breakpoint = breakpointOrder[i];
      if (values[breakpoint] !== undefined) {
        return values[breakpoint];
      }
    }
    
    return undefined;
  },
  
  // Create responsive CSS
  createResponsiveCSS: (property: string, values: Partial<Record<keyof BreakpointScale, string>>): string => {
    let css = '';
    
    // Base value (xs)
    if (values.xs) {
      css += `${property}: ${values.xs};\n`;
    }
    
    // Responsive values
    Object.entries(values).forEach(([breakpoint, value]) => {
      if (breakpoint !== 'xs' && value) {
        css += `${mediaQueries[breakpoint as keyof typeof mediaQueries]} {\n`;
        css += `  ${property}: ${value};\n`;
        css += `}\n`;
      }
    });
    
    return css;
  },
  
  // Get grid columns for breakpoint
  getGridColumns: (breakpoint: keyof BreakpointScale): number => {
    const gridColumns: Record<keyof BreakpointScale, number> = {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 5,
      '2xl': 6,
    };
    return gridColumns[breakpoint];
  },
  
  // Get spacing for breakpoint
  getSpacingForBreakpoint: (breakpoint: keyof BreakpointScale): string => {
    const spacing: Record<keyof BreakpointScale, string> = {
      xs: '1rem',
      sm: '1.5rem',
      md: '2rem',
      lg: '2.5rem',
      xl: '3rem',
      '2xl': '4rem',
    };
    return spacing[breakpoint];
  },
};

// Device-specific breakpoints
export const deviceBreakpoints = {
  // Mobile devices
  mobile: {
    portrait: '320px',
    landscape: '568px',
  },
  
  // Tablet devices
  tablet: {
    portrait: '768px',
    landscape: '1024px',
  },
  
  // Desktop devices
  desktop: {
    small: '1280px',
    medium: '1440px',
    large: '1920px',
  },
  
  // Ultra-wide devices
  ultrawide: {
    standard: '2560px',
    wide: '3440px',
  },
};

// Container queries (for component-level responsiveness)
export const containerQueries = {
  xs: '@container (min-width: 0px)',
  sm: '@container (min-width: 320px)',
  md: '@container (min-width: 640px)',
  lg: '@container (min-width: 1024px)',
  xl: '@container (min-width: 1280px)',
};

// Breakpoint utilities
export const breakpointUtils = {
  // Get device type
  getDeviceType: (width: number): 'mobile' | 'tablet' | 'desktop' | 'ultrawide' => {
    if (width < parseInt(breakpoints.md)) return 'mobile';
    if (width < parseInt(breakpoints.lg)) return 'tablet';
    if (width < parseInt(breakpoints['2xl'])) return 'desktop';
    return 'ultrawide';
  },
  
  // Get orientation
  getOrientation: (width: number, height: number): 'portrait' | 'landscape' => {
    return width > height ? 'landscape' : 'portrait';
  },
  
  // Get pixel density
  getPixelDensity: (): number => {
    return typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  },
  
  // Get viewport dimensions
  getViewportDimensions: (): { width: number; height: number } => {
    if (typeof window !== 'undefined') {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
    return { width: 0, height: 0 };
  },
  
  // Check if device supports touch
  isTouchDevice: (): boolean => {
    return typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  },
  
  // Check if device prefers reduced motion
  prefersReducedMotion: (): boolean => {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
  
  // Check if device prefers dark mode
  prefersDarkMode: (): boolean => {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  },
};

// Export all breakpoints
export const breakpointTokens = {
  breakpoints,
  containerMaxWidths,
  mediaQueries,
  deviceBreakpoints,
  containerQueries,
  responsiveUtils,
  breakpointUtils,
};

export default breakpointTokens;
