// AI Agent Loading Status Component
// Loading state indicator with customizable animations

import React, { useState, useEffect } from "react";

interface LoadingStatusProps {
  loadingId: string;
  isLoading: boolean;
  message?: string;
  progress?: number; // 0-100
  type?: "spinner" | "dots" | "pulse" | "bar" | "skeleton";
  size?: "small" | "medium" | "large";
  color?: "primary" | "secondary" | "success" | "warning" | "error";
  showProgress?: boolean;
  showMessage?: boolean;
  className?: string;
  onLoadingComplete?: () => void;
}

export const LoadingStatus: React.FC<LoadingStatusProps> = ({
  loadingId,
  isLoading,
  message,
  progress,
  type = "spinner",
  size = "medium",
  color = "primary",
  showProgress = false,
  showMessage = true,
  className = "",
  onLoadingComplete,
}) => {
  const [currentProgress, setCurrentProgress] = useState(progress || 0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (progress !== undefined) {
      setCurrentProgress(progress);
      if (progress >= 100 && !isComplete) {
        setIsComplete(true);
        setTimeout(() => {
          if (onLoadingComplete) {
            onLoadingComplete();
          }
        }, 500);
      }
    }
  }, [progress, isComplete, onLoadingComplete]);

  const getSizeClasses = (size: string): string => {
    switch (size) {
      case "small":
        return "w-4 h-4";
      case "medium":
        return "w-6 h-6";
      case "large":
        return "w-8 h-8";
      default:
        return "w-6 h-6";
    }
  };

  const getColorClasses = (color: string): string => {
    switch (color) {
      case "primary":
        return "text-blue-500";
      case "secondary":
        return "text-gray-500";
      case "success":
        return "text-green-500";
      case "warning":
        return "text-yellow-500";
      case "error":
        return "text-red-500";
      default:
        return "text-blue-500";
    }
  };

  const getProgressBarColor = (color: string): string => {
    switch (color) {
      case "primary":
        return "bg-blue-500";
      case "secondary":
        return "bg-gray-500";
      case "success":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  const renderSpinner = () => (
    <div className={`${getSizeClasses(size)} ${getColorClasses(color)}`}>
      <svg
        className="animate-spin"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );

  const renderDots = () => (
    <div className={`flex space-x-1 ${getColorClasses(color)}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full animate-bounce`}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: "0.6s",
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className={`${getSizeClasses(size)} ${getColorClasses(color)}`}>
      <div className="w-full h-full rounded-full animate-pulse bg-current opacity-75" />
    </div>
  );

  const renderBar = () => (
    <div className="w-full max-w-xs">
      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(
            color,
          )}`}
          style={{ width: `${currentProgress}%` }}
        />
      </div>
      {showProgress && (
        <div className="text-xs text-gray-500 mt-1 text-center">
          {Math.round(currentProgress)}%
        </div>
      )}
    </div>
  );

  const renderSkeleton = () => (
    <div className="animate-pulse">
      <div className="flex space-x-4">
        <div
          className={`rounded-full ${getColorClasses(color).replace(
            "text-",
            "bg-",
          )} ${getSizeClasses(size)}`}
        />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 dark:bg-gray-700" />
          <div className="h-4 bg-gray-200 rounded w-1/2 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );

  const renderLoadingIndicator = () => {
    switch (type) {
      case "spinner":
        return renderSpinner();
      case "dots":
        return renderDots();
      case "pulse":
        return renderPulse();
      case "bar":
        return renderBar();
      case "skeleton":
        return renderSkeleton();
      default:
        return renderSpinner();
    }
  };

  if (!isLoading && !isComplete) {
    return null;
  }

  return (
    <div
      className={`flex items-center space-x-3 ${className}`}
      role="status"
      aria-label={`Loading ${loadingId}: ${message || "Please wait"}`}
      aria-live="polite"
    >
      {renderLoadingIndicator()}

      {showMessage && message && (
        <div className="flex flex-col">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {message}
          </span>
          {showProgress && progress !== undefined && (
            <span className="text-xs text-gray-500">
              {Math.round(currentProgress)}% complete
            </span>
          )}
        </div>
      )}

      {isComplete && (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 text-green-500">
            <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-sm text-green-600 font-medium">Complete</span>
        </div>
      )}

      <span className="sr-only">
        {isLoading ? "Loading" : "Complete"}: {message || "Please wait"}
        {showProgress &&
          progress !== undefined &&
          `, ${Math.round(currentProgress)}% complete`}
      </span>
    </div>
  );
};

export default LoadingStatus;
