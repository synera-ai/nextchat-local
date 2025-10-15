// Core Plugin System Types
// This file defines the fundamental types and interfaces for the modular plugin system

import { z } from "zod";

// Plugin lifecycle states
export type PluginState =
  | "uninstalled"
  | "installed"
  | "enabled"
  | "disabled"
  | "error"
  | "loading"
  | "initializing"
  | "active"
  | "shutting_down";

// Plugin capabilities
export interface PluginCapabilities {
  tools: Tool[];
  resources: Resource[];
  actions: Action[];
  hooks: Hook[];
  middleware: Middleware[];
}

// Plugin tool definition
export interface Tool {
  name: string;
  description: string;
  inputSchema: z.ZodSchema;
  outputSchema: z.ZodSchema;
  handler: (input: any) => Promise<any>;
  permissions?: string[];
  rateLimit?: {
    requests: number;
    window: number; // in milliseconds
  };
}

// Plugin resource definition
export interface Resource {
  name: string;
  type: "file" | "url" | "data" | "stream";
  uri: string;
  metadata?: Record<string, any>;
  permissions?: string[];
}

// Plugin action definition
export interface Action {
  name: string;
  description: string;
  inputSchema: z.ZodSchema;
  handler: (input: any) => Promise<any>;
  permissions?: string[];
  async?: boolean;
}

// Plugin hook definition
export interface Hook {
  name: string;
  event: string;
  priority: number;
  handler: (data: any) => Promise<any>;
  once?: boolean;
}

// Plugin middleware definition
export interface Middleware {
  name: string;
  type: "request" | "response" | "error";
  handler: (context: any, next: () => Promise<any>) => Promise<any>;
  priority: number;
}

// Plugin configuration schema
export interface PluginConfigSchema {
  type: "object";
  properties: Record<
    string,
    {
      type: string;
      description?: string;
      default?: any;
      required?: boolean;
      enum?: any[];
      minimum?: number;
      maximum?: number;
      pattern?: string;
    }
  >;
  required?: string[];
}

// Plugin metadata
export interface PluginMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  author: {
    name: string;
    email?: string;
    url?: string;
  };
  license: string;
  repository?: {
    type: string;
    url: string;
  };
  homepage?: string;
  bugs?: {
    url: string;
  };
  keywords: string[];
  category: string;
  tags: string[];
  capabilities: PluginCapabilities;
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  configSchema: PluginConfigSchema;
  icon?: string;
  screenshots?: string[];
  documentation?: string;
  changelog?: string;
  lastUpdated: Date;
  verified: boolean;
  minNextChatVersion?: string;
  maxNextChatVersion?: string;
}

// Plugin configuration
export interface PluginConfig {
  enabled: boolean;
  settings: Record<string, any>;
  permissions: string[];
  rateLimits: Record<
    string,
    {
      requests: number;
      window: number;
    }
  >;
  hooks: Record<string, boolean>;
  middleware: Record<string, boolean>;
}

// Plugin instance
export interface PluginInstance {
  metadata: PluginMetadata;
  config: PluginConfig;
  state: PluginState;
  instance: Plugin;
  error?: Error;
  lastUsed?: Date;
  usageCount: number;
  errorCount: number;
  performance: {
    avgResponseTime: number;
    totalRequests: number;
    successRate: number;
    memoryUsage: number;
  };
}

// Plugin interface
export interface Plugin {
  // Core plugin methods
  initialize(): Promise<void>;
  destroy(): Promise<void>;

  // Configuration methods
  configure(config: Partial<PluginConfig>): Promise<void>;
  getConfig(): PluginConfig;

  // Capability methods
  getCapabilities(): PluginCapabilities;
  getTools(): Tool[];
  getResources(): Resource[];
  getActions(): Action[];
  getHooks(): Hook[];
  getMiddleware(): Middleware[];

  // Lifecycle methods
  enable(): Promise<void>;
  disable(): Promise<void>;
  restart(): Promise<void>;

  // Health and status methods
  getStatus(): PluginState;
  getHealth(): {
    status: "healthy" | "warning" | "error";
    message?: string;
    metrics: Record<string, any>;
  };

  // Event emitter
  on(event: string, listener: (...args: any[]) => void): this;
  emit(event: string, ...args: any[]): boolean;
  removeListener(event: string, listener: (...args: any[]) => void): this;
}

// Plugin manager interface
export interface PluginManager {
  // Plugin lifecycle management
  install(pluginId: string, source: string): Promise<PluginInstance>;
  uninstall(pluginId: string): Promise<void>;
  enable(pluginId: string): Promise<void>;
  disable(pluginId: string): Promise<void>;
  restart(pluginId: string): Promise<void>;

  // Plugin discovery and management
  discover(): Promise<PluginMetadata[]>;
  search(
    query: string,
    filters?: PluginSearchFilters,
  ): Promise<PluginMetadata[]>;
  getInstalled(): PluginInstance[];
  getEnabled(): PluginInstance[];
  getAvailable(): PluginMetadata[];

  // Plugin configuration
  configure(pluginId: string, config: Partial<PluginConfig>): Promise<void>;
  getConfig(pluginId: string): PluginConfig;

  // Plugin execution
  executeTool(pluginId: string, toolName: string, input: any): Promise<any>;
  executeAction(pluginId: string, actionName: string, input: any): Promise<any>;
  getResource(pluginId: string, resourceName: string): Promise<Resource>;

  // Event system
  emit(event: string, ...args: any[]): boolean;
  on(event: string, listener: (...args: any[]) => void): this;
  removeListener(event: string, listener: (...args: any[]) => void): this;
}

// Plugin search filters
export interface PluginSearchFilters {
  category?: string;
  tags?: string[];
  capabilities?: string[];
  verified?: boolean;
  minRating?: number;
  author?: string;
  license?: string;
  state?: PluginState[];
  installed?: boolean;
  enabled?: boolean;
}

// Plugin installation result
export interface PluginInstallationResult {
  success: boolean;
  plugin?: PluginInstance;
  error?: string;
  warnings?: string[];
}

// Plugin error types
export class PluginError extends Error {
  constructor(
    message: string,
    public pluginId: string,
    public code: string,
    public details?: any,
  ) {
    super(message);
    this.name = "PluginError";
  }
}

export class PluginConfigurationError extends PluginError {
  constructor(pluginId: string, message: string, details?: any) {
    super(message, pluginId, "CONFIGURATION_ERROR", details);
    this.name = "PluginConfigurationError";
  }
}

export class PluginExecutionError extends PluginError {
  constructor(pluginId: string, message: string, details?: any) {
    super(message, pluginId, "EXECUTION_ERROR", details);
    this.name = "PluginExecutionError";
  }
}

export class PluginDependencyError extends PluginError {
  constructor(pluginId: string, message: string, details?: any) {
    super(message, pluginId, "DEPENDENCY_ERROR", details);
    this.name = "PluginDependencyError";
  }
}

// Plugin event types
export interface PluginEvents {
  // Plugin lifecycle events
  "plugin:installed": (plugin: PluginInstance) => void;
  "plugin:uninstalled": (pluginId: string) => void;
  "plugin:enabled": (plugin: PluginInstance) => void;
  "plugin:disabled": (plugin: PluginInstance) => void;
  "plugin:restarted": (plugin: PluginInstance) => void;

  // Plugin execution events
  "plugin:tool:executed": (
    pluginId: string,
    toolName: string,
    result: any,
  ) => void;
  "plugin:action:executed": (
    pluginId: string,
    actionName: string,
    result: any,
  ) => void;
  "plugin:resource:accessed": (pluginId: string, resourceName: string) => void;

  // Plugin error events
  "plugin:error": (pluginId: string, error: Error) => void;
  "plugin:warning": (pluginId: string, warning: string) => void;

  // Plugin configuration events
  "plugin:configured": (pluginId: string, config: PluginConfig) => void;

  // Plugin discovery events
  "plugin:discovered": (plugin: PluginMetadata) => void;
  "plugin:search:completed": (query: string, results: PluginMetadata[]) => void;
}
