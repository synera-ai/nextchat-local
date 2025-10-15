// AI Agent Activity Item Component
// Individual activity item in the activity feed

import React, { useState } from "react";
import {
  ActivityFeedComponent,
  ActivityType,
  ActivitySeverity,
} from "../types";

interface ActivityItemProps {
  activity: ActivityFeedComponent;
  onClick?: () => void;
  showTimestamp?: boolean;
  showMetadata?: boolean;
  compact?: boolean;
  className?: string;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({
  activity,
  onClick,
  showTimestamp = true,
  showMetadata = false,
  compact = false,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSeverityColor = (severity: ActivitySeverity): string => {
    switch (severity) {
      case "info":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700";
      case "success":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700";
      case "error":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700";
      case "critical":
        return "bg-red-200 text-red-900 border-red-300 dark:bg-red-800 dark:text-red-100 dark:border-red-600";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600";
    }
  };

  const getTypeIcon = (type: ActivityType): string => {
    switch (type) {
      case "agent-start":
        return "🚀";
      case "agent-stop":
        return "🛑";
      case "agent-error":
        return "❌";
      case "agent-success":
        return "✅";
      case "task-start":
        return "▶️";
      case "task-complete":
        return "🏁";
      case "task-error":
        return "⚠️";
      case "system-event":
        return "⚙️";
      case "user-action":
        return "👤";
      default:
        return "📋";
    }
  };

  const getTypeLabel = (type: ActivityType): string => {
    switch (type) {
      case "agent-start":
        return "Agent Started";
      case "agent-stop":
        return "Agent Stopped";
      case "agent-error":
        return "Agent Error";
      case "agent-success":
        return "Agent Success";
      case "task-start":
        return "Task Started";
      case "task-complete":
        return "Task Completed";
      case "task-error":
        return "Task Error";
      case "system-event":
        return "System Event";
      case "user-action":
        return "User Action";
      default:
        return "Activity";
    }
  };

  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const formatFullTimestamp = (timestamp: Date): string => {
    return new Date(timestamp).toLocaleString();
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={`
        bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700
        hover:shadow-md transition-all duration-200 cursor-pointer
        ${compact ? "p-3" : "p-4"}
        ${className}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Activity: ${activity.title}`}
      aria-expanded={isExpanded}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 flex items-center justify-center text-lg">
            {getTypeIcon(activity.type)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3
                className={`font-medium text-gray-900 dark:text-gray-100 ${
                  compact ? "text-sm" : "text-base"
                }`}
              >
                {activity.title}
              </h3>

              <span
                className={`
                  inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
                  ${getSeverityColor(activity.severity)}
                `}
              >
                {activity.severity}
              </span>
            </div>

            {showTimestamp && (
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <span title={formatFullTimestamp(activity.timestamp)}>
                  {formatTimestamp(activity.timestamp)}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {activity.description && (
            <p
              className={`mt-1 text-gray-600 dark:text-gray-400 ${
                compact ? "text-sm" : "text-base"
              }`}
            >
              {activity.description}
            </p>
          )}

          {/* Type and ID */}
          <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{getTypeLabel(activity.type)}</span>
            <span>•</span>
            <span>ID: {activity.id}</span>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Type:
                  </span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {activity.type}
                  </span>
                </div>

                <div className="text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Severity:
                  </span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {activity.severity}
                  </span>
                </div>

                <div className="text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Timestamp:
                  </span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {formatFullTimestamp(activity.timestamp)}
                  </span>
                </div>

                {showMetadata && activity.metadata && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Metadata:
                    </span>
                    <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-x-auto">
                      {JSON.stringify(activity.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Expand/Collapse Icon */}
        <div className="flex-shrink-0">
          <button
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            aria-label={
              isExpanded
                ? "Collapse activity details"
                : "Expand activity details"
            }
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;
