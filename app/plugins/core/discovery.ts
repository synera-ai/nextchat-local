// Plugin Discovery Manager
// This file handles plugin discovery, search, and metadata management

import { EventEmitter } from "events";
import { PluginMetadata, PluginSearchFilters, PluginError } from "./types";

export class PluginDiscoveryManager extends EventEmitter {
  private discoveredPlugins: Map<string, PluginMetadata> = new Map();
  private discoverySources: Map<string, DiscoverySource> = new Map();
  private initialized = false;

  constructor() {
    super();
    this.initializeDefaultSources();
  }

  // Initialize the discovery manager
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
  }

  // Initialize default discovery sources
  private initializeDefaultSources(): void {
    const defaultSources: DiscoverySource[] = [
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
        id: "github-releases",
        name: "GitHub Releases",
        type: "github",
        url: "https://api.github.com",
        enabled: true,
        priority: 2,
        syncInterval: 1800000, // 30 minutes
      },
      {
        id: "local-registry",
        name: "Local Registry",
        type: "local",
        url: "file:///plugins",
        enabled: true,
        priority: 3,
        syncInterval: 60000, // 1 minute
      },
    ];

    for (const source of defaultSources) {
      this.discoverySources.set(source.id, source);
    }
  }

  // Discover all plugins from all sources
  async discoverAll(): Promise<PluginMetadata[]> {
    if (!this.initialized) {
      throw new PluginError(
        "Discovery manager not initialized",
        "system",
        "NOT_INITIALIZED",
      );
    }

    try {
      const allPlugins: PluginMetadata[] = [];

      // Discover from each enabled source
      for (const source of this.discoverySources.values()) {
        if (source.enabled) {
          try {
            const plugins = await this.discoverFromSource(source);
            allPlugins.push(...plugins);
          } catch (error) {
            console.error(
              `Failed to discover from source ${source.id}:`,
              error,
            );
          }
        }
      }

      // Remove duplicates and update cache
      const uniquePlugins = this.deduplicatePlugins(allPlugins);
      this.updateDiscoveredPlugins(uniquePlugins);

      return uniquePlugins;
    } catch (error) {
      throw new PluginError(
        `Failed to discover plugins: ${error}`,
        "system",
        "DISCOVERY_ERROR",
        error,
      );
    }
  }

  // Discover plugin from specific source
  async discoverPlugin(
    pluginId: string,
    source: string,
  ): Promise<PluginMetadata> {
    if (!this.initialized) {
      throw new PluginError(
        "Discovery manager not initialized",
        "system",
        "NOT_INITIALIZED",
      );
    }

    try {
      // Check if plugin is already discovered
      const cachedPlugin = this.discoveredPlugins.get(pluginId);
      if (cachedPlugin) {
        return cachedPlugin;
      }

      // Find source
      const discoverySource = this.discoverySources.get(source);
      if (!discoverySource) {
        throw new PluginError(
          `Discovery source not found: ${source}`,
          "system",
          "SOURCE_NOT_FOUND",
        );
      }

      // Discover plugin from source
      const plugin = await this.discoverFromSourceById(
        discoverySource,
        pluginId,
      );
      if (!plugin) {
        throw new PluginError(
          `Plugin not found: ${pluginId}`,
          pluginId,
          "PLUGIN_NOT_FOUND",
        );
      }

      // Cache discovered plugin
      this.discoveredPlugins.set(pluginId, plugin);

      this.emit("plugin:discovered", plugin);
      return plugin;
    } catch (error) {
      if (error instanceof PluginError) {
        throw error;
      }
      throw new PluginError(
        `Failed to discover plugin ${pluginId}: ${error}`,
        pluginId,
        "DISCOVERY_ERROR",
        error,
      );
    }
  }

  // Search plugins
  async search(
    query: string,
    filters?: PluginSearchFilters,
  ): Promise<PluginMetadata[]> {
    if (!this.initialized) {
      throw new PluginError(
        "Discovery manager not initialized",
        "system",
        "NOT_INITIALIZED",
      );
    }

    try {
      // Get all discovered plugins
      const allPlugins = Array.from(this.discoveredPlugins.values());

      // Apply search query
      let filteredPlugins = allPlugins;
      if (query) {
        const searchTerms = query.toLowerCase().split(/\s+/);
        filteredPlugins = allPlugins.filter((plugin) => {
          const searchableText = [
            plugin.name,
            plugin.description,
            ...plugin.keywords,
            ...plugin.tags,
            plugin.author.name,
          ]
            .join(" ")
            .toLowerCase();

          return searchTerms.every((term) => searchableText.includes(term));
        });
      }

      // Apply filters
      if (filters) {
        filteredPlugins = this.applyFilters(filteredPlugins, filters);
      }

      // Sort by relevance
      filteredPlugins = this.sortByRelevance(filteredPlugins, query);

      this.emit("plugin:search:completed", query, filteredPlugins);
      return filteredPlugins;
    } catch (error) {
      throw new PluginError(
        `Failed to search plugins: ${error}`,
        "system",
        "SEARCH_ERROR",
        error,
      );
    }
  }

  // Discover from specific source
  private async discoverFromSource(
    source: DiscoverySource,
  ): Promise<PluginMetadata[]> {
    switch (source.type) {
      case "npm":
        return await this.discoverFromNPM(source);
      case "github":
        return await this.discoverFromGitHub(source);
      case "local":
        return await this.discoverFromLocal(source);
      default:
        throw new PluginError(
          `Unsupported source type: ${source.type}`,
          "system",
          "UNSUPPORTED_SOURCE",
        );
    }
  }

  // Discover plugin by ID from specific source
  private async discoverFromSourceById(
    source: DiscoverySource,
    pluginId: string,
  ): Promise<PluginMetadata | null> {
    switch (source.type) {
      case "npm":
        return await this.discoverFromNPMById(source, pluginId);
      case "github":
        return await this.discoverFromGitHubById(source, pluginId);
      case "local":
        return await this.discoverFromLocalById(source, pluginId);
      default:
        throw new PluginError(
          `Unsupported source type: ${source.type}`,
          "system",
          "UNSUPPORTED_SOURCE",
        );
    }
  }

  // Discover from NPM registry
  private async discoverFromNPM(
    source: DiscoverySource,
  ): Promise<PluginMetadata[]> {
    // In a real implementation, this would query the NPM registry
    // For now, we'll return mock data
    return [
      {
        id: "nextchat-file-manager",
        name: "File Manager",
        description: "Manage files and directories",
        version: "1.0.0",
        author: { name: "NextChat Team" },
        license: "MIT",
        keywords: ["file", "manager", "filesystem"],
        category: "utility",
        tags: ["file", "manager"],
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
    ];
  }

  // Discover specific plugin from NPM
  private async discoverFromNPMById(
    source: DiscoverySource,
    pluginId: string,
  ): Promise<PluginMetadata | null> {
    // In a real implementation, this would query the NPM registry for the specific package
    // For now, we'll return mock data
    if (pluginId === "nextchat-file-manager") {
      return {
        id: "nextchat-file-manager",
        name: "File Manager",
        description: "Manage files and directories",
        version: "1.0.0",
        author: { name: "NextChat Team" },
        license: "MIT",
        keywords: ["file", "manager", "filesystem"],
        category: "utility",
        tags: ["file", "manager"],
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
      };
    }
    return null;
  }

  // Discover from GitHub
  private async discoverFromGitHub(
    source: DiscoverySource,
  ): Promise<PluginMetadata[]> {
    // In a real implementation, this would query the GitHub API
    return [];
  }

  // Discover specific plugin from GitHub
  private async discoverFromGitHubById(
    source: DiscoverySource,
    pluginId: string,
  ): Promise<PluginMetadata | null> {
    // In a real implementation, this would query the GitHub API
    return null;
  }

  // Discover from local directory
  private async discoverFromLocal(
    source: DiscoverySource,
  ): Promise<PluginMetadata[]> {
    // In a real implementation, this would scan the local directory
    return [];
  }

  // Discover specific plugin from local directory
  private async discoverFromLocalById(
    source: DiscoverySource,
    pluginId: string,
  ): Promise<PluginMetadata | null> {
    // In a real implementation, this would scan the local directory
    return null;
  }

  // Apply search filters
  private applyFilters(
    plugins: PluginMetadata[],
    filters: PluginSearchFilters,
  ): PluginMetadata[] {
    return plugins.filter((plugin) => {
      // Category filter
      if (filters.category && plugin.category !== filters.category) {
        return false;
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        if (!filters.tags.every((tag) => plugin.tags.includes(tag))) {
          return false;
        }
      }

      // Capabilities filter
      if (filters.capabilities && filters.capabilities.length > 0) {
        const pluginCapabilities = [
          ...plugin.capabilities.tools.map((t) => t.name),
          ...plugin.capabilities.actions.map((a) => a.name),
          ...plugin.capabilities.resources.map((r) => r.name),
        ];
        if (
          !filters.capabilities.every((cap) => pluginCapabilities.includes(cap))
        ) {
          return false;
        }
      }

      // Verified filter
      if (
        filters.verified !== undefined &&
        plugin.verified !== filters.verified
      ) {
        return false;
      }

      // Author filter
      if (filters.author && plugin.author.name !== filters.author) {
        return false;
      }

      // License filter
      if (filters.license && plugin.license !== filters.license) {
        return false;
      }

      return true;
    });
  }

  // Sort plugins by relevance
  private sortByRelevance(
    plugins: PluginMetadata[],
    query: string,
  ): PluginMetadata[] {
    return plugins.sort((a, b) => {
      // Prioritize verified plugins
      if (a.verified && !b.verified) return -1;
      if (!a.verified && b.verified) return 1;

      // Prioritize exact name matches
      const aNameMatch = a.name.toLowerCase().includes(query.toLowerCase());
      const bNameMatch = b.name.toLowerCase().includes(query.toLowerCase());
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;

      // Sort by last updated
      return b.lastUpdated.getTime() - a.lastUpdated.getTime();
    });
  }

  // Remove duplicate plugins
  private deduplicatePlugins(plugins: PluginMetadata[]): PluginMetadata[] {
    const seen = new Set<string>();
    return plugins.filter((plugin) => {
      if (seen.has(plugin.id)) {
        return false;
      }
      seen.add(plugin.id);
      return true;
    });
  }

  // Update discovered plugins cache
  private updateDiscoveredPlugins(plugins: PluginMetadata[]): void {
    for (const plugin of plugins) {
      this.discoveredPlugins.set(plugin.id, plugin);
    }
  }

  // Add discovery source
  addDiscoverySource(source: DiscoverySource): void {
    this.discoverySources.set(source.id, source);
  }

  // Remove discovery source
  removeDiscoverySource(sourceId: string): void {
    this.discoverySources.delete(sourceId);
  }

  // Get discovery sources
  getDiscoverySources(): DiscoverySource[] {
    return Array.from(this.discoverySources.values());
  }

  // Get discovered plugins
  getDiscoveredPlugins(): PluginMetadata[] {
    return Array.from(this.discoveredPlugins.values());
  }

  // Get discovery statistics
  getStats(): {
    totalDiscovered: number;
    sourcesCount: number;
    enabledSources: number;
    lastSync: Date | null;
  } {
    const sources = Array.from(this.discoverySources.values());
    return {
      totalDiscovered: this.discoveredPlugins.size,
      sourcesCount: sources.length,
      enabledSources: sources.filter((s) => s.enabled).length,
      lastSync: null, // In a real implementation, this would track last sync time
    };
  }

  // Cleanup
  async destroy(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    this.discoveredPlugins.clear();
    this.discoverySources.clear();
    this.initialized = false;
  }
}

// Discovery source interface
export interface DiscoverySource {
  id: string;
  name: string;
  type: "npm" | "github" | "local" | "marketplace";
  url: string;
  enabled: boolean;
  priority: number;
  syncInterval?: number;
  lastSync?: Date;
  credentials?: {
    token?: string;
    username?: string;
    password?: string;
  };
}
