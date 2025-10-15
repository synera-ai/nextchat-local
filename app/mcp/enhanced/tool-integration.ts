// Tool Integration Framework

import { EventEmitter } from "events";
import { MCPClientLogger } from "../logger";
import { ListToolsResponse, McpRequestMessage } from "../types";

// Tool definition interface
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: any;
  outputSchema?: any;
  category: string;
  tags: string[];
  version: string;
  author: string;
  clientId: string;
  enabled: boolean;
  permissions: string[];
  rateLimit?: {
    requests: number;
    window: number; // milliseconds
  };
  cache?: {
    enabled: boolean;
    ttl: number; // milliseconds
  };
}

// Tool execution context
export interface ToolExecutionContext {
  toolName: string;
  clientId: string;
  parameters: any;
  userId?: string;
  sessionId?: string;
  requestId: string;
  timestamp: Date;
  metadata?: any;
}

// Tool execution result
export interface ToolExecutionResult {
  success: boolean;
  result?: any;
  error?: string;
  executionTime: number;
  cached: boolean;
  requestId: string;
  timestamp: Date;
}

// Tool integration manager
export class ToolIntegrationManager extends EventEmitter {
  private tools: Map<string, ToolDefinition> = new Map();
  private executionCache: Map<string, { result: any; timestamp: Date }> =
    new Map();
  private rateLimitTracker: Map<string, { count: number; windowStart: Date }> =
    new Map();
  private logger: MCPClientLogger;
  private clientManager: any; // Will be injected

  constructor() {
    super();
    this.logger = new MCPClientLogger();
  }

  // Set client manager reference
  setClientManager(clientManager: any): void {
    this.clientManager = clientManager;
  }

  // Register tool from client
  async registerTool(clientId: string, toolData: any): Promise<void> {
    const tool: ToolDefinition = {
      name: toolData.name,
      description: toolData.description,
      inputSchema: toolData.inputSchema,
      outputSchema: toolData.outputSchema,
      category: this.categorizeTool(toolData),
      tags: this.extractTags(toolData),
      version: toolData.version || "1.0.0",
      author: toolData.author || "Unknown",
      clientId,
      enabled: true,
      permissions: this.extractPermissions(toolData),
      rateLimit: this.extractRateLimit(toolData),
      cache: this.extractCacheConfig(toolData),
    };

    this.tools.set(tool.name, tool);
    this.logger.info(`Registered tool: ${tool.name} from client ${clientId}`);
    this.emit("toolRegistered", { tool, clientId });
  }

  // Register tools from client's tool list
  async registerToolsFromClient(
    clientId: string,
    toolsResponse: ListToolsResponse,
  ): Promise<void> {
    if (!toolsResponse.tools || !Array.isArray(toolsResponse.tools)) {
      this.logger.warn(`Invalid tools response from client ${clientId}`);
      return;
    }

    for (const toolData of toolsResponse.tools) {
      await this.registerTool(clientId, toolData);
    }

    this.logger.info(
      `Registered ${toolsResponse.tools.length} tools from client ${clientId}`,
    );
  }

  // Execute tool
  async executeTool(
    toolName: string,
    parameters: any,
    context: Partial<ToolExecutionContext> = {},
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    const requestId = context.requestId || this.generateRequestId();

    const executionContext: ToolExecutionContext = {
      toolName,
      clientId: "",
      parameters,
      requestId,
      timestamp: new Date(),
      ...context,
    };

    try {
      // Get tool definition
      const tool = this.tools.get(toolName);
      if (!tool) {
        throw new Error(`Tool not found: ${toolName}`);
      }

      if (!tool.enabled) {
        throw new Error(`Tool is disabled: ${toolName}`);
      }

      executionContext.clientId = tool.clientId;

      // Check rate limiting
      if (tool.rateLimit) {
        const rateLimitKey = `${toolName}:${context.userId || "anonymous"}`;
        if (!this.checkRateLimit(rateLimitKey, tool.rateLimit)) {
          throw new Error(`Rate limit exceeded for tool: ${toolName}`);
        }
      }

      // Check cache
      if (tool.cache?.enabled) {
        const cacheKey = this.generateCacheKey(toolName, parameters);
        const cachedResult = this.getCachedResult(cacheKey, tool.cache.ttl);
        if (cachedResult) {
          return {
            success: true,
            result: cachedResult,
            executionTime: Date.now() - startTime,
            cached: true,
            requestId,
            timestamp: new Date(),
          };
        }
      }

      // Validate parameters
      this.validateParameters(tool, parameters);

      // Get client and execute
      const client = this.clientManager?.getClient(tool.clientId);
      if (!client) {
        throw new Error(`Client not found: ${tool.clientId}`);
      }

      const request: McpRequestMessage = {
        method: "tools/call",
        params: {
          name: toolName,
          arguments: parameters,
        },
      };

      const result = await client.executeRequest(request);
      const executionTime = Date.now() - startTime;

      // Cache result if enabled
      if (tool.cache?.enabled) {
        const cacheKey = this.generateCacheKey(toolName, parameters);
        this.setCachedResult(cacheKey, result, tool.cache.ttl);
      }

      // Update rate limit tracker
      if (tool.rateLimit) {
        const rateLimitKey = `${toolName}:${context.userId || "anonymous"}`;
        this.updateRateLimit(rateLimitKey);
      }

      this.emit("toolExecuted", {
        tool,
        context: executionContext,
        result,
        executionTime,
      });

      return {
        success: true,
        result,
        executionTime,
        cached: false,
        requestId,
        timestamp: new Date(),
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error(`Tool execution failed: ${toolName}`, error);
      this.emit("toolExecutionFailed", {
        toolName,
        context: executionContext,
        error: errorMessage,
        executionTime,
      });

      return {
        success: false,
        error: errorMessage,
        executionTime,
        cached: false,
        requestId,
        timestamp: new Date(),
      };
    }
  }

  // Get tool definition
  getTool(toolName: string): ToolDefinition | undefined {
    return this.tools.get(toolName);
  }

  // Get all tools
  getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  // Get tools by category
  getToolsByCategory(category: string): ToolDefinition[] {
    return Array.from(this.tools.values()).filter(
      (tool) => tool.category === category,
    );
  }

  // Get tools by client
  getToolsByClient(clientId: string): ToolDefinition[] {
    return Array.from(this.tools.values()).filter(
      (tool) => tool.clientId === clientId,
    );
  }

  // Search tools
  searchTools(
    query: string,
    filters: {
      category?: string;
      tags?: string[];
      clientId?: string;
      enabled?: boolean;
    } = {},
  ): ToolDefinition[] {
    let tools = Array.from(this.tools.values());

    // Text search
    if (query) {
      const searchTerms = query.toLowerCase().split(" ");
      tools = tools.filter((tool) => {
        const searchableText = [
          tool.name,
          tool.description,
          tool.author,
          ...tool.tags,
        ]
          .join(" ")
          .toLowerCase();

        return searchTerms.every((term) => searchableText.includes(term));
      });
    }

    // Apply filters
    if (filters.category) {
      tools = tools.filter((tool) => tool.category === filters.category);
    }

    if (filters.tags && filters.tags.length > 0) {
      tools = tools.filter((tool) =>
        filters.tags!.some((tag) => tool.tags.includes(tag)),
      );
    }

    if (filters.clientId) {
      tools = tools.filter((tool) => tool.clientId === filters.clientId);
    }

    if (filters.enabled !== undefined) {
      tools = tools.filter((tool) => tool.enabled === filters.enabled);
    }

    return tools.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Enable/disable tool
  setToolEnabled(toolName: string, enabled: boolean): void {
    const tool = this.tools.get(toolName);
    if (tool) {
      tool.enabled = enabled;
      this.emit("toolEnabledChanged", { toolName, enabled });
    }
  }

  // Get tool categories
  getToolCategories(): string[] {
    const categories = new Set<string>();
    for (const tool of this.tools.values()) {
      categories.add(tool.category);
    }
    return Array.from(categories).sort();
  }

  // Get tool tags
  getToolTags(): string[] {
    const tags = new Set<string>();
    for (const tool of this.tools.values()) {
      tool.tags.forEach((tag) => tags.add(tag));
    }
    return Array.from(tags).sort();
  }

  // Remove tool
  removeTool(toolName: string): void {
    const tool = this.tools.get(toolName);
    if (tool) {
      this.tools.delete(toolName);
      this.emit("toolRemoved", { toolName, tool });
    }
  }

  // Remove tools by client
  removeToolsByClient(clientId: string): void {
    const toolsToRemove = this.getToolsByClient(clientId);
    for (const tool of toolsToRemove) {
      this.tools.delete(tool.name);
    }
    this.emit("toolsRemovedByClient", {
      clientId,
      count: toolsToRemove.length,
    });
  }

  // Get tool statistics
  getToolStats(): {
    totalTools: number;
    enabledTools: number;
    disabledTools: number;
    categories: number;
    tags: number;
    clients: number;
  } {
    const tools = Array.from(this.tools.values());
    const clients = new Set(tools.map((tool) => tool.clientId));
    const categories = new Set(tools.map((tool) => tool.category));
    const tags = new Set(tools.flatMap((tool) => tool.tags));

    return {
      totalTools: tools.length,
      enabledTools: tools.filter((tool) => tool.enabled).length,
      disabledTools: tools.filter((tool) => !tool.enabled).length,
      categories: categories.size,
      tags: tags.size,
      clients: clients.size,
    };
  }

  // Helper methods
  private categorizeTool(toolData: any): string {
    // Simple categorization based on tool name and description
    const name = toolData.name?.toLowerCase() || "";
    const description = toolData.description?.toLowerCase() || "";

    if (name.includes("file") || description.includes("file"))
      return "filesystem";
    if (name.includes("git") || description.includes("git"))
      return "development";
    if (name.includes("web") || description.includes("web")) return "web";
    if (name.includes("ai") || description.includes("ai")) return "ai";
    if (name.includes("data") || description.includes("data")) return "data";

    return "general";
  }

  private extractTags(toolData: any): string[] {
    const tags: string[] = [];
    const name = toolData.name?.toLowerCase() || "";
    const description = toolData.description?.toLowerCase() || "";

    // Extract tags from name and description
    const commonTags = [
      "file",
      "git",
      "web",
      "ai",
      "data",
      "system",
      "utility",
    ];
    commonTags.forEach((tag) => {
      if (name.includes(tag) || description.includes(tag)) {
        tags.push(tag);
      }
    });

    return tags;
  }

  private extractPermissions(toolData: any): string[] {
    // Extract permissions from tool schema or metadata
    return toolData.permissions || ["read"];
  }

  private extractRateLimit(toolData: any): ToolDefinition["rateLimit"] {
    return toolData.rateLimit || undefined;
  }

  private extractCacheConfig(toolData: any): ToolDefinition["cache"] {
    return toolData.cache || { enabled: false, ttl: 300000 }; // 5 minutes default
  }

  private validateParameters(tool: ToolDefinition, parameters: any): void {
    // Basic parameter validation
    if (tool.inputSchema && tool.inputSchema.required) {
      for (const requiredParam of tool.inputSchema.required) {
        if (!(requiredParam in parameters)) {
          throw new Error(`Missing required parameter: ${requiredParam}`);
        }
      }
    }
  }

  private checkRateLimit(
    key: string,
    rateLimit: { requests: number; window: number },
  ): boolean {
    const now = new Date();
    const tracker = this.rateLimitTracker.get(key);

    if (!tracker) {
      this.rateLimitTracker.set(key, { count: 1, windowStart: now });
      return true;
    }

    // Reset window if expired
    if (now.getTime() - tracker.windowStart.getTime() > rateLimit.window) {
      this.rateLimitTracker.set(key, { count: 1, windowStart: now });
      return true;
    }

    // Check if within limit
    if (tracker.count >= rateLimit.requests) {
      return false;
    }

    return true;
  }

  private updateRateLimit(key: string): void {
    const tracker = this.rateLimitTracker.get(key);
    if (tracker) {
      tracker.count++;
    }
  }

  private generateCacheKey(toolName: string, parameters: any): string {
    return `${toolName}:${JSON.stringify(parameters)}`;
  }

  private getCachedResult(key: string, ttl: number): any | null {
    const cached = this.executionCache.get(key);
    if (cached && Date.now() - cached.timestamp.getTime() < ttl) {
      return cached.result;
    }
    return null;
  }

  private setCachedResult(key: string, result: any, ttl: number): void {
    this.executionCache.set(key, {
      result,
      timestamp: new Date(),
    });

    // Clean up expired cache entries
    setTimeout(() => {
      this.executionCache.delete(key);
    }, ttl);
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup
  async cleanup(): Promise<void> {
    this.tools.clear();
    this.executionCache.clear();
    this.rateLimitTracker.clear();
    this.removeAllListeners();
  }
}

// Export singleton instance
export const toolIntegrationManager = new ToolIntegrationManager();
