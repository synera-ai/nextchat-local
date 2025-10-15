// Enhanced MCP Client Implementation

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { MCPClientLogger } from "../logger";
import { ListToolsResponse, McpRequestMessage, ServerConfig } from "../types";
import { z } from "zod";
import { EventEmitter } from "events";

// Enhanced client configuration
export interface EnhancedClientConfig {
  id: string;
  config: ServerConfig;
  options?: {
    maxRetries?: number;
    retryDelay?: number;
    connectionTimeout?: number;
    healthCheckInterval?: number;
    maxConnections?: number;
    enableMetrics?: boolean;
  };
}

// Client health status
export interface ClientHealth {
  status: "healthy" | "unhealthy" | "degraded" | "unknown";
  lastCheck: Date;
  responseTime?: number;
  errorCount: number;
  successCount: number;
  uptime: number;
}

// Client metrics
export interface ClientMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastRequestTime?: Date;
  connectionUptime: number;
}

// Enhanced client class
export class EnhancedMCPClient extends EventEmitter {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private config: EnhancedClientConfig;
  private logger: MCPClientLogger;
  private health: ClientHealth;
  private metrics: ClientMetrics;
  private healthCheckTimer?: NodeJS.Timeout;
  private isConnected = false;
  private connectionStartTime?: Date;
  private retryCount = 0;

  constructor(config: EnhancedClientConfig) {
    super();
    this.config = config;
    this.logger = new MCPClientLogger();

    this.health = {
      status: "unknown",
      lastCheck: new Date(),
      errorCount: 0,
      successCount: 0,
      uptime: 0,
    };

    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      connectionUptime: 0,
    };
  }

  // Initialize the client
  async initialize(): Promise<void> {
    try {
      this.logger.info(
        `Initializing enhanced MCP client for ${this.config.id}...`,
      );

      await this.createConnection();
      this.startHealthCheck();

      this.emit("initialized", { clientId: this.config.id });
      this.logger.info(
        `Enhanced MCP client ${this.config.id} initialized successfully`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to initialize client ${this.config.id}:`,
        error,
      );
      this.health.status = "unhealthy";
      this.emit("error", { clientId: this.config.id, error });
      throw error;
    }
  }

  // Create connection with retry logic
  private async createConnection(): Promise<void> {
    const maxRetries = this.config.options?.maxRetries || 3;
    const retryDelay = this.config.options?.retryDelay || 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.info(
          `Creating connection attempt ${attempt}/${maxRetries} for ${this.config.id}`,
        );

        this.transport = new StdioClientTransport({
          command: this.config.config.command,
          args: this.config.config.args,
          env: {
            ...Object.fromEntries(
              Object.entries(process.env)
                .filter(([_, v]) => v !== undefined)
                .map(([k, v]) => [k, v as string]),
            ),
            ...(this.config.config.env || {}),
          },
        });

        this.client = new Client(
          {
            name: `nextchat-enhanced-mcp-client-${this.config.id}`,
            version: "2.0.0",
          },
          {
            capabilities: {
              tools: {},
              resources: {},
              prompts: {},
            },
          },
        );

        const connectionTimeout =
          this.config.options?.connectionTimeout || 10000;
        await Promise.race([
          this.client.connect(this.transport),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Connection timeout")),
              connectionTimeout,
            ),
          ),
        ]);

        this.isConnected = true;
        this.connectionStartTime = new Date();
        this.health.status = "healthy";
        this.retryCount = 0;

        this.logger.info(`Connection established for client ${this.config.id}`);
        this.emit("connected", { clientId: this.config.id });
        return;
      } catch (error) {
        this.logger.error(
          `Connection attempt ${attempt} failed for ${this.config.id}:`,
          error,
        );
        this.retryCount = attempt;

        if (attempt === maxRetries) {
          this.health.status = "unhealthy";
          this.emit("connectionFailed", {
            clientId: this.config.id,
            error,
            attempts: attempt,
          });
          throw error;
        }

        // Wait before retry
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * attempt),
        );
      }
    }
  }

  // Start health check monitoring
  private startHealthCheck(): void {
    const interval = this.config.options?.healthCheckInterval || 30000; // 30 seconds

    this.healthCheckTimer = setInterval(async () => {
      await this.performHealthCheck();
    }, interval);
  }

  // Perform health check
  private async performHealthCheck(): Promise<void> {
    if (!this.client || !this.isConnected) {
      this.health.status = "unhealthy";
      return;
    }

    try {
      const startTime = Date.now();
      await this.client.listTools();
      const responseTime = Date.now() - startTime;

      this.health = {
        ...this.health,
        status: "healthy",
        lastCheck: new Date(),
        responseTime,
        successCount: this.health.successCount + 1,
        uptime: this.connectionStartTime
          ? Date.now() - this.connectionStartTime.getTime()
          : 0,
      };

      this.metrics.connectionUptime = this.health.uptime;
    } catch (error) {
      this.health = {
        ...this.health,
        status: "unhealthy",
        lastCheck: new Date(),
        errorCount: this.health.errorCount + 1,
        uptime: this.connectionStartTime
          ? Date.now() - this.connectionStartTime.getTime()
          : 0,
      };

      this.logger.warn(
        `Health check failed for client ${this.config.id}:`,
        error,
      );
      this.emit("healthCheckFailed", { clientId: this.config.id, error });
    }
  }

  // Execute request with metrics and error handling
  async executeRequest(request: McpRequestMessage): Promise<any> {
    if (!this.client || !this.isConnected) {
      throw new Error(`Client ${this.config.id} is not connected`);
    }

    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      const result = await this.client.request(request, z.any());
      const responseTime = Date.now() - startTime;

      // Update metrics
      this.metrics.successfulRequests++;
      this.metrics.lastRequestTime = new Date();
      this.updateAverageResponseTime(responseTime);

      this.emit("requestSuccess", {
        clientId: this.config.id,
        request,
        responseTime,
        result,
      });

      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.metrics.failedRequests++;

      this.emit("requestFailed", {
        clientId: this.config.id,
        request,
        responseTime,
        error,
      });

      this.logger.error(`Request failed for client ${this.config.id}:`, error);
      throw error;
    }
  }

  // List tools with caching
  private toolsCache?: ListToolsResponse;
  private toolsCacheTime?: Date;
  private readonly TOOLS_CACHE_TTL = 60000; // 1 minute

  async listTools(forceRefresh = false): Promise<ListToolsResponse> {
    if (!this.client || !this.isConnected) {
      throw new Error(`Client ${this.config.id} is not connected`);
    }

    // Check cache
    if (!forceRefresh && this.toolsCache && this.toolsCacheTime) {
      const cacheAge = Date.now() - this.toolsCacheTime.getTime();
      if (cacheAge < this.TOOLS_CACHE_TTL) {
        return this.toolsCache;
      }
    }

    try {
      const tools = await this.client.listTools();
      this.toolsCache = tools;
      this.toolsCacheTime = new Date();

      this.emit("toolsListed", { clientId: this.config.id, tools });
      return tools;
    } catch (error) {
      this.logger.error(
        `Failed to list tools for client ${this.config.id}:`,
        error,
      );
      throw error;
    }
  }

  // Update average response time
  private updateAverageResponseTime(responseTime: number): void {
    const totalResponses = this.metrics.successfulRequests;
    if (totalResponses === 1) {
      this.metrics.averageResponseTime = responseTime;
    } else {
      this.metrics.averageResponseTime =
        (this.metrics.averageResponseTime * (totalResponses - 1) +
          responseTime) /
        totalResponses;
    }
  }

  // Get client health
  getHealth(): ClientHealth {
    return { ...this.health };
  }

  // Get client metrics
  getMetrics(): ClientMetrics {
    return { ...this.metrics };
  }

  // Get client configuration
  getConfig(): EnhancedClientConfig {
    return { ...this.config };
  }

  // Check if client is connected
  isClientConnected(): boolean {
    return this.isConnected;
  }

  // Reconnect client
  async reconnect(): Promise<void> {
    this.logger.info(`Reconnecting client ${this.config.id}...`);

    await this.disconnect();
    await this.createConnection();

    this.emit("reconnected", { clientId: this.config.id });
  }

  // Disconnect client
  async disconnect(): Promise<void> {
    this.logger.info(`Disconnecting client ${this.config.id}...`);

    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }

    if (this.client) {
      try {
        await this.client.close();
      } catch (error) {
        this.logger.warn(`Error closing client ${this.config.id}:`, error);
      }
    }

    this.isConnected = false;
    this.client = null;
    this.transport = null;
    this.health.status = "unknown";

    this.emit("disconnected", { clientId: this.config.id });
  }

  // Cleanup resources
  async cleanup(): Promise<void> {
    await this.disconnect();
    this.removeAllListeners();
  }
}

// Client manager for multiple clients
export class MCPClientManager extends EventEmitter {
  private clients: Map<string, EnhancedMCPClient> = new Map();
  private logger: MCPClientLogger;

  constructor() {
    super();
    this.logger = new MCPClientLogger();
  }

  // Create and manage a client
  async createClient(config: EnhancedClientConfig): Promise<EnhancedMCPClient> {
    const client = new EnhancedMCPClient(config);

    // Set up event forwarding
    client.on("initialized", (data) => this.emit("clientInitialized", data));
    client.on("connected", (data) => this.emit("clientConnected", data));
    client.on("disconnected", (data) => this.emit("clientDisconnected", data));
    client.on("error", (data) => this.emit("clientError", data));
    client.on("healthCheckFailed", (data) =>
      this.emit("clientHealthCheckFailed", data),
    );

    await client.initialize();
    this.clients.set(config.id, client);

    this.logger.info(`Client ${config.id} added to manager`);
    return client;
  }

  // Get client by ID
  getClient(id: string): EnhancedMCPClient | undefined {
    return this.clients.get(id);
  }

  // Get all clients
  getAllClients(): Map<string, EnhancedMCPClient> {
    return new Map(this.clients);
  }

  // Remove client
  async removeClient(id: string): Promise<void> {
    const client = this.clients.get(id);
    if (client) {
      await client.cleanup();
      this.clients.delete(id);
      this.logger.info(`Client ${id} removed from manager`);
    }
  }

  // Get all client health statuses
  getAllClientHealth(): Record<string, ClientHealth> {
    const health: Record<string, ClientHealth> = {};
    for (const [id, client] of this.clients) {
      health[id] = client.getHealth();
    }
    return health;
  }

  // Get all client metrics
  getAllClientMetrics(): Record<string, ClientMetrics> {
    const metrics: Record<string, ClientMetrics> = {};
    for (const [id, client] of this.clients) {
      metrics[id] = client.getMetrics();
    }
    return metrics;
  }

  // Cleanup all clients
  async cleanup(): Promise<void> {
    const cleanupPromises = Array.from(this.clients.values()).map((client) =>
      client.cleanup(),
    );
    await Promise.all(cleanupPromises);
    this.clients.clear();
    this.removeAllListeners();
  }
}

// Export singleton instance
export const mcpClientManager = new MCPClientManager();
