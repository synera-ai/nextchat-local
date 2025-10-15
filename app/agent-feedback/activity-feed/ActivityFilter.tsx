// AI Agent Activity Filter Component
// Activity filtering interface

import React, { useState, useEffect } from "react";
import {
  ActivityFilter as ActivityFilterType,
  ActivityType,
  ActivitySeverity,
  ActivityFeedComponent,
} from "../types";

interface ActivityFilterProps {
  filter: ActivityFilterType;
  onFilterChange: (filter: ActivityFilterType) => void;
  activities: ActivityFeedComponent[];
  className?: string;
}

export const ActivityFilter: React.FC<ActivityFilterProps> = ({
  filter,
  onFilterChange,
  activities,
  className = "",
}) => {
  const [localFilter, setLocalFilter] = useState<ActivityFilterType>(filter);

  useEffect(() => {
    setLocalFilter(filter);
  }, [filter]);

  const handleFilterChange = (newFilter: ActivityFilterType) => {
    setLocalFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleTypeChange = (type: ActivityType, checked: boolean) => {
    const currentTypes = localFilter.types || [];
    const newTypes = checked
      ? [...currentTypes, type]
      : currentTypes.filter((t) => t !== type);

    handleFilterChange({
      ...localFilter,
      types: newTypes.length > 0 ? newTypes : undefined,
    });
  };

  const handleSeverityChange = (
    severity: ActivitySeverity,
    checked: boolean,
  ) => {
    const currentSeverities = localFilter.severity || [];
    const newSeverities = checked
      ? [...currentSeverities, severity]
      : currentSeverities.filter((s) => s !== severity);

    handleFilterChange({
      ...localFilter,
      severity: newSeverities.length > 0 ? newSeverities : undefined,
    });
  };

  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    handleFilterChange({
      ...localFilter,
      dateRange: start && end ? { start, end } : undefined,
    });
  };

  const clearFilters = () => {
    handleFilterChange({});
  };

  const getTypeCount = (type: ActivityType): number => {
    return activities.filter((activity) => activity.type === type).length;
  };

  const getSeverityCount = (severity: ActivitySeverity): number => {
    return activities.filter((activity) => activity.severity === severity)
      .length;
  };

  const activityTypes: ActivityType[] = [
    "agent-start",
    "agent-stop",
    "agent-error",
    "agent-success",
    "task-start",
    "task-complete",
    "task-error",
    "system-event",
    "user-action",
  ];

  const severityLevels: ActivitySeverity[] = [
    "info",
    "success",
    "warning",
    "error",
    "critical",
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Filters
        </h3>
        <button
          onClick={clearFilters}
          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Clear all
        </button>
      </div>

      {/* Activity Types */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Activity Types
        </label>
        <div className="grid grid-cols-2 gap-2">
          {activityTypes.map((type) => {
            const count = getTypeCount(type);
            const isChecked = localFilter.types?.includes(type) || false;

            return (
              <label
                key={type}
                className="flex items-center space-x-2 text-xs cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => handleTypeChange(type, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  {type.replace("-", " ")}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  ({count})
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Severity Levels */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Severity Levels
        </label>
        <div className="grid grid-cols-2 gap-2">
          {severityLevels.map((severity) => {
            const count = getSeverityCount(severity);
            const isChecked = localFilter.severity?.includes(severity) || false;

            return (
              <label
                key={severity}
                className="flex items-center space-x-2 text-xs cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) =>
                    handleSeverityChange(severity, e.target.checked)
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300 capitalize">
                  {severity}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  ({count})
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Date Range */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Date Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              From
            </label>
            <input
              type="datetime-local"
              value={
                localFilter.dateRange?.start
                  ? new Date(localFilter.dateRange.start)
                      .toISOString()
                      .slice(0, 16)
                  : ""
              }
              onChange={(e) => {
                const start = e.target.value ? new Date(e.target.value) : null;
                handleDateRangeChange(
                  start,
                  localFilter.dateRange?.end || null,
                );
              }}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              To
            </label>
            <input
              type="datetime-local"
              value={
                localFilter.dateRange?.end
                  ? new Date(localFilter.dateRange.end)
                      .toISOString()
                      .slice(0, 16)
                  : ""
              }
              onChange={(e) => {
                const end = e.target.value ? new Date(e.target.value) : null;
                handleDateRangeChange(
                  localFilter.dateRange?.start || null,
                  end,
                );
              }}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Quick Filters
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() =>
              handleFilterChange({ severity: ["error", "critical"] })
            }
            className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 dark:bg-red-900 dark:text-red-200"
          >
            Errors Only
          </button>
          <button
            onClick={() => handleFilterChange({ severity: ["success"] })}
            className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 dark:bg-green-900 dark:text-green-200"
          >
            Success Only
          </button>
          <button
            onClick={() =>
              handleFilterChange({ types: ["agent-start", "agent-stop"] })
            }
            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200"
          >
            Agent Events
          </button>
          <button
            onClick={() =>
              handleFilterChange({
                types: ["task-start", "task-complete", "task-error"],
              })
            }
            className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200"
          >
            Task Events
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityFilter;
