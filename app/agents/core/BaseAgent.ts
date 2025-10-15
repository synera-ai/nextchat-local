// Base Agent Implementation

import { EventEmitter } from "events";
import {
  Agent,
  AgentConfig,
  AgentState,
  AgentMetrics,
  AgentTask,
  AgentMessage,
  AgentEvent,
  AgentVisualFeedback,
  AgentMonitoring,
  AgentDebugging,
  AgentPlugin,
  AgentLifecycleHooks,
} from "../types";

export abstract class BaseAgent extends EventEmitter implements Agent {
  // Core properties
  public config: AgentConfig;
  public state: AgentState;
  public metrics: AgentMetrics;

  // Internal state
  private tasks: Map<string, AgentTask> = new Map();
  private plugins: Map<string, AgentPlugin> = new Map();
  private events: AgentEvent[] = [];
  private logs: string[] = [];
  private lifecycleHooks: AgentLifecycleHooks = {};
  private debugMode = false;
  private logLevel: "debug" | "info" | "warn" | "error" = "info";
  private breakpoints: Set<(agent: Agent) => boolean> = new Set();
  private isPaused = false;
  private isStopped = false;

  constructor(config: AgentConfig) {
    super();
    this.config = config;
    this.state = this.createInitialState();
    this.metrics = this.createInitialMetrics();
  }

  // Create initial state
  private createInitialState(): AgentState {
    return {
      status: "idle",
      progress: 0,
      lastActivity: new Date(),
      errorCount: 0,
      successCount: 0,
      totalExecutionTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      isActive: false,
      isPaused: false,
      isStopped: false,
    };
  }

  // Create initial metrics
  private createInitialMetrics(): AgentMetrics {
    return {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      averageExecutionTime: 0,
      averageMemoryUsage: 0,
      averageCpuUsage: 0,
      uptime: 0,
      errorRate: 0,
      successRate: 0,
      throughput: 0,
      lastActivity: new Date(),
    };
  }

  // Lifecycle methods
  async initialize(): Promise<void> {
    this.log("info", `Initializing agent ${this.config.id}`);
    this.updateState({ status: "initializing" });

    try {
      await this.lifecycleHooks.onInitialize?.(this);
      await this.onInitialize();
      this.updateState({ status: "idle" });
      this.emitEvent("agent.initialized", { agentId: this.config.id });
      this.log("info", `Agent ${this.config.id} initialized successfully`);
    } catch (error) {
      this.updateState({ status: "error" });
      this.emitEvent("agent.initialization.failed", {
        agentId: this.config.id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async start(): Promise<void> {
    this.log("info", `Starting agent ${this.config.id}`);
    this.updateState({
      status: "running",
      isActive: true,
      startTime: new Date(),
    });

    try {
      await this.lifecycleHooks.onStart?.(this);
      await this.onStart();
      this.emitEvent("agent.started", { agentId: this.config.id });
      this.log("info", `Agent ${this.config.id} started successfully`);
    } catch (error) {
      this.updateState({ status: "error" });
      await this.lifecycleHooks.onError?.(this, error as Error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    this.log("info", `Stopping agent ${this.config.id}`);
    this.updateState({
      status: "stopped",
      isActive: false,
      isStopped: true,
      endTime: new Date(),
    });

    try {
      await this.lifecycleHooks.onStop?.(this);
      await this.onStop();
      this.emitEvent("agent.stopped", { agentId: this.config.id });
      this.log("info", `Agent ${this.config.id} stopped successfully`);
    } catch (error) {
      this.log("error", `Error stopping agent ${this.config.id}:`, error);
      throw error;
    }
  }

  async pause(): Promise<void> {
    this.log("info", `Pausing agent ${this.config.id}`);
    this.updateState({
      status: "paused",
      isPaused: true,
    });

    try {
      await this.lifecycleHooks.onPause?.(this);
      await this.onPause();
      this.emitEvent("agent.paused", { agentId: this.config.id });
      this.log("info", `Agent ${this.config.id} paused successfully`);
    } catch (error) {
      this.log("error", `Error pausing agent ${this.config.id}:`, error);
      throw error;
    }
  }

  async resume(): Promise<void> {
    this.log("info", `Resuming agent ${this.config.id}`);
    this.updateState({
      status: "running",
      isPaused: false,
    });

    try {
      await this.lifecycleHooks.onResume?.(this);
      await this.onResume();
      this.emitEvent("agent.resumed", { agentId: this.config.id });
      this.log("info", `Agent ${this.config.id} resumed successfully`);
    } catch (error) {
      this.log("error", `Error resuming agent ${this.config.id}:`, error);
      throw error;
    }
  }

  async restart(): Promise<void> {
    this.log("info", `Restarting agent ${this.config.id}`);
    await this.stop();
    await this.start();
  }

  // Task management
  async executeTask(task: AgentTask): Promise<any> {
    this.log("info", `Executing task ${task.id} for agent ${this.config.id}`);

    // Check if agent is in a valid state
    if (this.state.status === "stopped" || this.state.status === "error") {
      throw new Error(
        `Agent ${this.config.id} is not in a valid state to execute tasks`,
      );
    }

    // Check breakpoints
    if (this.debugMode && this.breakpoints.size > 0) {
      for (const breakpoint of this.breakpoints) {
        if (breakpoint(this)) {
          this.log("debug", `Breakpoint hit for agent ${this.config.id}`);
          await this.waitForDebugger();
        }
      }
    }

    // Update task status
    task.status = "running";
    task.startTime = new Date();
    this.tasks.set(task.id, task);

    // Update agent state
    this.updateState({
      status: "executing",
      currentTask: task.name,
      progress: 0,
    });

    try {
      await this.lifecycleHooks.onTaskStart?.(this, task);
      const result = await this.onExecuteTask(task);

      // Update task completion
      task.status = "completed";
      task.endTime = new Date();
      task.output = result;
      this.tasks.set(task.id, task);

      // Update metrics
      this.updateMetrics({
        completedTasks: this.metrics.completedTasks + 1,
        totalTasks: this.metrics.totalTasks + 1,
      });

      await this.lifecycleHooks.onTaskComplete?.(this, task);
      this.emitEvent("task.completed", {
        agentId: this.config.id,
        taskId: task.id,
      });

      this.log("info", `Task ${task.id} completed successfully`);
      return result;
    } catch (error) {
      // Update task failure
      task.status = "failed";
      task.endTime = new Date();
      task.error = error instanceof Error ? error.message : String(error);
      this.tasks.set(task.id, task);

      // Update metrics
      this.updateMetrics({
        failedTasks: this.metrics.failedTasks + 1,
        totalTasks: this.metrics.totalTasks + 1,
      });

      await this.lifecycleHooks.onTaskError?.(this, task, error as Error);
      this.emitEvent("task.failed", {
        agentId: this.config.id,
        taskId: task.id,
        error: error instanceof Error ? error.message : String(error),
      });

      this.log("error", `Task ${task.id} failed:`, error);
      throw error;
    } finally {
      // Reset agent state
      this.updateState({
        status: "idle",
        currentTask: undefined,
        progress: 0,
      });
    }
  }

  async cancelTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (task && task.status === "running") {
      task.status = "cancelled";
      task.endTime = new Date();
      this.tasks.set(taskId, task);
      this.emitEvent("task.cancelled", { agentId: this.config.id, taskId });
      this.log("info", `Task ${taskId} cancelled`);
    }
  }

  getTask(taskId: string): AgentTask | undefined {
    return this.tasks.get(taskId);
  }

  getTasks(): AgentTask[] {
    return Array.from(this.tasks.values());
  }

  // Communication
  async sendMessage(message: AgentMessage): Promise<void> {
    this.log(
      "debug",
      `Sending message ${message.id} from agent ${this.config.id}`,
    );
    this.emitEvent("message.sent", {
      agentId: this.config.id,
      messageId: message.id,
    });
    // Implementation would depend on the communication system
  }

  receiveMessage(callback: (message: AgentMessage) => void): void {
    this.on("message.received", (message: AgentMessage) => {
      callback(message);
    });
  }

  // Visual feedback
  getVisualFeedback(): AgentVisualFeedback {
    return {
      status: this.state.status,
      progress: this.state.progress,
      currentTask: this.state.currentTask,
      message: this.getStatusMessage(),
      icon: this.getStatusIcon(),
      color: this.getStatusColor(),
      animation: this.getStatusAnimation(),
      showProgress:
        this.state.status === "executing" || this.state.status === "thinking",
      showStatus: true,
      showActivity: this.state.isActive,
    };
  }

  // Monitoring
  getMonitoring(): AgentMonitoring {
    return {
      getMetrics: () => ({ ...this.metrics }),
      getState: () => ({ ...this.state }),
      getTasks: () => this.getTasks(),
      getEvents: (limit = 100) => this.events.slice(-limit),
      getLogs: (limit = 100) => this.logs.slice(-limit),
      isHealthy: () => this.isHealthy(),
      getHealthScore: () => this.getHealthScore(),
    };
  }

  // Debugging
  getDebugging(): AgentDebugging {
    return {
      enableDebugMode: () => {
        this.debugMode = true;
        this.logLevel = "debug";
        this.log("debug", `Debug mode enabled for agent ${this.config.id}`);
      },
      disableDebugMode: () => {
        this.debugMode = false;
        this.log("debug", `Debug mode disabled for agent ${this.config.id}`);
      },
      isDebugMode: () => this.debugMode,
      setLogLevel: (level) => {
        this.logLevel = level;
        this.log(
          "info",
          `Log level set to ${level} for agent ${this.config.id}`,
        );
      },
      getLogLevel: () => this.logLevel,
      addBreakpoint: (condition) => {
        this.breakpoints.add(condition);
        this.log("debug", `Breakpoint added for agent ${this.config.id}`);
      },
      removeBreakpoint: (condition) => {
        this.breakpoints.delete(condition);
        this.log("debug", `Breakpoint removed for agent ${this.config.id}`);
      },
      step: async () => {
        this.log("debug", `Step executed for agent ${this.config.id}`);
        // Implementation would depend on the debugging system
      },
      continue: async () => {
        this.log("debug", `Continue executed for agent ${this.config.id}`);
        // Implementation would depend on the debugging system
      },
      pause: async () => {
        await this.pause();
      },
      resume: async () => {
        await this.resume();
      },
    };
  }

  // Plugin management
  async loadPlugin(plugin: AgentPlugin): Promise<void> {
    this.log("info", `Loading plugin ${plugin.id} for agent ${this.config.id}`);
    plugin.isLoaded = true;
    plugin.loadTime = new Date();
    this.plugins.set(plugin.id, plugin);
    this.emitEvent("plugin.loaded", {
      agentId: this.config.id,
      pluginId: plugin.id,
    });
  }

  async unloadPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.isLoaded = false;
      this.plugins.delete(pluginId);
      this.emitEvent("plugin.unloaded", { agentId: this.config.id, pluginId });
      this.log(
        "info",
        `Plugin ${pluginId} unloaded from agent ${this.config.id}`,
      );
    }
  }

  getPlugins(): AgentPlugin[] {
    return Array.from(this.plugins.values());
  }

  // Event handling
  emit(eventType: string, data: any): void {
    const event: AgentEvent = {
      id: this.generateId(),
      type: eventType,
      timestamp: new Date(),
      agentId: this.config.id,
      data,
      severity: "info",
      source: "agent",
    };

    this.events.push(event);
    super.emit(eventType, event);
  }

  // Cleanup
  async cleanup(): Promise<void> {
    this.log("info", `Cleaning up agent ${this.config.id}`);
    await this.stop();
    this.tasks.clear();
    this.plugins.clear();
    this.events.length = 0;
    this.logs.length = 0;
    this.removeAllListeners();
  }

  // Abstract methods to be implemented by concrete agents
  protected abstract onInitialize(): Promise<void>;
  protected abstract onStart(): Promise<void>;
  protected abstract onStop(): Promise<void>;
  protected abstract onPause(): Promise<void>;
  protected abstract onResume(): Promise<void>;
  protected abstract onExecuteTask(task: AgentTask): Promise<any>;

  // Helper methods
  private updateState(updates: Partial<AgentState>): void {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...updates };
    this.state.lastActivity = new Date();
    this.lifecycleHooks.onStateChange?.(this, oldState, this.state);
  }

  private updateMetrics(updates: Partial<AgentMetrics>): void {
    this.metrics = { ...this.metrics, ...updates };
    this.metrics.lastActivity = new Date();
  }

  private emitEvent(type: string, data: any): void {
    this.emit(type, data);
  }

  private log(
    level: "debug" | "info" | "warn" | "error",
    message: string,
    ...args: any[]
  ): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] [${
      this.config.id
    }] ${message}`;

    if (args.length > 0) {
      this.logs.push(
        `${logMessage} ${args.map((arg) => JSON.stringify(arg)).join(" ")}`,
      );
    } else {
      this.logs.push(logMessage);
    }

    if (this.shouldLog(level)) {
      console.log(logMessage, ...args);
    }
  }

  private shouldLog(level: string): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level as keyof typeof levels] >= levels[this.logLevel];
  }

  private isHealthy(): boolean {
    return (
      this.state.status !== "error" &&
      this.state.errorCount < (this.config.maxRetries || 3) &&
      this.metrics.errorRate < 0.1
    );
  }

  private getHealthScore(): number {
    let score = 100;

    if (this.state.status === "error") score -= 50;
    if (this.metrics.errorRate > 0.1) score -= 30;
    if (this.metrics.successRate < 0.8) score -= 20;
    if (this.state.errorCount > 0) score -= 10;

    return Math.max(0, score);
  }

  private getStatusMessage(): string {
    switch (this.state.status) {
      case "idle":
        return "Ready";
      case "initializing":
        return "Initializing...";
      case "running":
        return "Running";
      case "thinking":
        return "Thinking...";
      case "executing":
        return `Executing: ${this.state.currentTask || "Task"}`;
      case "waiting":
        return "Waiting...";
      case "error":
        return "Error occurred";
      case "completed":
        return "Completed";
      case "paused":
        return "Paused";
      case "stopped":
        return "Stopped";
      default:
        return "Unknown";
    }
  }

  private getStatusIcon(): string {
    switch (this.state.status) {
      case "idle":
        return "⏸️";
      case "initializing":
        return "🔄";
      case "running":
        return "▶️";
      case "thinking":
        return "🤔";
      case "executing":
        return "⚡";
      case "waiting":
        return "⏳";
      case "error":
        return "❌";
      case "completed":
        return "✅";
      case "paused":
        return "⏸️";
      case "stopped":
        return "⏹️";
      default:
        return "❓";
    }
  }

  private getStatusColor(): string {
    switch (this.state.status) {
      case "idle":
        return "#6b7280";
      case "initializing":
        return "#3b82f6";
      case "running":
        return "#10b981";
      case "thinking":
        return "#8b5cf6";
      case "executing":
        return "#f59e0b";
      case "waiting":
        return "#6b7280";
      case "error":
        return "#ef4444";
      case "completed":
        return "#10b981";
      case "paused":
        return "#f59e0b";
      case "stopped":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  }

  private getStatusAnimation(): string {
    switch (this.state.status) {
      case "initializing":
        return "spin";
      case "thinking":
        return "pulse";
      case "executing":
        return "bounce";
      case "waiting":
        return "pulse";
      default:
        return "none";
    }
  }

  private async waitForDebugger(): Promise<void> {
    // Implementation would depend on the debugging system
    this.log("debug", `Waiting for debugger for agent ${this.config.id}`);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
