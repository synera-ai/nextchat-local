import { EventEmitter } from "events";
import { ModelRegistry, ModelResult, ModelExecution } from "./registry";
import { ModelExecutor } from "./executor";
import { ModelCache, CacheStats } from "./cache";

export interface MonitoringConfig {
  metricsInterval: number;
  alertThresholds: AlertThresholds;
  retentionPeriod: number;
  enableRealTimeMonitoring: boolean;
  enablePerformanceTracking: boolean;
  enableErrorTracking: boolean;
}

export interface AlertThresholds {
  errorRate: number;
  responseTime: number;
  queueLength: number;
  cacheHitRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface ModelMetrics {
  modelId: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageResponseTime: number;
  averageCost: number;
  totalCost: number;
  cacheHitRate: number;
  errorRate: number;
  lastExecution?: Date;
  peakResponseTime: number;
  minResponseTime: number;
  throughput: number;
  availability: number;
}

export interface SystemMetrics {
  totalModels: number;
  activeModels: number;
  totalExecutions: number;
  totalErrors: number;
  averageResponseTime: number;
  totalCost: number;
  cacheStats: CacheStats;
  queueStatus: {
    queueLength: number;
    activeExecutions: number;
    maxConcurrent: number;
  };
  systemHealth: SystemHealth;
}

export interface SystemHealth {
  status: "healthy" | "warning" | "critical";
  issues: HealthIssue[];
  lastChecked: Date;
  uptime: number;
}

export interface HealthIssue {
  type: "error" | "warning" | "info";
  message: string;
  timestamp: Date;
  modelId?: string;
  severity: "low" | "medium" | "high" | "critical";
}

export interface Alert {
  id: string;
  type: "error" | "warning" | "info";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  timestamp: Date;
  modelId?: string;
  resolved: boolean;
  resolvedAt?: Date;
  metadata: any;
}

export interface PerformanceReport {
  period: {
    start: Date;
    end: Date;
  };
  modelMetrics: ModelMetrics[];
  systemMetrics: SystemMetrics;
  alerts: Alert[];
  recommendations: string[];
}

export class ModelMonitor extends EventEmitter {
  private registry: ModelRegistry;
  private executor: ModelExecutor;
  private cache: ModelCache;
  private config: MonitoringConfig;
  private metrics: Map<string, ModelMetrics> = new Map();
  private systemMetrics: SystemMetrics;
  private alerts: Alert[] = [];
  private healthIssues: HealthIssue[] = [];
  private metricsTimer?: NodeJS.Timeout;
  private isMonitoring = false;

  constructor(
    registry: ModelRegistry,
    executor: ModelExecutor,
    cache: ModelCache,
    config?: Partial<MonitoringConfig>,
  ) {
    super();
    this.registry = registry;
    this.executor = executor;
    this.cache = cache;
    this.config = {
      metricsInterval: 30000, // 30 seconds
      alertThresholds: {
        errorRate: 0.1, // 10%
        responseTime: 5000, // 5 seconds
        queueLength: 100,
        cacheHitRate: 0.7, // 70%
        memoryUsage: 0.8, // 80%
        cpuUsage: 0.8, // 80%
      },
      retentionPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
      enableRealTimeMonitoring: true,
      enablePerformanceTracking: true,
      enableErrorTracking: true,
      ...config,
    };

    this.systemMetrics = this.initializeSystemMetrics();
    this.setupEventListeners();
  }

  private initializeSystemMetrics(): SystemMetrics {
    return {
      totalModels: 0,
      activeModels: 0,
      totalExecutions: 0,
      totalErrors: 0,
      averageResponseTime: 0,
      totalCost: 0,
      cacheStats: {
        totalEntries: 0,
        totalSize: 0,
        hitCount: 0,
        missCount: 0,
        hitRate: 0,
        evictionCount: 0,
        compressionRatio: 0,
        averageAccessTime: 0,
      },
      systemHealth: {
        status: "healthy",
        issues: [],
        lastChecked: new Date(),
        uptime: 0,
      },
    };
  }

  private setupEventListeners(): void {
    // Registry events
    this.registry.on("modelRegistered", (data) => {
      this.initializeModelMetrics(data.model.id);
      this.updateSystemMetrics();
    });

    this.registry.on("modelUnregistered", (data) => {
      this.metrics.delete(data.model.id);
      this.updateSystemMetrics();
    });

    this.registry.on("modelExecuted", (data) => {
      this.updateModelMetrics(data.modelId, data.result, data.duration);
      this.checkAlerts(data.modelId);
    });

    this.registry.on("modelExecutionError", (data) => {
      this.updateModelMetrics(data.modelId, null, data.duration, true);
      this.createAlert(
        "error",
        "high",
        `Model execution failed: ${data.error.message}`,
        data.modelId,
      );
      this.checkAlerts(data.modelId);
    });

    // Executor events
    this.executor.on("executionQueued", (data) => {
      this.updateSystemMetrics();
    });

    this.executor.on("executionCompleted", (data) => {
      this.updateSystemMetrics();
    });

    this.executor.on("executionFailed", (data) => {
      this.createAlert(
        "error",
        "medium",
        `Execution failed: ${data.error.message}`,
        data.modelId,
      );
      this.updateSystemMetrics();
    });

    this.executor.on("executionTimeout", (data) => {
      this.createAlert(
        "warning",
        "medium",
        `Execution timeout for model ${data.modelId}`,
        data.modelId,
      );
      this.updateSystemMetrics();
    });

    // Cache events
    this.cache.on("cacheHit", (data) => {
      this.updateSystemMetrics();
    });

    this.cache.on("cacheMiss", (data) => {
      this.updateSystemMetrics();
    });

    this.cache.on("cacheEviction", (data) => {
      this.updateSystemMetrics();
    });
  }

  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.metricsTimer = setInterval(() => {
      this.collectMetrics();
      this.checkSystemHealth();
      this.cleanupOldData();
    }, this.config.metricsInterval);

    this.emit("monitoringStarted");
  }

  async stopMonitoring(): Promise<void> {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
      this.metricsTimer = undefined;
    }

    this.emit("monitoringStopped");
  }

  async collectMetrics(): Promise<void> {
    try {
      // Collect model metrics
      const models = await this.registry.getAvailableModels();
      for (const model of models) {
        const registryMetrics = await this.registry.getModelMetrics(model.id);
        const executionHistory = await this.registry.getModelHistory(
          model.id,
          100,
        );

        this.updateModelMetricsFromHistory(model.id, executionHistory);
      }

      // Collect system metrics
      await this.updateSystemMetrics();

      // Collect cache metrics
      const cacheStats = await this.cache.getStats();
      this.systemMetrics.cacheStats = cacheStats;

      this.emit("metricsCollected", {
        modelMetrics: Array.from(this.metrics.values()),
        systemMetrics: this.systemMetrics,
      });
    } catch (error) {
      this.emit("metricsCollectionError", { error });
    }
  }

  async getModelMetrics(modelId: string): Promise<ModelMetrics | null> {
    return this.metrics.get(modelId) || null;
  }

  async getAllModelMetrics(): Promise<ModelMetrics[]> {
    return Array.from(this.metrics.values());
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    return { ...this.systemMetrics };
  }

  async getAlerts(activeOnly: boolean = true): Promise<Alert[]> {
    return activeOnly
      ? this.alerts.filter((alert) => !alert.resolved)
      : this.alerts;
  }

  async getHealthIssues(): Promise<HealthIssue[]> {
    return [...this.healthIssues];
  }

  async generatePerformanceReport(
    startDate: Date,
    endDate: Date,
  ): Promise<PerformanceReport> {
    const modelMetrics = await this.getAllModelMetrics();
    const systemMetrics = await this.getSystemMetrics();
    const alerts = this.alerts.filter(
      (alert) => alert.timestamp >= startDate && alert.timestamp <= endDate,
    );
    const recommendations = await this.generateRecommendations();

    return {
      period: { start: startDate, end: endDate },
      modelMetrics,
      systemMetrics,
      alerts,
      recommendations,
    };
  }

  private initializeModelMetrics(modelId: string): void {
    this.metrics.set(modelId, {
      modelId,
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageResponseTime: 0,
      averageCost: 0,
      totalCost: 0,
      cacheHitRate: 0,
      errorRate: 0,
      peakResponseTime: 0,
      minResponseTime: Infinity,
      throughput: 0,
      availability: 100,
    });
  }

  private updateModelMetrics(
    modelId: string,
    result: ModelResult | null,
    duration: number,
    isError: boolean = false,
  ): void {
    const metrics = this.metrics.get(modelId);
    if (!metrics) return;

    metrics.totalExecutions++;
    if (isError) {
      metrics.failedExecutions++;
    } else {
      metrics.successfulExecutions++;
    }

    // Update response time metrics
    metrics.averageResponseTime = (metrics.averageResponseTime + duration) / 2;
    metrics.peakResponseTime = Math.max(metrics.peakResponseTime, duration);
    metrics.minResponseTime = Math.min(metrics.minResponseTime, duration);

    // Update cost metrics
    if (result?.metadata.cost) {
      metrics.totalCost += result.metadata.cost;
      metrics.averageCost = metrics.totalCost / metrics.totalExecutions;
    }

    // Update cache hit rate
    if (result?.metadata.cacheHit) {
      metrics.cacheHitRate = (metrics.cacheHitRate + 1) / 2;
    }

    // Update error rate
    metrics.errorRate = metrics.failedExecutions / metrics.totalExecutions;

    // Update availability
    metrics.availability =
      (metrics.successfulExecutions / metrics.totalExecutions) * 100;

    // Update throughput (executions per minute)
    metrics.throughput =
      metrics.totalExecutions /
      ((Date.now() - metrics.lastExecution?.getTime() || Date.now()) / 60000);

    metrics.lastExecution = new Date();
  }

  private updateModelMetricsFromHistory(
    modelId: string,
    executions: ModelExecution[],
  ): void {
    const metrics = this.metrics.get(modelId);
    if (!metrics) return;

    const successful = executions.filter((e) => e.success);
    const failed = executions.filter((e) => !e.success);

    metrics.totalExecutions = executions.length;
    metrics.successfulExecutions = successful.length;
    metrics.failedExecutions = failed.length;

    if (executions.length > 0) {
      const responseTimes = executions.map((e) => e.duration);
      metrics.averageResponseTime =
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      metrics.peakResponseTime = Math.max(...responseTimes);
      metrics.minResponseTime = Math.min(...responseTimes);
    }

    const totalCost = executions.reduce(
      (sum, e) => sum + (e.metadata.cost || 0),
      0,
    );
    metrics.totalCost = totalCost;
    metrics.averageCost =
      executions.length > 0 ? totalCost / executions.length : 0;

    const cacheHits = executions.filter((e) => e.metadata.cacheHit).length;
    metrics.cacheHitRate =
      executions.length > 0 ? cacheHits / executions.length : 0;

    metrics.errorRate =
      executions.length > 0 ? failed.length / executions.length : 0;
    metrics.availability =
      executions.length > 0
        ? (successful.length / executions.length) * 100
        : 100;

    if (executions.length > 0) {
      metrics.lastExecution = executions[executions.length - 1].timestamp;
    }
  }

  private async updateSystemMetrics(): Promise<void> {
    const models = await this.registry.getAvailableModels();
    const queueStatus = this.executor.getQueueStatus();
    const cacheStats = await this.cache.getStats();

    this.systemMetrics.totalModels = models.length;
    this.systemMetrics.activeModels = models.filter(
      (m) => m.status === "active",
    ).length;
    this.systemMetrics.cacheStats = cacheStats;

    // Calculate aggregate metrics
    const allMetrics = Array.from(this.metrics.values());
    if (allMetrics.length > 0) {
      this.systemMetrics.totalExecutions = allMetrics.reduce(
        (sum, m) => sum + m.totalExecutions,
        0,
      );
      this.systemMetrics.totalErrors = allMetrics.reduce(
        (sum, m) => sum + m.failedExecutions,
        0,
      );
      this.systemMetrics.averageResponseTime =
        allMetrics.reduce((sum, m) => sum + m.averageResponseTime, 0) /
        allMetrics.length;
      this.systemMetrics.totalCost = allMetrics.reduce(
        (sum, m) => sum + m.totalCost,
        0,
      );
    }

    this.systemMetrics.queueStatus = queueStatus;
  }

  private checkSystemHealth(): void {
    const issues: HealthIssue[] = [];
    let status: "healthy" | "warning" | "critical" = "healthy";

    // Check error rates
    for (const [modelId, metrics] of this.metrics) {
      if (metrics.errorRate > this.config.alertThresholds.errorRate) {
        issues.push({
          type: "error",
          message: `High error rate: ${(metrics.errorRate * 100).toFixed(1)}%`,
          timestamp: new Date(),
          modelId,
          severity: metrics.errorRate > 0.2 ? "critical" : "high",
        });
        status = metrics.errorRate > 0.2 ? "critical" : "warning";
      }

      if (
        metrics.averageResponseTime > this.config.alertThresholds.responseTime
      ) {
        issues.push({
          type: "warning",
          message: `Slow response time: ${metrics.averageResponseTime.toFixed(
            0,
          )}ms`,
          timestamp: new Date(),
          modelId,
          severity: "medium",
        });
        if (status === "healthy") status = "warning";
      }
    }

    // Check queue status
    if (
      this.systemMetrics.queueStatus.queueLength >
      this.config.alertThresholds.queueLength
    ) {
      issues.push({
        type: "warning",
        message: `Long execution queue: ${this.systemMetrics.queueStatus.queueLength} items`,
        timestamp: new Date(),
        severity: "medium",
      });
      if (status === "healthy") status = "warning";
    }

    // Check cache hit rate
    if (
      this.systemMetrics.cacheStats.hitRate <
      this.config.alertThresholds.cacheHitRate
    ) {
      issues.push({
        type: "warning",
        message: `Low cache hit rate: ${(
          this.systemMetrics.cacheStats.hitRate * 100
        ).toFixed(1)}%`,
        timestamp: new Date(),
        severity: "low",
      });
    }

    this.systemMetrics.systemHealth = {
      status,
      issues,
      lastChecked: new Date(),
      uptime:
        Date.now() -
        (this.systemMetrics.systemHealth?.lastChecked?.getTime() || Date.now()),
    };

    this.healthIssues = issues;
  }

  private checkAlerts(modelId: string): void {
    const metrics = this.metrics.get(modelId);
    if (!metrics) return;

    // Check error rate threshold
    if (metrics.errorRate > this.config.alertThresholds.errorRate) {
      this.createAlert(
        "error",
        "high",
        `High error rate for model ${modelId}: ${(
          metrics.errorRate * 100
        ).toFixed(1)}%`,
        modelId,
      );
    }

    // Check response time threshold
    if (
      metrics.averageResponseTime > this.config.alertThresholds.responseTime
    ) {
      this.createAlert(
        "warning",
        "medium",
        `Slow response time for model ${modelId}: ${metrics.averageResponseTime.toFixed(
          0,
        )}ms`,
        modelId,
      );
    }
  }

  private createAlert(
    type: "error" | "warning" | "info",
    severity: "low" | "medium" | "high" | "critical",
    message: string,
    modelId?: string,
  ): void {
    const alert: Alert = {
      id: this.generateAlertId(),
      type,
      severity,
      message,
      timestamp: new Date(),
      modelId,
      resolved: false,
      metadata: {},
    };

    this.alerts.push(alert);
    this.emit("alertCreated", alert);
  }

  private async generateRecommendations(): Promise<string[]> {
    const recommendations: string[] = [];

    // Analyze metrics and generate recommendations
    for (const [modelId, metrics] of this.metrics) {
      if (metrics.errorRate > 0.05) {
        recommendations.push(
          `Consider investigating error patterns for model ${modelId} (${(
            metrics.errorRate * 100
          ).toFixed(1)}% error rate)`,
        );
      }

      if (metrics.averageResponseTime > 3000) {
        recommendations.push(
          `Consider optimizing model ${modelId} for better performance (${metrics.averageResponseTime.toFixed(
            0,
          )}ms avg response time)`,
        );
      }

      if (metrics.cacheHitRate < 0.5) {
        recommendations.push(
          `Consider increasing cache TTL for model ${modelId} to improve hit rate (${(
            metrics.cacheHitRate * 100
          ).toFixed(1)}% current hit rate)`,
        );
      }
    }

    if (this.systemMetrics.queueStatus.queueLength > 50) {
      recommendations.push(
        "Consider scaling up concurrent execution capacity to handle queue backlog",
      );
    }

    if (this.systemMetrics.cacheStats.hitRate < 0.6) {
      recommendations.push(
        "Consider reviewing cache configuration to improve hit rate",
      );
    }

    return recommendations;
  }

  private cleanupOldData(): void {
    const cutoffTime = Date.now() - this.config.retentionPeriod;

    // Clean up old alerts
    this.alerts = this.alerts.filter(
      (alert) => alert.timestamp.getTime() > cutoffTime,
    );

    // Clean up old health issues
    this.healthIssues = this.healthIssues.filter(
      (issue) => issue.timestamp.getTime() > cutoffTime,
    );
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods for alert management
  async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      this.emit("alertResolved", alert);
      return true;
    }
    return false;
  }

  async clearResolvedAlerts(): Promise<void> {
    this.alerts = this.alerts.filter((alert) => !alert.resolved);
    this.emit("alertsCleared");
  }
}
