// Enhanced MCP Integration System

// Export enhanced client
export {
  EnhancedMCPClient,
  MCPClientManager,
  mcpClientManager,
  type EnhancedClientConfig,
  type ClientHealth,
  type ClientMetrics,
} from "./client";

// Export plugin discovery
export {
  PluginDiscoveryManager,
  pluginDiscoveryManager,
  type PluginMetadata,
  type PluginRegistryEntry,
  type PluginDiscoverySource,
  type PluginSearchFilters,
  type PluginSearchResult,
} from "./plugin-discovery";

// Export tool integration
export {
  ToolIntegrationManager,
  toolIntegrationManager,
  type ToolDefinition,
  type ToolExecutionContext,
  type ToolExecutionResult,
} from "./tool-integration";

// Enhanced MCP system manager
import { MCPClientManager } from "./client";
import { PluginDiscoveryManager } from "./plugin-discovery";
import { ToolIntegrationManager } from "./tool-integration";
import { EventEmitter } from "events";
import { MCPClientLogger } from "../logger";

export class EnhancedMCPSystem extends EventEmitter {
  private clientManager: MCPClientManager;
  private pluginDiscovery: PluginDiscoveryManager;
  private toolIntegration: ToolIntegrationManager;
  private logger: MCPClientLogger;
  private initialized = false;

  constructor() {
    super();
    this.logger = new MCPClientLogger();
    this.clientManager = new MCPClientManager();
    this.pluginDiscovery = new PluginDiscoveryManager();
    this.toolIntegration = new ToolIntegrationManager();

    this.setupEventHandlers();
  }

  // Initialize the enhanced MCP system
  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn("Enhanced MCP system already initialized");
      return;
    }

    this.logger.info("Initializing Enhanced MCP System...");

    try {
      // Set up cross-references
      this.toolIntegration.setClientManager(this.clientManager);

      // Start plugin discovery auto-sync
      this.pluginDiscovery.startAutoSync();

      this.initialized = true;
      this.emit("initialized");
      this.logger.info("Enhanced MCP System initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize Enhanced MCP System:", error);
      throw error;
    }
  }

  // Set up event handlers
  private setupEventHandlers(): void {
    // Client events
    this.clientManager.on("clientInitialized", (data) => {
      this.emit("clientInitialized", data);
    });

    this.clientManager.on("clientConnected", (data) => {
      this.emit("clientConnected", data);
    });

    this.clientManager.on("clientDisconnected", (data) => {
      this.emit("clientDisconnected", data);
    });

    this.clientManager.on("clientError", (data) => {
      this.emit("clientError", data);
    });

    // Plugin discovery events
    this.pluginDiscovery.on("pluginRegistered", (data) => {
      this.emit("pluginRegistered", data);
    });

    this.pluginDiscovery.on("sourceSynced", (data) => {
      this.emit("sourceSynced", data);
    });

    // Tool integration events
    this.toolIntegration.on("toolRegistered", (data) => {
      this.emit("toolRegistered", data);
    });

    this.toolIntegration.on("toolExecuted", (data) => {
      this.emit("toolExecuted", data);
    });

    this.toolIntegration.on("toolExecutionFailed", (data) => {
      this.emit("toolExecutionFailed", data);
    });
  }

  // Get client manager
  getClientManager(): MCPClientManager {
    return this.clientManager;
  }

  // Get plugin discovery manager
  getPluginDiscovery(): PluginDiscoveryManager {
    return this.pluginDiscovery;
  }

  // Get tool integration manager
  getToolIntegration(): ToolIntegrationManager {
    return this.toolIntegration;
  }

  // Create and register a client with tools
  async createClientWithTools(config: any): Promise<void> {
    const client = await this.clientManager.createClient(config);

    // Register tools from the client
    const tools = await client.listTools();
    await this.toolIntegration.registerToolsFromClient(config.id, tools);

    this.logger.info(
      `Created client ${config.id} with ${tools.tools?.length || 0} tools`,
    );
  }

  // Get system status
  getSystemStatus(): {
    initialized: boolean;
    clients: {
      total: number;
      connected: number;
      health: any;
    };
    plugins: {
      total: number;
      available: number;
      active: number;
    };
    tools: {
      total: number;
      enabled: number;
      categories: number;
    };
  } {
    const clientHealth = this.clientManager.getAllClientHealth();
    const clientMetrics = this.clientManager.getAllClientMetrics();
    const pluginStats = this.pluginDiscovery.getRegistryStats();
    const toolStats = this.toolIntegration.getToolStats();

    return {
      initialized: this.initialized,
      clients: {
        total: Object.keys(clientHealth).length,
        connected: Object.values(clientHealth).filter(
          (h) => h.status === "healthy",
        ).length,
        health: clientHealth,
      },
      plugins: {
        total: pluginStats.totalPlugins,
        available: pluginStats.availablePlugins,
        active: pluginStats.activePlugins,
      },
      tools: {
        total: toolStats.totalTools,
        enabled: toolStats.enabledTools,
        categories: toolStats.categories,
      },
    };
  }

  // Get system health
  getSystemHealth(): {
    status: "healthy" | "degraded" | "unhealthy";
    issues: string[];
    metrics: any;
  } {
    const status = this.getSystemStatus();
    const issues: string[] = [];

    // Check for issues
    if (!this.initialized) {
      issues.push("System not initialized");
    }

    if (status.clients.connected === 0 && status.clients.total > 0) {
      issues.push("No clients connected");
    }

    if (status.tools.enabled === 0) {
      issues.push("No tools enabled");
    }

    // Determine overall status
    let overallStatus: "healthy" | "degraded" | "unhealthy";
    if (issues.length === 0) {
      overallStatus = "healthy";
    } else if (issues.length <= 2) {
      overallStatus = "degraded";
    } else {
      overallStatus = "unhealthy";
    }

    return {
      status: overallStatus,
      issues,
      metrics: status,
    };
  }

  // Cleanup system
  async cleanup(): Promise<void> {
    this.logger.info("Cleaning up Enhanced MCP System...");

    await Promise.all([
      this.clientManager.cleanup(),
      this.pluginDiscovery.cleanup(),
      this.toolIntegration.cleanup(),
    ]);

    this.initialized = false;
    this.removeAllListeners();

    this.logger.info("Enhanced MCP System cleaned up");
  }
}

// Export singleton instance
export const enhancedMCPSystem = new EnhancedMCPSystem();

// Export version
export const ENHANCED_MCP_VERSION = "2.0.0";

// Export metadata
export const enhancedMCPMetadata = {
  name: "Enhanced MCP Integration System",
  version: ENHANCED_MCP_VERSION,
  description:
    "Advanced Model Context Protocol integration with enhanced client management, plugin discovery, and tool integration",
  features: [
    "Enhanced client management with connection pooling",
    "Plugin discovery and registry system",
    "Advanced tool integration framework",
    "Health monitoring and metrics",
    "Rate limiting and caching",
    "Event-driven architecture",
    "TypeScript support",
  ],
};

// Default export
export default enhancedMCPSystem;
