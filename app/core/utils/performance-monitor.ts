import {
  PerformanceMetrics,
  PerformanceSnapshot,
  PerformanceAlert,
  PerformanceThresholds,
} from "../types/architecture";

export interface PerformanceMonitorConfig {
  enabled: boolean;
  interval: number;
  thresholds: PerformanceThresholds;
  enableLogging: boolean;
  enableAlerts: boolean;
  enableReporting: boolean;
  reportingEndpoint?: string;
  reportingInterval: number;
  maxHistorySize: number;
  enableWebVitals: boolean;
  enableCustomMetrics: boolean;
}

export interface WebVitals {
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  TTFB: number; // Time to First Byte
}

export interface CustomMetric {
  name: string;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
}

export interface PerformanceReport {
  timestamp: Date;
  metrics: PerformanceMetrics;
  webVitals: WebVitals;
  customMetrics: CustomMetric[];
  alerts: PerformanceAlert[];
  summary: PerformanceSummary;
}

export interface PerformanceSummary {
  overallHealth: "excellent" | "good" | "fair" | "poor" | "critical";
  healthScore: number;
  recommendations: string[];
  trends: PerformanceTrends;
}

export interface PerformanceTrends {
  responseTime: "improving" | "stable" | "degrading";
  memoryUsage: "improving" | "stable" | "degrading";
  errorRate: "improving" | "stable" | "degrading";
  throughput: "improving" | "stable" | "degrading";
}

export class PerformanceMonitor {
  private config: PerformanceMonitorConfig;
  private metrics: PerformanceMetrics = {
    responseTime: 0,
    throughput: 0,
    errorRate: 0,
    memoryUsage: 0,
    cpuUsage: 0,
  };
  private history: PerformanceSnapshot[] = [];
  private alerts: PerformanceAlert[] = [];
  private customMetrics: CustomMetric[] = [];
  private webVitals: WebVitals = {
    FCP: 0,
    LCP: 0,
    FID: 0,
    CLS: 0,
    TTFB: 0,
  };
  private isRunning = false;
  private monitoringTimer?: NodeJS.Timeout;
  private reportingTimer?: NodeJS.Timeout;
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor(config?: Partial<PerformanceMonitorConfig>) {
    this.config = {
      enabled: true,
      interval: 5000, // 5 seconds
      thresholds: {
        responseTime: 1000, // 1 second
        memoryUsage: 80, // 80%
        cpuUsage: 80, // 80%
        errorRate: 0.05, // 5%
      },
      enableLogging: true,
      enableAlerts: true,
      enableReporting: false,
      reportingInterval: 60000, // 1 minute
      maxHistorySize: 1000,
      enableWebVitals: true,
      enableCustomMetrics: true,
      ...config,
    };

    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      if (this.config.enabled) {
        // Initialize Web Vitals monitoring
        if (this.config.enableWebVitals) {
          await this.initializeWebVitals();
        }

        // Initialize custom metrics
        if (this.config.enableCustomMetrics) {
          await this.initializeCustomMetrics();
        }

        // Start monitoring
        this.startMonitoring();

        // Start reporting if enabled
        if (this.config.enableReporting) {
          this.startReporting();
        }

        this.isRunning = true;
        this.log("PerformanceMonitor initialized");
      }
    } catch (error) {
      this.log("Failed to initialize PerformanceMonitor:", error);
      throw error;
    }
  }

  private async initializeWebVitals(): Promise<void> {
    try {
      // Initialize Web Vitals observers
      if (typeof window !== "undefined" && "PerformanceObserver" in window) {
        // First Contentful Paint
        this.observeWebVital("paint", (entries) => {
          for (const entry of entries) {
            if (entry.name === "first-contentful-paint") {
              this.webVitals.FCP = entry.startTime;
            }
          }
        });

        // Largest Contentful Paint
        this.observeWebVital("largest-contentful-paint", (entries) => {
          const lastEntry = entries[entries.length - 1];
          this.webVitals.LCP = lastEntry.startTime;
        });

        // First Input Delay
        this.observeWebVital("first-input", (entries) => {
          const firstInput = entries[0];
          this.webVitals.FID =
            firstInput.processingStart - firstInput.startTime;
        });

        // Cumulative Layout Shift
        this.observeWebVital("layout-shift", (entries) => {
          let clsValue = 0;
          for (const entry of entries) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          this.webVitals.CLS = clsValue;
        });

        // Time to First Byte
        this.observeWebVital("navigation", (entries) => {
          const navigationEntry = entries[0];
          this.webVitals.TTFB =
            navigationEntry.responseStart - navigationEntry.requestStart;
        });
      }

      this.log("Web Vitals monitoring initialized");
    } catch (error) {
      this.log("Failed to initialize Web Vitals monitoring:", error);
    }
  }

  private observeWebVital(
    type: string,
    callback: (entries: PerformanceEntry[]) => void,
  ): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ type, buffered: true });
      this.observers.set(type, observer);
    } catch (error) {
      this.log(`Failed to observe ${type}:`, error);
    }
  }

  private async initializeCustomMetrics(): Promise<void> {
    try {
      // Initialize custom metrics collection
      this.log("Custom metrics monitoring initialized");
    } catch (error) {
      this.log("Failed to initialize custom metrics monitoring:", error);
    }
  }

  private startMonitoring(): void {
    this.monitoringTimer = setInterval(() => {
      this.collectMetrics();
    }, this.config.interval);
  }

  private startReporting(): void {
    this.reportingTimer = setInterval(() => {
      this.generateReport();
    }, this.config.reportingInterval);
  }

  private collectMetrics(): void {
    try {
      // Collect performance metrics
      this.collectPerformanceMetrics();

      // Collect memory usage
      this.collectMemoryUsage();

      // Collect CPU usage (if available)
      this.collectCPUUsage();

      // Create snapshot
      const snapshot: PerformanceSnapshot = {
        timestamp: new Date(),
        metrics: { ...this.metrics },
        context: {
          url: typeof window !== "undefined" ? window.location.href : "",
          userAgent:
            typeof navigator !== "undefined" ? navigator.userAgent : "",
          connection: this.getConnectionInfo(),
        },
      };

      // Add to history
      this.history.push(snapshot);

      // Clean up old history
      if (this.history.length > this.config.maxHistorySize) {
        this.history = this.history.slice(-this.config.maxHistorySize);
      }

      // Check for alerts
      if (this.config.enableAlerts) {
        this.checkAlerts(snapshot);
      }

      this.log("Metrics collected", snapshot);
    } catch (error) {
      this.log("Failed to collect metrics:", error);
    }
  }

  private collectPerformanceMetrics(): void {
    try {
      if (typeof window !== "undefined" && "performance" in window) {
        const navigation = performance.getEntriesByType(
          "navigation",
        )[0] as PerformanceNavigationTiming;

        if (navigation) {
          this.metrics.responseTime =
            navigation.responseEnd - navigation.requestStart;
          this.metrics.throughput = 1 / (this.metrics.responseTime / 1000);
        }
      }
    } catch (error) {
      this.log("Failed to collect performance metrics:", error);
    }
  }

  private collectMemoryUsage(): void {
    try {
      if (typeof window !== "undefined" && "memory" in performance) {
        const memory = (performance as any).memory;
        this.metrics.memoryUsage =
          (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
      }
    } catch (error) {
      this.log("Failed to collect memory usage:", error);
    }
  }

  private collectCPUUsage(): void {
    try {
      // CPU usage collection is not directly available in browsers
      // This would need to be implemented using other methods
      this.metrics.cpuUsage = 0;
    } catch (error) {
      this.log("Failed to collect CPU usage:", error);
    }
  }

  private getConnectionInfo(): any {
    try {
      if (typeof navigator !== "undefined" && "connection" in navigator) {
        const connection = (navigator as any).connection;
        return {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        };
      }
      return {};
    } catch (error) {
      return {};
    }
  }

  private checkAlerts(snapshot: PerformanceSnapshot): void {
    const alerts: PerformanceAlert[] = [];

    // Check response time threshold
    if (snapshot.metrics.responseTime > this.config.thresholds.responseTime) {
      alerts.push({
        id: this.generateAlertId(),
        type: "warning",
        message: `High response time: ${snapshot.metrics.responseTime.toFixed(
          0,
        )}ms`,
        threshold: this.config.thresholds.responseTime,
        current: snapshot.metrics.responseTime,
        timestamp: new Date(),
        resolved: false,
      });
    }

    // Check memory usage threshold
    if (snapshot.metrics.memoryUsage > this.config.thresholds.memoryUsage) {
      alerts.push({
        id: this.generateAlertId(),
        type: "warning",
        message: `High memory usage: ${snapshot.metrics.memoryUsage.toFixed(
          1,
        )}%`,
        threshold: this.config.thresholds.memoryUsage,
        current: snapshot.metrics.memoryUsage,
        timestamp: new Date(),
        resolved: false,
      });
    }

    // Check error rate threshold
    if (snapshot.metrics.errorRate > this.config.thresholds.errorRate) {
      alerts.push({
        id: this.generateAlertId(),
        type: "error",
        message: `High error rate: ${(snapshot.metrics.errorRate * 100).toFixed(
          1,
        )}%`,
        threshold: this.config.thresholds.errorRate,
        current: snapshot.metrics.errorRate,
        timestamp: new Date(),
        resolved: false,
      });
    }

    // Add new alerts
    this.alerts.push(...alerts);

    // Clean up old alerts
    const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours
    this.alerts = this.alerts.filter(
      (alert) => alert.timestamp.getTime() > cutoff,
    );
  }

  private async generateReport(): Promise<void> {
    try {
      const report: PerformanceReport = {
        timestamp: new Date(),
        metrics: { ...this.metrics },
        webVitals: { ...this.webVitals },
        customMetrics: [...this.customMetrics],
        alerts: [...this.alerts],
        summary: this.generateSummary(),
      };

      // Send report if endpoint is configured
      if (this.config.reportingEndpoint) {
        await this.sendReport(report);
      }

      this.log("Performance report generated", report);
    } catch (error) {
      this.log("Failed to generate performance report:", error);
    }
  }

  private generateSummary(): PerformanceSummary {
    const healthScore = this.calculateHealthScore();
    const overallHealth = this.getOverallHealth(healthScore);
    const recommendations = this.generateRecommendations();
    const trends = this.calculateTrends();

    return {
      overallHealth,
      healthScore,
      recommendations,
      trends,
    };
  }

  private calculateHealthScore(): number {
    let score = 100;

    // Deduct points for poor performance
    if (this.metrics.responseTime > this.config.thresholds.responseTime) {
      score -= 20;
    }
    if (this.metrics.memoryUsage > this.config.thresholds.memoryUsage) {
      score -= 20;
    }
    if (this.metrics.errorRate > this.config.thresholds.errorRate) {
      score -= 30;
    }
    if (this.metrics.cpuUsage > this.config.thresholds.cpuUsage) {
      score -= 10;
    }

    return Math.max(0, score);
  }

  private getOverallHealth(
    score: number,
  ): "excellent" | "good" | "fair" | "poor" | "critical" {
    if (score >= 90) return "excellent";
    if (score >= 80) return "good";
    if (score >= 70) return "fair";
    if (score >= 50) return "poor";
    return "critical";
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.responseTime > this.config.thresholds.responseTime) {
      recommendations.push(
        "Consider optimizing API calls and reducing response times",
      );
    }
    if (this.metrics.memoryUsage > this.config.thresholds.memoryUsage) {
      recommendations.push(
        "Consider implementing memory optimization strategies",
      );
    }
    if (this.metrics.errorRate > this.config.thresholds.errorRate) {
      recommendations.push(
        "Investigate and fix error sources to reduce error rate",
      );
    }
    if (this.metrics.cpuUsage > this.config.thresholds.cpuUsage) {
      recommendations.push("Consider optimizing CPU-intensive operations");
    }

    return recommendations;
  }

  private calculateTrends(): PerformanceTrends {
    // Calculate trends based on recent history
    const recentHistory = this.history.slice(-10);

    return {
      responseTime: this.calculateTrend(recentHistory, "responseTime"),
      memoryUsage: this.calculateTrend(recentHistory, "memoryUsage"),
      errorRate: this.calculateTrend(recentHistory, "errorRate"),
      throughput: this.calculateTrend(recentHistory, "throughput"),
    };
  }

  private calculateTrend(
    history: PerformanceSnapshot[],
    metric: keyof PerformanceMetrics,
  ): "improving" | "stable" | "degrading" {
    if (history.length < 2) return "stable";

    const first = history[0].metrics[metric];
    const last = history[history.length - 1].metrics[metric];
    const change = (last - first) / first;

    if (change > 0.1) return "degrading";
    if (change < -0.1) return "improving";
    return "stable";
  }

  private async sendReport(report: PerformanceReport): Promise<void> {
    try {
      if (this.config.reportingEndpoint) {
        await fetch(this.config.reportingEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(report),
        });
      }
    } catch (error) {
      this.log("Failed to send performance report:", error);
    }
  }

  addCustomMetric(
    name: string,
    value: number,
    tags?: Record<string, string>,
  ): void {
    if (!this.config.enableCustomMetrics) return;

    const metric: CustomMetric = {
      name,
      value,
      timestamp: new Date(),
      tags,
    };

    this.customMetrics.push(metric);

    // Clean up old metrics
    if (this.customMetrics.length > this.config.maxHistorySize) {
      this.customMetrics = this.customMetrics.slice(
        -this.config.maxHistorySize,
      );
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getWebVitals(): WebVitals {
    return { ...this.webVitals };
  }

  getHistory(limit?: number): PerformanceSnapshot[] {
    return limit ? this.history.slice(-limit) : [...this.history];
  }

  getAlerts(activeOnly: boolean = true): PerformanceAlert[] {
    return activeOnly
      ? this.alerts.filter((alert) => !alert.resolved)
      : [...this.alerts];
  }

  getCustomMetrics(name?: string, limit?: number): CustomMetric[] {
    let metrics = this.customMetrics;

    if (name) {
      metrics = metrics.filter((metric) => metric.name === name);
    }

    if (limit) {
      metrics = metrics.slice(-limit);
    }

    return metrics;
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      return true;
    }
    return false;
  }

  clearHistory(): void {
    this.history = [];
  }

  clearAlerts(): void {
    this.alerts = [];
  }

  clearCustomMetrics(): void {
    this.customMetrics = [];
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private log(message: string, ...args: any[]): void {
    if (this.config.enableLogging) {
      console.log(`[PerformanceMonitor] ${message}`, ...args);
    }
  }

  stop(): void {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = undefined;
    }

    if (this.reportingTimer) {
      clearInterval(this.reportingTimer);
      this.reportingTimer = undefined;
    }

    // Disconnect observers
    for (const observer of this.observers.values()) {
      observer.disconnect();
    }
    this.observers.clear();

    this.isRunning = false;
  }

  // Configuration
  updateConfig(newConfig: Partial<PerformanceMonitorConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): PerformanceMonitorConfig {
    return { ...this.config };
  }

  isRunning(): boolean {
    return this.isRunning;
  }
}

// Create and export a default instance
export const performanceMonitor = new PerformanceMonitor();
