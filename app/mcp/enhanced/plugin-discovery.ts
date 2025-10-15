// Plugin Discovery System

import { EventEmitter } from "events";
import { MCPClientLogger } from "../logger";
import { ServerConfig } from "../types";

// Plugin metadata interface
export interface PluginMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  repository?: string;
  homepage?: string;
  license?: string;
  tags: string[];
  category: string;
  capabilities: string[];
  dependencies?: string[];
  peerDependencies?: string[];
  configSchema?: any;
  icon?: string;
  screenshots?: string[];
  documentation?: string;
  changelog?: string;
  lastUpdated: Date;
  downloadCount?: number;
  rating?: number;
  verified: boolean;
}

// Plugin registry entry
export interface PluginRegistryEntry {
  metadata: PluginMetadata;
  config: ServerConfig;
  status: "available" | "installed" | "active" | "error" | "disabled";
  installationPath?: string;
  lastUsed?: Date;
  usageCount: number;
  errorCount: number;
  lastError?: string;
}

// Plugin discovery source
export interface PluginDiscoverySource {
  id: string;
  name: string;
  type: "npm" | "github" | "git" | "local" | "marketplace";
  url: string;
  enabled: boolean;
  priority: number;
  lastSync?: Date;
  syncInterval?: number;
}

// Plugin search filters
export interface PluginSearchFilters {
  category?: string;
  tags?: string[];
  capabilities?: string[];
  verified?: boolean;
  minRating?: number;
  author?: string;
  license?: string;
  status?: string[];
}

// Plugin search result
export interface PluginSearchResult {
  plugins: PluginRegistryEntry[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  filters: PluginSearchFilters;
}

// Plugin discovery manager
export class PluginDiscoveryManager extends EventEmitter {
  private registry: Map<string, PluginRegistryEntry> = new Map();
  private discoverySources: Map<string, PluginDiscoverySource> = new Map();
  private logger: MCPClientLogger;
  private syncTimer?: NodeJS.Timeout;

  constructor() {
    super();
    this.logger = new MCPClientLogger();
    this.initializeDefaultSources();
  }

  // Initialize default discovery sources
  private initializeDefaultSources(): void {
    const defaultSources: PluginDiscoverySource[] = [
      {
        id: "npm-registry",
        name: "NPM Registry",
        type: "npm",
        url: "https://registry.npmjs.org",
        enabled: true,
        priority: 1,
        syncInterval: 3600000, // 1 hour
      },
      {
        id: "github-mcp",
        name: "GitHub MCP Plugins",
        type: "github",
        url: "https://api.github.com/search/repositories?q=topic:mcp-plugin",
        enabled: true,
        priority: 2,
        syncInterval: 1800000, // 30 minutes
      },
      {
        id: "local-plugins",
        name: "Local Plugins",
        type: "local",
        url: "./plugins",
        enabled: true,
        priority: 3,
        syncInterval: 60000, // 1 minute
      },
    ];

    defaultSources.forEach((source) => {
      this.addDiscoverySource(source);
    });
  }

  // Add discovery source
  addDiscoverySource(source: PluginDiscoverySource): void {
    this.discoverySources.set(source.id, source);
    this.logger.info(`Added discovery source: ${source.name}`);
    this.emit("sourceAdded", { source });
  }

  // Remove discovery source
  removeDiscoverySource(sourceId: string): void {
    const source = this.discoverySources.get(sourceId);
    if (source) {
      this.discoverySources.delete(sourceId);
      this.logger.info(`Removed discovery source: ${source.name}`);
      this.emit("sourceRemoved", { sourceId, source });
    }
  }

  // Get discovery source
  getDiscoverySource(sourceId: string): PluginDiscoverySource | undefined {
    return this.discoverySources.get(sourceId);
  }

  // Get all discovery sources
  getAllDiscoverySources(): PluginDiscoverySource[] {
    return Array.from(this.discoverySources.values()).sort(
      (a, b) => a.priority - b.priority,
    );
  }

  // Start automatic sync
  startAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(async () => {
      await this.syncAllSources();
    }, 300000); // 5 minutes

    this.logger.info("Started automatic plugin discovery sync");
  }

  // Stop automatic sync
  stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
    }
    this.logger.info("Stopped automatic plugin discovery sync");
  }

  // Sync all sources
  async syncAllSources(): Promise<void> {
    const sources = this.getAllDiscoverySources().filter(
      (source) => source.enabled,
    );

    for (const source of sources) {
      try {
        await this.syncSource(source.id);
      } catch (error) {
        this.logger.error(`Failed to sync source ${source.name}:`, error);
        this.emit("syncError", { sourceId: source.id, error });
      }
    }
  }

  // Sync specific source
  async syncSource(sourceId: string): Promise<void> {
    const source = this.discoverySources.get(sourceId);
    if (!source || !source.enabled) {
      return;
    }

    this.logger.info(`Syncing discovery source: ${source.name}`);

    try {
      let plugins: PluginMetadata[] = [];

      switch (source.type) {
        case "npm":
          plugins = await this.syncNpmSource(source);
          break;
        case "github":
          plugins = await this.syncGitHubSource(source);
          break;
        case "local":
          plugins = await this.syncLocalSource(source);
          break;
        case "marketplace":
          plugins = await this.syncMarketplaceSource(source);
          break;
        default:
          this.logger.warn(`Unknown source type: ${source.type}`);
          return;
      }

      // Update registry with discovered plugins
      for (const plugin of plugins) {
        await this.registerPlugin(plugin, source);
      }

      // Update source sync time
      source.lastSync = new Date();

      this.emit("sourceSynced", { sourceId, pluginCount: plugins.length });
      this.logger.info(`Synced ${plugins.length} plugins from ${source.name}`);
    } catch (error) {
      this.logger.error(`Failed to sync source ${source.name}:`, error);
      throw error;
    }
  }

  // Sync NPM source
  private async syncNpmSource(
    source: PluginDiscoverySource,
  ): Promise<PluginMetadata[]> {
    // This would implement NPM registry search
    // For now, return mock data
    return [
      {
        id: "mcp-filesystem",
        name: "MCP Filesystem",
        description: "File system operations for MCP",
        version: "1.0.0",
        author: "MCP Team",
        repository: "https://github.com/modelcontextprotocol/server-filesystem",
        tags: ["filesystem", "file", "directory"],
        category: "system",
        capabilities: ["read", "write", "list"],
        verified: true,
        lastUpdated: new Date(),
      },
    ];
  }

  // Sync GitHub source
  private async syncGitHubSource(
    source: PluginDiscoverySource,
  ): Promise<PluginMetadata[]> {
    // This would implement GitHub API search
    // For now, return mock data
    return [
      {
        id: "mcp-git",
        name: "MCP Git",
        description: "Git operations for MCP",
        version: "1.0.0",
        author: "MCP Team",
        repository: "https://github.com/modelcontextprotocol/server-git",
        tags: ["git", "version-control", "repository"],
        category: "development",
        capabilities: ["clone", "commit", "push", "pull"],
        verified: true,
        lastUpdated: new Date(),
      },
    ];
  }

  // Sync local source
  private async syncLocalSource(
    source: PluginDiscoverySource,
  ): Promise<PluginMetadata[]> {
    // This would scan local directories for plugins
    // For now, return empty array
    return [];
  }

  // Sync marketplace source
  private async syncMarketplaceSource(
    source: PluginDiscoverySource,
  ): Promise<PluginMetadata[]> {
    // This would implement marketplace API
    // For now, return empty array
    return [];
  }

  // Register plugin in registry
  async registerPlugin(
    metadata: PluginMetadata,
    source: PluginDiscoverySource,
  ): Promise<void> {
    const existingEntry = this.registry.get(metadata.id);

    const entry: PluginRegistryEntry = {
      metadata,
      config: this.createDefaultConfig(metadata),
      status: existingEntry?.status || "available",
      installationPath: existingEntry?.installationPath,
      lastUsed: existingEntry?.lastUsed,
      usageCount: existingEntry?.usageCount || 0,
      errorCount: existingEntry?.errorCount || 0,
      lastError: existingEntry?.lastError,
    };

    this.registry.set(metadata.id, entry);
    this.emit("pluginRegistered", { plugin: entry });
  }

  // Create default config for plugin
  private createDefaultConfig(metadata: PluginMetadata): ServerConfig {
    return {
      command: "npx",
      args: [metadata.id],
      status: "active",
    };
  }

  // Search plugins
  async searchPlugins(
    query: string = "",
    filters: PluginSearchFilters = {},
    page: number = 1,
    pageSize: number = 20,
  ): Promise<PluginSearchResult> {
    let plugins = Array.from(this.registry.values());

    // Apply text search
    if (query) {
      const searchTerms = query.toLowerCase().split(" ");
      plugins = plugins.filter((plugin) => {
        const searchableText = [
          plugin.metadata.name,
          plugin.metadata.description,
          plugin.metadata.author,
          ...plugin.metadata.tags,
        ]
          .join(" ")
          .toLowerCase();

        return searchTerms.every((term) => searchableText.includes(term));
      });
    }

    // Apply filters
    if (filters.category) {
      plugins = plugins.filter(
        (plugin) => plugin.metadata.category === filters.category,
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      plugins = plugins.filter((plugin) =>
        filters.tags!.some((tag) => plugin.metadata.tags.includes(tag)),
      );
    }

    if (filters.capabilities && filters.capabilities.length > 0) {
      plugins = plugins.filter((plugin) =>
        filters.capabilities!.some((cap) =>
          plugin.metadata.capabilities.includes(cap),
        ),
      );
    }

    if (filters.verified !== undefined) {
      plugins = plugins.filter(
        (plugin) => plugin.metadata.verified === filters.verified,
      );
    }

    if (filters.minRating !== undefined) {
      plugins = plugins.filter(
        (plugin) => (plugin.metadata.rating || 0) >= filters.minRating!,
      );
    }

    if (filters.author) {
      plugins = plugins.filter((plugin) =>
        plugin.metadata.author
          .toLowerCase()
          .includes(filters.author!.toLowerCase()),
      );
    }

    if (filters.status && filters.status.length > 0) {
      plugins = plugins.filter((plugin) =>
        filters.status!.includes(plugin.status),
      );
    }

    // Sort by relevance (verified first, then by rating, then by name)
    plugins.sort((a, b) => {
      if (a.metadata.verified !== b.metadata.verified) {
        return a.metadata.verified ? -1 : 1;
      }
      if (a.metadata.rating !== b.metadata.rating) {
        return (b.metadata.rating || 0) - (a.metadata.rating || 0);
      }
      return a.metadata.name.localeCompare(b.metadata.name);
    });

    // Pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedPlugins = plugins.slice(startIndex, endIndex);

    return {
      plugins: paginatedPlugins,
      total: plugins.length,
      page,
      pageSize,
      hasMore: endIndex < plugins.length,
      filters,
    };
  }

  // Get plugin by ID
  getPlugin(id: string): PluginRegistryEntry | undefined {
    return this.registry.get(id);
  }

  // Get all plugins
  getAllPlugins(): PluginRegistryEntry[] {
    return Array.from(this.registry.values());
  }

  // Update plugin status
  updatePluginStatus(id: string, status: PluginRegistryEntry["status"]): void {
    const plugin = this.registry.get(id);
    if (plugin) {
      plugin.status = status;
      this.emit("pluginStatusUpdated", { pluginId: id, status });
    }
  }

  // Update plugin usage
  updatePluginUsage(id: string): void {
    const plugin = this.registry.get(id);
    if (plugin) {
      plugin.usageCount++;
      plugin.lastUsed = new Date();
      this.emit("pluginUsed", { pluginId: id, usageCount: plugin.usageCount });
    }
  }

  // Record plugin error
  recordPluginError(id: string, error: string): void {
    const plugin = this.registry.get(id);
    if (plugin) {
      plugin.errorCount++;
      plugin.lastError = error;
      this.emit("pluginError", {
        pluginId: id,
        error,
        errorCount: plugin.errorCount,
      });
    }
  }

  // Get plugin categories
  getPluginCategories(): string[] {
    const categories = new Set<string>();
    for (const plugin of this.registry.values()) {
      categories.add(plugin.metadata.category);
    }
    return Array.from(categories).sort();
  }

  // Get plugin tags
  getPluginTags(): string[] {
    const tags = new Set<string>();
    for (const plugin of this.registry.values()) {
      plugin.metadata.tags.forEach((tag) => tags.add(tag));
    }
    return Array.from(tags).sort();
  }

  // Get plugin capabilities
  getPluginCapabilities(): string[] {
    const capabilities = new Set<string>();
    for (const plugin of this.registry.values()) {
      plugin.metadata.capabilities.forEach((cap) => capabilities.add(cap));
    }
    return Array.from(capabilities).sort();
  }

  // Get registry statistics
  getRegistryStats(): {
    totalPlugins: number;
    availablePlugins: number;
    installedPlugins: number;
    activePlugins: number;
    errorPlugins: number;
    categories: number;
    tags: number;
    capabilities: number;
  } {
    const plugins = Array.from(this.registry.values());

    return {
      totalPlugins: plugins.length,
      availablePlugins: plugins.filter((p) => p.status === "available").length,
      installedPlugins: plugins.filter((p) => p.status === "installed").length,
      activePlugins: plugins.filter((p) => p.status === "active").length,
      errorPlugins: plugins.filter((p) => p.status === "error").length,
      categories: this.getPluginCategories().length,
      tags: this.getPluginTags().length,
      capabilities: this.getPluginCapabilities().length,
    };
  }

  // Cleanup
  async cleanup(): Promise<void> {
    this.stopAutoSync();
    this.registry.clear();
    this.discoverySources.clear();
    this.removeAllListeners();
  }
}

// Export singleton instance
export const pluginDiscoveryManager = new PluginDiscoveryManager();
