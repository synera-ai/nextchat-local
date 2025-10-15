import { EventEmitter } from "events";
import { BaseAgent } from "../core/BaseAgent";
import { AgentManager } from "../core/AgentManager";

export interface MonitoringConfig {
  enabled: boolean;
  interval: number;
  timeout: number;
  retries: number;
  metricsRetention: number;
  alertingEnabled: boolean;
  loggingEnabled: boolean;
  performanceTracking: boolean;
  healthChecking: boolean;
  resourceMonitoring: boolean;
}

export interface AgentMetrics {
  agentId: string;
  timestamp: Date;
  performance: PerformanceMetrics;
  health: HealthMetrics;
  resources: ResourceMetrics;
  errors: ErrorMetrics;
  custom: Record<string, any>;
}

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  successRate: number;
  errorRate: number;
  averageLatency: number;
  peakLatency: number;
  requestsPerSecond: number;
  totalRequests: number;
  totalErrors: number;
}

export interface HealthMetrics {
  status: "healthy" | "unhealthy" | "degraded";
  uptime: number;
  lastActivity: Date;
  healthScore: number;
  issues: HealthIssue[];
  checks: HealthCheck[];
}

export interface HealthIssue {
  type: "error" | "warning" | "info";
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface HealthCheck {
  name: string;
  status: "pass" | "fail" | "warning";
  message: string;
  duration: number;
  timestamp: Date;
  details?: any;
}

export interface ResourceMetrics {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  disk: number;
  gpu?: number;
  custom: Record<string, number>;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorRate: number;
  errorTypes: Record<string, number>;
  lastError?: Date;
  errorTrend: "increasing" | "decreasing" | "stable";
  criticalErrors: number;
  warnings: number;
}

export interface MonitoringAlert {
  id: string;
  agentId: string;
  type: AlertType;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  metadata: AlertMetadata;
}

export interface AlertMetadata {
  threshold: number;
  currentValue: number;
  duration: number;
  tags: string[];
  source: string;
  correlationId?: string;
}

export enum AlertType {
  PERFORMANCE = "performance",
  HEALTH = "health",
  RESOURCE = "resource",
  ERROR = "error",
  CUSTOM = "custom",
}

export interface MonitoringReport {
  agentId: string;
  period: {
    start: Date;
    end: Date;
  };
  summary: MonitoringSummary;
  metrics: AgentMetrics[];
  alerts: MonitoringAlert[];
  recommendations: string[];
}

export interface MonitoringSummary {
  overallHealth: "excellent" | "good" | "fair" | "poor" | "critical";
  healthScore: number;
  performanceScore: number;
  resourceScore: number;
  errorScore: number;
  uptime: number;
  totalRequests: number;
  totalErrors: number;
  averageResponseTime: number;
  peakResponseTime: number;
}

export class AgentMonitoring extends EventEmitter {
  private config: MonitoringConfig;
  private agentManager: AgentManager;
  private metrics: Map<string, AgentMetrics[]> = new Map();
  private alerts: Map<string, MonitoringAlert[]> = new Map();
  private monitoringTimer?: NodeJS.Timeout;
  private isRunning = false;

  constructor(agentManager: AgentManager, config?: Partial<MonitoringConfig>) {
    super();
    this.agentManager = agentManager;
    this.config = {
      enabled: true,
      interval: 30000, // 30 seconds
      timeout: 10000, // 10 seconds
      retries: 3,
      metricsRetention: 7 * 24 * 60 * 60 * 1000, // 7 days
      alertingEnabled: true,
      loggingEnabled: true,
      performanceTracking: true,
      healthChecking: true,
      resourceMonitoring: true,
      ...config,
    };
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error("Monitoring is already running");
    }

    try {
      if (this.config.enabled) {
        this.monitoringTimer = setInterval(() => {
          this.collectMetrics();
        }, this.config.interval);
      }

      this.isRunning = true;
      this.emit("monitoringStarted");
    } catch (error) {
      this.emit("monitoringError", { error });
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      if (this.monitoringTimer) {
        clearInterval(this.monitoringTimer);
        this.monitoringTimer = undefined;
      }

      this.isRunning = false;
      this.emit("monitoringStopped");
    } catch (error) {
      this.emit("monitoringError", { error });
      throw error;
    }
  }

  async collectMetrics(): Promise<void> {
    try {
      const agents = await this.agentManager.getAllAgents();

      for (const agent of agents) {
        try {
          const metrics = await this.collectAgentMetrics(agent);
          this.storeMetrics(agent.id, metrics);

          // Check for alerts
          if (this.config.alertingEnabled) {
            await this.checkAlerts(agent.id, metrics);
          }
        } catch (error) {
          this.emit("metricsCollectionError", { agentId: agent.id, error });
        }
      }

      // Clean up old metrics
      this.cleanupOldMetrics();

      this.emit("metricsCollected", { agentCount: agents.length });
    } catch (error) {
      this.emit("monitoringError", { error });
    }
  }

  private async collectAgentMetrics(agent: BaseAgent): Promise<AgentMetrics> {
    const timestamp = new Date();

    // Collect performance metrics
    const performance = await this.collectPerformanceMetrics(agent);

    // Collect health metrics
    const health = await this.collectHealthMetrics(agent);

    // Collect resource metrics
    const resources = await this.collectResourceMetrics(agent);

    // Collect error metrics
    const errors = await this.collectErrorMetrics(agent);

    // Collect custom metrics
    const custom = await this.collectCustomMetrics(agent);

    return {
      agentId: agent.id,
      timestamp,
      performance,
      health,
      resources,
      errors,
      custom,
    };
  }

  private async collectPerformanceMetrics(
    agent: BaseAgent,
  ): Promise<PerformanceMetrics> {
    // In a real implementation, you would collect actual performance data
    // For now, we'll simulate the collection

    const responseTime = Math.random() * 1000 + 100; // 100-1100ms
    const throughput = Math.random() * 100 + 10; // 10-110 requests/second
    const successRate = Math.random() * 0.2 + 0.8; // 80-100%
    const errorRate = 1 - successRate;

    return {
      responseTime,
      throughput,
      successRate,
      errorRate,
      averageLatency: responseTime,
      peakLatency: responseTime * 2,
      requestsPerSecond: throughput,
      totalRequests: Math.floor(Math.random() * 10000),
      totalErrors: Math.floor(Math.random() * 100),
    };
  }

  private async collectHealthMetrics(agent: BaseAgent): Promise<HealthMetrics> {
    const status = Math.random() > 0.1 ? "healthy" : "unhealthy";
    const healthScore =
      status === "healthy" ? Math.random() * 0.3 + 0.7 : Math.random() * 0.3;

    const issues: HealthIssue[] = [];
    if (status === "unhealthy") {
      issues.push({
        type: "error",
        message: "Agent is not responding",
        severity: "high",
        timestamp: new Date(),
        resolved: false,
      });
    }

    const checks: HealthCheck[] = [
      {
        name: "connectivity",
        status: status === "healthy" ? "pass" : "fail",
        message:
          status === "healthy"
            ? "Agent is reachable"
            : "Agent is not reachable",
        duration: Math.random() * 100,
        timestamp: new Date(),
      },
      {
        name: "performance",
        status: "pass",
        message: "Performance is within acceptable range",
        duration: Math.random() * 50,
        timestamp: new Date(),
      },
    ];

    return {
      status: status as "healthy" | "unhealthy" | "degraded",
      uptime: Date.now() - agent.metadata.createdAt.getTime(),
      lastActivity: new Date(),
      healthScore,
      issues,
      checks,
    };
  }

  private async collectResourceMetrics(
    agent: BaseAgent,
  ): Promise<ResourceMetrics> {
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      storage: Math.random() * 100,
      network: Math.random() * 100,
      disk: Math.random() * 100,
      gpu: Math.random() * 100,
      custom: {},
    };
  }

  private async collectErrorMetrics(agent: BaseAgent): Promise<ErrorMetrics> {
    const totalErrors = Math.floor(Math.random() * 100);
    const errorRate = totalErrors / 1000; // Assuming 1000 total requests

    return {
      totalErrors,
      errorRate,
      errorTypes: {
        timeout: Math.floor(Math.random() * 10),
        validation: Math.floor(Math.random() * 5),
        network: Math.floor(Math.random() * 3),
      },
      lastError: totalErrors > 0 ? new Date() : undefined,
      errorTrend: "stable",
      criticalErrors: Math.floor(Math.random() * 5),
      warnings: Math.floor(Math.random() * 20),
    };
  }

  private async collectCustomMetrics(
    agent: BaseAgent,
  ): Promise<Record<string, any>> {
    // Collect custom metrics based on agent type and configuration
    return {
      customMetric1: Math.random() * 100,
      customMetric2: Math.random() * 1000,
      customMetric3: Math.random() > 0.5,
    };
  }

  private storeMetrics(agentId: string, metrics: AgentMetrics): void {
    const agentMetrics = this.metrics.get(agentId) || [];
    agentMetrics.push(metrics);

    // Keep only recent metrics
    const cutoff = Date.now() - this.config.metricsRetention;
    const recentMetrics = agentMetrics.filter(
      (m) => m.timestamp.getTime() > cutoff,
    );

    this.metrics.set(agentId, recentMetrics);
  }

  private async checkAlerts(
    agentId: string,
    metrics: AgentMetrics,
  ): Promise<void> {
    const alerts: MonitoringAlert[] = [];

    // Check performance alerts
    if (metrics.performance.responseTime > 5000) {
      alerts.push({
        id: this.generateAlertId(),
        agentId,
        type: AlertType.PERFORMANCE,
        severity: "high",
        message: `High response time: ${metrics.performance.responseTime.toFixed(
          0,
        )}ms`,
        timestamp: new Date(),
        resolved: false,
        metadata: {
          threshold: 5000,
          currentValue: metrics.performance.responseTime,
          duration: 0,
          tags: ["performance", "response_time"],
          source: "monitoring",
        },
      });
    }

    // Check health alerts
    if (metrics.health.status === "unhealthy") {
      alerts.push({
        id: this.generateAlertId(),
        agentId,
        type: AlertType.HEALTH,
        severity: "critical",
        message: "Agent is unhealthy",
        timestamp: new Date(),
        resolved: false,
        metadata: {
          threshold: 0.5,
          currentValue: metrics.health.healthScore,
          duration: 0,
          tags: ["health", "status"],
          source: "monitoring",
        },
      });
    }

    // Check resource alerts
    if (metrics.resources.memory > 90) {
      alerts.push({
        id: this.generateAlertId(),
        agentId,
        type: AlertType.RESOURCE,
        severity: "medium",
        message: `High memory usage: ${metrics.resources.memory.toFixed(1)}%`,
        timestamp: new Date(),
        resolved: false,
        metadata: {
          threshold: 90,
          currentValue: metrics.resources.memory,
          duration: 0,
          tags: ["resource", "memory"],
          source: "monitoring",
        },
      });
    }

    // Check error alerts
    if (metrics.errors.errorRate > 0.1) {
      alerts.push({
        id: this.generateAlertId(),
        agentId,
        type: AlertType.ERROR,
        severity: "high",
        message: `High error rate: ${(metrics.errors.errorRate * 100).toFixed(
          1,
        )}%`,
        timestamp: new Date(),
        resolved: false,
        metadata: {
          threshold: 0.1,
          currentValue: metrics.errors.errorRate,
          duration: 0,
          tags: ["error", "rate"],
          source: "monitoring",
        },
      });
    }

    // Store alerts
    for (const alert of alerts) {
      this.storeAlert(alert);
      this.emit("alertTriggered", { alert });
    }
  }

  private storeAlert(alert: MonitoringAlert): void {
    const agentAlerts = this.alerts.get(alert.agentId) || [];
    agentAlerts.push(alert);
    this.alerts.set(alert.agentId, agentAlerts);
  }

  private cleanupOldMetrics(): void {
    const cutoff = Date.now() - this.config.metricsRetention;

    for (const [agentId, metrics] of this.metrics) {
      const recentMetrics = metrics.filter(
        (m) => m.timestamp.getTime() > cutoff,
      );
      this.metrics.set(agentId, recentMetrics);
    }
  }

  async getMetrics(agentId: string, limit?: number): Promise<AgentMetrics[]> {
    const metrics = this.metrics.get(agentId) || [];
    return limit ? metrics.slice(-limit) : metrics;
  }

  async getAllMetrics(): Promise<Map<string, AgentMetrics[]>> {
    return new Map(this.metrics);
  }

  async getAlerts(
    agentId?: string,
    activeOnly: boolean = true,
  ): Promise<MonitoringAlert[]> {
    if (agentId) {
      const alerts = this.alerts.get(agentId) || [];
      return activeOnly ? alerts.filter((a) => !a.resolved) : alerts;
    }

    const allAlerts: MonitoringAlert[] = [];
    for (const alerts of this.alerts.values()) {
      allAlerts.push(...alerts);
    }

    return activeOnly ? allAlerts.filter((a) => !a.resolved) : allAlerts;
  }

  async resolveAlert(alertId: string): Promise<boolean> {
    for (const [agentId, alerts] of this.alerts) {
      const alert = alerts.find((a) => a.id === alertId);
      if (alert && !alert.resolved) {
        alert.resolved = true;
        alert.resolvedAt = new Date();
        this.emit("alertResolved", { alert });
        return true;
      }
    }
    return false;
  }

  async generateReport(
    agentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MonitoringReport> {
    const metrics = this.metrics.get(agentId) || [];
    const alerts = this.alerts.get(agentId) || [];

    // Filter metrics by date range
    const filteredMetrics = metrics.filter(
      (m) => m.timestamp >= startDate && m.timestamp <= endDate,
    );

    // Filter alerts by date range
    const filteredAlerts = alerts.filter(
      (a) => a.timestamp >= startDate && a.timestamp <= endDate,
    );

    // Generate summary
    const summary = this.generateSummary(filteredMetrics);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      filteredMetrics,
      filteredAlerts,
    );

    return {
      agentId,
      period: { start: startDate, end: endDate },
      summary,
      metrics: filteredMetrics,
      alerts: filteredAlerts,
      recommendations,
    };
  }

  private generateSummary(metrics: AgentMetrics[]): MonitoringSummary {
    if (metrics.length === 0) {
      return {
        overallHealth: "excellent",
        healthScore: 100,
        performanceScore: 100,
        resourceScore: 100,
        errorScore: 100,
        uptime: 0,
        totalRequests: 0,
        totalErrors: 0,
        averageResponseTime: 0,
        peakResponseTime: 0,
      };
    }

    const totalRequests = metrics.reduce(
      (sum, m) => sum + m.performance.totalRequests,
      0,
    );
    const totalErrors = metrics.reduce(
      (sum, m) => sum + m.performance.totalErrors,
      0,
    );
    const averageResponseTime =
      metrics.reduce((sum, m) => sum + m.performance.responseTime, 0) /
      metrics.length;
    const peakResponseTime = Math.max(
      ...metrics.map((m) => m.performance.peakLatency),
    );

    const healthScore =
      metrics.reduce((sum, m) => sum + m.health.healthScore, 0) /
      metrics.length;
    const performanceScore =
      metrics.reduce((sum, m) => sum + m.performance.successRate, 0) /
      metrics.length;
    const resourceScore =
      100 -
      metrics.reduce((sum, m) => sum + m.resources.memory, 0) / metrics.length;
    const errorScore =
      100 -
      (metrics.reduce((sum, m) => sum + m.errors.errorRate, 0) /
        metrics.length) *
        100;

    const overallScore =
      (healthScore + performanceScore + resourceScore + errorScore) / 4;
    let overallHealth: "excellent" | "good" | "fair" | "poor" | "critical";

    if (overallScore >= 90) overallHealth = "excellent";
    else if (overallScore >= 80) overallHealth = "good";
    else if (overallScore >= 70) overallHealth = "fair";
    else if (overallScore >= 60) overallHealth = "poor";
    else overallHealth = "critical";

    return {
      overallHealth,
      healthScore,
      performanceScore,
      resourceScore,
      errorScore,
      uptime: metrics.length > 0 ? metrics[0].health.uptime : 0,
      totalRequests,
      totalErrors,
      averageResponseTime,
      peakResponseTime,
    };
  }

  private generateRecommendations(
    metrics: AgentMetrics[],
    alerts: MonitoringAlert[],
  ): string[] {
    const recommendations: string[] = [];

    // Performance recommendations
    const avgResponseTime =
      metrics.reduce((sum, m) => sum + m.performance.responseTime, 0) /
      metrics.length;
    if (avgResponseTime > 2000) {
      recommendations.push(
        "Consider optimizing agent performance to reduce response time",
      );
    }

    // Health recommendations
    const unhealthyCount = metrics.filter(
      (m) => m.health.status === "unhealthy",
    ).length;
    if (unhealthyCount > metrics.length * 0.1) {
      recommendations.push(
        "Investigate recurring health issues and improve agent reliability",
      );
    }

    // Resource recommendations
    const avgMemory =
      metrics.reduce((sum, m) => sum + m.resources.memory, 0) / metrics.length;
    if (avgMemory > 80) {
      recommendations.push(
        "Consider increasing memory allocation or optimizing memory usage",
      );
    }

    // Error recommendations
    const avgErrorRate =
      metrics.reduce((sum, m) => sum + m.errors.errorRate, 0) / metrics.length;
    if (avgErrorRate > 0.05) {
      recommendations.push(
        "Review error patterns and implement better error handling",
      );
    }

    return recommendations;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Configuration
  updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit("configUpdated", { config: this.config });
  }

  getConfig(): MonitoringConfig {
    return { ...this.config };
  }

  isRunning(): boolean {
    return this.isRunning;
  }
}
