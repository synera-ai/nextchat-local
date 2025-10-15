// Core Plugin Manager
// This file implements the main plugin management system

import { EventEmitter } from "events";
import {
  PluginInstance,
  PluginManager,
  PluginMetadata,
  PluginConfig,
  PluginSearchFilters,
  PluginError,
  PluginConfigurationError,
  PluginExecutionError,
} from "./types";
import { PluginConfigurationManager } from "./configuration";
import { PluginLifecycleManager } from "./lifecycle";
import { PluginSecurityManager } from "./security";
import { PluginDiscoveryManager } from "./discovery";
import { PluginExecutionManager } from "./execution";
import { PluginEventManager } from "./events";
import { PluginPerformanceManager } from "./performance";

export class CorePluginManager extends EventEmitter implements PluginManager {
  private plugins: Map<string, PluginInstance> = new Map();
  private configurationManager: PluginConfigurationManager;
  private lifecycleManager: PluginLifecycleManager;
  private securityManager: PluginSecurityManager;
  private discoveryManager: PluginDiscoveryManager;
  private executionManager: PluginExecutionManager;
  private eventManager: PluginEventManager;
  private performanceManager: PluginPerformanceManager;
  private initialized = false;

  constructor() {
    super();
    this.configurationManager = new PluginConfigurationManager();
    this.lifecycleManager = new PluginLifecycleManager();
    this.securityManager = new PluginSecurityManager();
    this.discoveryManager = new PluginDiscoveryManager();
    this.executionManager = new PluginExecutionManager();
    this.eventManager = new PluginEventManager();
    this.performanceManager = new PluginPerformanceManager();

    this.setupEventHandlers();
  }

  // Initialize the plugin manager
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize all managers
      await Promise.all([
        this.configurationManager.initialize(),
        this.lifecycleManager.initialize(),
        this.securityManager.initialize(),
        this.discoveryManager.initialize(),
        this.executionManager.initialize(),
        this.eventManager.initialize(),
        this.performanceManager.initialize(),
      ]);

      // Load existing plugins
      await this.loadInstalledPlugins();

      this.initialized = true;
      this.emit("initialized");
    } catch (error) {
      throw new PluginError(
        `Failed to initialize plugin manager: ${error}`,
        "system",
        "INITIALIZATION_ERROR",
        error,
      );
    }
  }

  // Setup event handlers
  private setupEventHandlers(): void {
    // Plugin lifecycle events
    this.lifecycleManager.on("plugin:installed", (plugin: PluginInstance) => {
      this.plugins.set(plugin.metadata.id, plugin);
      this.emit("plugin:installed", plugin);
    });

    this.lifecycleManager.on("plugin:uninstalled", (pluginId: string) => {
      this.plugins.delete(pluginId);
      this.emit("plugin:uninstalled", pluginId);
    });

    this.lifecycleManager.on("plugin:enabled", (plugin: PluginInstance) => {
      this.emit("plugin:enabled", plugin);
    });

    this.lifecycleManager.on("plugin:disabled", (plugin: PluginInstance) => {
      this.emit("plugin:disabled", plugin);
    });

    this.lifecycleManager.on("plugin:restarted", (plugin: PluginInstance) => {
      this.emit("plugin:restarted", plugin);
    });

    // Plugin execution events
    this.executionManager.on(
      "plugin:tool:executed",
      (pluginId: string, toolName: string, result: any) => {
        this.emit("plugin:tool:executed", pluginId, toolName, result);
      },
    );

    this.executionManager.on(
      "plugin:action:executed",
      (pluginId: string, actionName: string, result: any) => {
        this.emit("plugin:action:executed", pluginId, actionName, result);
      },
    );

    this.executionManager.on(
      "plugin:resource:accessed",
      (pluginId: string, resourceName: string) => {
        this.emit("plugin:resource:accessed", pluginId, resourceName);
      },
    );

    // Plugin error events
    this.lifecycleManager.on(
      "plugin:error",
      (pluginId: string, error: Error) => {
        this.emit("plugin:error", pluginId, error);
      },
    );

    this.lifecycleManager.on(
      "plugin:warning",
      (pluginId: string, warning: string) => {
        this.emit("plugin:warning", pluginId, warning);
      },
    );

    // Plugin configuration events
    this.configurationManager.on(
      "plugin:configured",
      (pluginId: string, config: PluginConfig) => {
        this.emit("plugin:configured", pluginId, config);
      },
    );

    // Plugin discovery events
    this.discoveryManager.on("plugin:discovered", (plugin: PluginMetadata) => {
      this.emit("plugin:discovered", plugin);
    });

    this.discoveryManager.on(
      "plugin:search:completed",
      (query: string, results: PluginMetadata[]) => {
        this.emit("plugin:search:completed", query, results);
      },
    );
  }

  // Load installed plugins
  private async loadInstalledPlugins(): Promise<void> {
    try {
      const installedPlugins =
        await this.configurationManager.getInstalledPlugins();

      for (const pluginConfig of installedPlugins) {
        try {
          const plugin = await this.lifecycleManager.loadPlugin(pluginConfig);
          this.plugins.set(plugin.metadata.id, plugin);
        } catch (error) {
          console.error(`Failed to load plugin ${pluginConfig.id}:`, error);
        }
      }
    } catch (error) {
      console.error("Failed to load installed plugins:", error);
    }
  }

  // Plugin lifecycle management
  async install(pluginId: string, source: string): Promise<PluginInstance> {
    if (!this.initialized) {
      throw new PluginError(
        "Plugin manager not initialized",
        "system",
        "NOT_INITIALIZED",
      );
    }

    try {
      // Check if plugin is already installed
      if (this.plugins.has(pluginId)) {
        throw new PluginError(
          `Plugin ${pluginId} is already installed`,
          pluginId,
          "ALREADY_INSTALLED",
        );
      }

      // Discover plugin metadata
      const metadata = await this.discoveryManager.discoverPlugin(
        pluginId,
        source,
      );

      // Validate plugin
      await this.securityManager.validatePlugin(metadata);

      // Install plugin
      const plugin = await this.lifecycleManager.installPlugin(
        metadata,
        source,
      );

      // Configure plugin
      await this.configurationManager.configurePlugin(pluginId, plugin.config);

      // Add to registry
      this.plugins.set(pluginId, plugin);

      return plugin;
    } catch (error) {
      if (error instanceof PluginError) {
        throw error;
      }
      throw new PluginError(
        `Failed to install plugin ${pluginId}: ${error}`,
        pluginId,
        "INSTALLATION_ERROR",
        error,
      );
    }
  }

  async uninstall(pluginId: string): Promise<void> {
    if (!this.initialized) {
      throw new PluginError(
        "Plugin manager not initialized",
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
        await this.disable(pluginId);
      }

      // Uninstall plugin
      await this.lifecycleManager.uninstallPlugin(pluginId);

      // Remove configuration
      await this.configurationManager.removePluginConfig(pluginId);

      // Remove from registry
      this.plugins.delete(pluginId);
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

  async enable(pluginId: string): Promise<void> {
    if (!this.initialized) {
      throw new PluginError(
        "Plugin manager not initialized",
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
      await this.lifecycleManager.enablePlugin(plugin);
    } catch (error) {
      if (error instanceof PluginError) {
        throw error;
      }
      throw new PluginError(
        `Failed to enable plugin ${pluginId}: ${error}`,
        pluginId,
        "ENABLE_ERROR",
        error,
      );
    }
  }

  async disable(pluginId: string): Promise<void> {
    if (!this.initialized) {
      throw new PluginError(
        "Plugin manager not initialized",
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
      await this.lifecycleManager.disablePlugin(plugin);
    } catch (error) {
      if (error instanceof PluginError) {
        throw error;
      }
      throw new PluginError(
        `Failed to disable plugin ${pluginId}: ${error}`,
        pluginId,
        "DISABLE_ERROR",
        error,
      );
    }
  }

  async restart(pluginId: string): Promise<void> {
    if (!this.initialized) {
      throw new PluginError(
        "Plugin manager not initialized",
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
      await this.lifecycleManager.restartPlugin(plugin);
    } catch (error) {
      if (error instanceof PluginError) {
        throw error;
      }
      throw new PluginError(
        `Failed to restart plugin ${pluginId}: ${error}`,
        pluginId,
        "RESTART_ERROR",
        error,
      );
    }
  }

  // Plugin discovery and management
  async discover(): Promise<PluginMetadata[]> {
    if (!this.initialized) {
      throw new PluginError(
        "Plugin manager not initialized",
        "system",
        "NOT_INITIALIZED",
      );
    }

    return await this.discoveryManager.discoverAll();
  }

  async search(
    query: string,
    filters?: PluginSearchFilters,
  ): Promise<PluginMetadata[]> {
    if (!this.initialized) {
      throw new PluginError(
        "Plugin manager not initialized",
        "system",
        "NOT_INITIALIZED",
      );
    }

    return await this.discoveryManager.search(query, filters);
  }

  getInstalled(): PluginInstance[] {
    return Array.from(this.plugins.values());
  }

  getEnabled(): PluginInstance[] {
    return Array.from(this.plugins.values()).filter(
      (plugin) => plugin.state === "enabled" || plugin.state === "active",
    );
  }

  getAvailable(): PluginMetadata[] {
    if (!this.initialized) {
      throw new PluginError(
        "Plugin manager not initialized",
        "system",
        "NOT_INITIALIZED",
      );
    }

    return Array.from(this.discoveryManager.getDiscoveredPlugins());
  }

  // Plugin configuration
  async configure(
    pluginId: string,
    config: Partial<PluginConfig>,
  ): Promise<void> {
    if (!this.initialized) {
      throw new PluginError(
        "Plugin manager not initialized",
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
      await this.configurationManager.configurePlugin(pluginId, config);

      // Update plugin instance
      plugin.config = { ...plugin.config, ...config };

      // Reconfigure plugin if it's active
      if (plugin.state === "active" || plugin.state === "enabled") {
        await plugin.instance.configure(plugin.config);
      }
    } catch (error) {
      if (error instanceof PluginError) {
        throw error;
      }
      throw new PluginConfigurationError(
        pluginId,
        `Failed to configure plugin: ${error}`,
        error,
      );
    }
  }

  getConfig(pluginId: string): PluginConfig {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new PluginError(
        `Plugin ${pluginId} not found`,
        pluginId,
        "NOT_FOUND",
      );
    }

    return plugin.config;
  }

  // Plugin execution
  async executeTool(
    pluginId: string,
    toolName: string,
    input: any,
  ): Promise<any> {
    if (!this.initialized) {
      throw new PluginError(
        "Plugin manager not initialized",
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

    if (plugin.state !== "active") {
      throw new PluginError(
        `Plugin ${pluginId} is not active`,
        pluginId,
        "NOT_ACTIVE",
      );
    }

    try {
      return await this.executionManager.executeTool(plugin, toolName, input);
    } catch (error) {
      if (error instanceof PluginError) {
        throw error;
      }
      throw new PluginExecutionError(
        pluginId,
        `Failed to execute tool ${toolName}: ${error}`,
        error,
      );
    }
  }

  async executeAction(
    pluginId: string,
    actionName: string,
    input: any,
  ): Promise<any> {
    if (!this.initialized) {
      throw new PluginError(
        "Plugin manager not initialized",
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

    if (plugin.state !== "active") {
      throw new PluginError(
        `Plugin ${pluginId} is not active`,
        pluginId,
        "NOT_ACTIVE",
      );
    }

    try {
      return await this.executionManager.executeAction(
        plugin,
        actionName,
        input,
      );
    } catch (error) {
      if (error instanceof PluginError) {
        throw error;
      }
      throw new PluginExecutionError(
        pluginId,
        `Failed to execute action ${actionName}: ${error}`,
        error,
      );
    }
  }

  async getResource(pluginId: string, resourceName: string): Promise<any> {
    if (!this.initialized) {
      throw new PluginError(
        "Plugin manager not initialized",
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

    if (plugin.state !== "active") {
      throw new PluginError(
        `Plugin ${pluginId} is not active`,
        pluginId,
        "NOT_ACTIVE",
      );
    }

    try {
      return await this.executionManager.getResource(plugin, resourceName);
    } catch (error) {
      if (error instanceof PluginError) {
        throw error;
      }
      throw new PluginExecutionError(
        pluginId,
        `Failed to get resource ${resourceName}: ${error}`,
        error,
      );
    }
  }

  // Get plugin instance
  getPlugin(pluginId: string): PluginInstance | undefined {
    return this.plugins.get(pluginId);
  }

  // Get plugin manager status
  getStatus(): {
    initialized: boolean;
    pluginCount: number;
    enabledCount: number;
    errorCount: number;
  } {
    const plugins = Array.from(this.plugins.values());
    return {
      initialized: this.initialized,
      pluginCount: plugins.length,
      enabledCount: plugins.filter(
        (p) => p.state === "enabled" || p.state === "active",
      ).length,
      errorCount: plugins.filter((p) => p.state === "error").length,
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
        if (plugin.state === "active" || plugin.state === "enabled") {
          try {
            await this.disable(plugin.metadata.id);
          } catch (error) {
            console.error(
              `Failed to disable plugin ${plugin.metadata.id}:`,
              error,
            );
          }
        }
      }

      // Destroy all managers
      await Promise.all([
        this.configurationManager.destroy(),
        this.lifecycleManager.destroy(),
        this.securityManager.destroy(),
        this.discoveryManager.destroy(),
        this.executionManager.destroy(),
        this.eventManager.destroy(),
        this.performanceManager.destroy(),
      ]);

      this.plugins.clear();
      this.initialized = false;
    } catch (error) {
      console.error("Failed to destroy plugin manager:", error);
    }
  }
}
