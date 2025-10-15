// Base Input Component

import React, { forwardRef, useState, useCallback } from "react";
import {
  BaseComponentProps,
  ComponentVariants,
  FormProps,
  ValidationProps,
  AccessibilityProps,
  FocusProps,
  KeyboardProps,
} from "../types";

export interface InputProps
  extends BaseComponentProps,
    ComponentVariants,
    FormProps,
    ValidationProps,
    AccessibilityProps,
    FocusProps,
    KeyboardProps {
  // Input-specific props
  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "tel"
    | "url"
    | "search"
    | "date"
    | "time"
    | "datetime-local";
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  step?: number;
  min?: number | string;
  max?: number | string;
  multiple?: boolean;
  accept?: string;
  // Styling
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  // Events
  onInput?: (event: React.FormEvent<HTMLInputElement>) => void;
  onInvalid?: (event: React.FormEvent<HTMLInputElement>) => void;
  onMouseEnter?: (event: React.MouseEvent) => void;
  onMouseLeave?: (event: React.MouseEvent) => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      style,
      id,
      "data-testid": testId,
      // Input props
      type = "text",
      placeholder,
      autoComplete,
      autoFocus = false,
      maxLength,
      minLength,
      pattern,
      step,
      min,
      max,
      multiple = false,
      accept,
      // Form props
      name,
      value,
      defaultValue,
      required = false,
      disabled = false,
      readOnly = false,
      onChange,
      onBlur,
      onFocus,
      // Validation props
      error = false,
      errorMessage,
      success = false,
      successMessage,
      warning = false,
      warningMessage,
      info = false,
      infoMessage,
      // Variants
      size = "md",
      color = "primary",
      variant = "outline",
      state = "default",
      // Styling
      fullWidth = false,
      leftIcon,
      rightIcon,
      clearable = false,
      // Accessibility
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      "aria-required": ariaRequired,
      // Events
      onInput,
      onInvalid,
      onKeyDown,
      onKeyUp,
      onKeyPress,
      onMouseEnter,
      onMouseLeave,
      ...rest
    },
    ref,
  ) => {
    // Internal state
    const [internalValue, setInternalValue] = useState(
      value || defaultValue || "",
    );
    const [isFocused, setIsFocused] = useState(false);

    // Get current value
    const currentValue = value !== undefined ? value : internalValue;

    // Handle value change
    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;

        if (value === undefined) {
          setInternalValue(newValue);
        }

        onChange?.(newValue);
      },
      [value, onChange],
    );

    // Handle focus
    const handleFocus = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        onFocus?.(event);
      },
      [onFocus],
    );

    // Handle blur
    const handleBlur = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        onBlur?.(event);
      },
      [onBlur],
    );

    // Handle clear
    const handleClear = useCallback(() => {
      if (value === undefined) {
        setInternalValue("");
      }
      onChange?.("");
    }, [value, onChange]);

    // Build class names
    const buildClassName = () => {
      const baseClasses = ["input"];

      // Size classes
      baseClasses.push(`input--${size}`);

      // Color classes
      baseClasses.push(`input--${color}`);

      // Variant classes
      baseClasses.push(`input--${variant}`);

      // State classes
      if (disabled) baseClasses.push("input--disabled");
      if (readOnly) baseClasses.push("input--readonly");
      if (error) baseClasses.push("input--error");
      if (success) baseClasses.push("input--success");
      if (warning) baseClasses.push("input--warning");
      if (info) baseClasses.push("input--info");
      if (fullWidth) baseClasses.push("input--full-width");
      if (isFocused) baseClasses.push("input--focused");
      if (leftIcon) baseClasses.push("input--with-left-icon");
      if (rightIcon || clearable) baseClasses.push("input--with-right-icon");

      // Custom className
      if (className) baseClasses.push(className);

      return baseClasses.join(" ");
    };

    // Get validation message
    const getValidationMessage = () => {
      if (error && errorMessage) return errorMessage;
      if (success && successMessage) return successMessage;
      if (warning && warningMessage) return warningMessage;
      if (info && infoMessage) return infoMessage;
      return null;
    };

    // Get validation class
    const getValidationClass = () => {
      if (error) return "input__message--error";
      if (success) return "input__message--success";
      if (warning) return "input__message--warning";
      if (info) return "input__message--info";
      return "";
    };

    // Render left icon
    const renderLeftIcon = () => {
      if (!leftIcon) return null;
      return <span className="input__left-icon">{leftIcon}</span>;
    };

    // Render right icon
    const renderRightIcon = () => {
      if (clearable && currentValue && !disabled && !readOnly) {
        return (
          <button
            type="button"
            className="input__clear-button"
            onClick={handleClear}
            aria-label="Clear input"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        );
      }

      if (rightIcon) {
        return <span className="input__right-icon">{rightIcon}</span>;
      }

      return null;
    };

    return (
      <div className="input-wrapper">
        <div className="input-container">
          {renderLeftIcon()}
          <input
            ref={ref}
            type={type}
            className={buildClassName()}
            style={style}
            id={id}
            data-testid={testId}
            // Input props
            placeholder={placeholder}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            maxLength={maxLength}
            minLength={minLength}
            pattern={pattern}
            step={step}
            min={min}
            max={max}
            multiple={multiple}
            accept={accept}
            // Form props
            name={name}
            value={currentValue}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            // Accessibility
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            aria-invalid={error || ariaInvalid}
            aria-required={required || ariaRequired}
            // Events
            onInput={onInput}
            onInvalid={onInvalid}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
            onKeyPress={onKeyPress}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            {...rest}
          />
          {renderRightIcon()}
        </div>
        {getValidationMessage() && (
          <div className={`input__message ${getValidationClass()}`}>
            {getValidationMessage()}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
