// AI Agent Status Component
// Real-time agent status indicator

import React, { useState, useEffect } from "react";
import { StatusIndicatorState } from "../types";

interface AgentStatusProps {
  agentId: string;
  status: StatusIndicatorState;
  message?: string;
  showMessage?: boolean;
  size?: "small" | "medium" | "large";
  animated?: boolean;
  className?: string;
  onStatusChange?: (status: StatusIndicatorState) => void;
}

export const AgentStatus: React.FC<AgentStatusProps> = ({
  agentId,
  status,
  message,
  showMessage = true,
  size = "medium",
  animated = true,
  className = "",
  onStatusChange,
}) => {
  const [currentStatus, setCurrentStatus] =
    useState<StatusIndicatorState>(status);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (status !== currentStatus) {
      setIsAnimating(true);
      setCurrentStatus(status);

      // Stop animation after transition
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [status, currentStatus]);

  const getStatusColor = (status: StatusIndicatorState): string => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "inactive":
        return "bg-gray-400";
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      case "success":
        return "bg-green-600";
      case "loading":
        return "bg-blue-500";
      case "unknown":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusIcon = (status: StatusIndicatorState): string => {
    switch (status) {
      case "active":
        return "●";
      case "inactive":
        return "○";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "success":
        return "✓";
      case "loading":
        return "⟳";
      case "unknown":
        return "?";
      default:
        return "○";
    }
  };

  const getSizeClasses = (size: string): string => {
    switch (size) {
      case "small":
        return "w-2 h-2 text-xs";
      case "medium":
        return "w-3 h-3 text-sm";
      case "large":
        return "w-4 h-4 text-base";
      default:
        return "w-3 h-3 text-sm";
    }
  };

  const getAnimationClasses = (): string => {
    if (!animated) return "";

    switch (currentStatus) {
      case "loading":
        return "animate-spin";
      case "active":
        return isAnimating ? "animate-pulse" : "";
      case "error":
        return isAnimating ? "animate-bounce" : "";
      default:
        return "";
    }
  };

  const handleClick = () => {
    if (onStatusChange) {
      // Cycle through statuses for demo purposes
      const statuses: StatusIndicatorState[] = [
        "active",
        "inactive",
        "error",
        "warning",
        "success",
        "loading",
      ];
      const currentIndex = statuses.indexOf(currentStatus);
      const nextIndex = (currentIndex + 1) % statuses.length;
      onStatusChange(statuses[nextIndex]);
    }
  };

  return (
    <div
      className={`flex items-center space-x-2 ${className}`}
      role="status"
      aria-label={`Agent ${agentId} status: ${currentStatus}`}
      aria-live="polite"
    >
      <div
        className={`
          ${getSizeClasses(size)}
          ${getStatusColor(currentStatus)}
          ${getAnimationClasses()}
          rounded-full
          flex items-center justify-center
          text-white
          font-bold
          cursor-pointer
          transition-all duration-300
          hover:scale-110
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `}
        onClick={handleClick}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        title={`Agent ${agentId}: ${currentStatus}${
          message ? ` - ${message}` : ""
        }`}
      >
        <span className="sr-only">{getStatusIcon(currentStatus)}</span>
        <span className="not-sr-only">{getStatusIcon(currentStatus)}</span>
      </div>

      {showMessage && message && (
        <span
          className="text-sm text-gray-700 dark:text-gray-300"
          aria-label={`Status message: ${message}`}
        >
          {message}
        </span>
      )}

      <span className="sr-only">
        Agent {agentId} is currently {currentStatus}
        {message && `. ${message}`}
      </span>
    </div>
  );
};

export default AgentStatus;
