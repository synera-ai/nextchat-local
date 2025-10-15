// Plugin Lifecycle Manager
// This file handles plugin lifecycle management including installation, initialization, and cleanup

import { EventEmitter } from "events";
import {
  Plugin,
  PluginInstance,
  PluginMetadata,
  PluginConfig,
  PluginState,
  PluginError,
  PluginDependencyError,
} from "./types";

export class PluginLifecycleManager extends EventEmitter {
  private plugins: Map<string, PluginInstance> = new Map();
  private initialized = false;

  constructor() {
    super();
  }

  // Initialize the lifecycle manager
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
  }

  // Install plugin
  async installPlugin(
    metadata: PluginMetadata,
    source: string,
  ): Promise<PluginInstance> {
    if (!this.initialized) {
      throw new PluginError(
        "Lifecycle manager not initialized",
        "system",
        "NOT_INITIALIZED",
      );
    }

    try {
      // Check dependencies
      await this.checkDependencies(metadata);

      // Create plugin instance
      const pluginInstance: PluginInstance = {
        metadata,
        config: {
          enabled: false,
          settings: {},
          permissions: [],
          rateLimits: {},
          hooks: {},
          middleware: {},
        },
        state: "installed",
        instance: null as any, // Will be set when plugin is loaded
        usageCount: 0,
        errorCount: 0,
        performance: {
          avgResponseTime: 0,
          totalRequests: 0,
          successRate: 100,
          memoryUsage: 0,
        },
      };

      // Store plugin instance
      this.plugins.set(metadata.id, pluginInstance);

      this.emit("plugin:installed", pluginInstance);
      return pluginInstance;
    } catch (error) {
      if (error instanceof PluginError) {
        throw error;
      }
      throw new PluginError(
        `Failed to install plugin ${metadata.id}: ${error}`,
        metadata.id,
        "INSTALLATION_ERROR",
        error,
      );
    }
  }

  // Load plugin
  async loadPlugin(pluginConfig: {
    id: string;
    config: PluginConfig;
  }): Promise<PluginInstance> {
    if (!this.initialized) {
      throw new PluginError(
        "Lifecycle manager not initialized",
        "system",
        "NOT_INITIALIZED",
      );
    }

    try {
      // In a real implementation, this would dynamically load the plugin module
      // For now, we'll create a mock plugin instance
      const mockPlugin: Plugin = {
        initialize: async () => {},
        destroy: async () => {},
        configure: async (config: Partial<PluginConfig>) => {},
        getConfig: () => pluginConfig.config,
        getCapabilities: () => ({
          tools: [],
          resources: [],
          actions: [],
          hooks: [],
          middleware: [],
        }),
        getTools: () => [],
        getResources: () => [],
        getActions: () => [],
        getHooks: () => [],
        getMiddleware: () => [],
        enable: async () => {},
        disable: async () => {},
        restart: async () => {},
        getStatus: () => "installed" as PluginState,
        getHealth: () => ({
          status: "healthy" as const,
          message: "Plugin is healthy",
          metrics: {},
        }),
        on: function (event: string, listener: (...args: any[]) => void) {
          return this;
        },
        emit: function (event: string, ...args: any[]) {
          return true;
        },
        removeListener: function (
          event: string,
          listener: (...args: any[]) => void,
        ) {
          return this;
        },
      };

      const pluginInstance: PluginInstance = {
        metadata: {
          id: pluginConfig.id,
          name: pluginConfig.id,
          description: "Mock plugin",
          version: "1.0.0",
          author: { name: "System" },
          license: "MIT",
          keywords: [],
          category: "system",
          tags: [],
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
        config: pluginConfig.config,
        state: "installed",
        instance: mockPlugin,
        usageCount: 0,
        errorCount: 0,
        performance: {
          avgResponseTime: 0,
          totalRequests: 0,
          successRate: 100,
          memoryUsage: 0,
        },
      };

      this.plugins.set(pluginConfig.id, pluginInstance);
      return pluginInstance;
    } catch (error) {
      throw new PluginError(
        `Failed to load plugin ${pluginConfig.id}: ${error}`,
        pluginConfig.id,
        "LOAD_ERROR",
        error,
      );
    }
  }

  // Uninstall plugin
  async uninstallPlugin(pluginId: string): Promise<void> {
    if (!this.initialized) {
      throw new PluginError(
        "Lifecycle manager not initialized",
        "system",
        "NOT_INITIALIZED",
      );
    }

    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new PluginError(
        `Plugin ${pluginId} not found`,
        pluginId,
        "NOT_FOUND",
      );
    }

    try {
      // Disable plugin if enabled
      if (plugin.state === "enabled" || plugin.state === "active") {
        await this.disablePlugin(plugin);
      }

      // Destroy plugin instance
      if (plugin.instance) {
        try {
          await plugin.instance.destroy();
        } catch (error) {
          console.error(`Failed to destroy plugin ${pluginId}:`, error);
        }
      }

      // Remove from registry
      this.plugins.delete(pluginId);

      this.emit("plugin:uninstalled", pluginId);
    } catch (error) {
      if (error instanceof PluginError) {
        throw error;
      }
      throw new PluginError(
        `Failed to uninstall plugin ${pluginId}: ${error}`,
        pluginId,
        "UNINSTALLATION_ERROR",
        error,
      );
    }
  }

  // Enable plugin
  async enablePlugin(plugin: PluginInstance): Promise<void> {
    if (!this.initialized) {
      throw new PluginError(
        "Lifecycle manager not initialized",
        "system",
        "NOT_INITIALIZED",
      );
    }

    try {
      // Check if plugin is already enabled
      if (plugin.state === "enabled" || plugin.state === "active") {
        return;
      }

      // Check dependencies
      await this.checkDependencies(plugin.metadata);

      // Set state to loading
      plugin.state = "loading";

      // Initialize plugin if not already initialized
      if (!plugin.instance) {
        plugin.state = "initializing";
        // In a real implementation, this would load the actual plugin module
        plugin.state = "active";
      } else {
        // Enable plugin
        await plugin.instance.enable();
        plugin.state = "enabled";
      }

      this.emit("plugin:enabled", plugin);
    } catch (error) {
      plugin.state = "error";
      plugin.error = error as Error;
      plugin.errorCount++;

      if (error instanceof PluginError) {
        throw error;
      }
      throw new PluginError(
        `Failed to enable plugin ${plugin.metadata.id}: ${error}`,
        plugin.metadata.id,
        "ENABLE_ERROR",
        error,
      );
    }
  }

  // Disable plugin
  async disablePlugin(plugin: PluginInstance): Promise<void> {
    if (!this.initialized) {
      throw new PluginError(
        "Lifecycle manager not initialized",
        "system",
        "NOT_INITIALIZED",
      );
    }

    try {
      // Check if plugin is already disabled
      if (plugin.state === "disabled" || plugin.state === "installed") {
        return;
      }

      // Set state to shutting down
      plugin.state = "shutting_down";

      // Disable plugin
      if (plugin.instance) {
        await plugin.instance.disable();
      }

      plugin.state = "disabled";
      this.emit("plugin:disabled", plugin);
    } catch (error) {
      plugin.state = "error";
      plugin.error = error as Error;
      plugin.errorCount++;

      if (error instanceof PluginError) {
        throw error;
      }
      throw new PluginError(
        `Failed to disable plugin ${plugin.metadata.id}: ${error}`,
        plugin.metadata.id,
        "DISABLE_ERROR",
        error,
      );
    }
  }

  // Restart plugin
  async restartPlugin(plugin: PluginInstance): Promise<void> {
    if (!this.initialized) {
      throw new PluginError(
        "Lifecycle manager not initialized",
        "system",
        "NOT_INITIALIZED",
      );
    }

    try {
      const wasEnabled =
        plugin.state === "enabled" || plugin.state === "active";

      // Disable plugin if enabled
      if (wasEnabled) {
        await this.disablePlugin(plugin);
      }

      // Re-enable plugin if it was enabled
      if (wasEnabled) {
        await this.enablePlugin(plugin);
      }

      this.emit("plugin:restarted", plugin);
    } catch (error) {
      if (error instanceof PluginError) {
        throw error;
      }
      throw new PluginError(
        `Failed to restart plugin ${plugin.metadata.id}: ${error}`,
        plugin.metadata.id,
        "RESTART_ERROR",
        error,
      );
    }
  }

  // Check plugin dependencies
  private async checkDependencies(metadata: PluginMetadata): Promise<void> {
    if (!metadata.dependencies) {
      return;
    }

    const missingDependencies: string[] = [];

    for (const [depName, depVersion] of Object.entries(metadata.dependencies)) {
      // In a real implementation, this would check if the dependency is available
      // For now, we'll assume all dependencies are available
    }

    if (missingDependencies.length > 0) {
      throw new PluginDependencyError(
        metadata.id,
        `Missing dependencies: ${missingDependencies.join(", ")}`,
        { missing: missingDependencies },
      );
    }
  }

  // Get plugin instance
  getPlugin(pluginId: string): PluginInstance | undefined {
    return this.plugins.get(pluginId);
  }

  // Get all plugin instances
  getAllPlugins(): PluginInstance[] {
    return Array.from(this.plugins.values());
  }

  // Get plugins by state
  getPluginsByState(state: PluginState): PluginInstance[] {
    return Array.from(this.plugins.values()).filter(
      (plugin) => plugin.state === state,
    );
  }

  // Get plugin statistics
  getStats(): {
    total: number;
    byState: Record<PluginState, number>;
    errorCount: number;
    avgPerformance: {
      responseTime: number;
      successRate: number;
      memoryUsage: number;
    };
  } {
    const plugins = Array.from(this.plugins.values());
    const byState: Record<PluginState, number> = {
      uninstalled: 0,
      installed: 0,
      enabled: 0,
      disabled: 0,
      error: 0,
      loading: 0,
      initializing: 0,
      active: 0,
      shutting_down: 0,
    };

    let totalResponseTime = 0;
    let totalSuccessRate = 0;
    let totalMemoryUsage = 0;
    let errorCount = 0;

    for (const plugin of plugins) {
      byState[plugin.state]++;
      totalResponseTime += plugin.performance.avgResponseTime;
      totalSuccessRate += plugin.performance.successRate;
      totalMemoryUsage += plugin.performance.memoryUsage;
      errorCount += plugin.errorCount;
    }

    return {
      total: plugins.length,
      byState,
      errorCount,
      avgPerformance: {
        responseTime:
          plugins.length > 0 ? totalResponseTime / plugins.length : 0,
        successRate: plugins.length > 0 ? totalSuccessRate / plugins.length : 0,
        memoryUsage: plugins.length > 0 ? totalMemoryUsage / plugins.length : 0,
      },
    };
  }

  // Cleanup
  async destroy(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    try {
      // Disable all plugins
      for (const plugin of this.plugins.values()) {
        if (plugin.state === "enabled" || plugin.state === "active") {
          try {
            await this.disablePlugin(plugin);
          } catch (error) {
            console.error(
              `Failed to disable plugin ${plugin.metadata.id}:`,
              error,
            );
          }
        }
      }

      this.plugins.clear();
      this.initialized = false;
    } catch (error) {
      console.error("Failed to destroy lifecycle manager:", error);
    }
  }
}
