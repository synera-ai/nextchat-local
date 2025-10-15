// Agent Manager Implementation

import { EventEmitter } from "events";
import {
  Agent,
  AgentConfig,
  AgentMessage,
  AgentManager as IAgentManager,
  AgentStatus,
  AgentCapability,
  AgentTask,
  AgentMetrics,
} from "../types";
import { BaseAgent } from "./BaseAgent";

export class AgentManager extends EventEmitter implements IAgentManager {
  private agents: Map<string, Agent> = new Map();
  private agentTemplates: Map<string, AgentConfig> = new Map();
  private messageQueue: AgentMessage[] = [];
  private isInitialized = false;

  constructor() {
    super();
    this.initializeDefaultTemplates();
  }

  // Initialize default agent templates
  private initializeDefaultTemplates(): void {
    const defaultTemplates: AgentConfig[] = [
      {
        id: "text-generator",
        name: "Text Generator Agent",
        description: "Generates text content using AI models",
        version: "1.0.0",
        author: "NextChat Team",
        capabilities: ["text-generation", "user-interaction"],
        priority: "normal",
        securityLevel: "medium",
        autoStart: true,
        restartOnError: true,
        maxRetries: 3,
      },
      {
        id: "code-executor",
        name: "Code Executor Agent",
        description: "Executes code in various programming languages",
        version: "1.0.0",
        author: "NextChat Team",
        capabilities: ["code-execution", "file-operations"],
        priority: "high",
        securityLevel: "high",
        autoStart: false,
        restartOnError: true,
        maxRetries: 2,
      },
      {
        id: "file-manager",
        name: "File Manager Agent",
        description: "Manages file operations and storage",
        version: "1.0.0",
        author: "NextChat Team",
        capabilities: ["file-operations", "system-monitoring"],
        priority: "normal",
        securityLevel: "medium",
        autoStart: true,
        restartOnError: true,
        maxRetries: 3,
      },
      {
        id: "web-searcher",
        name: "Web Search Agent",
        description: "Performs web searches and retrieves information",
        version: "1.0.0",
        author: "NextChat Team",
        capabilities: ["web-search", "data-analysis"],
        priority: "normal",
        securityLevel: "low",
        autoStart: false,
        restartOnError: true,
        maxRetries: 3,
      },
    ];

    defaultTemplates.forEach((template) => {
      this.agentTemplates.set(template.id, template);
    });
  }

  // Agent lifecycle management
  async createAgent(config: AgentConfig): Promise<Agent> {
    if (this.agents.has(config.id)) {
      throw new Error(`Agent with ID ${config.id} already exists`);
    }

    this.log("info", `Creating agent ${config.id}`);

    try {
      // Create agent instance (this would be a concrete implementation)
      const agent = this.createAgentInstance(config);

      // Initialize the agent
      await agent.initialize();

      // Add to manager
      this.agents.set(config.id, agent);

      // Set up event forwarding
      this.setupAgentEventForwarding(agent);

      // Auto-start if configured
      if (config.autoStart) {
        await this.startAgent(config.id);
      }

      this.emit("agent.created", { agentId: config.id, agent });
      this.log("info", `Agent ${config.id} created successfully`);

      return agent;
    } catch (error) {
      this.log("error", `Failed to create agent ${config.id}:`, error);
      throw error;
    }
  }

  async startAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    this.log("info", `Starting agent ${agentId}`);

    try {
      await agent.start();
      this.emit("agent.started", { agentId });
      this.log("info", `Agent ${agentId} started successfully`);
    } catch (error) {
      this.log("error", `Failed to start agent ${agentId}:`, error);
      throw error;
    }
  }

  async stopAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    this.log("info", `Stopping agent ${agentId}`);

    try {
      await agent.stop();
      this.emit("agent.stopped", { agentId });
      this.log("info", `Agent ${agentId} stopped successfully`);
    } catch (error) {
      this.log("error", `Failed to stop agent ${agentId}:`, error);
      throw error;
    }
  }

  async pauseAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    this.log("info", `Pausing agent ${agentId}`);

    try {
      await agent.pause();
      this.emit("agent.paused", { agentId });
      this.log("info", `Agent ${agentId} paused successfully`);
    } catch (error) {
      this.log("error", `Failed to pause agent ${agentId}:`, error);
      throw error;
    }
  }

  async resumeAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    this.log("info", `Resuming agent ${agentId}`);

    try {
      await agent.resume();
      this.emit("agent.resumed", { agentId });
      this.log("info", `Agent ${agentId} resumed successfully`);
    } catch (error) {
      this.log("error", `Failed to resume agent ${agentId}:`, error);
      throw error;
    }
  }

  async restartAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    this.log("info", `Restarting agent ${agentId}`);

    try {
      await agent.restart();
      this.emit("agent.restarted", { agentId });
      this.log("info", `Agent ${agentId} restarted successfully`);
    } catch (error) {
      this.log("error", `Failed to restart agent ${agentId}:`, error);
      throw error;
    }
  }

  async removeAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    this.log("info", `Removing agent ${agentId}`);

    try {
      await agent.cleanup();
      this.agents.delete(agentId);
      this.emit("agent.removed", { agentId });
      this.log("info", `Agent ${agentId} removed successfully`);
    } catch (error) {
      this.log("error", `Failed to remove agent ${agentId}:`, error);
      throw error;
    }
  }

  // Agent access
  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  getAgentsByStatus(status: AgentStatus): Agent[] {
    return this.getAllAgents().filter((agent) => agent.state.status === status);
  }

  getAgentsByCapability(capability: AgentCapability): Agent[] {
    return this.getAllAgents().filter((agent) =>
      agent.config.capabilities.includes(capability),
    );
  }

  // Agent communication
  async sendMessageToAgent(
    agentId: string,
    message: AgentMessage,
  ): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    this.log("debug", `Sending message ${message.id} to agent ${agentId}`);

    try {
      await agent.sendMessage(message);
      this.emit("message.sent", { agentId, messageId: message.id });
    } catch (error) {
      this.log("error", `Failed to send message to agent ${agentId}:`, error);
      throw error;
    }
  }

  async broadcastMessage(message: AgentMessage): Promise<void> {
    this.log("info", `Broadcasting message ${message.id} to all agents`);

    const promises = this.getAllAgents().map((agent) =>
      agent
        .sendMessage(message)
        .catch((error) =>
          this.log(
            "error",
            `Failed to send broadcast message to agent ${agent.config.id}:`,
            error,
          ),
        ),
    );

    await Promise.all(promises);
    this.emit("message.broadcast", { messageId: message.id });
  }

  // Agent monitoring
  getSystemMetrics(): {
    totalAgents: number;
    activeAgents: number;
    idleAgents: number;
    errorAgents: number;
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    averagePerformance: number;
  } {
    const agents = this.getAllAgents();
    const totalAgents = agents.length;
    const activeAgents = agents.filter((agent) => agent.state.isActive).length;
    const idleAgents = agents.filter(
      (agent) => agent.state.status === "idle",
    ).length;
    const errorAgents = agents.filter(
      (agent) => agent.state.status === "error",
    ).length;

    const totalTasks = agents.reduce(
      (sum, agent) => sum + agent.metrics.totalTasks,
      0,
    );
    const completedTasks = agents.reduce(
      (sum, agent) => sum + agent.metrics.completedTasks,
      0,
    );
    const failedTasks = agents.reduce(
      (sum, agent) => sum + agent.metrics.failedTasks,
      0,
    );

    const averagePerformance =
      agents.length > 0
        ? agents.reduce((sum, agent) => sum + agent.metrics.successRate, 0) /
          agents.length
        : 0;

    return {
      totalAgents,
      activeAgents,
      idleAgents,
      errorAgents,
      totalTasks,
      completedTasks,
      failedTasks,
      averagePerformance,
    };
  }

  getAgentHealth(): Record<string, boolean> {
    const health: Record<string, boolean> = {};

    for (const [agentId, agent] of this.agents) {
      health[agentId] = agent.getMonitoring().isHealthy();
    }

    return health;
  }

  getAgentPerformance(): Record<string, AgentMetrics> {
    const performance: Record<string, AgentMetrics> = {};

    for (const [agentId, agent] of this.agents) {
      performance[agentId] = agent.getMonitoring().getMetrics();
    }

    return performance;
  }

  // Agent management
  async createAgentFromTemplate(
    templateId: string,
    overrides?: Partial<AgentConfig>,
  ): Promise<Agent> {
    const template = this.agentTemplates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const config: AgentConfig = {
      ...template,
      ...overrides,
      id: overrides?.id || `${templateId}-${Date.now()}`,
    };

    return this.createAgent(config);
  }

  getAvailableTemplates(): AgentConfig[] {
    return Array.from(this.agentTemplates.values());
  }

  registerTemplate(template: AgentConfig): void {
    this.agentTemplates.set(template.id, template);
    this.emit("template.registered", { templateId: template.id });
    this.log("info", `Template ${template.id} registered`);
  }

  unregisterTemplate(templateId: string): void {
    if (this.agentTemplates.delete(templateId)) {
      this.emit("template.unregistered", { templateId });
      this.log("info", `Template ${templateId} unregistered`);
    }
  }

  // Cleanup
  async cleanup(): Promise<void> {
    this.log("info", "Cleaning up agent manager");

    const cleanupPromises = Array.from(this.agents.values()).map((agent) =>
      agent
        .cleanup()
        .catch((error) =>
          this.log(
            "error",
            `Error cleaning up agent ${agent.config.id}:`,
            error,
          ),
        ),
    );

    await Promise.all(cleanupPromises);
    this.agents.clear();
    this.agentTemplates.clear();
    this.messageQueue.length = 0;
    this.removeAllListeners();

    this.log("info", "Agent manager cleaned up successfully");
  }

  // Helper methods
  private createAgentInstance(config: AgentConfig): Agent {
    // This would create a concrete agent instance based on the config
    // For now, we'll create a mock implementation
    return new MockAgent(config);
  }

  private setupAgentEventForwarding(agent: Agent): void {
    // Forward agent events to the manager
    agent.on("agent.started", (data) => this.emit("agent.started", data));
    agent.on("agent.stopped", (data) => this.emit("agent.stopped", data));
    agent.on("agent.paused", (data) => this.emit("agent.paused", data));
    agent.on("agent.resumed", (data) => this.emit("agent.resumed", data));
    agent.on("agent.error", (data) => this.emit("agent.error", data));
    agent.on("task.completed", (data) => this.emit("task.completed", data));
    agent.on("task.failed", (data) => this.emit("task.failed", data));
  }

  private log(
    level: "debug" | "info" | "warn" | "error",
    message: string,
    ...args: any[]
  ): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] [AgentManager] ${message}`;

    if (args.length > 0) {
      console.log(logMessage, ...args);
    } else {
      console.log(logMessage);
    }
  }
}

// Mock Agent implementation for demonstration
class MockAgent extends BaseAgent {
  protected async onInitialize(): Promise<void> {
    // Mock initialization
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  protected async onStart(): Promise<void> {
    // Mock start
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  protected async onStop(): Promise<void> {
    // Mock stop
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  protected async onPause(): Promise<void> {
    // Mock pause
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  protected async onResume(): Promise<void> {
    // Mock resume
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  protected async onExecuteTask(task: AgentTask): Promise<any> {
    // Mock task execution
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { result: `Task ${task.id} completed`, timestamp: new Date() };
  }
}
