// Component Library Types and Interfaces

import { ReactNode, CSSProperties, HTMLAttributes } from "react";

// Base component props
export interface BaseComponentProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  id?: string;
  "data-testid"?: string;
}

// Size variants
export type Size = "xs" | "sm" | "md" | "lg" | "xl";

// Color variants
export type Color =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info";

// Variant types
export type Variant = "solid" | "outline" | "ghost" | "link";

// Component states
export type ComponentState =
  | "default"
  | "hover"
  | "active"
  | "focus"
  | "disabled"
  | "loading";

// Theme variants
export type ThemeVariant = "light" | "dark";

// Responsive breakpoints
export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

// Responsive values
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

// Component variants
export interface ComponentVariants {
  size?: Size;
  color?: Color;
  variant?: Variant;
  state?: ComponentState;
  theme?: ThemeVariant;
}

// Animation props
export interface AnimationProps {
  animate?: boolean;
  duration?: number;
  delay?: number;
  easing?: string;
  direction?: "normal" | "reverse" | "alternate" | "alternate-reverse";
  fillMode?: "none" | "forwards" | "backwards" | "both";
  iterationCount?: number | "infinite";
}

// Accessibility props
export interface AccessibilityProps {
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-expanded"?: boolean;
  "aria-selected"?: boolean;
  "aria-checked"?: boolean;
  "aria-disabled"?: boolean;
  "aria-hidden"?: boolean;
  "aria-live"?: "off" | "polite" | "assertive";
  "aria-atomic"?: boolean;
  "aria-busy"?: boolean;
  role?: string;
  tabIndex?: number;
}

// Focus props
export interface FocusProps {
  autoFocus?: boolean;
  onFocus?: (event: React.FocusEvent) => void;
  onBlur?: (event: React.FocusEvent) => void;
}

// Click props
export interface ClickProps {
  onClick?: (event: React.MouseEvent) => void;
  onDoubleClick?: (event: React.MouseEvent) => void;
  onContextMenu?: (event: React.MouseEvent) => void;
}

// Keyboard props
export interface KeyboardProps {
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onKeyUp?: (event: React.KeyboardEvent) => void;
  onKeyPress?: (event: React.KeyboardEvent) => void;
}

// Form props
export interface FormProps {
  name?: string;
  value?: any;
  defaultValue?: any;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  onChange?: (value: any) => void;
  onBlur?: (event: React.FocusEvent) => void;
  onFocus?: (event: React.FocusEvent) => void;
}

// Validation props
export interface ValidationProps {
  error?: boolean;
  errorMessage?: string;
  success?: boolean;
  successMessage?: string;
  warning?: boolean;
  warningMessage?: string;
  info?: boolean;
  infoMessage?: string;
}

// Layout props
export interface LayoutProps {
  width?: ResponsiveValue<string | number>;
  height?: ResponsiveValue<string | number>;
  minWidth?: ResponsiveValue<string | number>;
  minHeight?: ResponsiveValue<string | number>;
  maxWidth?: ResponsiveValue<string | number>;
  maxHeight?: ResponsiveValue<string | number>;
  padding?: ResponsiveValue<string | number>;
  margin?: ResponsiveValue<string | number>;
  display?: ResponsiveValue<CSSProperties["display"]>;
  position?: ResponsiveValue<CSSProperties["position"]>;
  top?: ResponsiveValue<string | number>;
  right?: ResponsiveValue<string | number>;
  bottom?: ResponsiveValue<string | number>;
  left?: ResponsiveValue<string | number>;
  zIndex?: ResponsiveValue<number>;
}

// Flexbox props
export interface FlexProps {
  direction?: ResponsiveValue<CSSProperties["flexDirection"]>;
  wrap?: ResponsiveValue<CSSProperties["flexWrap"]>;
  justify?: ResponsiveValue<CSSProperties["justifyContent"]>;
  align?: ResponsiveValue<CSSProperties["alignItems"]>;
  alignContent?: ResponsiveValue<CSSProperties["alignContent"]>;
  gap?: ResponsiveValue<string | number>;
  grow?: ResponsiveValue<number>;
  shrink?: ResponsiveValue<number>;
  basis?: ResponsiveValue<string | number>;
}

// Grid props
export interface GridProps {
  columns?: ResponsiveValue<number | string>;
  rows?: ResponsiveValue<number | string>;
  gap?: ResponsiveValue<string | number>;
  columnGap?: ResponsiveValue<string | number>;
  rowGap?: ResponsiveValue<string | number>;
  autoColumns?: ResponsiveValue<string>;
  autoRows?: ResponsiveValue<string>;
  autoFlow?: ResponsiveValue<CSSProperties["gridAutoFlow"]>;
  justifyItems?: ResponsiveValue<CSSProperties["justifyItems"]>;
  alignItems?: ResponsiveValue<CSSProperties["alignItems"]>;
  justifyContent?: ResponsiveValue<CSSProperties["justifyContent"]>;
  alignContent?: ResponsiveValue<CSSProperties["alignContent"]>;
}

// Spacing props
export interface SpacingProps {
  p?: ResponsiveValue<string | number>;
  pt?: ResponsiveValue<string | number>;
  pr?: ResponsiveValue<string | number>;
  pb?: ResponsiveValue<string | number>;
  pl?: ResponsiveValue<string | number>;
  px?: ResponsiveValue<string | number>;
  py?: ResponsiveValue<string | number>;
  m?: ResponsiveValue<string | number>;
  mt?: ResponsiveValue<string | number>;
  mr?: ResponsiveValue<string | number>;
  mb?: ResponsiveValue<string | number>;
  ml?: ResponsiveValue<string | number>;
  mx?: ResponsiveValue<string | number>;
  my?: ResponsiveValue<string | number>;
}

// Typography props
export interface TypographyProps {
  fontSize?: ResponsiveValue<string | number>;
  fontWeight?: ResponsiveValue<CSSProperties["fontWeight"]>;
  lineHeight?: ResponsiveValue<string | number>;
  letterSpacing?: ResponsiveValue<string | number>;
  textAlign?: ResponsiveValue<CSSProperties["textAlign"]>;
  textDecoration?: ResponsiveValue<CSSProperties["textDecoration"]>;
  textTransform?: ResponsiveValue<CSSProperties["textTransform"]>;
  fontFamily?: ResponsiveValue<string>;
  color?: ResponsiveValue<string>;
}

// Border props
export interface BorderProps {
  border?: ResponsiveValue<string>;
  borderWidth?: ResponsiveValue<string | number>;
  borderStyle?: ResponsiveValue<CSSProperties["borderStyle"]>;
  borderColor?: ResponsiveValue<string>;
  borderRadius?: ResponsiveValue<string | number>;
  borderTop?: ResponsiveValue<string>;
  borderRight?: ResponsiveValue<string>;
  borderBottom?: ResponsiveValue<string>;
  borderLeft?: ResponsiveValue<string>;
}

// Shadow props
export interface ShadowProps {
  boxShadow?: ResponsiveValue<string>;
  textShadow?: ResponsiveValue<string>;
}

// Background props
export interface BackgroundProps {
  backgroundColor?: ResponsiveValue<string>;
  backgroundImage?: ResponsiveValue<string>;
  backgroundSize?: ResponsiveValue<CSSProperties["backgroundSize"]>;
  backgroundPosition?: ResponsiveValue<CSSProperties["backgroundPosition"]>;
  backgroundRepeat?: ResponsiveValue<CSSProperties["backgroundRepeat"]>;
  backgroundAttachment?: ResponsiveValue<CSSProperties["backgroundAttachment"]>;
}

// Transform props
export interface TransformProps {
  transform?: ResponsiveValue<string>;
  transformOrigin?: ResponsiveValue<string>;
  transition?: ResponsiveValue<string>;
  transitionProperty?: ResponsiveValue<string>;
  transitionDuration?: ResponsiveValue<string | number>;
  transitionTimingFunction?: ResponsiveValue<string>;
  transitionDelay?: ResponsiveValue<string | number>;
}

// Component composition
export interface ComponentComposition {
  as?: keyof JSX.IntrinsicElements | React.ComponentType<any>;
  forwardRef?: boolean;
  shouldForwardProp?: (prop: string) => boolean;
}

// Component configuration
export interface ComponentConfig {
  name: string;
  displayName?: string;
  defaultProps?: Record<string, any>;
  propTypes?: Record<string, any>;
  variants?: Record<string, any>;
  compoundVariants?: Array<{
    variants: Record<string, any>;
    style: Record<string, any>;
  }>;
}

// Component theme
export interface ComponentTheme {
  base?: Record<string, any>;
  variants?: Record<string, Record<string, any>>;
  sizes?: Record<string, Record<string, any>>;
  colors?: Record<string, Record<string, any>>;
  states?: Record<string, Record<string, any>>;
  animations?: Record<string, any>;
  transitions?: Record<string, any>;
}

// Component context
export interface ComponentContext {
  theme?: ComponentTheme;
  variants?: ComponentVariants;
  state?: ComponentState;
  disabled?: boolean;
  loading?: boolean;
  error?: boolean;
  size?: Size;
  color?: Color;
}

// Component ref
export interface ComponentRef<T = HTMLElement> {
  current: T | null;
  focus?: () => void;
  blur?: () => void;
  click?: () => void;
}

// Component forward ref
export type ComponentForwardRef<T, P = {}> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<T>
>;

// Component with variants
export interface ComponentWithVariants<P = {}, V = {}> extends React.FC<P> {
  variants?: V;
  defaultProps?: Partial<P>;
}

// Polymorphic component
export interface PolymorphicComponent<
  P = {},
  D extends React.ElementType = "div",
> {
  <C extends React.ElementType = D>(
    props: P & { as?: C } & Omit<React.ComponentPropsWithoutRef<C>, keyof P>,
  ): JSX.Element;
}

// Component utilities
export interface ComponentUtils {
  createVariant: <T>(variants: Record<string, T>) => (variant: string) => T;
  createSize: <T>(sizes: Record<string, T>) => (size: string) => T;
  createColor: <T>(colors: Record<string, T>) => (color: string) => T;
  createState: <T>(states: Record<string, T>) => (state: string) => T;
  mergeProps: <T>(...props: Partial<T>[]) => T;
  omitProps: <T, K extends keyof T>(props: T, keys: K[]) => Omit<T, K>;
  pickProps: <T, K extends keyof T>(props: T, keys: K[]) => Pick<T, K>;
}

// Export all types
export type { ReactNode, CSSProperties, HTMLAttributes };
