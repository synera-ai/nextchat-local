// AI Agent Activity Feed Component
// Real-time activity feed with filtering and search

import React, { useState, useEffect, useMemo } from "react";
import {
  ActivityFeedComponent,
  ActivityType,
  ActivitySeverity,
  ActivityFilter,
} from "../types";
import { ActivityItem } from "./ActivityItem";
import { ActivityFilter as ActivityFilterComponent } from "./ActivityFilter";
import { ActivitySearch } from "./ActivitySearch";

interface ActivityFeedProps {
  activities: ActivityFeedComponent[];
  maxItems?: number;
  showFilters?: boolean;
  showSearch?: boolean;
  showExport?: boolean;
  autoScroll?: boolean;
  refreshInterval?: number;
  className?: string;
  onActivityClick?: (activity: ActivityFeedComponent) => void;
  onFilterChange?: (filter: ActivityFilter) => void;
  onExport?: (activities: ActivityFeedComponent[]) => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  maxItems = 100,
  showFilters = true,
  showSearch = true,
  showExport = true,
  autoScroll = true,
  refreshInterval,
  className = "",
  onActivityClick,
  onFilterChange,
  onExport,
}) => {
  const [filteredActivities, setFilteredActivities] = useState<
    ActivityFeedComponent[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<ActivityFilter>({});
  const [isAutoScrolling, setIsAutoScrolling] = useState(autoScroll);
  const [feedRef, setFeedRef] = useState<HTMLDivElement | null>(null);

  // Filter and search activities
  const processedActivities = useMemo(() => {
    let result = [...activities];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (activity) =>
          activity.title.toLowerCase().includes(query) ||
          activity.description?.toLowerCase().includes(query) ||
          activity.type.toLowerCase().includes(query),
      );
    }

    // Apply type filter
    if (filter.types && filter.types.length > 0) {
      result = result.filter((activity) =>
        filter.types!.includes(activity.type),
      );
    }

    // Apply severity filter
    if (filter.severity && filter.severity.length > 0) {
      result = result.filter((activity) =>
        filter.severity!.includes(activity.severity),
      );
    }

    // Apply date range filter
    if (filter.dateRange) {
      result = result.filter((activity) => {
        const activityDate = new Date(activity.timestamp);
        return (
          activityDate >= filter.dateRange!.start &&
          activityDate <= filter.dateRange!.end
        );
      });
    }

    // Sort by timestamp (newest first)
    result.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    // Limit items
    if (maxItems > 0) {
      result = result.slice(0, maxItems);
    }

    return result;
  }, [activities, searchQuery, filter, maxItems]);

  useEffect(() => {
    setFilteredActivities(processedActivities);
  }, [processedActivities]);

  // Auto-scroll to bottom when new activities arrive
  useEffect(() => {
    if (isAutoScrolling && feedRef) {
      feedRef.scrollTop = feedRef.scrollHeight;
    }
  }, [filteredActivities, isAutoScrolling, feedRef]);

  // Handle scroll events to detect if user is at bottom
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    setIsAutoScrolling(isAtBottom);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilter: ActivityFilter) => {
    setFilter(newFilter);
    if (onFilterChange) {
      onFilterChange(newFilter);
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport(filteredActivities);
    } else {
      // Default export to JSON
      const dataStr = JSON.stringify(filteredActivities, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `activity-feed-${
        new Date().toISOString().split("T")[0]
      }.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const getActivityStats = () => {
    const stats = {
      total: filteredActivities.length,
      byType: {} as Record<ActivityType, number>,
      bySeverity: {} as Record<ActivitySeverity, number>,
    };

    filteredActivities.forEach((activity) => {
      stats.byType[activity.type] = (stats.byType[activity.type] || 0) + 1;
      stats.bySeverity[activity.severity] =
        (stats.bySeverity[activity.severity] || 0) + 1;
    });

    return stats;
  };

  const stats = getActivityStats();

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Activity Feed
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {stats.total} activities
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {showExport && (
            <button
              onClick={handleExport}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Export activities"
            >
              Export
            </button>
          )}

          <button
            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
            className={`px-3 py-1 text-sm rounded focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isAutoScrolling
                ? "bg-green-500 text-white hover:bg-green-600 focus:ring-green-500"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300"
            }`}
            aria-label={
              isAutoScrolling ? "Disable auto-scroll" : "Enable auto-scroll"
            }
          >
            {isAutoScrolling ? "Auto-scroll ON" : "Auto-scroll OFF"}
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      {(showFilters || showSearch) && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
          {showSearch && (
            <ActivitySearch
              query={searchQuery}
              onQueryChange={handleSearchChange}
              placeholder="Search activities..."
            />
          )}

          {showFilters && (
            <ActivityFilterComponent
              filter={filter}
              onFilterChange={handleFilterChange}
              activities={activities}
            />
          )}
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Total: <span className="font-medium">{stats.total}</span>
          </span>

          {Object.entries(stats.bySeverity).map(([severity, count]) => (
            <span key={severity} className="text-gray-600 dark:text-gray-400">
              {severity}: <span className="font-medium">{count}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div
        ref={setFeedRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
        onScroll={handleScroll}
        role="log"
        aria-label="Activity feed"
        aria-live="polite"
      >
        {filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-sm">
              {searchQuery || Object.keys(filter).length > 0
                ? "No activities match your filters"
                : "No activities yet"}
            </p>
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              onClick={() => onActivityClick?.(activity)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            Showing {filteredActivities.length} of {activities.length}{" "}
            activities
          </span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;
