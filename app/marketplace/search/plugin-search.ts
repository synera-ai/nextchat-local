// Plugin Search System
// Advanced search with filters, sorting, and analytics

import { EventEmitter } from "events";
import {
  Plugin,
  PluginFilters,
  SearchResult,
  SearchSuggestion,
  SearchHistory,
  SearchAnalytics,
  SortOption,
} from "../types";

export class PluginSearchManager extends EventEmitter {
  private initialized: boolean = false;

  // Search data
  public filters: PluginFilters = {};
  public sortOptions: SortOption[] = [];
  public analytics: SearchAnalytics = {
    totalSearches: 0,
    popularQueries: [],
    searchTrends: [],
    userSearches: {},
    performance: {
      averageResponseTime: 0,
      cacheHitRate: 0,
      errorRate: 0,
    },
  };
  public history: SearchHistory[] = [];

  constructor() {
    super();
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      this.emit("warn", "Plugin search already initialized");
      return;
    }

    this.emit("info", "Initializing Plugin Search Manager...");

    try {
      // Initialize search options
      await this.initializeSortOptions();
      await this.initializeFilters();
      await this.initializeAnalytics();

      this.initialized = true;
      this.emit("initialized");
      this.emit("info", "Plugin Search Manager initialized successfully");
    } catch (error) {
      this.emit("error", `Failed to initialize plugin search: ${error}`);
      throw error;
    }
  }

  private async initializeSortOptions(): Promise<void> {
    this.sortOptions = [
      {
        id: "relevance",
        name: "Relevance",
        description: "Most relevant results first",
        field: "relevance",
        order: "desc",
        default: true,
      },
      {
        id: "popularity",
        name: "Popularity",
        description: "Most popular plugins first",
        field: "downloads",
        order: "desc",
        default: false,
      },
      {
        id: "rating",
        name: "Rating",
        description: "Highest rated plugins first",
        field: "rating",
        order: "desc",
        default: false,
      },
      {
        id: "newest",
        name: "Newest",
        description: "Recently added plugins first",
        field: "createdAt",
        order: "desc",
        default: false,
      },
      {
        id: "updated",
        name: "Recently Updated",
        description: "Recently updated plugins first",
        field: "updatedAt",
        order: "desc",
        default: false,
      },
      {
        id: "name",
        name: "Name",
        description: "Alphabetical order",
        field: "name",
        order: "asc",
        default: false,
      },
      {
        id: "price",
        name: "Price",
        description: "Price from low to high",
        field: "price",
        order: "asc",
        default: false,
      },
    ];
  }

  private async initializeFilters(): Promise<void> {
    this.filters = {
      categories: [],
      tags: [],
      priceRange: { min: 0, max: 1000 },
      minRating: 0,
      sortBy: "relevance",
      sortOrder: "desc",
      page: 1,
      limit: 20,
    };
  }

  private async initializeAnalytics(): Promise<void> {
    this.analytics = {
      totalSearches: 0,
      popularQueries: [],
      searchTrends: [],
      userSearches: {},
      performance: {
        averageResponseTime: 0,
        cacheHitRate: 0,
        errorRate: 0,
      },
    };
  }

  // Main search method
  async search(query: string, filters: PluginFilters): Promise<SearchResult> {
    const startTime = Date.now();
    this.emit("info", `Searching plugins: ${query}`);

    try {
      // Update analytics
      this.analytics.totalSearches++;
      this.updatePopularQueries(query);
      this.addToHistory(query, filters);

      // Perform search
      let plugins: Plugin[] = [];
      let suggestions: SearchSuggestion[] = [];
      let related: string[] = [];

      // Text search
      if (query.trim()) {
        plugins = await this.performTextSearch(query, filters);
        suggestions = await this.generateSuggestions(query);
        related = await this.findRelatedQueries(query);
      } else {
        // Browse mode - no query
        plugins = await this.browsePlugins(filters);
      }

      // Apply filters
      plugins = await this.applyFilters(plugins, filters);

      // Sort results
      plugins = this.sortResults(plugins, filters.sortBy, filters.sortOrder);

      // Paginate results
      const paginatedResults = this.paginateResults(
        plugins,
        filters.page,
        filters.limit,
      );

      // Calculate performance metrics
      const responseTime = Date.now() - startTime;
      this.updatePerformanceMetrics(responseTime);

      const result: SearchResult = {
        plugins: paginatedResults,
        total: plugins.length,
        page: filters.page || 1,
        limit: filters.limit || 20,
        hasMore: (filters.page || 1) * (filters.limit || 20) < plugins.length,
        filters,
        suggestions,
        related,
        searchTime: responseTime,
        query,
        facets: await this.generateFacets(plugins, filters),
      };

      this.emit("search:completed", result);
      return result;
    } catch (error) {
      this.emit("error", `Failed to search plugins: ${error}`);
      throw error;
    }
  }

  // Text search implementation
  private async performTextSearch(
    query: string,
    filters: PluginFilters,
  ): Promise<Plugin[]> {
    // This would integrate with a search engine like Elasticsearch
    // For now, we'll simulate the search
    const searchTerms = query.toLowerCase().split(/\s+/);

    // Simulate plugin data
    const allPlugins: Plugin[] = [];

    return allPlugins.filter((plugin) => {
      const searchableText = [
        plugin.name,
        plugin.description,
        plugin.author,
        ...plugin.tags,
        ...plugin.categories,
      ]
        .join(" ")
        .toLowerCase();

      return searchTerms.some((term) => searchableText.includes(term));
    });
  }

  // Browse plugins without search query
  private async browsePlugins(filters: PluginFilters): Promise<Plugin[]> {
    // Return plugins based on filters only
    return [];
  }

  // Apply filters to search results
  private async applyFilters(
    plugins: Plugin[],
    filters: PluginFilters,
  ): Promise<Plugin[]> {
    let filtered = [...plugins];

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter((plugin) =>
        filters.categories!.some((category) =>
          plugin.categories.includes(category),
        ),
      );
    }

    // Tag filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((plugin) =>
        filters.tags!.some((tag) => plugin.tags.includes(tag)),
      );
    }

    // Price range filter
    if (filters.priceRange) {
      filtered = filtered.filter((plugin) => {
        const price = plugin.pricing?.price || 0;
        return (
          price >= filters.priceRange!.min && price <= filters.priceRange!.max
        );
      });
    }

    // Rating filter
    if (filters.minRating) {
      filtered = filtered.filter(
        (plugin) => plugin.rating >= filters.minRating!,
      );
    }

    // Free/Paid filter
    if (filters.freeOnly) {
      filtered = filtered.filter(
        (plugin) => !plugin.pricing || plugin.pricing.price === 0,
      );
    }

    // Featured filter
    if (filters.featuredOnly) {
      filtered = filtered.filter((plugin) => plugin.featured);
    }

    return filtered;
  }

  // Sort search results
  private sortResults(
    plugins: Plugin[],
    sortBy: string,
    sortOrder: "asc" | "desc" = "desc",
  ): Plugin[] {
    return plugins.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "relevance":
          // Relevance would be calculated by search engine
          comparison = 0;
          break;
        case "popularity":
        case "downloads":
          comparison = (a.downloads || 0) - (b.downloads || 0);
          break;
        case "rating":
          comparison = a.rating - b.rating;
          break;
        case "newest":
        case "createdAt":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "updated":
        case "updatedAt":
          comparison =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "price":
          const priceA = a.pricing?.price || 0;
          const priceB = b.pricing?.price || 0;
          comparison = priceA - priceB;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }

  // Paginate results
  private paginateResults(
    plugins: Plugin[],
    page: number,
    limit: number,
  ): Plugin[] {
    const start = (page - 1) * limit;
    const end = start + limit;
    return plugins.slice(start, end);
  }

  // Generate search suggestions
  async suggest(query: string): Promise<string[]> {
    this.emit("info", `Getting suggestions for: ${query}`);

    try {
      if (!query.trim()) {
        return this.getPopularQueries();
      }

      // Generate suggestions based on query
      const suggestions: string[] = [];

      // Add query variations
      suggestions.push(query);
      suggestions.push(query + " plugin");
      suggestions.push(query + " extension");

      // Add related terms (this would come from search analytics)
      const relatedTerms = await this.findRelatedTerms(query);
      suggestions.push(...relatedTerms);

      // Remove duplicates and limit
      return [...new Set(suggestions)].slice(0, 10);
    } catch (error) {
      this.emit("error", `Failed to get suggestions: ${error}`);
      return [];
    }
  }

  // Autocomplete implementation
  async autocomplete(query: string): Promise<string[]> {
    this.emit("info", `Getting autocomplete for: ${query}`);

    try {
      if (!query.trim()) {
        return [];
      }

      // Get autocomplete suggestions
      const suggestions = await this.suggest(query);

      // Filter to only include suggestions that start with the query
      return suggestions.filter((suggestion) =>
        suggestion.toLowerCase().startsWith(query.toLowerCase()),
      );
    } catch (error) {
      this.emit("error", `Failed to get autocomplete: ${error}`);
      return [];
    }
  }

  // Generate search facets
  private async generateFacets(
    plugins: Plugin[],
    filters: PluginFilters,
  ): Promise<any> {
    const facets: any = {
      categories: {},
      tags: {},
      priceRanges: {},
      ratings: {},
    };

    // Count facets
    plugins.forEach((plugin) => {
      // Categories
      plugin.categories.forEach((category) => {
        facets.categories[category] = (facets.categories[category] || 0) + 1;
      });

      // Tags
      plugin.tags.forEach((tag) => {
        facets.tags[tag] = (facets.tags[tag] || 0) + 1;
      });

      // Price ranges
      const price = plugin.pricing?.price || 0;
      const priceRange = this.getPriceRange(price);
      facets.priceRanges[priceRange] =
        (facets.priceRanges[priceRange] || 0) + 1;

      // Ratings
      const rating = Math.floor(plugin.rating);
      facets.ratings[rating] = (facets.ratings[rating] || 0) + 1;
    });

    return facets;
  }

  // Helper methods
  private updatePopularQueries(query: string): void {
    const existing = this.analytics.popularQueries.find(
      (q) => q.query === query,
    );
    if (existing) {
      existing.count++;
    } else {
      this.analytics.popularQueries.push({ query, count: 1 });
    }

    // Sort by count and keep top 100
    this.analytics.popularQueries.sort((a, b) => b.count - a.count);
    this.analytics.popularQueries = this.analytics.popularQueries.slice(0, 100);
  }

  private addToHistory(query: string, filters: PluginFilters): void {
    const historyItem: SearchHistory = {
      id: Date.now().toString(),
      query,
      filters,
      timestamp: new Date(),
      resultsCount: 0, // Would be set after search completes
    };

    this.history.unshift(historyItem);

    // Keep only last 100 searches
    if (this.history.length > 100) {
      this.history = this.history.slice(0, 100);
    }
  }

  private updatePerformanceMetrics(responseTime: number): void {
    // Update average response time
    const currentAvg = this.analytics.performance.averageResponseTime;
    const totalSearches = this.analytics.totalSearches;
    this.analytics.performance.averageResponseTime =
      (currentAvg * (totalSearches - 1) + responseTime) / totalSearches;
  }

  private getPopularQueries(): string[] {
    return this.analytics.popularQueries.slice(0, 10).map((q) => q.query);
  }

  private async findRelatedTerms(query: string): Promise<string[]> {
    // This would use search analytics to find related terms
    return [];
  }

  private async findRelatedQueries(query: string): Promise<string[]> {
    // This would find related queries based on search patterns
    return [];
  }

  private getPriceRange(price: number): string {
    if (price === 0) return "Free";
    if (price < 10) return "$1-$9";
    if (price < 25) return "$10-$24";
    if (price < 50) return "$25-$49";
    if (price < 100) return "$50-$99";
    return "$100+";
  }

  // Analytics methods
  async getSearchAnalytics(): Promise<SearchAnalytics> {
    return this.analytics;
  }

  async getSearchHistory(userId?: string): Promise<SearchHistory[]> {
    if (userId) {
      return this.history.filter((h) => h.filters.userId === userId);
    }
    return this.history;
  }

  async getPopularQueries(
    limit: number = 10,
  ): Promise<{ query: string; count: number }[]> {
    return this.analytics.popularQueries.slice(0, limit);
  }

  getStatus(): any {
    return {
      initialized: this.initialized,
      totalSearches: this.analytics.totalSearches,
      historyCount: this.history.length,
      popularQueriesCount: this.analytics.popularQueries.length,
      sortOptions: this.sortOptions.length,
      performance: this.analytics.performance,
    };
  }

  async destroy(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    this.emit("info", "Destroying Plugin Search Manager...");

    try {
      // Clear all data
      this.filters = {};
      this.sortOptions = [];
      this.analytics = {
        totalSearches: 0,
        popularQueries: [],
        searchTrends: [],
        userSearches: {},
        performance: {
          averageResponseTime: 0,
          cacheHitRate: 0,
          errorRate: 0,
        },
      };
      this.history = [];

      this.initialized = false;
      this.emit("destroyed");
      this.emit("info", "Plugin Search Manager destroyed successfully");
    } catch (error) {
      this.emit("error", `Failed to destroy plugin search: ${error}`);
      throw error;
    }
  }
}
