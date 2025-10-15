// Plugin API
// This file provides the API interface for plugins to interact with NextChat

import { EventEmitter } from "events";
import {
  PluginMetadata,
  PluginConfig,
  Tool,
  Action,
  Resource,
  Hook,
  Middleware,
} from "../core/types";

export class PluginAPI extends EventEmitter {
  private pluginId: string;
  private metadata: PluginMetadata;
  private config: PluginConfig;
  private permissions: string[] = [];
  private rateLimits: Map<string, RateLimit> = new Map();

  constructor(
    pluginId: string,
    metadata: PluginMetadata,
    config: PluginConfig,
  ) {
    super();
    this.pluginId = pluginId;
    this.metadata = metadata;
    this.config = config;
  }

  // Plugin information
  getPluginId(): string {
    return this.pluginId;
  }

  getMetadata(): PluginMetadata {
    return this.metadata;
  }

  getConfig(): PluginConfig {
    return this.config;
  }

  // Configuration management
  async updateConfig(newConfig: Partial<PluginConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    this.emit("config:updated", this.config);
  }

  // Permission management
  hasPermission(permission: string): boolean {
    return (
      this.permissions.includes(permission) || this.permissions.includes("*")
    );
  }

  requestPermission(permission: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.emit("permission:requested", permission, resolve);
    });
  }

  grantPermission(permission: string): void {
    if (!this.permissions.includes(permission)) {
      this.permissions.push(permission);
      this.emit("permission:granted", permission);
    }
  }

  revokePermission(permission: string): void {
    const index = this.permissions.indexOf(permission);
    if (index > -1) {
      this.permissions.splice(index, 1);
      this.emit("permission:revoked", permission);
    }
  }

  // Rate limiting
  setRateLimit(operation: string, requests: number, window: number): void {
    this.rateLimits.set(operation, {
      requests,
      window,
      count: 0,
      resetTime: Date.now() + window,
    });
  }

  checkRateLimit(operation: string): boolean {
    const limit = this.rateLimits.get(operation);
    if (!limit) {
      return true;
    }

    const now = Date.now();
    if (now > limit.resetTime) {
      limit.count = 0;
      limit.resetTime = now + limit.window;
    }

    if (limit.count >= limit.requests) {
      return false;
    }

    limit.count++;
    return true;
  }

  // Tool registration
  registerTool(tool: Tool): void {
    this.emit("tool:registered", tool);
  }

  unregisterTool(toolName: string): void {
    this.emit("tool:unregistered", toolName);
  }

  // Action registration
  registerAction(action: Action): void {
    this.emit("action:registered", action);
  }

  unregisterAction(actionName: string): void {
    this.emit("action:unregistered", actionName);
  }

  // Resource registration
  registerResource(resource: Resource): void {
    this.emit("resource:registered", resource);
  }

  unregisterResource(resourceName: string): void {
    this.emit("resource:unregistered", resourceName);
  }

  // Hook registration
  registerHook(hook: Hook): void {
    this.emit("hook:registered", hook);
  }

  unregisterHook(hookName: string): void {
    this.emit("hook:unregistered", hookName);
  }

  // Middleware registration
  registerMiddleware(middleware: Middleware): void {
    this.emit("middleware:registered", middleware);
  }

  unregisterMiddleware(middlewareName: string): void {
    this.emit("middleware:unregistered", middlewareName);
  }

  // Event system
  emitEvent(event: string, data: any): void {
    this.emit("event:emitted", event, data);
  }

  onEvent(event: string, handler: (data: any) => void): void {
    this.emit("event:subscribed", event, handler);
  }

  offEvent(event: string, handler: (data: any) => void): void {
    this.emit("event:unsubscribed", event, handler);
  }

  // Storage API
  async getStorage(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.emit("storage:get", key, (error: Error | null, value: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(value);
        }
      });
    });
  }

  async setStorage(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.emit("storage:set", key, value, (error: Error | null) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async removeStorage(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.emit("storage:remove", key, (error: Error | null) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  // HTTP API
  async request(options: RequestOptions): Promise<Response> {
    if (!this.hasPermission("network:http")) {
      throw new Error("HTTP requests not permitted");
    }

    return new Promise((resolve, reject) => {
      this.emit(
        "http:request",
        options,
        (error: Error | null, response: Response) => {
          if (error) {
            reject(error);
          } else {
            resolve(response);
          }
        },
      );
    });
  }

  // File system API
  async readFile(path: string): Promise<string> {
    if (!this.hasPermission("filesystem:read")) {
      throw new Error("File system read access not permitted");
    }

    return new Promise((resolve, reject) => {
      this.emit(
        "filesystem:read",
        path,
        (error: Error | null, content: string) => {
          if (error) {
            reject(error);
          } else {
            resolve(content);
          }
        },
      );
    });
  }

  async writeFile(path: string, content: string): Promise<void> {
    if (!this.hasPermission("filesystem:write")) {
      throw new Error("File system write access not permitted");
    }

    return new Promise((resolve, reject) => {
      this.emit("filesystem:write", path, content, (error: Error | null) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  // Logging API
  log(level: LogLevel, message: string, data?: any): void {
    this.emit("log", {
      pluginId: this.pluginId,
      level,
      message,
      data,
      timestamp: new Date(),
    });
  }

  debug(message: string, data?: any): void {
    this.log("debug", message, data);
  }

  info(message: string, data?: any): void {
    this.log("info", message, data);
  }

  warn(message: string, data?: any): void {
    this.log("warn", message, data);
  }

  error(message: string, data?: any): void {
    this.log("error", message, data);
  }

  // Metrics API
  recordMetric(
    name: string,
    value: number,
    tags?: Record<string, string>,
  ): void {
    this.emit("metric:recorded", {
      pluginId: this.pluginId,
      name,
      value,
      tags,
      timestamp: new Date(),
    });
  }

  incrementCounter(
    name: string,
    value: number = 1,
    tags?: Record<string, string>,
  ): void {
    this.recordMetric(name, value, tags);
  }

  // Health check API
  setHealthStatus(status: HealthStatus): void {
    this.emit("health:status", {
      pluginId: this.pluginId,
      status,
      timestamp: new Date(),
    });
  }

  // Cleanup
  destroy(): void {
    this.emit("plugin:destroyed", this.pluginId);
    this.removeAllListeners();
  }
}

// Rate limit interface
interface RateLimit {
  requests: number;
  window: number;
  count: number;
  resetTime: number;
}

// Request options interface
export interface RequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

// Log level type
export type LogLevel = "debug" | "info" | "warn" | "error";

// Health status type
export type HealthStatus = "healthy" | "warning" | "error" | "unknown";
