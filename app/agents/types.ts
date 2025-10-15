// AI Agent Framework Types and Interfaces

import { ReactNode } from "react";

// Agent status types
export type AgentStatus =
  | "idle"
  | "initializing"
  | "running"
  | "thinking"
  | "executing"
  | "waiting"
  | "error"
  | "completed"
  | "paused"
  | "stopped";

// Agent priority levels
export type AgentPriority = "low" | "normal" | "high" | "critical";

// Agent capabilities
export type AgentCapability =
  | "text-generation"
  | "code-execution"
  | "file-operations"
  | "web-search"
  | "data-analysis"
  | "image-generation"
  | "audio-processing"
  | "plugin-integration"
  | "user-interaction"
  | "system-monitoring";

// Agent communication types
export type AgentMessageType =
  | "request"
  | "response"
  | "notification"
  | "error"
  | "status-update"
  | "progress-update"
  | "completion"
  | "interruption";

// Agent configuration interface
export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  capabilities: AgentCapability[];
  priority: AgentPriority;
  maxExecutionTime?: number;
  maxMemoryUsage?: number;
  allowedPlugins?: string[];
  securityLevel: "low" | "medium" | "high";
  autoStart?: boolean;
  restartOnError?: boolean;
  maxRetries?: number;
  environment?: Record<string, any>;
  dependencies?: string[];
}

// Agent state interface
export interface AgentState {
  status: AgentStatus;
  progress: number;
  currentTask?: string;
  lastActivity: Date;
  startTime?: Date;
  endTime?: Date;
  errorCount: number;
  successCount: number;
  totalExecutionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  isActive: boolean;
  isPaused: boolean;
  isStopped: boolean;
}

// Agent message interface
export interface AgentMessage {
  id: string;
  type: AgentMessageType;
  timestamp: Date;
  sender: string;
  recipient?: string;
  content: any;
  metadata?: Record<string, any>;
  priority: AgentPriority;
  correlationId?: string;
  replyTo?: string;
}

// Agent task interface
export interface AgentTask {
  id: string;
  name: string;
  description: string;
  type: string;
  priority: AgentPriority;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  progress: number;
  startTime?: Date;
  endTime?: Date;
  input: any;
  output?: any;
  error?: string;
  metadata?: Record<string, any>;
  dependencies?: string[];
  timeout?: number;
}

// Agent event interface
export interface AgentEvent {
  id: string;
  type: string;
  timestamp: Date;
  agentId: string;
  data: any;
  severity: "info" | "warning" | "error" | "critical";
  source: string;
  metadata?: Record<string, any>;
}

// Agent performance metrics
export interface AgentMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageExecutionTime: number;
  averageMemoryUsage: number;
  averageCpuUsage: number;
  uptime: number;
  errorRate: number;
  successRate: number;
  throughput: number;
  lastActivity: Date;
}

// Agent visual feedback interface
export interface AgentVisualFeedback {
  status: AgentStatus;
  progress: number;
  currentTask?: string;
  message?: string;
  icon?: ReactNode;
  color?: string;
  animation?: string;
  showProgress?: boolean;
  showStatus?: boolean;
  showActivity?: boolean;
  customComponent?: ReactNode;
}

// Agent plugin interface
export interface AgentPlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  capabilities: AgentCapability[];
  config: Record<string, any>;
  isEnabled: boolean;
  isLoaded: boolean;
  loadTime?: Date;
  errorCount: number;
  lastUsed?: Date;
}

// Agent lifecycle hooks
export interface AgentLifecycleHooks {
  onInitialize?: (agent: Agent) => Promise<void>;
  onStart?: (agent: Agent) => Promise<void>;
  onStop?: (agent: Agent) => Promise<void>;
  onPause?: (agent: Agent) => Promise<void>;
  onResume?: (agent: Agent) => Promise<void>;
  onError?: (agent: Agent, error: Error) => Promise<void>;
  onTaskStart?: (agent: Agent, task: AgentTask) => Promise<void>;
  onTaskComplete?: (agent: Agent, task: AgentTask) => Promise<void>;
  onTaskError?: (agent: Agent, task: AgentTask, error: Error) => Promise<void>;
  onMessage?: (agent: Agent, message: AgentMessage) => Promise<void>;
  onStateChange?: (
    agent: Agent,
    oldState: AgentState,
    newState: AgentState,
  ) => Promise<void>;
}

// Agent communication interface
export interface AgentCommunication {
  sendMessage: (message: AgentMessage) => Promise<void>;
  receiveMessage: (callback: (message: AgentMessage) => void) => void;
  broadcastMessage: (message: AgentMessage) => Promise<void>;
  subscribeToEvents: (
    eventType: string,
    callback: (event: AgentEvent) => void,
  ) => void;
  unsubscribeFromEvents: (
    eventType: string,
    callback: (event: AgentEvent) => void,
  ) => void;
}

// Agent execution context
export interface AgentExecutionContext {
  agentId: string;
  taskId: string;
  userId?: string;
  sessionId?: string;
  requestId: string;
  timestamp: Date;
  environment: Record<string, any>;
  permissions: string[];
  metadata?: Record<string, any>;
}

// Agent security context
export interface AgentSecurityContext {
  agentId: string;
  permissions: string[];
  securityLevel: "low" | "medium" | "high";
  allowedOperations: string[];
  restrictedOperations: string[];
  allowedPlugins: string[];
  restrictedPlugins: string[];
  allowedResources: string[];
  restrictedResources: string[];
  auditLog: boolean;
  encryption: boolean;
}

// Agent monitoring interface
export interface AgentMonitoring {
  getMetrics: () => AgentMetrics;
  getState: () => AgentState;
  getTasks: () => AgentTask[];
  getEvents: (limit?: number) => AgentEvent[];
  getLogs: (limit?: number) => string[];
  isHealthy: () => boolean;
  getHealthScore: () => number;
}

// Agent debugging interface
export interface AgentDebugging {
  enableDebugMode: () => void;
  disableDebugMode: () => void;
  isDebugMode: () => boolean;
  setLogLevel: (level: "debug" | "info" | "warn" | "error") => void;
  getLogLevel: () => string;
  addBreakpoint: (condition: (agent: Agent) => boolean) => void;
  removeBreakpoint: (condition: (agent: Agent) => boolean) => void;
  step: () => Promise<void>;
  continue: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
}

// Base Agent interface
export interface Agent {
  // Core properties
  config: AgentConfig;
  state: AgentState;
  metrics: AgentMetrics;

  // Lifecycle methods
  initialize: () => Promise<void>;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  restart: () => Promise<void>;

  // Task management
  executeTask: (task: AgentTask) => Promise<any>;
  cancelTask: (taskId: string) => Promise<void>;
  getTask: (taskId: string) => AgentTask | undefined;
  getTasks: () => AgentTask[];

  // Communication
  sendMessage: (message: AgentMessage) => Promise<void>;
  receiveMessage: (callback: (message: AgentMessage) => void) => void;

  // Monitoring and debugging
  getVisualFeedback: () => AgentVisualFeedback;
  getMonitoring: () => AgentMonitoring;
  getDebugging: () => AgentDebugging;

  // Plugin management
  loadPlugin: (plugin: AgentPlugin) => Promise<void>;
  unloadPlugin: (pluginId: string) => Promise<void>;
  getPlugins: () => AgentPlugin[];

  // Event handling
  emit: (event: AgentEvent) => void;
  on: (eventType: string, callback: (event: AgentEvent) => void) => void;
  off: (eventType: string, callback: (event: AgentEvent) => void) => void;

  // Cleanup
  cleanup: () => Promise<void>;
}

// Agent factory interface
export interface AgentFactory {
  createAgent: (config: AgentConfig) => Agent;
  createAgentFromTemplate: (
    templateId: string,
    overrides?: Partial<AgentConfig>,
  ) => Agent;
  getAvailableTemplates: () => AgentConfig[];
  registerTemplate: (template: AgentConfig) => void;
  unregisterTemplate: (templateId: string) => void;
}

// Agent manager interface
export interface AgentManager {
  // Agent lifecycle
  createAgent: (config: AgentConfig) => Promise<Agent>;
  startAgent: (agentId: string) => Promise<void>;
  stopAgent: (agentId: string) => Promise<void>;
  pauseAgent: (agentId: string) => Promise<void>;
  resumeAgent: (agentId: string) => Promise<void>;
  restartAgent: (agentId: string) => Promise<void>;
  removeAgent: (agentId: string) => Promise<void>;

  // Agent access
  getAgent: (agentId: string) => Agent | undefined;
  getAllAgents: () => Agent[];
  getAgentsByStatus: (status: AgentStatus) => Agent[];
  getAgentsByCapability: (capability: AgentCapability) => Agent[];

  // Agent communication
  sendMessageToAgent: (agentId: string, message: AgentMessage) => Promise<void>;
  broadcastMessage: (message: AgentMessage) => Promise<void>;

  // Agent monitoring
  getSystemMetrics: () => {
    totalAgents: number;
    activeAgents: number;
    idleAgents: number;
    errorAgents: number;
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    averagePerformance: number;
  };

  // Agent management
  getAgentHealth: () => Record<string, boolean>;
  getAgentPerformance: () => Record<string, AgentMetrics>;
  cleanup: () => Promise<void>;
}

// Export all types
export type { ReactNode };
