// Agent Visual Feedback Component

import React from "react";
import { AgentVisualFeedback as AgentVisualFeedbackType } from "../types";

export interface AgentVisualFeedbackProps {
  feedback: AgentVisualFeedbackType;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const AgentVisualFeedback: React.FC<AgentVisualFeedbackProps> = ({
  feedback,
  size = "md",
  showDetails = false,
  className,
  style,
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-sm p-2";
      case "md":
        return "text-base p-3";
      case "lg":
        return "text-lg p-4";
      default:
        return "text-base p-3";
    }
  };

  const getStatusClasses = () => {
    const baseClasses =
      "inline-flex items-center gap-2 rounded-lg border transition-all duration-200";

    switch (feedback.status) {
      case "idle":
        return `${baseClasses} bg-gray-50 border-gray-200 text-gray-600`;
      case "initializing":
        return `${baseClasses} bg-blue-50 border-blue-200 text-blue-600`;
      case "running":
        return `${baseClasses} bg-green-50 border-green-200 text-green-600`;
      case "thinking":
        return `${baseClasses} bg-purple-50 border-purple-200 text-purple-600`;
      case "executing":
        return `${baseClasses} bg-yellow-50 border-yellow-200 text-yellow-600`;
      case "waiting":
        return `${baseClasses} bg-gray-50 border-gray-200 text-gray-600`;
      case "error":
        return `${baseClasses} bg-red-50 border-red-200 text-red-600`;
      case "completed":
        return `${baseClasses} bg-green-50 border-green-200 text-green-600`;
      case "paused":
        return `${baseClasses} bg-yellow-50 border-yellow-200 text-yellow-600`;
      case "stopped":
        return `${baseClasses} bg-gray-50 border-gray-200 text-gray-600`;
      default:
        return `${baseClasses} bg-gray-50 border-gray-200 text-gray-600`;
    }
  };

  const getAnimationClasses = () => {
    if (!feedback.animation || feedback.animation === "none") {
      return "";
    }

    switch (feedback.animation) {
      case "spin":
        return "animate-spin";
      case "pulse":
        return "animate-pulse";
      case "bounce":
        return "animate-bounce";
      default:
        return "";
    }
  };

  const getIcon = () => {
    if (feedback.icon) {
      return feedback.icon;
    }

    // Default icons based on status
    switch (feedback.status) {
      case "idle":
        return "⏸️";
      case "initializing":
        return "🔄";
      case "running":
        return "▶️";
      case "thinking":
        return "🤔";
      case "executing":
        return "⚡";
      case "waiting":
        return "⏳";
      case "error":
        return "❌";
      case "completed":
        return "✅";
      case "paused":
        return "⏸️";
      case "stopped":
        return "⏹️";
      default:
        return "❓";
    }
  };

  const getProgressBar = () => {
    if (!feedback.showProgress || feedback.progress === undefined) {
      return null;
    }

    return (
      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div
          className="bg-current h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, feedback.progress))}%` }}
        />
      </div>
    );
  };

  const getDetails = () => {
    if (!showDetails) {
      return null;
    }

    return (
      <div className="mt-2 text-xs text-gray-500">
        {feedback.currentTask && <div>Task: {feedback.currentTask}</div>}
        {feedback.message && <div>Status: {feedback.message}</div>}
        {feedback.progress !== undefined && (
          <div>Progress: {Math.round(feedback.progress)}%</div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`${getSizeClasses()} ${getStatusClasses()} ${className || ""}`}
      style={{
        ...style,
        color: feedback.color,
      }}
    >
      <div className={`${getAnimationClasses()}`}>{getIcon()}</div>

      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">
          {feedback.message || feedback.status}
        </div>

        {getProgressBar()}
        {getDetails()}
      </div>

      {feedback.customComponent && (
        <div className="ml-2">{feedback.customComponent}</div>
      )}
    </div>
  );
};

export default AgentVisualFeedback;
