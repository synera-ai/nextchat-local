// Light theme configuration

import { colors } from '../tokens/colors';
import { typographyTokens } from '../tokens/typography';
import { spacingTokens } from '../tokens/spacing';
import { shadowTokens } from '../tokens/shadows';
import { breakpointTokens } from '../tokens/breakpoints';

export const lightTheme = {
  // Theme metadata
  name: 'light',
  displayName: 'Light Theme',
  description: 'Default light theme with high contrast and clean aesthetics',
  
  // Color palette
  colors: {
    // Background colors
    background: {
      primary: colors.lightTheme.background.primary,
      secondary: colors.lightTheme.background.secondary,
      tertiary: colors.lightTheme.background.tertiary,
      elevated: colors.lightTheme.background.elevated,
      overlay: colors.lightTheme.background.overlay,
    },
    
    // Text colors
    text: {
      primary: colors.lightTheme.text.primary,
      secondary: colors.lightTheme.text.secondary,
      tertiary: colors.lightTheme.text.tertiary,
      disabled: colors.lightTheme.text.disabled,
      inverse: colors.lightTheme.text.inverse,
    },
    
    // Border colors
    border: {
      primary: colors.lightTheme.border.primary,
      secondary: colors.lightTheme.border.secondary,
      focus: colors.lightTheme.border.focus,
      error: colors.lightTheme.border.error,
      success: colors.lightTheme.border.success,
    },
    
    // Interactive colors
    interactive: {
      primary: colors.lightTheme.interactive.primary,
      primaryHover: colors.lightTheme.interactive.primaryHover,
      primaryActive: colors.lightTheme.interactive.primaryActive,
      secondary: colors.lightTheme.interactive.secondary,
      secondaryHover: colors.lightTheme.interactive.secondaryHover,
      secondaryActive: colors.lightTheme.interactive.secondaryActive,
    },
    
    // Status colors
    status: {
      success: colors.lightTheme.status.success,
      warning: colors.lightTheme.status.warning,
      error: colors.lightTheme.status.error,
      info: colors.lightTheme.status.info,
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
    // Override specific typography for light theme
    body: {
      ...typographyTokens.typography.body,
      // Ensure good contrast in light theme
      large: {
        ...typographyTokens.typography.body.large,
        color: colors.lightTheme.text.primary,
      },
      medium: {
        ...typographyTokens.typography.body.medium,
        color: colors.lightTheme.text.primary,
      },
      small: {
        ...typographyTokens.typography.body.small,
        color: colors.lightTheme.text.secondary,
      },
    },
  },
  
  // Spacing
  spacing: {
    ...spacingTokens,
  },
  
  // Shadows
  shadows: {
    ...shadowTokens.themeShadows.light,
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
        background: colors.lightTheme.interactive.primary,
        color: colors.lightTheme.text.inverse,
        border: 'none',
        shadow: shadowTokens.componentShadows.button.default,
        hover: {
          background: colors.lightTheme.interactive.primaryHover,
          shadow: shadowTokens.componentShadows.button.hover,
        },
        active: {
          background: colors.lightTheme.interactive.primaryActive,
          shadow: shadowTokens.componentShadows.button.active,
        },
        disabled: {
          background: colors.lightTheme.text.disabled,
          color: colors.lightTheme.text.tertiary,
          shadow: shadowTokens.componentShadows.button.disabled,
        },
      },
      secondary: {
        background: colors.lightTheme.interactive.secondary,
        color: colors.lightTheme.text.primary,
        border: `1px solid ${colors.lightTheme.border.primary}`,
        shadow: shadowTokens.componentShadows.button.default,
        hover: {
          background: colors.lightTheme.interactive.secondaryHover,
          shadow: shadowTokens.componentShadows.button.hover,
        },
        active: {
          background: colors.lightTheme.interactive.secondaryActive,
          shadow: shadowTokens.componentShadows.button.active,
        },
        disabled: {
          background: colors.lightTheme.background.secondary,
          color: colors.lightTheme.text.disabled,
          border: `1px solid ${colors.lightTheme.border.secondary}`,
          shadow: shadowTokens.componentShadows.button.disabled,
        },
      },
    },
    
    // Input theme
    input: {
      background: colors.lightTheme.background.elevated,
      color: colors.lightTheme.text.primary,
      border: `1px solid ${colors.lightTheme.border.primary}`,
      shadow: shadowTokens.componentShadows.input.default,
      placeholder: {
        color: colors.lightTheme.text.tertiary,
      },
      focus: {
        border: `1px solid ${colors.lightTheme.border.focus}`,
        shadow: shadowTokens.componentShadows.input.focus,
      },
      error: {
        border: `1px solid ${colors.lightTheme.border.error}`,
        shadow: shadowTokens.componentShadows.input.error,
      },
      success: {
        border: `1px solid ${colors.lightTheme.border.success}`,
        shadow: shadowTokens.componentShadows.input.success,
      },
      disabled: {
        background: colors.lightTheme.background.secondary,
        color: colors.lightTheme.text.disabled,
        border: `1px solid ${colors.lightTheme.border.secondary}`,
      },
    },
    
    // Card theme
    card: {
      background: colors.lightTheme.background.elevated,
      border: `1px solid ${colors.lightTheme.border.primary}`,
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
        background: colors.lightTheme.background.overlay,
      },
      content: {
        background: colors.lightTheme.background.elevated,
        border: `1px solid ${colors.lightTheme.border.primary}`,
        shadow: shadowTokens.componentShadows.modal.content,
      },
    },
    
    // Navigation theme
    navigation: {
      background: colors.lightTheme.background.elevated,
      border: `1px solid ${colors.lightTheme.border.primary}`,
      shadow: shadowTokens.componentShadows.navigation.header,
      link: {
        color: colors.lightTheme.text.primary,
        hover: {
          color: colors.lightTheme.interactive.primary,
          background: colors.lightTheme.background.secondary,
        },
        active: {
          color: colors.lightTheme.interactive.primary,
          background: colors.lightTheme.background.tertiary,
        },
      },
    },
    
    // Table theme
    table: {
      background: colors.lightTheme.background.elevated,
      border: `1px solid ${colors.lightTheme.border.primary}`,
      header: {
        background: colors.lightTheme.background.secondary,
        color: colors.lightTheme.text.primary,
        shadow: shadowTokens.componentShadows.table.header,
      },
      row: {
        background: colors.lightTheme.background.elevated,
        hover: {
          background: colors.lightTheme.background.secondary,
          shadow: shadowTokens.componentShadows.table.rowHover,
        },
      },
      cell: {
        border: `1px solid ${colors.lightTheme.border.primary}`,
        color: colors.lightTheme.text.primary,
      },
    },
    
    // Badge theme
    badge: {
      success: {
        background: colors.semantic.success[100],
        color: colors.semantic.success[800],
        border: `1px solid ${colors.semantic.success[200]}`,
      },
      warning: {
        background: colors.semantic.warning[100],
        color: colors.semantic.warning[800],
        border: `1px solid ${colors.semantic.warning[200]}`,
      },
      error: {
        background: colors.semantic.error[100],
        color: colors.semantic.error[800],
        border: `1px solid ${colors.semantic.error[200]}`,
      },
      info: {
        background: colors.semantic.info[100],
        color: colors.semantic.info[800],
        border: `1px solid ${colors.semantic.info[200]}`,
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

export default lightTheme;
