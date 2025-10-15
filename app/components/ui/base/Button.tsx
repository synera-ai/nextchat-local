// Base Button Component

import React, { forwardRef } from "react";
import {
  BaseComponentProps,
  ComponentVariants,
  AccessibilityProps,
  FocusProps,
  ClickProps,
  KeyboardProps,
} from "../types";

export interface ButtonProps
  extends BaseComponentProps,
    ComponentVariants,
    AccessibilityProps,
    FocusProps,
    ClickProps,
    KeyboardProps {
  // Button-specific props
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loadingText?: string;
  loadingSpinner?: React.ReactNode;
  // Event handlers
  onMouseEnter?: (event: React.MouseEvent) => void;
  onMouseLeave?: (event: React.MouseEvent) => void;
  onMouseDown?: (event: React.MouseEvent) => void;
  onMouseUp?: (event: React.MouseEvent) => void;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      style,
      id,
      "data-testid": testId,
      // Button props
      type = "button",
      disabled = false,
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      loadingText,
      loadingSpinner,
      // Variants
      size = "md",
      color = "primary",
      variant = "solid",
      state = "default",
      // Accessibility
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      "aria-disabled": ariaDisabled,
      role = "button",
      tabIndex,
      // Events
      onClick,
      onDoubleClick,
      onContextMenu,
      onFocus,
      onBlur,
      onKeyDown,
      onKeyUp,
      onKeyPress,
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onMouseUp,
      ...rest
    },
    ref,
  ) => {
    // Determine if button is actually disabled
    const isDisabled = disabled || loading;

    // Build class names
    const buildClassName = () => {
      const baseClasses = ["btn"];

      // Size classes
      baseClasses.push(`btn--${size}`);

      // Color classes
      baseClasses.push(`btn--${color}`);

      // Variant classes
      baseClasses.push(`btn--${variant}`);

      // State classes
      if (isDisabled) baseClasses.push("btn--disabled");
      if (loading) baseClasses.push("btn--loading");
      if (fullWidth) baseClasses.push("btn--full-width");

      // Custom className
      if (className) baseClasses.push(className);

      return baseClasses.join(" ");
    };

    // Handle click events
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    // Handle key events
    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      // Handle Enter and Space keys for button activation
      if (event.key === "Enter" || event.key === " ") {
        if (!isDisabled) {
          event.preventDefault();
          onClick?.(event as any);
        }
      }
      onKeyDown?.(event);
    };

    // Render loading spinner
    const renderLoadingSpinner = () => {
      if (!loading) return null;

      if (loadingSpinner) {
        return loadingSpinner;
      }

      return (
        <span className="btn__spinner" aria-hidden="true">
          <svg
            className="btn__spinner-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
        </span>
      );
    };

    // Render button content
    const renderContent = () => {
      if (loading && loadingText) {
        return (
          <>
            {renderLoadingSpinner()}
            <span className="btn__loading-text">{loadingText}</span>
          </>
        );
      }

      return (
        <>
          {leftIcon && <span className="btn__left-icon">{leftIcon}</span>}
          {children && <span className="btn__content">{children}</span>}
          {rightIcon && <span className="btn__right-icon">{rightIcon}</span>}
          {renderLoadingSpinner()}
        </>
      );
    };

    return (
      <button
        ref={ref}
        type={type}
        className={buildClassName()}
        style={style}
        id={id}
        data-testid={testId}
        disabled={isDisabled}
        // Accessibility
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-disabled={isDisabled || ariaDisabled}
        role={role}
        tabIndex={isDisabled ? -1 : tabIndex}
        // Events
        onClick={handleClick}
        onDoubleClick={onDoubleClick}
        onContextMenu={onContextMenu}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        onKeyUp={onKeyUp}
        onKeyPress={onKeyPress}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        {...rest}
      >
        {renderContent()}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
