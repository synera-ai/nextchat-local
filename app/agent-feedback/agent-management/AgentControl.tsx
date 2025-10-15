// AI Agent Control Component
// Agent control interface with start, stop, restart, pause, resume

import React, { useState } from "react";
import { AgentStatus, AgentControl as AgentControlType } from "../types";

interface AgentControlProps {
  agentId: string;
  status: AgentStatus;
  availableControls?: AgentControlType[];
  onControlAction?: (
    agentId: string,
    action: AgentControlType,
  ) => Promise<void>;
  showStatus?: boolean;
  showProgress?: boolean;
  compact?: boolean;
  className?: string;
}

export const AgentControl: React.FC<AgentControlProps> = ({
  agentId,
  status,
  availableControls = ["start", "stop", "restart", "pause", "resume"],
  onControlAction,
  showStatus = true,
  showProgress = false,
  compact = false,
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState<AgentControlType | null>(null);

  const getStatusColor = (status: AgentStatus): string => {
    switch (status) {
      case "running":
        return "bg-green-500";
      case "stopped":
        return "bg-gray-400";
      case "paused":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      case "starting":
        return "bg-blue-500";
      case "stopping":
        return "bg-orange-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusIcon = (status: AgentStatus): string => {
    switch (status) {
      case "running":
        return "▶️";
      case "stopped":
        return "⏹️";
      case "paused":
        return "⏸️";
      case "error":
        return "❌";
      case "starting":
        return "🔄";
      case "stopping":
        return "⏳";
      default:
        return "❓";
    }
  };

  const getStatusLabel = (status: AgentStatus): string => {
    switch (status) {
      case "running":
        return "Running";
      case "stopped":
        return "Stopped";
      case "paused":
        return "Paused";
      case "error":
        return "Error";
      case "starting":
        return "Starting";
      case "stopping":
        return "Stopping";
      default:
        return "Unknown";
    }
  };

  const getControlIcon = (control: AgentControlType): string => {
    switch (control) {
      case "start":
        return "▶️";
      case "stop":
        return "⏹️";
      case "restart":
        return "🔄";
      case "pause":
        return "⏸️";
      case "resume":
        return "▶️";
      case "configure":
        return "⚙️";
      default:
        return "❓";
    }
  };

  const getControlLabel = (control: AgentControlType): string => {
    switch (control) {
      case "start":
        return "Start";
      case "stop":
        return "Stop";
      case "restart":
        return "Restart";
      case "pause":
        return "Pause";
      case "resume":
        return "Resume";
      case "configure":
        return "Configure";
      default:
        return "Unknown";
    }
  };

  const isControlEnabled = (control: AgentControlType): boolean => {
    switch (control) {
      case "start":
        return status === "stopped" || status === "error";
      case "stop":
        return status === "running" || status === "paused";
      case "restart":
        return (
          status === "running" || status === "paused" || status === "error"
        );
      case "pause":
        return status === "running";
      case "resume":
        return status === "paused";
      case "configure":
        return true; // Always available
      default:
        return false;
    }
  };

  const handleControlAction = async (action: AgentControlType) => {
    if (!onControlAction || !isControlEnabled(action) || isLoading) {
      return;
    }

    setIsLoading(true);
    setLastAction(action);

    try {
      await onControlAction(agentId, action);
    } catch (error) {
      console.error(`Failed to ${action} agent ${agentId}:`, error);
    } finally {
      setIsLoading(false);
      setLastAction(null);
    }
  };

  const renderControlButton = (control: AgentControlType) => {
    const enabled = isControlEnabled(control);
    const isActive = lastAction === control && isLoading;

    return (
      <button
        key={control}
        onClick={() => handleControlAction(control)}
        disabled={!enabled || isLoading}
        className={`
          flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
          ${
            enabled && !isLoading
              ? "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500"
              : "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
          }
          ${isActive ? "animate-pulse" : ""}
        `}
        title={`${getControlLabel(control)} agent ${agentId}`}
        aria-label={`${getControlLabel(control)} agent ${agentId}`}
      >
        <span className="text-sm">
          {isActive ? "⏳" : getControlIcon(control)}
        </span>
        {!compact && <span>{getControlLabel(control)}</span>}
      </button>
    );
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Agent Control
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {agentId}
            </span>
          </div>

          {showStatus && (
            <div className="flex items-center space-x-2">
              <div
                className={`
                  w-3 h-3 rounded-full ${getStatusColor(status)}
                  ${
                    status === "starting" || status === "stopping"
                      ? "animate-pulse"
                      : ""
                  }
                `}
                aria-label={`Agent status: ${getStatusLabel(status)}`}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {getStatusLabel(status)}
              </span>
            </div>
          )}
        </div>

        {/* Status Display */}
        {showStatus && (
          <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <span className="text-2xl">{getStatusIcon(status)}</span>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {getStatusLabel(status)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Agent {agentId} is currently{" "}
                {getStatusLabel(status).toLowerCase()}
              </p>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-2">
          {availableControls.map(renderControlButton)}
        </div>

        {/* Progress Indicator */}
        {showProgress && isLoading && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {lastAction
                  ? `${getControlLabel(lastAction)}ing agent...`
                  : "Processing..."}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div
                className="bg-blue-500 h-2 rounded-full animate-pulse"
                style={{ width: "60%" }}
              />
            </div>
          </div>
        )}

        {/* Action History */}
        {lastAction && !isLoading && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last action: {getControlLabel(lastAction)} completed
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentControl;
