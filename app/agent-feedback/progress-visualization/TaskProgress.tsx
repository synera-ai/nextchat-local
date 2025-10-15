// AI Agent Task Progress Component
// Task completion progress visualization

import React, { useState, useEffect } from "react";
import { ProgressType } from "../types";

interface TaskProgressProps {
  taskId: string;
  progress: number; // 0-100
  max?: number;
  label?: string;
  description?: string;
  type?: ProgressType;
  showPercentage?: boolean;
  showLabel?: boolean;
  showDescription?: boolean;
  animated?: boolean;
  color?: "primary" | "success" | "warning" | "error" | "info";
  size?: "small" | "medium" | "large";
  className?: string;
  onProgressComplete?: (taskId: string) => void;
  onProgressUpdate?: (taskId: string, progress: number) => void;
}

export const TaskProgress: React.FC<TaskProgressProps> = ({
  taskId,
  progress,
  max = 100,
  label,
  description,
  type = "task-progress",
  showPercentage = true,
  showLabel = true,
  showDescription = true,
  animated = true,
  color = "primary",
  size = "medium",
  className = "",
  onProgressComplete,
  onProgressUpdate,
}) => {
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (progress !== currentProgress) {
      setIsAnimating(true);
      setCurrentProgress(progress);

      if (onProgressUpdate) {
        onProgressUpdate(taskId, progress);
      }

      if (progress >= max && !isComplete) {
        setIsComplete(true);
        setTimeout(() => {
          if (onProgressComplete) {
            onProgressComplete(taskId);
          }
        }, 500);
      }

      // Stop animation after transition
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [
    progress,
    currentProgress,
    max,
    isComplete,
    taskId,
    onProgressUpdate,
    onProgressComplete,
  ]);

  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary":
        return {
          bg: "bg-blue-500",
          text: "text-blue-600",
          border: "border-blue-500",
        };
      case "success":
        return {
          bg: "bg-green-500",
          text: "text-green-600",
          border: "border-green-500",
        };
      case "warning":
        return {
          bg: "bg-yellow-500",
          text: "text-yellow-600",
          border: "border-yellow-500",
        };
      case "error":
        return {
          bg: "bg-red-500",
          text: "text-red-600",
          border: "border-red-500",
        };
      case "info":
        return {
          bg: "bg-gray-500",
          text: "text-gray-600",
          border: "border-gray-500",
        };
      default:
        return {
          bg: "bg-blue-500",
          text: "text-blue-600",
          border: "border-blue-500",
        };
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case "small":
        return {
          height: "h-2",
          text: "text-xs",
          padding: "p-1",
        };
      case "medium":
        return {
          height: "h-3",
          text: "text-sm",
          padding: "p-2",
        };
      case "large":
        return {
          height: "h-4",
          text: "text-base",
          padding: "p-3",
        };
      default:
        return {
          height: "h-3",
          text: "text-sm",
          padding: "p-2",
        };
    }
  };

  const colors = getColorClasses(color);
  const sizes = getSizeClasses(size);
  const percentage = Math.round((currentProgress / max) * 100);

  const renderProgressBar = () => (
    <div className="w-full">
      <div
        className={`w-full bg-gray-200 rounded-full ${sizes.height} dark:bg-gray-700`}
      >
        <div
          className={`
            ${colors.bg}
            ${sizes.height}
            rounded-full
            transition-all duration-300 ease-out
            ${animated && isAnimating ? "animate-pulse" : ""}
            ${isComplete ? "animate-bounce" : ""}
          `}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={currentProgress}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`Task ${taskId} progress: ${percentage}%`}
        />
      </div>
    </div>
  );

  const renderCircularProgress = () => {
    const radius = size === "small" ? 20 : size === "medium" ? 30 : 40;
    const strokeWidth = size === "small" ? 3 : size === "medium" ? 4 : 5;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className={`${colors.text} transition-all duration-300 ease-out`}
          />
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="text-gray-200 dark:text-gray-700"
          />
        </svg>
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`${sizes.text} font-medium ${colors.text}`}>
              {percentage}%
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderStepProgress = () => {
    const steps = 5; // Default to 5 steps
    const stepProgress = Math.floor((percentage / 100) * steps);

    return (
      <div className="flex items-center space-x-2">
        {Array.from({ length: steps }, (_, index) => (
          <div
            key={index}
            className={`
              w-3 h-3 rounded-full transition-all duration-300
              ${
                index < stepProgress
                  ? `${colors.bg} ${
                      animated && isAnimating ? "animate-pulse" : ""
                    }`
                  : "bg-gray-200 dark:bg-gray-700"
              }
            `}
            aria-label={`Step ${index + 1} ${
              index < stepProgress ? "completed" : "pending"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderProgressIndicator = () => {
    switch (type) {
      case "circular-progress":
        return renderCircularProgress();
      case "step-progress":
        return renderStepProgress();
      case "linear-progress":
      case "task-progress":
      default:
        return renderProgressBar();
    }
  };

  return (
    <div
      className={`${sizes.padding} ${className}`}
      role="region"
      aria-label={`Task progress for ${taskId}`}
      aria-live="polite"
    >
      <div className="space-y-2">
        {showLabel && label && (
          <div className="flex items-center justify-between">
            <h3
              className={`${sizes.text} font-medium text-gray-900 dark:text-gray-100`}
            >
              {label}
            </h3>
            {showPercentage && type !== "circular-progress" && (
              <span className={`${sizes.text} ${colors.text} font-medium`}>
                {percentage}%
              </span>
            )}
          </div>
        )}

        {showDescription && description && (
          <p className={`text-xs text-gray-600 dark:text-gray-400`}>
            {description}
          </p>
        )}

        <div className="flex items-center space-x-3">
          {renderProgressIndicator()}

          {isComplete && (
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 text-green-500">
                <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-xs text-green-600 font-medium">
                Complete
              </span>
            </div>
          )}
        </div>
      </div>

      <span className="sr-only">
        Task {taskId} is {percentage}% complete
        {label && `: ${label}`}
        {description && `. ${description}`}
      </span>
    </div>
  );
};

export default TaskProgress;
