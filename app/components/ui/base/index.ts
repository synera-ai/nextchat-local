// Base Components Index

// Export base components
export { default as Box } from "./Box";
export { default as Button } from "./Button";
export { default as Input } from "./Input";
export { default as Tabs } from "./Tabs";

// Export types
export type { BoxProps } from "./Box";
export type { ButtonProps } from "./Button";
export type { InputProps } from "./Input";
export type { TabsProps, TabDefinition } from "./Tabs";

// Re-export types from types file
export type {
  BaseComponentProps,
  ComponentVariants,
  Size,
  Color,
  Variant,
  ComponentState,
  ThemeVariant,
  Breakpoint,
  ResponsiveValue,
  AccessibilityProps,
  FocusProps,
  ClickProps,
  KeyboardProps,
  FormProps,
  ValidationProps,
  LayoutProps,
  SpacingProps,
  BorderProps,
  BackgroundProps,
  ShadowProps,
  TypographyProps,
  ComponentComposition,
  ComponentForwardRef,
} from "../types";
