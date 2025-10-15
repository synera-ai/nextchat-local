// Design tokens for spacing

export interface SpacingScale {
  0: string;
  px: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  14: string;
  16: string;
  20: string;
  24: string;
  28: string;
  32: string;
  36: string;
  40: string;
  44: string;
  48: string;
  52: string;
  56: string;
  60: string;
  64: string;
  72: string;
  80: string;
  96: string;
}

export interface LayoutSpacing {
  container: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  section: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  component: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Base spacing scale (using 4px base unit)
export const spacing: SpacingScale = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
};

// Layout spacing
export const layoutSpacing: LayoutSpacing = {
  container: {
    xs: spacing[4],   // 16px
    sm: spacing[6],   // 24px
    md: spacing[8],   // 32px
    lg: spacing[12],  // 48px
    xl: spacing[16],  // 64px
    '2xl': spacing[24], // 96px
  },
  section: {
    xs: spacing[8],   // 32px
    sm: spacing[12],  // 48px
    md: spacing[16],  // 64px
    lg: spacing[20],  // 80px
    xl: spacing[24],  // 96px
  },
  component: {
    xs: spacing[2],   // 8px
    sm: spacing[3],   // 12px
    md: spacing[4],   // 16px
    lg: spacing[6],   // 24px
    xl: spacing[8],   // 32px
  },
};

// Semantic spacing
export const semanticSpacing = {
  // Padding
  padding: {
    xs: spacing[1],   // 4px
    sm: spacing[2],   // 8px
    md: spacing[3],   // 12px
    lg: spacing[4],   // 16px
    xl: spacing[6],   // 24px
  },
  
  // Margin
  margin: {
    xs: spacing[1],   // 4px
    sm: spacing[2],   // 8px
    md: spacing[3],   // 12px
    lg: spacing[4],   // 16px
    xl: spacing[6],   // 24px
  },
  
  // Gap
  gap: {
    xs: spacing[1],   // 4px
    sm: spacing[2],   // 8px
    md: spacing[3],   // 12px
    lg: spacing[4],   // 16px
    xl: spacing[6],   // 24px
  },
  
  // Border radius
  radius: {
    none: '0',
    sm: '0.125rem',   // 2px
    md: '0.25rem',    // 4px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },
};

// Component-specific spacing
export const componentSpacing = {
  // Button spacing
  button: {
    padding: {
      sm: `${spacing[2]} ${spacing[3]}`,  // 8px 12px
      md: `${spacing[2.5]} ${spacing[4]}`, // 10px 16px
      lg: `${spacing[3]} ${spacing[6]}`,   // 12px 24px
    },
    gap: spacing[2], // 8px
  },
  
  // Input spacing
  input: {
    padding: {
      sm: `${spacing[2]} ${spacing[3]}`,  // 8px 12px
      md: `${spacing[2.5]} ${spacing[4]}`, // 10px 16px
      lg: `${spacing[3]} ${spacing[4]}`,   // 12px 16px
    },
    gap: spacing[2], // 8px
  },
  
  // Card spacing
  card: {
    padding: {
      sm: spacing[4], // 16px
      md: spacing[6], // 24px
      lg: spacing[8], // 32px
    },
    gap: spacing[4], // 16px
  },
  
  // Modal spacing
  modal: {
    padding: {
      sm: spacing[6], // 24px
      md: spacing[8], // 32px
      lg: spacing[12], // 48px
    },
    gap: spacing[6], // 24px
  },
  
  // Navigation spacing
  navigation: {
    padding: {
      sm: `${spacing[2]} ${spacing[3]}`,  // 8px 12px
      md: `${spacing[3]} ${spacing[4]}`,  // 12px 16px
      lg: `${spacing[4]} ${spacing[6]}`,  // 16px 24px
    },
    gap: spacing[4], // 16px
  },
};

// Responsive spacing
export const responsiveSpacing = {
  // Mobile-first approach
  mobile: {
    container: spacing[4],   // 16px
    section: spacing[8],     // 32px
    component: spacing[3],   // 12px
  },
  tablet: {
    container: spacing[6],   // 24px
    section: spacing[12],    // 48px
    component: spacing[4],   // 16px
  },
  desktop: {
    container: spacing[8],   // 32px
    section: spacing[16],    // 64px
    component: spacing[6],   // 24px
  },
  wide: {
    container: spacing[12],  // 48px
    section: spacing[20],    // 80px
    component: spacing[8],   // 32px
  },
};

// Spacing utilities
export const spacingUtils = {
  // Get spacing value
  get: (key: keyof SpacingScale): string => spacing[key],
  
  // Get responsive spacing
  getResponsive: (breakpoint: 'mobile' | 'tablet' | 'desktop' | 'wide', type: 'container' | 'section' | 'component'): string => {
    return responsiveSpacing[breakpoint][type];
  },
  
  // Get semantic spacing
  getSemantic: (type: 'padding' | 'margin' | 'gap', size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): string => {
    return semanticSpacing[type][size];
  },
  
  // Get component spacing
  getComponent: (component: keyof typeof componentSpacing, property: string, size?: string): string => {
    const comp = componentSpacing[component];
    if (size && comp[property as keyof typeof comp] && typeof comp[property as keyof typeof comp] === 'object') {
      return (comp[property as keyof typeof comp] as any)[size];
    }
    return comp[property as keyof typeof comp] as string;
  },
  
  // Convert to CSS custom property
  toCSSVar: (value: string): string => `var(--spacing-${value})`,
  
  // Get spacing scale
  getScale: (base: number = 4, steps: number = 10): string[] => {
    return Array.from({ length: steps }, (_, i) => `${(base * (i + 1)) / 16}rem`);
  },
};

// Export all spacing
export const spacingTokens = {
  spacing,
  layoutSpacing,
  semanticSpacing,
  componentSpacing,
  responsiveSpacing,
  utils: spacingUtils,
};

export default spacingTokens;
