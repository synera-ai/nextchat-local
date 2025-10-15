// AI Agent Connection Status Component
// Real-time connection status indicator

import React, { useState, useEffect } from "react";

interface ConnectionStatusProps {
  connectionId: string;
  status: "connected" | "disconnected" | "connecting" | "error";
  latency?: number;
  lastConnected?: Date;
  showLatency?: boolean;
  showLastConnected?: boolean;
  size?: "small" | "medium" | "large";
  animated?: boolean;
  className?: string;
  onConnectionChange?: (status: string) => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  connectionId,
  status,
  latency,
  lastConnected,
  showLatency = true,
  showLastConnected = false,
  size = "medium",
  animated = true,
  className = "",
  onConnectionChange,
}) => {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [isAnimating, setIsAnimating] = useState(false);
  const [connectionPulse, setConnectionPulse] = useState(false);

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

  // Pulse animation for connected status
  useEffect(() => {
    if (currentStatus === "connected" && animated) {
      const interval = setInterval(() => {
        setConnectionPulse((prev) => !prev);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [currentStatus, animated]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "connected":
        return "bg-green-500";
      case "disconnected":
        return "bg-gray-400";
      case "connecting":
        return "bg-blue-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case "connected":
        return "🔗";
      case "disconnected":
        return "🔌";
      case "connecting":
        return "⏳";
      case "error":
        return "❌";
      default:
        return "❓";
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
      case "connecting":
        return "animate-spin";
      case "connected":
        return connectionPulse ? "animate-pulse" : "";
      case "error":
        return isAnimating ? "animate-bounce" : "";
      default:
        return "";
    }
  };

  const getLatencyColor = (latency?: number): string => {
    if (!latency) return "text-gray-500";
    if (latency < 100) return "text-green-600";
    if (latency < 300) return "text-yellow-600";
    return "text-red-600";
  };

  const formatLastConnected = (date?: Date): string => {
    if (!date) return "";
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const handleClick = () => {
    if (onConnectionChange) {
      // Cycle through connection statuses for demo purposes
      const statuses = ["connected", "disconnected", "connecting", "error"];
      const currentIndex = statuses.indexOf(currentStatus);
      const nextIndex = (currentIndex + 1) % statuses.length;
      onConnectionChange(statuses[nextIndex]);
    }
  };

  return (
    <div
      className={`flex items-center space-x-2 ${className}`}
      role="status"
      aria-label={`Connection ${connectionId} status: ${currentStatus}`}
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
        title={`Connection ${connectionId}: ${currentStatus}${
          latency ? ` (${latency}ms)` : ""
        }`}
      >
        <span className="sr-only">{getStatusIcon(currentStatus)}</span>
        <span className="not-sr-only">{getStatusIcon(currentStatus)}</span>
      </div>

      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
        </span>

        {showLatency && latency !== undefined && (
          <span
            className={`text-xs ${getLatencyColor(latency)}`}
            aria-label={`Latency: ${latency} milliseconds`}
          >
            {latency}ms
          </span>
        )}

        {showLastConnected &&
          lastConnected &&
          currentStatus === "disconnected" && (
            <span
              className="text-xs text-gray-500"
              aria-label={`Last connected: ${formatLastConnected(
                lastConnected,
              )}`}
            >
              {formatLastConnected(lastConnected)}
            </span>
          )}
      </div>

      <span className="sr-only">
        Connection {connectionId} is currently {currentStatus}
        {latency && ` with ${latency}ms latency`}
        {lastConnected &&
          currentStatus === "disconnected" &&
          `, last connected ${formatLastConnected(lastConnected)}`}
      </span>
    </div>
  );
};

export default ConnectionStatus;
