// Dark theme configuration

import { colors } from '../tokens/colors';
import { typographyTokens } from '../tokens/typography';
import { spacingTokens } from '../tokens/spacing';
import { shadowTokens } from '../tokens/shadows';
import { breakpointTokens } from '../tokens/breakpoints';

export const darkTheme = {
  // Theme metadata
  name: 'dark',
  displayName: 'Dark Theme',
  description: 'Dark theme with reduced eye strain and modern aesthetics',
  
  // Color palette
  colors: {
    // Background colors
    background: {
      primary: colors.darkTheme.background.primary,
      secondary: colors.darkTheme.background.secondary,
      tertiary: colors.darkTheme.background.tertiary,
      elevated: colors.darkTheme.background.elevated,
      overlay: colors.darkTheme.background.overlay,
    },
    
    // Text colors
    text: {
      primary: colors.darkTheme.text.primary,
      secondary: colors.darkTheme.text.secondary,
      tertiary: colors.darkTheme.text.tertiary,
      disabled: colors.darkTheme.text.disabled,
      inverse: colors.darkTheme.text.inverse,
    },
    
    // Border colors
    border: {
      primary: colors.darkTheme.border.primary,
      secondary: colors.darkTheme.border.secondary,
      focus: colors.darkTheme.border.focus,
      error: colors.darkTheme.border.error,
      success: colors.darkTheme.border.success,
    },
    
    // Interactive colors
    interactive: {
      primary: colors.darkTheme.interactive.primary,
      primaryHover: colors.darkTheme.interactive.primaryHover,
      primaryActive: colors.darkTheme.interactive.primaryActive,
      secondary: colors.darkTheme.interactive.secondary,
      secondaryHover: colors.darkTheme.interactive.secondaryHover,
      secondaryActive: colors.darkTheme.interactive.secondaryActive,
    },
    
    // Status colors
    status: {
      success: colors.darkTheme.status.success,
      warning: colors.darkTheme.status.warning,
      error: colors.darkTheme.status.error,
      info: colors.darkTheme.status.info,
    },
    
    // Semantic colors
    semantic: {
      success: colors.semantic.success,
      warning: colors.semantic.warning,
      error: colors.semantic.error,
      info: colors.semantic.info,
    },
    
    // Brand colors
    brand: {
      primary: colors.primary,
      secondary: colors.secondary,
      neutral: colors.neutral,
    },
  },
  
  // Typography
  typography: {
    ...typographyTokens,
    // Override specific typography for dark theme
    body: {
      ...typographyTokens.typography.body,
      // Ensure good contrast in dark theme
      large: {
        ...typographyTokens.typography.body.large,
        color: colors.darkTheme.text.primary,
      },
      medium: {
        ...typographyTokens.typography.body.medium,
        color: colors.darkTheme.text.primary,
      },
      small: {
        ...typographyTokens.typography.body.small,
        color: colors.darkTheme.text.secondary,
      },
    },
  },
  
  // Spacing
  spacing: {
    ...spacingTokens,
  },
  
  // Shadows
  shadows: {
    ...shadowTokens.themeShadows.dark,
  },
  
  // Breakpoints
  breakpoints: {
    ...breakpointTokens,
  },
  
  // Component-specific theme overrides
  components: {
    // Button theme
    button: {
      primary: {
        background: colors.darkTheme.interactive.primary,
        color: colors.darkTheme.text.inverse,
        border: 'none',
        shadow: shadowTokens.componentShadows.button.default,
        hover: {
          background: colors.darkTheme.interactive.primaryHover,
          shadow: shadowTokens.componentShadows.button.hover,
        },
        active: {
          background: colors.darkTheme.interactive.primaryActive,
          shadow: shadowTokens.componentShadows.button.active,
        },
        disabled: {
          background: colors.darkTheme.text.disabled,
          color: colors.darkTheme.text.tertiary,
          shadow: shadowTokens.componentShadows.button.disabled,
        },
      },
      secondary: {
        background: colors.darkTheme.interactive.secondary,
        color: colors.darkTheme.text.primary,
        border: `1px solid ${colors.darkTheme.border.primary}`,
        shadow: shadowTokens.componentShadows.button.default,
        hover: {
          background: colors.darkTheme.interactive.secondaryHover,
          shadow: shadowTokens.componentShadows.button.hover,
        },
        active: {
          background: colors.darkTheme.interactive.secondaryActive,
          shadow: shadowTokens.componentShadows.button.active,
        },
        disabled: {
          background: colors.darkTheme.background.secondary,
          color: colors.darkTheme.text.disabled,
          border: `1px solid ${colors.darkTheme.border.secondary}`,
          shadow: shadowTokens.componentShadows.button.disabled,
        },
      },
    },
    
    // Input theme
    input: {
      background: colors.darkTheme.background.elevated,
      color: colors.darkTheme.text.primary,
      border: `1px solid ${colors.darkTheme.border.primary}`,
      shadow: shadowTokens.componentShadows.input.default,
      placeholder: {
        color: colors.darkTheme.text.tertiary,
      },
      focus: {
        border: `1px solid ${colors.darkTheme.border.focus}`,
        shadow: shadowTokens.componentShadows.input.focus,
      },
      error: {
        border: `1px solid ${colors.darkTheme.border.error}`,
        shadow: shadowTokens.componentShadows.input.error,
      },
      success: {
        border: `1px solid ${colors.darkTheme.border.success}`,
        shadow: shadowTokens.componentShadows.input.success,
      },
      disabled: {
        background: colors.darkTheme.background.secondary,
        color: colors.darkTheme.text.disabled,
        border: `1px solid ${colors.darkTheme.border.secondary}`,
      },
    },
    
    // Card theme
    card: {
      background: colors.darkTheme.background.elevated,
      border: `1px solid ${colors.darkTheme.border.primary}`,
      shadow: shadowTokens.componentShadows.card.default,
      hover: {
        shadow: shadowTokens.componentShadows.card.hover,
      },
      elevated: {
        shadow: shadowTokens.componentShadows.card.elevated,
      },
      floating: {
        shadow: shadowTokens.componentShadows.card.floating,
      },
    },
    
    // Modal theme
    modal: {
      backdrop: {
        background: colors.darkTheme.background.overlay,
      },
      content: {
        background: colors.darkTheme.background.elevated,
        border: `1px solid ${colors.darkTheme.border.primary}`,
        shadow: shadowTokens.componentShadows.modal.content,
      },
    },
    
    // Navigation theme
    navigation: {
      background: colors.darkTheme.background.elevated,
      border: `1px solid ${colors.darkTheme.border.primary}`,
      shadow: shadowTokens.componentShadows.navigation.header,
      link: {
        color: colors.darkTheme.text.primary,
        hover: {
          color: colors.darkTheme.interactive.primary,
          background: colors.darkTheme.background.secondary,
        },
        active: {
          color: colors.darkTheme.interactive.primary,
          background: colors.darkTheme.background.tertiary,
        },
      },
    },
    
    // Table theme
    table: {
      background: colors.darkTheme.background.elevated,
      border: `1px solid ${colors.darkTheme.border.primary}`,
      header: {
        background: colors.darkTheme.background.secondary,
        color: colors.darkTheme.text.primary,
        shadow: shadowTokens.componentShadows.table.header,
      },
      row: {
        background: colors.darkTheme.background.elevated,
        hover: {
          background: colors.darkTheme.background.secondary,
          shadow: shadowTokens.componentShadows.table.rowHover,
        },
      },
      cell: {
        border: `1px solid ${colors.darkTheme.border.primary}`,
        color: colors.darkTheme.text.primary,
      },
    },
    
    // Badge theme
    badge: {
      success: {
        background: colors.semantic.success[900],
        color: colors.semantic.success[100],
        border: `1px solid ${colors.semantic.success[700]}`,
      },
      warning: {
        background: colors.semantic.warning[900],
        color: colors.semantic.warning[100],
        border: `1px solid ${colors.semantic.warning[700]}`,
      },
      error: {
        background: colors.semantic.error[900],
        color: colors.semantic.error[100],
        border: `1px solid ${colors.semantic.error[700]}`,
      },
      info: {
        background: colors.semantic.info[900],
        color: colors.semantic.info[100],
        border: `1px solid ${colors.semantic.info[700]}`,
      },
    },
  },
  
  // Animation and transition settings
  animations: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  
  // Z-index scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

export default darkTheme;
