// Plugin Execution Manager
// This file handles plugin execution, tool calls, and resource access

import { EventEmitter } from "events";
import {
  PluginInstance,
  Tool,
  Action,
  Resource,
  PluginError,
  PluginExecutionError,
} from "./types";

export class PluginExecutionManager extends EventEmitter {
  private initialized = false;
  private executionContexts: Map<string, ExecutionContext> = new Map();
  private rateLimiters: Map<string, RateLimiter> = new Map();

  constructor() {
    super();
  }

  // Initialize the execution manager
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
  }

  // Execute plugin tool
  async executeTool(
    plugin: PluginInstance,
    toolName: string,
    input: any,
  ): Promise<any> {
    if (!this.initialized) {
      throw new PluginError(
        "Execution manager not initialized",
        "system",
        "NOT_INITIALIZED",
      );
    }

    try {
      // Check if plugin is active
      if (plugin.state !== "active") {
        throw new PluginExecutionError(
          plugin.metadata.id,
          `Plugin is not active (current state: ${plugin.state})`,
        );
      }

      // Get tool definition
      const tool = this.getTool(plugin, toolName);
      if (!tool) {
        throw new PluginExecutionError(
          plugin.metadata.id,
          `Tool '${toolName}' not found`,
        );
      }

      // Check rate limits
      await this.checkRateLimit(plugin.metadata.id, toolName);

      // Validate input
      await this.validateInput(tool, input);

      // Create execution context
      const context = this.createExecutionContext(plugin, toolName, input);

      // Execute tool
      const startTime = Date.now();
      let result: any;
      let error: Error | null = null;

      try {
        result = await this.executeWithTimeout(
          tool.handler(input),
          tool.rateLimit?.window || 30000,
        );
      } catch (err) {
        error = err as Error;
        throw err;
      } finally {
        const executionTime = Date.now() - startTime;
        this.updatePerformanceMetrics(plugin, executionTime, error === null);
      }

      // Emit execution event
      this.emit("plugin:tool:executed", plugin.metadata.id, toolName, result);

      return result;
    } catch (error) {
      if (error instanceof PluginError) {
        throw error;
      }
      throw new PluginExecutionError(
        plugin.metadata.id,
        `Failed to execute tool '${toolName}': ${error}`,
        error,
      );
    }
  }

  // Execute plugin action
  async executeAction(
    plugin: PluginInstance,
    actionName: string,
    input: any,
  ): Promise<any> {
    if (!this.initialized) {
      throw new PluginError(
        "Execution manager not initialized",
        "system",
        "NOT_INITIALIZED",
      );
    }

    try {
      // Check if plugin is active
      if (plugin.state !== "active") {
        throw new PluginExecutionError(
          plugin.metadata.id,
          `Plugin is not active (current state: ${plugin.state})`,
        );
      }

      // Get action definition
      const action = this.getAction(plugin, actionName);
      if (!action) {
        throw new PluginExecutionError(
          plugin.metadata.id,
          `Action '${actionName}' not found`,
        );
      }

      // Check rate limits
      await this.checkRateLimit(plugin.metadata.id, actionName);

      // Validate input
      await this.validateInput(action, input);

      // Create execution context
      const context = this.createExecutionContext(plugin, actionName, input);

      // Execute action
      const startTime = Date.now();
      let result: any;
      let error: Error | null = null;

      try {
        result = await this.executeWithTimeout(action.handler(input), 30000);
      } catch (err) {
        error = err as Error;
        throw err;
      } finally {
        const executionTime = Date.now() - startTime;
        this.updatePerformanceMetrics(plugin, executionTime, error === null);
      }

      // Emit execution event
      this.emit(
        "plugin:action:executed",
        plugin.metadata.id,
        actionName,
        result,
      );

      return result;
    } catch (error) {
      if (error instanceof PluginError) {
        throw error;
      }
      throw new PluginExecutionError(
        plugin.metadata.id,
        `Failed to execute action '${actionName}': ${error}`,
        error,
      );
    }
  }

  // Get plugin resource
  async getResource(
    plugin: PluginInstance,
    resourceName: string,
  ): Promise<Resource> {
    if (!this.initialized) {
      throw new PluginError(
        "Execution manager not initialized",
        "system",
        "NOT_INITIALIZED",
      );
    }

    try {
      // Check if plugin is active
      if (plugin.state !== "active") {
        throw new PluginExecutionError(
          plugin.metadata.id,
          `Plugin is not active (current state: ${plugin.state})`,
        );
      }

      // Get resource definition
      const resource = this.getResourceDefinition(plugin, resourceName);
      if (!resource) {
        throw new PluginExecutionError(
          plugin.metadata.id,
          `Resource '${resourceName}' not found`,
        );
      }

      // Emit resource access event
      this.emit("plugin:resource:accessed", plugin.metadata.id, resourceName);

      return resource;
    } catch (error) {
      if (error instanceof PluginError) {
        throw error;
      }
      throw new PluginExecutionError(
        plugin.metadata.id,
        `Failed to get resource '${resourceName}': ${error}`,
        error,
      );
    }
  }

  // Get tool definition from plugin
  private getTool(plugin: PluginInstance, toolName: string): Tool | null {
    const tools = plugin.instance.getTools();
    return tools.find((tool) => tool.name === toolName) || null;
  }

  // Get action definition from plugin
  private getAction(plugin: PluginInstance, actionName: string): Action | null {
    const actions = plugin.instance.getActions();
    return actions.find((action) => action.name === actionName) || null;
  }

  // Get resource definition from plugin
  private getResourceDefinition(
    plugin: PluginInstance,
    resourceName: string,
  ): Resource | null {
    const resources = plugin.instance.getResources();
    return resources.find((resource) => resource.name === resourceName) || null;
  }

  // Validate input against schema
  private async validateInput(
    definition: Tool | Action,
    input: any,
  ): Promise<void> {
    try {
      if (definition.inputSchema) {
        definition.inputSchema.parse(input);
      }
    } catch (error) {
      throw new PluginExecutionError(
        "system",
        `Input validation failed: ${error}`,
        error,
      );
    }
  }

  // Check rate limits
  private async checkRateLimit(
    pluginId: string,
    operation: string,
  ): Promise<void> {
    const rateLimiter = this.rateLimiters.get(`${pluginId}:${operation}`);
    if (rateLimiter) {
      if (!rateLimiter.canExecute()) {
        throw new PluginExecutionError(
          pluginId,
          `Rate limit exceeded for operation '${operation}'`,
        );
      }
      rateLimiter.recordExecution();
    }
  }

  // Create execution context
  private createExecutionContext(
    plugin: PluginInstance,
    operation: string,
    input: any,
  ): ExecutionContext {
    const context: ExecutionContext = {
      pluginId: plugin.metadata.id,
      operation,
      input,
      startTime: Date.now(),
      timeout: 30000,
    };

    this.executionContexts.set(`${plugin.metadata.id}:${operation}`, context);
    return context;
  }

  // Execute with timeout
  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeout: number,
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Execution timeout")), timeout);
      }),
    ]);
  }

  // Update performance metrics
  private updatePerformanceMetrics(
    plugin: PluginInstance,
    executionTime: number,
    success: boolean,
  ): void {
    const perf = plugin.performance;

    // Update average response time
    perf.totalRequests++;
    perf.avgResponseTime =
      (perf.avgResponseTime * (perf.totalRequests - 1) + executionTime) /
      perf.totalRequests;

    // Update success rate
    if (success) {
      perf.successRate =
        (perf.successRate * (perf.totalRequests - 1) + 100) /
        perf.totalRequests;
    } else {
      perf.successRate =
        (perf.successRate * (perf.totalRequests - 1)) / perf.totalRequests;
    }

    // Update usage count
    plugin.usageCount++;
    plugin.lastUsed = new Date();
  }

  // Set rate limit for plugin operation
  setRateLimit(
    pluginId: string,
    operation: string,
    requests: number,
    window: number,
  ): void {
    const key = `${pluginId}:${operation}`;
    this.rateLimiters.set(key, new RateLimiter(requests, window));
  }

  // Get execution context
  getExecutionContext(
    pluginId: string,
    operation: string,
  ): ExecutionContext | undefined {
    return this.executionContexts.get(`${pluginId}:${operation}`);
  }

  // Get all execution contexts
  getAllExecutionContexts(): ExecutionContext[] {
    return Array.from(this.executionContexts.values());
  }

  // Get execution statistics
  getStats(): {
    activeExecutions: number;
    totalRateLimiters: number;
    avgExecutionTime: number;
  } {
    const contexts = Array.from(this.executionContexts.values());
    const activeExecutions = contexts.filter(
      (c) => Date.now() - c.startTime < c.timeout,
    ).length;
    const avgExecutionTime =
      contexts.length > 0
        ? contexts.reduce((sum, c) => sum + (Date.now() - c.startTime), 0) /
          contexts.length
        : 0;

    return {
      activeExecutions,
      totalRateLimiters: this.rateLimiters.size,
      avgExecutionTime,
    };
  }

  // Cleanup
  async destroy(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    this.executionContexts.clear();
    this.rateLimiters.clear();
    this.initialized = false;
  }
}

// Execution context interface
export interface ExecutionContext {
  pluginId: string;
  operation: string;
  input: any;
  startTime: number;
  timeout: number;
}

// Rate limiter class
class RateLimiter {
  private requests: number;
  private window: number;
  private executions: number[] = [];

  constructor(requests: number, window: number) {
    this.requests = requests;
    this.window = window;
  }

  canExecute(): boolean {
    const now = Date.now();
    // Remove old executions outside the window
    this.executions = this.executions.filter(
      (time) => now - time < this.window,
    );

    return this.executions.length < this.requests;
  }

  recordExecution(): void {
    this.executions.push(Date.now());
  }
}
