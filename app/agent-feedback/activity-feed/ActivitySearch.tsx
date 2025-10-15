// AI Agent Activity Search Component
// Activity search interface

import React, { useState, useEffect, useRef } from "react";

interface ActivitySearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  placeholder?: string;
  showSuggestions?: boolean;
  className?: string;
}

export const ActivitySearch: React.FC<ActivitySearchProps> = ({
  query,
  onQueryChange,
  placeholder = "Search activities...",
  showSuggestions = true,
  className = "",
}) => {
  const [localQuery, setLocalQuery] = useState(query);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  useEffect(() => {
    // Load search history from localStorage
    const savedHistory = localStorage.getItem("activity-search-history");
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Failed to load search history:", error);
      }
    }
  }, []);

  const saveSearchHistory = (newHistory: string[]) => {
    setSearchHistory(newHistory);
    localStorage.setItem("activity-search-history", JSON.stringify(newHistory));
  };

  const handleQueryChange = (newQuery: string) => {
    setLocalQuery(newQuery);
    onQueryChange(newQuery);
  };

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      // Add to search history
      const newHistory = [
        searchQuery,
        ...searchHistory.filter((h) => h !== searchQuery),
      ].slice(0, 10);
      saveSearchHistory(newHistory);
    }
    setShowSuggestionsList(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch(localQuery);
    } else if (e.key === "Escape") {
      setShowSuggestionsList(false);
      inputRef.current?.blur();
    }
  };

  const handleInputFocus = () => {
    if (showSuggestions && searchHistory.length > 0) {
      setShowSuggestionsList(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setShowSuggestionsList(false);
    }, 200);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleQueryChange(suggestion);
    handleSearch(suggestion);
  };

  const clearSearch = () => {
    handleQueryChange("");
    setShowSuggestionsList(false);
    inputRef.current?.focus();
  };

  const clearHistory = () => {
    saveSearchHistory([]);
    setShowSuggestionsList(false);
  };

  const getFilteredHistory = (): string[] => {
    if (!localQuery.trim()) return searchHistory;
    return searchHistory.filter((h) =>
      h.toLowerCase().includes(localQuery.toLowerCase()),
    );
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={localQuery}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="
            block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md
            focus:ring-blue-500 focus:border-blue-500
            dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
            dark:focus:ring-blue-500 dark:focus:border-blue-500
          "
          aria-label="Search activities"
          aria-describedby="search-description"
        />

        {localQuery && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            aria-label="Clear search"
          >
            <svg
              className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Search Suggestions */}
      {showSuggestions &&
        showSuggestionsList &&
        getFilteredHistory().length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
            <div className="py-1">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                Recent searches
              </div>
              {getFilteredHistory().map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                >
                  <div className="flex items-center space-x-2">
                    <svg
                      className="h-3 w-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{suggestion}</span>
                  </div>
                </button>
              ))}
              {searchHistory.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={clearHistory}
                    className="w-full px-3 py-2 text-left text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                  >
                    Clear history
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Search Description */}
      <p
        id="search-description"
        className="mt-1 text-xs text-gray-500 dark:text-gray-400"
      >
        Search by activity title, description, or type
      </p>
    </div>
  );
};

export default ActivitySearch;
