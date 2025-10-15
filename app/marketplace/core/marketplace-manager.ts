// Marketplace Manager
// This file manages the plugin marketplace functionality

import { EventEmitter } from "events";
import {
  PluginMetadata,
  PluginSearchFilters,
  PluginError,
} from "../../plugins/core/types";

export class MarketplaceManager extends EventEmitter {
  private plugins: Map<string, MarketplacePlugin> = new Map();
  private categories: Map<string, Category> = new Map();
  private reviews: Map<string, Review[]> = new Map();
  private collections: Map<string, Collection> = new Map();
  private users: Map<string, User> = new Map();
  private initialized = false;

  constructor() {
    super();
    this.initializeDefaultCategories();
  }

  // Initialize the marketplace manager
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Load marketplace data
      await this.loadMarketplaceData();
      this.initialized = true;
    } catch (error) {
      throw new PluginError(
        `Failed to initialize marketplace: ${error}`,
        "system",
        "MARKETPLACE_INIT_ERROR",
        error,
      );
    }
  }

  // Initialize default categories
  private initializeDefaultCategories(): void {
    const defaultCategories: Category[] = [
      {
        id: "productivity",
        name: "Productivity",
        description: "Tools to enhance productivity and workflow",
        icon: "⚡",
        color: "#4CAF50",
        plugins: [],
      },
      {
        id: "communication",
        name: "Communication",
        description: "Communication and collaboration tools",
        icon: "💬",
        color: "#2196F3",
        plugins: [],
      },
      {
        id: "development",
        name: "Development",
        description: "Development and coding tools",
        icon: "💻",
        color: "#FF9800",
        plugins: [],
      },
      {
        id: "utilities",
        name: "Utilities",
        description: "General utility plugins",
        icon: "🔧",
        color: "#9C27B0",
        plugins: [],
      },
      {
        id: "entertainment",
        name: "Entertainment",
        description: "Entertainment and media plugins",
        icon: "🎮",
        color: "#E91E63",
        plugins: [],
      },
    ];

    for (const category of defaultCategories) {
      this.categories.set(category.id, category);
    }
  }

  // Load marketplace data
  private async loadMarketplaceData(): Promise<void> {
    // In a real implementation, this would load from a database or API
    // For now, we'll create some mock data
    await this.createMockData();
  }

  // Create mock marketplace data
  private async createMockData(): Promise<void> {
    const mockPlugins: MarketplacePlugin[] = [
      {
        id: "file-manager-pro",
        metadata: {
          id: "file-manager-pro",
          name: "File Manager Pro",
          description: "Advanced file management with cloud sync",
          version: "2.1.0",
          author: { name: "NextChat Team" },
          license: "MIT",
          keywords: ["file", "manager", "cloud", "sync"],
          category: "productivity",
          tags: ["file", "manager", "cloud"],
          capabilities: {
            tools: [],
            resources: [],
            actions: [],
            hooks: [],
            middleware: [],
          },
          dependencies: {},
          peerDependencies: {},
          configSchema: {
            type: "object",
            properties: {},
          },
          lastUpdated: new Date(),
          verified: true,
        },
        downloads: 15420,
        rating: 4.8,
        reviews: 234,
        price: 0,
        featured: true,
        trending: true,
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-10-15"),
      },
      {
        id: "code-assistant",
        metadata: {
          id: "code-assistant",
          name: "Code Assistant",
          description: "AI-powered code completion and suggestions",
          version: "1.5.2",
          author: { name: "DevTools Inc" },
          license: "Apache-2.0",
          keywords: ["code", "ai", "completion", "development"],
          category: "development",
          tags: ["code", "ai", "development"],
          capabilities: {
            tools: [],
            resources: [],
            actions: [],
            hooks: [],
            middleware: [],
          },
          dependencies: {},
          peerDependencies: {},
          configSchema: {
            type: "object",
            properties: {},
          },
          lastUpdated: new Date(),
          verified: true,
        },
        downloads: 8930,
        rating: 4.6,
        reviews: 156,
        price: 9.99,
        featured: false,
        trending: true,
        createdAt: new Date("2024-03-20"),
        updatedAt: new Date("2024-10-10"),
      },
    ];

    for (const plugin of mockPlugins) {
      this.plugins.set(plugin.id, plugin);

      // Add to category
      const category = this.categories.get(plugin.metadata.category);
      if (category) {
        category.plugins.push(plugin.id);
      }
    }
  }

  // Search plugins
  async searchPlugins(
    query: string,
    filters?: PluginSearchFilters,
  ): Promise<MarketplaceSearchResult> {
    if (!this.initialized) {
      throw new PluginError(
        "Marketplace not initialized",
        "system",
        "NOT_INITIALIZED",
      );
    }

    try {
      let results = Array.from(this.plugins.values());

      // Apply search query
      if (query) {
        const searchTerms = query.toLowerCase().split(/\s+/);
        results = results.filter((plugin) => {
          const searchableText = [
            plugin.metadata.name,
            plugin.metadata.description,
            ...plugin.metadata.keywords,
            ...plugin.metadata.tags,
            plugin.metadata.author.name,
          ]
            .join(" ")
            .toLowerCase();

          return searchTerms.every((term) => searchableText.includes(term));
        });
      }

      // Apply filters
      if (filters) {
        results = this.applyFilters(results, filters);
      }

      // Sort by relevance and popularity
      results = this.sortResults(results, query);

      return {
        plugins: results,
        total: results.length,
        page: 1,
        pageSize: results.length,
        hasMore: false,
        filters: filters || {},
      };
    } catch (error) {
      throw new PluginError(
        `Search failed: ${error}`,
        "system",
        "SEARCH_ERROR",
        error,
      );
    }
  }

  // Apply search filters
  private applyFilters(
    plugins: MarketplacePlugin[],
    filters: PluginSearchFilters,
  ): MarketplacePlugin[] {
    return plugins.filter((plugin) => {
      // Category filter
      if (filters.category && plugin.metadata.category !== filters.category) {
        return false;
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        if (!filters.tags.every((tag) => plugin.metadata.tags.includes(tag))) {
          return false;
        }
      }

      // Verified filter
      if (
        filters.verified !== undefined &&
        plugin.metadata.verified !== filters.verified
      ) {
        return false;
      }

      // Rating filter
      if (filters.minRating && plugin.rating < filters.minRating) {
        return false;
      }

      // Author filter
      if (filters.author && plugin.metadata.author.name !== filters.author) {
        return false;
      }

      // License filter
      if (filters.license && plugin.metadata.license !== filters.license) {
        return false;
      }

      return true;
    });
  }

  // Sort search results
  private sortResults(
    plugins: MarketplacePlugin[],
    query: string,
  ): MarketplacePlugin[] {
    return plugins.sort((a, b) => {
      // Prioritize featured plugins
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;

      // Prioritize trending plugins
      if (a.trending && !b.trending) return -1;
      if (!a.trending && b.trending) return 1;

      // Prioritize exact name matches
      const aNameMatch = a.metadata.name
        .toLowerCase()
        .includes(query.toLowerCase());
      const bNameMatch = b.metadata.name
        .toLowerCase()
        .includes(query.toLowerCase());
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;

      // Sort by rating
      if (a.rating !== b.rating) return b.rating - a.rating;

      // Sort by downloads
      return b.downloads - a.downloads;
    });
  }

  // Get plugin details
  getPlugin(pluginId: string): MarketplacePlugin | undefined {
    return this.plugins.get(pluginId);
  }

  // Get featured plugins
  getFeaturedPlugins(): MarketplacePlugin[] {
    return Array.from(this.plugins.values())
      .filter((plugin) => plugin.featured)
      .sort((a, b) => b.downloads - a.downloads);
  }

  // Get trending plugins
  getTrendingPlugins(): MarketplacePlugin[] {
    return Array.from(this.plugins.values())
      .filter((plugin) => plugin.trending)
      .sort((a, b) => b.downloads - a.downloads);
  }

  // Get plugins by category
  getPluginsByCategory(categoryId: string): MarketplacePlugin[] {
    const category = this.categories.get(categoryId);
    if (!category) {
      return [];
    }

    return category.plugins
      .map((pluginId) => this.plugins.get(pluginId))
      .filter((plugin) => plugin !== undefined) as MarketplacePlugin[];
  }

  // Get all categories
  getCategories(): Category[] {
    return Array.from(this.categories.values());
  }

  // Get category by ID
  getCategory(categoryId: string): Category | undefined {
    return this.categories.get(categoryId);
  }

  // Add plugin to marketplace
  async addPlugin(plugin: MarketplacePlugin): Promise<void> {
    this.plugins.set(plugin.id, plugin);

    // Add to category
    const category = this.categories.get(plugin.metadata.category);
    if (category && !category.plugins.includes(plugin.id)) {
      category.plugins.push(plugin.id);
    }

    this.emit("plugin:added", plugin);
  }

  // Update plugin
  async updatePlugin(
    pluginId: string,
    updates: Partial<MarketplacePlugin>,
  ): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new PluginError(
        `Plugin ${pluginId} not found`,
        pluginId,
        "NOT_FOUND",
      );
    }

    const updatedPlugin = { ...plugin, ...updates };
    this.plugins.set(pluginId, updatedPlugin);

    this.emit("plugin:updated", updatedPlugin);
  }

  // Remove plugin from marketplace
  async removePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new PluginError(
        `Plugin ${pluginId} not found`,
        pluginId,
        "NOT_FOUND",
      );
    }

    // Remove from category
    const category = this.categories.get(plugin.metadata.category);
    if (category) {
      category.plugins = category.plugins.filter((id) => id !== pluginId);
    }

    this.plugins.delete(pluginId);
    this.emit("plugin:removed", pluginId);
  }

  // Get marketplace statistics
  getStats(): MarketplaceStats {
    const plugins = Array.from(this.plugins.values());

    return {
      totalPlugins: plugins.length,
      totalDownloads: plugins.reduce((sum, p) => sum + p.downloads, 0),
      totalReviews: plugins.reduce((sum, p) => sum + p.reviews, 0),
      averageRating:
        plugins.length > 0
          ? plugins.reduce((sum, p) => sum + p.rating, 0) / plugins.length
          : 0,
      featuredPlugins: plugins.filter((p) => p.featured).length,
      trendingPlugins: plugins.filter((p) => p.trending).length,
      categories: this.categories.size,
      verifiedPlugins: plugins.filter((p) => p.metadata.verified).length,
    };
  }

  // Cleanup
  async destroy(): Promise<void> {
    this.plugins.clear();
    this.categories.clear();
    this.reviews.clear();
    this.collections.clear();
    this.users.clear();
    this.initialized = false;
  }
}

// Marketplace plugin interface
export interface MarketplacePlugin {
  id: string;
  metadata: PluginMetadata;
  downloads: number;
  rating: number;
  reviews: number;
  price: number;
  featured: boolean;
  trending: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Category interface
export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  plugins: string[];
}

// Review interface
export interface Review {
  id: string;
  pluginId: string;
  userId: string;
  rating: number;
  title: string;
  content: string;
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
}

// Collection interface
export interface Collection {
  id: string;
  name: string;
  description: string;
  author: string;
  plugins: string[];
  public: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// User interface
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  plugins: string[];
  reviews: string[];
  collections: string[];
  createdAt: Date;
}

// Marketplace search result interface
export interface MarketplaceSearchResult {
  plugins: MarketplacePlugin[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  filters: PluginSearchFilters;
}

// Marketplace statistics interface
export interface MarketplaceStats {
  totalPlugins: number;
  totalDownloads: number;
  totalReviews: number;
  averageRating: number;
  featuredPlugins: number;
  trendingPlugins: number;
  categories: number;
  verifiedPlugins: number;
}
