// Plugin Performance Manager
// This file handles plugin performance monitoring, metrics, and optimization

import { EventEmitter } from "events";
import { PluginInstance, PluginError } from "./types";

export class PluginPerformanceManager extends EventEmitter {
  private initialized = false;
  private performanceMetrics: Map<string, PerformanceMetrics> = new Map();
  private monitoringInterval?: NodeJS.Timeout;
  private alertThresholds: PerformanceThresholds;

  constructor() {
    super();
    this.alertThresholds = {
      maxResponseTime: 5000, // 5 seconds
      minSuccessRate: 95, // 95%
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
      maxErrorRate: 5, // 5%
    };
  }

  // Initialize the performance manager
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.initialized = true;

    // Start performance monitoring
    this.startMonitoring();
  }

  // Start performance monitoring
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.checkThresholds();
    }, 30000); // Monitor every 30 seconds
  }

  // Stop performance monitoring
  private stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  // Collect performance metrics
  private collectMetrics(): void {
    for (const [pluginId, metrics] of this.performanceMetrics.entries()) {
      // Update memory usage
      metrics.memoryUsage = this.getMemoryUsage(pluginId);

      // Update CPU usage
      metrics.cpuUsage = this.getCPUUsage(pluginId);

      // Update last updated timestamp
      metrics.lastUpdated = new Date();
    }
  }

  // Check performance thresholds
  private checkThresholds(): void {
    for (const [pluginId, metrics] of this.performanceMetrics.entries()) {
      const alerts: PerformanceAlert[] = [];

      // Check response time threshold
      if (metrics.avgResponseTime > this.alertThresholds.maxResponseTime) {
        alerts.push({
          type: "response_time",
          message: `Response time ${metrics.avgResponseTime}ms exceeds threshold ${this.alertThresholds.maxResponseTime}ms`,
          severity: "warning",
          timestamp: new Date(),
        });
      }

      // Check success rate threshold
      if (metrics.successRate < this.alertThresholds.minSuccessRate) {
        alerts.push({
          type: "success_rate",
          message: `Success rate ${metrics.successRate}% below threshold ${this.alertThresholds.minSuccessRate}%`,
          severity: "error",
          timestamp: new Date(),
        });
      }

      // Check memory usage threshold
      if (metrics.memoryUsage > this.alertThresholds.maxMemoryUsage) {
        alerts.push({
          type: "memory_usage",
          message: `Memory usage ${metrics.memoryUsage} bytes exceeds threshold ${this.alertThresholds.maxMemoryUsage} bytes`,
          severity: "warning",
          timestamp: new Date(),
        });
      }

      // Check error rate threshold
      const errorRate = 100 - metrics.successRate;
      if (errorRate > this.alertThresholds.maxErrorRate) {
        alerts.push({
          type: "error_rate",
          message: `Error rate ${errorRate}% exceeds threshold ${this.alertThresholds.maxErrorRate}%`,
          severity: "error",
          timestamp: new Date(),
        });
      }

      // Emit alerts
      for (const alert of alerts) {
        this.emit("performance:alert", pluginId, alert);
      }
    }
  }

  // Register plugin for performance monitoring
  registerPlugin(plugin: PluginInstance): void {
    if (!this.initialized) {
      throw new PluginError(
        "Performance manager not initialized",
        "system",
        "NOT_INITIALIZED",
      );
    }

    const metrics: PerformanceMetrics = {
      pluginId: plugin.metadata.id,
      avgResponseTime: 0,
      totalRequests: 0,
      successRate: 100,
      memoryUsage: 0,
      cpuUsage: 0,
      errorCount: 0,
      lastUpdated: new Date(),
      history: [],
    };

    this.performanceMetrics.set(plugin.metadata.id, metrics);
  }

  // Unregister plugin from performance monitoring
  unregisterPlugin(pluginId: string): void {
    this.performanceMetrics.delete(pluginId);
  }

  // Update plugin performance metrics
  updateMetrics(
    pluginId: string,
    executionTime: number,
    success: boolean,
  ): void {
    const metrics = this.performanceMetrics.get(pluginId);
    if (!metrics) {
      return;
    }

    // Update response time
    metrics.totalRequests++;
    metrics.avgResponseTime =
      (metrics.avgResponseTime * (metrics.totalRequests - 1) + executionTime) /
      metrics.totalRequests;

    // Update success rate
    if (success) {
      metrics.successRate =
        (metrics.successRate * (metrics.totalRequests - 1) + 100) /
        metrics.totalRequests;
    } else {
      metrics.successRate =
        (metrics.successRate * (metrics.totalRequests - 1)) /
        metrics.totalRequests;
      metrics.errorCount++;
    }

    // Add to history
    metrics.history.push({
      timestamp: new Date(),
      responseTime: executionTime,
      success,
      memoryUsage: metrics.memoryUsage,
      cpuUsage: metrics.cpuUsage,
    });

    // Keep only last 100 entries
    if (metrics.history.length > 100) {
      metrics.history = metrics.history.slice(-100);
    }

    metrics.lastUpdated = new Date();
  }

  // Get plugin performance metrics
  getMetrics(pluginId: string): PerformanceMetrics | undefined {
    return this.performanceMetrics.get(pluginId);
  }

  // Get all performance metrics
  getAllMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.performanceMetrics);
  }

  // Get performance statistics
  getStats(): {
    totalPlugins: number;
    avgResponseTime: number;
    avgSuccessRate: number;
    totalRequests: number;
    totalErrors: number;
    pluginsWithAlerts: number;
  } {
    const metrics = Array.from(this.performanceMetrics.values());

    if (metrics.length === 0) {
      return {
        totalPlugins: 0,
        avgResponseTime: 0,
        avgSuccessRate: 0,
        totalRequests: 0,
        totalErrors: 0,
        pluginsWithAlerts: 0,
      };
    }

    const totalRequests = metrics.reduce((sum, m) => sum + m.totalRequests, 0);
    const totalErrors = metrics.reduce((sum, m) => sum + m.errorCount, 0);
    const avgResponseTime =
      metrics.reduce((sum, m) => sum + m.avgResponseTime, 0) / metrics.length;
    const avgSuccessRate =
      metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length;

    // Count plugins with alerts
    let pluginsWithAlerts = 0;
    for (const metric of metrics) {
      if (
        metric.avgResponseTime > this.alertThresholds.maxResponseTime ||
        metric.successRate < this.alertThresholds.minSuccessRate ||
        metric.memoryUsage > this.alertThresholds.maxMemoryUsage
      ) {
        pluginsWithAlerts++;
      }
    }

    return {
      totalPlugins: metrics.length,
      avgResponseTime,
      avgSuccessRate,
      totalRequests,
      totalErrors,
      pluginsWithAlerts,
    };
  }

  // Set performance thresholds
  setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.alertThresholds = { ...this.alertThresholds, ...thresholds };
  }

  // Get performance thresholds
  getThresholds(): PerformanceThresholds {
    return { ...this.alertThresholds };
  }

  // Get memory usage for plugin
  private getMemoryUsage(pluginId: string): number {
    // In a real implementation, this would get actual memory usage
    // For now, we'll return a mock value
    return Math.random() * 50 * 1024 * 1024; // Random value between 0-50MB
  }

  // Get CPU usage for plugin
  private getCPUUsage(pluginId: string): number {
    // In a real implementation, this would get actual CPU usage
    // For now, we'll return a mock value
    return Math.random() * 100; // Random value between 0-100%
  }

  // Generate performance report
  generateReport(pluginId?: string): PerformanceReport {
    if (pluginId) {
      const metrics = this.performanceMetrics.get(pluginId);
      if (!metrics) {
        throw new PluginError(
          `Plugin ${pluginId} not found`,
          pluginId,
          "NOT_FOUND",
        );
      }

      return {
        pluginId,
        metrics,
        recommendations: this.generateRecommendations(metrics),
        timestamp: new Date(),
      };
    }

    // Generate report for all plugins
    const allMetrics = Array.from(this.performanceMetrics.values());
    const overallMetrics: PerformanceMetrics = {
      pluginId: "all",
      avgResponseTime:
        allMetrics.reduce((sum, m) => sum + m.avgResponseTime, 0) /
        allMetrics.length,
      totalRequests: allMetrics.reduce((sum, m) => sum + m.totalRequests, 0),
      successRate:
        allMetrics.reduce((sum, m) => sum + m.successRate, 0) /
        allMetrics.length,
      memoryUsage: allMetrics.reduce((sum, m) => sum + m.memoryUsage, 0),
      cpuUsage:
        allMetrics.reduce((sum, m) => sum + m.cpuUsage, 0) / allMetrics.length,
      errorCount: allMetrics.reduce((sum, m) => sum + m.errorCount, 0),
      lastUpdated: new Date(),
      history: [],
    };

    return {
      pluginId: "all",
      metrics: overallMetrics,
      recommendations: this.generateRecommendations(overallMetrics),
      timestamp: new Date(),
    };
  }

  // Generate performance recommendations
  private generateRecommendations(metrics: PerformanceMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.avgResponseTime > this.alertThresholds.maxResponseTime) {
      recommendations.push(
        "Consider optimizing plugin performance or reducing complexity",
      );
    }

    if (metrics.successRate < this.alertThresholds.minSuccessRate) {
      recommendations.push(
        "Review error handling and improve plugin reliability",
      );
    }

    if (metrics.memoryUsage > this.alertThresholds.maxMemoryUsage) {
      recommendations.push(
        "Optimize memory usage and consider implementing cleanup routines",
      );
    }

    if (metrics.errorCount > 0) {
      recommendations.push("Investigate and fix recurring errors");
    }

    if (recommendations.length === 0) {
      recommendations.push("Plugin performance is within acceptable limits");
    }

    return recommendations;
  }

  // Cleanup
  async destroy(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    this.stopMonitoring();
    this.performanceMetrics.clear();
    this.initialized = false;
  }
}

// Performance metrics interface
export interface PerformanceMetrics {
  pluginId: string;
  avgResponseTime: number;
  totalRequests: number;
  successRate: number;
  memoryUsage: number;
  cpuUsage: number;
  errorCount: number;
  lastUpdated: Date;
  history: PerformanceHistoryEntry[];
}

// Performance history entry interface
export interface PerformanceHistoryEntry {
  timestamp: Date;
  responseTime: number;
  success: boolean;
  memoryUsage: number;
  cpuUsage: number;
}

// Performance thresholds interface
export interface PerformanceThresholds {
  maxResponseTime: number;
  minSuccessRate: number;
  maxMemoryUsage: number;
  maxErrorRate: number;
}

// Performance alert interface
export interface PerformanceAlert {
  type: "response_time" | "success_rate" | "memory_usage" | "error_rate";
  message: string;
  severity: "info" | "warning" | "error";
  timestamp: Date;
}

// Performance report interface
export interface PerformanceReport {
  pluginId: string;
  metrics: PerformanceMetrics;
  recommendations: string[];
  timestamp: Date;
}
