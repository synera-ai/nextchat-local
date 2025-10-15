// AI Agent Framework Index

// Export types
export * from "./types";

// Export core components
export { BaseAgent } from "./core/BaseAgent";
export { AgentManager } from "./core/AgentManager";

// Export visual components
export { default as AgentVisualFeedback } from "./visual/AgentVisualFeedback";

// Export agent framework
import { AgentManager } from "./core/AgentManager";
import { EventEmitter } from "events";

export class AIAgentFramework extends EventEmitter {
  private agentManager: AgentManager;
  private isInitialized = false;

  constructor() {
    super();
    this.agentManager = new AgentManager();
    this.setupEventHandlers();
  }

  // Initialize the framework
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.log("info", "Initializing AI Agent Framework...");

    try {
      // Set up event forwarding from agent manager
      this.agentManager.on("agent.created", (data) =>
        this.emit("agent.created", data),
      );
      this.agentManager.on("agent.started", (data) =>
        this.emit("agent.started", data),
      );
      this.agentManager.on("agent.stopped", (data) =>
        this.emit("agent.stopped", data),
      );
      this.agentManager.on("agent.paused", (data) =>
        this.emit("agent.paused", data),
      );
      this.agentManager.on("agent.resumed", (data) =>
        this.emit("agent.resumed", data),
      );
      this.agentManager.on("agent.error", (data) =>
        this.emit("agent.error", data),
      );
      this.agentManager.on("task.completed", (data) =>
        this.emit("task.completed", data),
      );
      this.agentManager.on("task.failed", (data) =>
        this.emit("task.failed", data),
      );

      this.isInitialized = true;
      this.emit("framework.initialized");
      this.log("info", "AI Agent Framework initialized successfully");
    } catch (error) {
      this.log("error", "Failed to initialize AI Agent Framework:", error);
      throw error;
    }
  }

  // Get agent manager
  getAgentManager(): AgentManager {
    return this.agentManager;
  }

  // Get framework status
  getFrameworkStatus(): {
    initialized: boolean;
    totalAgents: number;
    activeAgents: number;
    systemHealth: "healthy" | "degraded" | "unhealthy";
  } {
    const metrics = this.agentManager.getSystemMetrics();
    const health = this.agentManager.getAgentHealth();

    const healthyAgents = Object.values(health).filter(Boolean).length;
    const totalAgents = Object.keys(health).length;

    let systemHealth: "healthy" | "degraded" | "unhealthy";
    if (totalAgents === 0) {
      systemHealth = "healthy";
    } else if (healthyAgents === totalAgents) {
      systemHealth = "healthy";
    } else if (healthyAgents >= totalAgents * 0.7) {
      systemHealth = "degraded";
    } else {
      systemHealth = "unhealthy";
    }

    return {
      initialized: this.isInitialized,
      totalAgents: metrics.totalAgents,
      activeAgents: metrics.activeAgents,
      systemHealth,
    };
  }

  // Get framework metrics
  getFrameworkMetrics(): {
    system: ReturnType<AgentManager["getSystemMetrics"]>;
    health: ReturnType<AgentManager["getAgentHealth"]>;
    performance: ReturnType<AgentManager["getAgentPerformance"]>;
  } {
    return {
      system: this.agentManager.getSystemMetrics(),
      health: this.agentManager.getAgentHealth(),
      performance: this.agentManager.getAgentPerformance(),
    };
  }

  // Cleanup framework
  async cleanup(): Promise<void> {
    this.log("info", "Cleaning up AI Agent Framework...");

    try {
      await this.agentManager.cleanup();
      this.isInitialized = false;
      this.removeAllListeners();

      this.emit("framework.cleaned");
      this.log("info", "AI Agent Framework cleaned up successfully");
    } catch (error) {
      this.log("error", "Error cleaning up AI Agent Framework:", error);
      throw error;
    }
  }

  // Set up event handlers
  private setupEventHandlers(): void {
    // Framework-level event handling
    this.on("agent.error", (data) => {
      this.log("error", `Agent error: ${data.agentId}`, data);
    });

    this.on("task.failed", (data) => {
      this.log(
        "warn",
        `Task failed: ${data.taskId} for agent ${data.agentId}`,
        data,
      );
    });
  }

  // Logging
  private log(
    level: "debug" | "info" | "warn" | "error",
    message: string,
    ...args: any[]
  ): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] [AIAgentFramework] ${message}`;

    if (args.length > 0) {
      console.log(logMessage, ...args);
    } else {
      console.log(logMessage);
    }
  }
}

// Export singleton instance
export const aiAgentFramework = new AIAgentFramework();

// Export version
export const AI_AGENT_FRAMEWORK_VERSION = "1.0.0";

// Export metadata
export const aiAgentFrameworkMetadata = {
  name: "AI Agent Framework",
  version: AI_AGENT_FRAMEWORK_VERSION,
  description:
    "Comprehensive AI agent framework with visual feedback, model integration, and real-time communication",
  features: [
    "Agent lifecycle management",
    "Visual feedback system",
    "Model integration framework",
    "Plugin stubbing system",
    "Real-time communication",
    "Agent monitoring and debugging",
    "Performance metrics",
    "Event-driven architecture",
    "TypeScript support",
  ],
};

// Default export
export default aiAgentFramework;
