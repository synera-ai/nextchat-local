import { AgentFactory } from "./agent-factory";
import { AgentDeployment } from "./agent-deployment";
import { AgentMonitoring } from "./agent-monitoring";
import { AgentManager } from "../core/AgentManager";

export interface LifecycleConfig {
  factory?: {
    maxAgents?: number;
    defaultTimeout?: number;
    retryAttempts?: number;
    retryDelay?: number;
    validationEnabled?: boolean;
    autoStart?: boolean;
    persistenceEnabled?: boolean;
    compressionEnabled?: boolean;
    encryptionEnabled?: boolean;
  };
  deployment?: {
    maxDeployments?: number;
    defaultTimeout?: number;
    retryAttempts?: number;
    retryDelay?: number;
    healthCheckInterval?: number;
    healthCheckTimeout?: number;
    rollbackEnabled?: boolean;
    autoScalingEnabled?: boolean;
    loadBalancingEnabled?: boolean;
    monitoringEnabled?: boolean;
    loggingEnabled?: boolean;
  };
  monitoring?: {
    enabled?: boolean;
    interval?: number;
    timeout?: number;
    retries?: number;
    metricsRetention?: number;
    alertingEnabled?: boolean;
    loggingEnabled?: boolean;
    performanceTracking?: boolean;
    healthChecking?: boolean;
    resourceMonitoring?: boolean;
  };
}

export class AgentLifecycleSystem {
  public factory: AgentFactory;
  public deployment: AgentDeployment;
  public monitoring: AgentMonitoring;
  private agentManager: AgentManager;

  constructor(config?: LifecycleConfig) {
    // Initialize agent manager
    this.agentManager = new AgentManager();

    // Initialize components
    this.factory = new AgentFactory(this.agentManager, config?.factory);
    this.deployment = new AgentDeployment(
      this.agentManager,
      config?.deployment,
    );
    this.monitoring = new AgentMonitoring(
      this.agentManager,
      config?.monitoring,
    );

    this.setupEventForwarding();
  }

  private setupEventForwarding(): void {
    // Forward events from components to the main system
    this.factory.on("*", (event, ...args) => {
      this.emit(`factory:${event}`, ...args);
    });

    this.deployment.on("*", (event, ...args) => {
      this.emit(`deployment:${event}`, ...args);
    });

    this.monitoring.on("*", (event, ...args) => {
      this.emit(`monitoring:${event}`, ...args);
    });
  }

  async initialize(): Promise<void> {
    try {
      // Start monitoring
      await this.monitoring.start();

      // Start health checks
      await this.deployment.startHealthChecks();

      console.log("Agent Lifecycle System initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Agent Lifecycle System:", error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    try {
      // Stop monitoring
      await this.monitoring.stop();

      // Stop health checks
      await this.deployment.stopHealthChecks();

      console.log("Agent Lifecycle System shutdown successfully");
    } catch (error) {
      console.error("Failed to shutdown Agent Lifecycle System:", error);
      throw error;
    }
  }

  // Convenience methods
  async createAgent(templateId: string, options?: any): Promise<any> {
    return this.factory.createAgent(templateId, options);
  }

  async deployAgent(
    agent: any,
    targetId: string,
    configuration?: any,
  ): Promise<any> {
    return this.deployment.deployAgent(agent, targetId, configuration);
  }

  async undeployAgent(deploymentId: string): Promise<boolean> {
    return this.deployment.undeployAgent(deploymentId);
  }

  async getAgentMetrics(agentId: string, limit?: number): Promise<any[]> {
    return this.monitoring.getMetrics(agentId, limit);
  }

  async getAgentAlerts(
    agentId?: string,
    activeOnly: boolean = true,
  ): Promise<any[]> {
    return this.monitoring.getAlerts(agentId, activeOnly);
  }

  async generateAgentReport(
    agentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    return this.monitoring.generateReport(agentId, startDate, endDate);
  }

  // Component access
  getAgentFactory(): AgentFactory {
    return this.factory;
  }

  getAgentDeployment(): AgentDeployment {
    return this.deployment;
  }

  getAgentMonitoring(): AgentMonitoring {
    return this.monitoring;
  }

  getAgentManager(): AgentManager {
    return this.agentManager;
  }

  // Configuration
  updateConfig(newConfig: LifecycleConfig): void {
    this.factory.updateConfig(newConfig.factory || {});
    this.deployment.updateConfig(newConfig.deployment || {});
    this.monitoring.updateConfig(newConfig.monitoring || {});
  }

  isRunning(): boolean {
    return this.monitoring.isRunning() && this.deployment.isRunning();
  }
}

// Export individual components
export { AgentFactory, AgentDeployment, AgentMonitoring };

// Export types
export type {
  AgentFactoryConfig,
  AgentTemplate,
  AgentCapabilities,
  AgentConfiguration,
  AgentDependency,
  AgentRequirement,
  AgentTemplateMetadata,
  AgentType,
  AgentCreationOptions,
  AgentCreationResult,
  AgentCreationMetadata,
} from "./agent-factory";

export type {
  DeploymentConfig,
  DeploymentTarget,
  DeploymentCredentials,
  DeploymentCapabilities,
  ResourceLimits,
  DeploymentTargetMetadata,
  DeploymentTargetType,
  Deployment,
  DeploymentConfiguration,
  HealthCheckConfig,
  ScalingConfig,
  NetworkingConfig,
  RateLimitingConfig,
  DeploymentMetadata,
  DeploymentStatus,
  DeploymentResult,
  DeploymentResultMetadata,
} from "./agent-deployment";

export type {
  MonitoringConfig,
  AgentMetrics,
  PerformanceMetrics,
  HealthMetrics,
  HealthIssue,
  HealthCheck,
  ResourceMetrics,
  ErrorMetrics,
  MonitoringAlert,
  AlertMetadata,
  AlertType,
  MonitoringReport,
  MonitoringSummary,
} from "./agent-monitoring";

// Create and export a default instance
export const agentLifecycleSystem = new AgentLifecycleSystem();
