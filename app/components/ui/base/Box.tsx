// Base Box Component

import React, { forwardRef } from "react";
import {
  BaseComponentProps,
  LayoutProps,
  SpacingProps,
  BorderProps,
  BackgroundProps,
  ShadowProps,
  TypographyProps,
  ComponentComposition,
} from "../types";

export interface BoxProps
  extends BaseComponentProps,
    LayoutProps,
    SpacingProps,
    BorderProps,
    BackgroundProps,
    ShadowProps,
    TypographyProps,
    ComponentComposition {
  // Additional Box-specific props
  as?: keyof JSX.IntrinsicElements;
  ref?: React.Ref<HTMLElement>;
}

const Box = forwardRef<HTMLElement, BoxProps>(
  (
    {
      as: Component = "div",
      children,
      className,
      style,
      id,
      "data-testid": testId,
      // Layout props
      width,
      height,
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
      padding,
      margin,
      display,
      position,
      top,
      right,
      bottom,
      left,
      zIndex,
      // Spacing props
      p,
      pt,
      pr,
      pb,
      pl,
      px,
      py,
      m,
      mt,
      mr,
      mb,
      ml,
      mx,
      my,
      // Border props
      border,
      borderWidth,
      borderStyle,
      borderColor,
      borderRadius,
      borderTop,
      borderRight,
      borderBottom,
      borderLeft,
      // Background props
      backgroundColor,
      backgroundImage,
      backgroundSize,
      backgroundPosition,
      backgroundRepeat,
      backgroundAttachment,
      // Shadow props
      boxShadow,
      textShadow,
      // Typography props
      fontSize,
      fontWeight,
      lineHeight,
      letterSpacing,
      textAlign,
      textDecoration,
      textTransform,
      fontFamily,
      color,
      ...rest
    },
    ref,
  ) => {
    // Build responsive styles
    const buildResponsiveStyle = (value: any, property: string) => {
      if (typeof value === "object" && value !== null) {
        // Handle responsive values
        const styles: Record<string, any> = {};
        Object.entries(value).forEach(([breakpoint, val]) => {
          if (breakpoint === "xs") {
            styles[property] = val;
          } else {
            const mediaQuery = `@media (min-width: ${getBreakpointValue(
              breakpoint,
            )}px)`;
            styles[mediaQuery] = { [property]: val };
          }
        });
        return styles;
      }
      return { [property]: value };
    };

    const getBreakpointValue = (breakpoint: string): number => {
      const breakpoints: Record<string, number> = {
        xs: 0,
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        "2xl": 1536,
      };
      return breakpoints[breakpoint] || 0;
    };

    // Combine all styles
    const combinedStyle: React.CSSProperties = {
      ...style,
      // Layout styles
      ...(width && buildResponsiveStyle(width, "width")),
      ...(height && buildResponsiveStyle(height, "height")),
      ...(minWidth && buildResponsiveStyle(minWidth, "minWidth")),
      ...(minHeight && buildResponsiveStyle(minHeight, "minHeight")),
      ...(maxWidth && buildResponsiveStyle(maxWidth, "maxWidth")),
      ...(maxHeight && buildResponsiveStyle(maxHeight, "maxHeight")),
      ...(padding && buildResponsiveStyle(padding, "padding")),
      ...(margin && buildResponsiveStyle(margin, "margin")),
      ...(display && buildResponsiveStyle(display, "display")),
      ...(position && buildResponsiveStyle(position, "position")),
      ...(top && buildResponsiveStyle(top, "top")),
      ...(right && buildResponsiveStyle(right, "right")),
      ...(bottom && buildResponsiveStyle(bottom, "bottom")),
      ...(left && buildResponsiveStyle(left, "left")),
      ...(zIndex && buildResponsiveStyle(zIndex, "zIndex")),
      // Spacing styles
      ...(p && buildResponsiveStyle(p, "padding")),
      ...(pt && buildResponsiveStyle(pt, "paddingTop")),
      ...(pr && buildResponsiveStyle(pr, "paddingRight")),
      ...(pb && buildResponsiveStyle(pb, "paddingBottom")),
      ...(pl && buildResponsiveStyle(pl, "paddingLeft")),
      ...(px && buildResponsiveStyle(px, "paddingLeft")),
      ...(px && buildResponsiveStyle(px, "paddingRight")),
      ...(py && buildResponsiveStyle(py, "paddingTop")),
      ...(py && buildResponsiveStyle(py, "paddingBottom")),
      ...(m && buildResponsiveStyle(m, "margin")),
      ...(mt && buildResponsiveStyle(mt, "marginTop")),
      ...(mr && buildResponsiveStyle(mr, "marginRight")),
      ...(mb && buildResponsiveStyle(mb, "marginBottom")),
      ...(ml && buildResponsiveStyle(ml, "marginLeft")),
      ...(mx && buildResponsiveStyle(mx, "marginLeft")),
      ...(mx && buildResponsiveStyle(mx, "marginRight")),
      ...(my && buildResponsiveStyle(my, "marginTop")),
      ...(my && buildResponsiveStyle(my, "marginBottom")),
      // Border styles
      ...(border && buildResponsiveStyle(border, "border")),
      ...(borderWidth && buildResponsiveStyle(borderWidth, "borderWidth")),
      ...(borderStyle && buildResponsiveStyle(borderStyle, "borderStyle")),
      ...(borderColor && buildResponsiveStyle(borderColor, "borderColor")),
      ...(borderRadius && buildResponsiveStyle(borderRadius, "borderRadius")),
      ...(borderTop && buildResponsiveStyle(borderTop, "borderTop")),
      ...(borderRight && buildResponsiveStyle(borderRight, "borderRight")),
      ...(borderBottom && buildResponsiveStyle(borderBottom, "borderBottom")),
      ...(borderLeft && buildResponsiveStyle(borderLeft, "borderLeft")),
      // Background styles
      ...(backgroundColor &&
        buildResponsiveStyle(backgroundColor, "backgroundColor")),
      ...(backgroundImage &&
        buildResponsiveStyle(backgroundImage, "backgroundImage")),
      ...(backgroundSize &&
        buildResponsiveStyle(backgroundSize, "backgroundSize")),
      ...(backgroundPosition &&
        buildResponsiveStyle(backgroundPosition, "backgroundPosition")),
      ...(backgroundRepeat &&
        buildResponsiveStyle(backgroundRepeat, "backgroundRepeat")),
      ...(backgroundAttachment &&
        buildResponsiveStyle(backgroundAttachment, "backgroundAttachment")),
      // Shadow styles
      ...(boxShadow && buildResponsiveStyle(boxShadow, "boxShadow")),
      ...(textShadow && buildResponsiveStyle(textShadow, "textShadow")),
      // Typography styles
      ...(fontSize && buildResponsiveStyle(fontSize, "fontSize")),
      ...(fontWeight && buildResponsiveStyle(fontWeight, "fontWeight")),
      ...(lineHeight && buildResponsiveStyle(lineHeight, "lineHeight")),
      ...(letterSpacing &&
        buildResponsiveStyle(letterSpacing, "letterSpacing")),
      ...(textAlign && buildResponsiveStyle(textAlign, "textAlign")),
      ...(textDecoration &&
        buildResponsiveStyle(textDecoration, "textDecoration")),
      ...(textTransform &&
        buildResponsiveStyle(textTransform, "textTransform")),
      ...(fontFamily && buildResponsiveStyle(fontFamily, "fontFamily")),
      ...(color && buildResponsiveStyle(color, "color")),
    };

    return (
      <Component
        ref={ref}
        className={className}
        style={combinedStyle}
        id={id}
        data-testid={testId}
        {...rest}
      >
        {children}
      </Component>
    );
  },
);

Box.displayName = "Box";

export default Box;
