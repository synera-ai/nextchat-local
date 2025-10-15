// Plugin Hooks System
// This file handles plugin hooks and event system integration

import { EventEmitter } from "events";
import { PluginInstance, Hook, PluginError } from "../core/types";

export class PluginHooksSystem extends EventEmitter {
  private hooks: Map<string, Hook[]> = new Map();
  private hookHistory: Map<string, HookExecution[]> = new Map();
  private hookMetrics: Map<string, HookMetrics> = new Map();

  constructor() {
    super();
  }

  // Initialize the hooks system
  async initialize(): Promise<void> {
    // Start metrics collection
    this.startMetricsCollection();
  }

  // Register plugin hooks
  registerHooks(plugin: PluginInstance): void {
    const pluginHooks = plugin.instance.getHooks();

    for (const hook of pluginHooks) {
      this.registerHook(plugin, hook);
    }

    this.emit("hooks:registered", plugin.metadata.id, pluginHooks);
  }

  // Unregister plugin hooks
  unregisterHooks(plugin: PluginInstance): void {
    const pluginHooks = plugin.instance.getHooks();

    for (const hook of pluginHooks) {
      this.unregisterHook(plugin, hook);
    }

    this.emit("hooks:unregistered", plugin.metadata.id);
  }

  // Register individual hook
  private registerHook(plugin: PluginInstance, hook: Hook): void {
    const eventHooks = this.hooks.get(hook.event) || [];

    // Remove existing hook from same plugin
    const filteredHooks = eventHooks.filter(
      (h) => !h.name.startsWith(`${plugin.metadata.id}:`),
    );

    // Add new hook with plugin prefix
    const prefixedHook: Hook = {
      ...hook,
      name: `${plugin.metadata.id}:${hook.name}`,
    };

    filteredHooks.push(prefixedHook);

    // Sort by priority
    filteredHooks.sort((a, b) => b.priority - a.priority);

    this.hooks.set(hook.event, filteredHooks);

    // Initialize metrics for this hook
    this.hookMetrics.set(prefixedHook.name, {
      executions: 0,
      successes: 0,
      failures: 0,
      totalTime: 0,
      avgTime: 0,
      lastExecuted: null,
    });
  }

  // Unregister individual hook
  private unregisterHook(plugin: PluginInstance, hook: Hook): void {
    const eventHooks = this.hooks.get(hook.event) || [];
    const filteredHooks = eventHooks.filter(
      (h) => !h.name.startsWith(`${plugin.metadata.id}:`),
    );

    if (filteredHooks.length === 0) {
      this.hooks.delete(hook.event);
    } else {
      this.hooks.set(hook.event, filteredHooks);
    }

    // Remove metrics
    this.hookMetrics.delete(`${plugin.metadata.id}:${hook.name}`);
  }

  // Execute hooks for event
  async executeHooks(event: string, data: any): Promise<any> {
    const eventHooks = this.hooks.get(event) || [];

    if (eventHooks.length === 0) {
      return data;
    }

    let result = data;

    for (const hook of eventHooks) {
      try {
        const startTime = Date.now();

        // Execute hook
        result = await this.executeHook(hook, result);

        const executionTime = Date.now() - startTime;

        // Update metrics
        this.updateHookMetrics(hook.name, executionTime, true);

        // Record execution
        this.recordHookExecution(hook, executionTime, true, null);

        // Remove hook if it's a one-time hook
        if (hook.once) {
          this.removeHook(event, hook.name);
        }

        this.emit("hook:executed", hook, result, executionTime);
      } catch (error) {
        const executionTime = Date.now() - startTime;

        // Update metrics
        this.updateHookMetrics(hook.name, executionTime, false);

        // Record execution
        this.recordHookExecution(hook, executionTime, false, error);

        this.emit("hook:failed", hook, error, executionTime);

        // Continue with other hooks unless it's a critical error
        if (error instanceof PluginError && error.code === "CRITICAL_ERROR") {
          throw error;
        }
      }
    }

    return result;
  }

  // Execute individual hook
  private async executeHook(hook: Hook, data: any): Promise<any> {
    // In a real implementation, this would execute the actual hook
    // For now, we'll simulate execution
    return hook.handler(data);
  }

  // Update hook metrics
  private updateHookMetrics(
    hookName: string,
    executionTime: number,
    success: boolean,
  ): void {
    const metrics = this.hookMetrics.get(hookName);
    if (!metrics) {
      return;
    }

    metrics.executions++;
    metrics.totalTime += executionTime;
    metrics.avgTime = metrics.totalTime / metrics.executions;
    metrics.lastExecuted = new Date();

    if (success) {
      metrics.successes++;
    } else {
      metrics.failures++;
    }
  }

  // Record hook execution
  private recordHookExecution(
    hook: Hook,
    executionTime: number,
    success: boolean,
    error: Error | null,
  ): void {
    const execution: HookExecution = {
      hookName: hook.name,
      event: hook.event,
      executionTime,
      success,
      error: error?.message,
      timestamp: new Date(),
    };

    if (!this.hookHistory.has(hook.event)) {
      this.hookHistory.set(hook.event, []);
    }

    const history = this.hookHistory.get(hook.event)!;
    history.push(execution);

    // Keep only last 100 executions per event
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
  }

  // Remove specific hook
  private removeHook(event: string, hookName: string): void {
    const eventHooks = this.hooks.get(event) || [];
    const filteredHooks = eventHooks.filter((hook) => hook.name !== hookName);

    if (filteredHooks.length === 0) {
      this.hooks.delete(event);
    } else {
      this.hooks.set(event, filteredHooks);
    }
  }

  // Start metrics collection
  private startMetricsCollection(): void {
    setInterval(() => {
      this.collectMetrics();
    }, 60000); // Collect metrics every minute
  }

  // Collect metrics
  private collectMetrics(): void {
    const metrics = {
      totalHooks: this.hooks.size,
      totalExecutions: 0,
      totalSuccesses: 0,
      totalFailures: 0,
      avgExecutionTime: 0,
    };

    for (const hookMetrics of this.hookMetrics.values()) {
      metrics.totalExecutions += hookMetrics.executions;
      metrics.totalSuccesses += hookMetrics.successes;
      metrics.totalFailures += hookMetrics.failures;
      metrics.avgExecutionTime += hookMetrics.avgTime;
    }

    if (this.hookMetrics.size > 0) {
      metrics.avgExecutionTime /= this.hookMetrics.size;
    }

    this.emit("metrics:collected", metrics);
  }

  // Get hooks for event
  getHooks(event: string): Hook[] {
    return this.hooks.get(event) || [];
  }

  // Get all hooks
  getAllHooks(): Map<string, Hook[]> {
    return new Map(this.hooks);
  }

  // Get hook metrics
  getHookMetrics(hookName: string): HookMetrics | undefined {
    return this.hookMetrics.get(hookName);
  }

  // Get all hook metrics
  getAllHookMetrics(): Map<string, HookMetrics> {
    return new Map(this.hookMetrics);
  }

  // Get hook execution history
  getHookHistory(event: string, limit: number = 50): HookExecution[] {
    const history = this.hookHistory.get(event) || [];
    return history.slice(-limit);
  }

  // Get hooks statistics
  getStats(): {
    totalHooks: number;
    totalEvents: number;
    totalExecutions: number;
    successRate: number;
    avgExecutionTime: number;
  } {
    let totalExecutions = 0;
    let totalSuccesses = 0;
    let totalTime = 0;

    for (const metrics of this.hookMetrics.values()) {
      totalExecutions += metrics.executions;
      totalSuccesses += metrics.successes;
      totalTime += metrics.totalTime;
    }

    const successRate =
      totalExecutions > 0 ? (totalSuccesses / totalExecutions) * 100 : 0;
    const avgExecutionTime =
      totalExecutions > 0 ? totalTime / totalExecutions : 0;

    return {
      totalHooks: Array.from(this.hooks.values()).reduce(
        (sum, hooks) => sum + hooks.length,
        0,
      ),
      totalEvents: this.hooks.size,
      totalExecutions,
      successRate,
      avgExecutionTime,
    };
  }

  // Cleanup
  async destroy(): Promise<void> {
    this.hooks.clear();
    this.hookHistory.clear();
    this.hookMetrics.clear();
    this.removeAllListeners();
  }
}

// Hook execution interface
export interface HookExecution {
  hookName: string;
  event: string;
  executionTime: number;
  success: boolean;
  error?: string;
  timestamp: Date;
}

// Hook metrics interface
export interface HookMetrics {
  executions: number;
  successes: number;
  failures: number;
  totalTime: number;
  avgTime: number;
  lastExecuted: Date | null;
}
