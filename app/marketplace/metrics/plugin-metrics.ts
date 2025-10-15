// Plugin Metrics System
// KPI tracking, benchmarks, and goal management

import { EventEmitter } from "events";
import {
  KPIMetric,
  BenchmarkMetric,
  GoalMetric,
  AlertMetric,
  MetricType,
  MetricCategory,
  MetricStatus,
  AlertSeverity,
  AlertCondition,
} from "../types";

export class PluginMetricsManager extends EventEmitter {
  private initialized: boolean = false;

  // Metrics data
  public kpis: Map<string, KPIMetric[]> = new Map();
  public benchmarks: Map<string, BenchmarkMetric[]> = new Map();
  public goals: Map<string, GoalMetric[]> = new Map();
  public alerts: Map<string, AlertMetric[]> = new Map();

  constructor() {
    super();
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      this.emit("warn", "Plugin metrics already initialized");
      return;
    }

    this.emit("info", "Initializing Plugin Metrics Manager...");

    try {
      // Initialize metrics systems
      await this.initializeKPIs();
      await this.initializeBenchmarks();
      await this.initializeGoals();
      await this.initializeAlerts();

      this.initialized = true;
      this.emit("initialized");
      this.emit("info", "Plugin Metrics Manager initialized successfully");
    } catch (error) {
      this.emit("error", `Failed to initialize plugin metrics: ${error}`);
      throw error;
    }
  }

  private async initializeKPIs(): Promise<void> {
    this.kpis = new Map();
  }

  private async initializeBenchmarks(): Promise<void> {
    this.benchmarks = new Map();
  }

  private async initializeGoals(): Promise<void> {
    this.goals = new Map();
  }

  private async initializeAlerts(): Promise<void> {
    this.alerts = new Map();
  }

  // KPI management
  async addKPI(pluginId: string, kpi: Partial<KPIMetric>): Promise<KPIMetric> {
    this.emit("info", `Adding KPI for plugin: ${pluginId}`);

    try {
      const newKPI: KPIMetric = {
        id: this.generateKPIId(),
        pluginId,
        name: kpi.name || "",
        description: kpi.description || "",
        type: kpi.type || ("number" as MetricType),
        category: kpi.category || ("performance" as MetricCategory),
        value: kpi.value || 0,
        target: kpi.target || 0,
        unit: kpi.unit || "",
        status: kpi.status || ("active" as MetricStatus),
        trend: kpi.trend || "stable",
        lastUpdated: new Date(),
        createdAt: new Date(),
      };

      const pluginKPIs = this.kpis.get(pluginId) || [];
      pluginKPIs.push(newKPI);
      this.kpis.set(pluginId, pluginKPIs);

      this.emit("kpi:added", newKPI);
      return newKPI;
    } catch (error) {
      this.emit("error", `Failed to add KPI: ${error}`);
      throw error;
    }
  }

  async updateKPI(
    kpiId: string,
    updates: Partial<KPIMetric>,
  ): Promise<KPIMetric> {
    this.emit("info", `Updating KPI: ${kpiId}`);

    try {
      const kpi = await this.getKPI(kpiId);
      if (!kpi) {
        throw new Error(`KPI ${kpiId} not found`);
      }

      const updatedKPI = {
        ...kpi,
        ...updates,
        lastUpdated: new Date(),
      };

      // Update KPI in plugin KPIs
      const pluginKPIs = this.kpis.get(kpi.pluginId) || [];
      const index = pluginKPIs.findIndex((k) => k.id === kpiId);
      if (index !== -1) {
        pluginKPIs[index] = updatedKPI;
        this.kpis.set(kpi.pluginId, pluginKPIs);
      }

      this.emit("kpi:updated", updatedKPI);
      return updatedKPI;
    } catch (error) {
      this.emit("error", `Failed to update KPI: ${error}`);
      throw error;
    }
  }

  async getKPI(kpiId: string): Promise<KPIMetric | null> {
    for (const [pluginId, kpis] of this.kpis) {
      const kpi = kpis.find((k) => k.id === kpiId);
      if (kpi) {
        return kpi;
      }
    }
    return null;
  }

  async getPluginKPIs(pluginId: string): Promise<KPIMetric[]> {
    return this.kpis.get(pluginId) || [];
  }

  // Benchmark management
  async addBenchmark(
    pluginId: string,
    benchmark: Partial<BenchmarkMetric>,
  ): Promise<BenchmarkMetric> {
    this.emit("info", `Adding benchmark for plugin: ${pluginId}`);

    try {
      const newBenchmark: BenchmarkMetric = {
        id: this.generateBenchmarkId(),
        pluginId,
        name: benchmark.name || "",
        description: benchmark.description || "",
        type: benchmark.type || ("number" as MetricType),
        category: benchmark.category || ("performance" as MetricCategory),
        value: benchmark.value || 0,
        industryAverage: benchmark.industryAverage || 0,
        topPercentile: benchmark.topPercentile || 0,
        comparison: benchmark.comparison || "average",
        lastUpdated: new Date(),
        createdAt: new Date(),
      };

      const pluginBenchmarks = this.benchmarks.get(pluginId) || [];
      pluginBenchmarks.push(newBenchmark);
      this.benchmarks.set(pluginId, pluginBenchmarks);

      this.emit("benchmark:added", newBenchmark);
      return newBenchmark;
    } catch (error) {
      this.emit("error", `Failed to add benchmark: ${error}`);
      throw error;
    }
  }

  async getPluginBenchmarks(pluginId: string): Promise<BenchmarkMetric[]> {
    return this.benchmarks.get(pluginId) || [];
  }

  // Goal management
  async addGoal(
    pluginId: string,
    goal: Partial<GoalMetric>,
  ): Promise<GoalMetric> {
    this.emit("info", `Adding goal for plugin: ${pluginId}`);

    try {
      const newGoal: GoalMetric = {
        id: this.generateGoalId(),
        pluginId,
        name: goal.name || "",
        description: goal.description || "",
        type: goal.type || ("number" as MetricType),
        category: goal.category || ("performance" as MetricCategory),
        target: goal.target || 0,
        current: goal.current || 0,
        unit: goal.unit || "",
        deadline: goal.deadline || new Date(),
        status: goal.status || ("active" as MetricStatus),
        progress: goal.progress || 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
      };

      const pluginGoals = this.goals.get(pluginId) || [];
      pluginGoals.push(newGoal);
      this.goals.set(pluginId, pluginGoals);

      this.emit("goal:added", newGoal);
      return newGoal;
    } catch (error) {
      this.emit("error", `Failed to add goal: ${error}`);
      throw error;
    }
  }

  async updateGoal(
    goalId: string,
    updates: Partial<GoalMetric>,
  ): Promise<GoalMetric> {
    this.emit("info", `Updating goal: ${goalId}`);

    try {
      const goal = await this.getGoal(goalId);
      if (!goal) {
        throw new Error(`Goal ${goalId} not found`);
      }

      const updatedGoal = {
        ...goal,
        ...updates,
        lastUpdated: new Date(),
      };

      // Calculate progress
      if (updates.current !== undefined) {
        updatedGoal.progress = Math.min(
          100,
          (updates.current / updatedGoal.target) * 100,
        );

        // Update status based on progress
        if (updatedGoal.progress >= 100) {
          updatedGoal.status = "completed" as MetricStatus;
        } else if (new Date() > updatedGoal.deadline) {
          updatedGoal.status = "overdue" as MetricStatus;
        }
      }

      // Update goal in plugin goals
      const pluginGoals = this.goals.get(goal.pluginId) || [];
      const index = pluginGoals.findIndex((g) => g.id === goalId);
      if (index !== -1) {
        pluginGoals[index] = updatedGoal;
        this.goals.set(goal.pluginId, pluginGoals);
      }

      this.emit("goal:updated", updatedGoal);
      return updatedGoal;
    } catch (error) {
      this.emit("error", `Failed to update goal: ${error}`);
      throw error;
    }
  }

  async getGoal(goalId: string): Promise<GoalMetric | null> {
    for (const [pluginId, goals] of this.goals) {
      const goal = goals.find((g) => g.id === goalId);
      if (goal) {
        return goal;
      }
    }
    return null;
  }

  async getPluginGoals(pluginId: string): Promise<GoalMetric[]> {
    return this.goals.get(pluginId) || [];
  }

  // Alert management
  async addAlert(
    pluginId: string,
    alert: Partial<AlertMetric>,
  ): Promise<AlertMetric> {
    this.emit("info", `Adding alert for plugin: ${pluginId}`);

    try {
      const newAlert: AlertMetric = {
        id: this.generateAlertId(),
        pluginId,
        name: alert.name || "",
        description: alert.description || "",
        type: alert.type || ("number" as MetricType),
        category: alert.category || ("performance" as MetricCategory),
        condition: alert.condition || ("greater_than" as AlertCondition),
        threshold: alert.threshold || 0,
        severity: alert.severity || ("medium" as AlertSeverity),
        enabled: alert.enabled !== false,
        lastTriggered: alert.lastTriggered,
        triggerCount: alert.triggerCount || 0,
        createdAt: new Date(),
      };

      const pluginAlerts = this.alerts.get(pluginId) || [];
      pluginAlerts.push(newAlert);
      this.alerts.set(pluginId, pluginAlerts);

      this.emit("alert:added", newAlert);
      return newAlert;
    } catch (error) {
      this.emit("error", `Failed to add alert: ${error}`);
      throw error;
    }
  }

  async checkAlerts(
    pluginId: string,
    metricValue: number,
    metricName: string,
  ): Promise<AlertMetric[]> {
    this.emit("info", `Checking alerts for plugin: ${pluginId}`);

    try {
      const triggeredAlerts: AlertMetric[] = [];
      const pluginAlerts = this.alerts.get(pluginId) || [];

      for (const alert of pluginAlerts) {
        if (!alert.enabled) continue;

        let shouldTrigger = false;

        switch (alert.condition) {
          case "greater_than":
            shouldTrigger = metricValue > alert.threshold;
            break;
          case "less_than":
            shouldTrigger = metricValue < alert.threshold;
            break;
          case "equals":
            shouldTrigger = metricValue === alert.threshold;
            break;
          case "not_equals":
            shouldTrigger = metricValue !== alert.threshold;
            break;
          case "greater_than_or_equal":
            shouldTrigger = metricValue >= alert.threshold;
            break;
          case "less_than_or_equal":
            shouldTrigger = metricValue <= alert.threshold;
            break;
        }

        if (shouldTrigger) {
          // Update alert
          alert.lastTriggered = new Date();
          alert.triggerCount++;

          triggeredAlerts.push(alert);
          this.emit("alert:triggered", alert);
        }
      }

      return triggeredAlerts;
    } catch (error) {
      this.emit("error", `Failed to check alerts: ${error}`);
      throw error;
    }
  }

  async getPluginAlerts(pluginId: string): Promise<AlertMetric[]> {
    return this.alerts.get(pluginId) || [];
  }

  // Metric calculations
  async calculateKPITrend(
    pluginId: string,
    kpiId: string,
    historicalData: number[],
  ): Promise<string> {
    if (historicalData.length < 2) {
      return "stable";
    }

    const recent = historicalData.slice(-7); // Last 7 data points
    const older = historicalData.slice(-14, -7); // Previous 7 data points

    if (recent.length === 0 || older.length === 0) {
      return "stable";
    }

    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (change > 5) return "increasing";
    if (change < -5) return "decreasing";
    return "stable";
  }

  async calculateGoalProgress(goalId: string): Promise<number> {
    const goal = await this.getGoal(goalId);
    if (!goal) {
      return 0;
    }

    return Math.min(100, (goal.current / goal.target) * 100);
  }

  // Dashboard data
  async getDashboardData(pluginId: string): Promise<any> {
    this.emit("info", `Getting dashboard data for plugin: ${pluginId}`);

    try {
      const kpis = await this.getPluginKPIs(pluginId);
      const benchmarks = await this.getPluginBenchmarks(pluginId);
      const goals = await this.getPluginGoals(pluginId);
      const alerts = await this.getPluginAlerts(pluginId);

      // Calculate summary statistics
      const activeKPIs = kpis.filter((k) => k.status === "active").length;
      const completedGoals = goals.filter(
        (g) => g.status === "completed",
      ).length;
      const activeAlerts = alerts.filter((a) => a.enabled).length;
      const triggeredAlerts = alerts.filter((a) => a.triggerCount > 0).length;

      return {
        pluginId,
        kpis: {
          total: kpis.length,
          active: activeKPIs,
          data: kpis,
        },
        benchmarks: {
          total: benchmarks.length,
          data: benchmarks,
        },
        goals: {
          total: goals.length,
          completed: completedGoals,
          progress:
            goals.reduce((sum, g) => sum + g.progress, 0) / goals.length || 0,
          data: goals,
        },
        alerts: {
          total: alerts.length,
          active: activeAlerts,
          triggered: triggeredAlerts,
          data: alerts,
        },
        summary: {
          activeKPIs,
          completedGoals,
          activeAlerts,
          triggeredAlerts,
        },
        lastUpdated: new Date(),
      };
    } catch (error) {
      this.emit("error", `Failed to get dashboard data: ${error}`);
      throw error;
    }
  }

  // Utility methods
  private generateKPIId(): string {
    return `kpi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateBenchmarkId(): string {
    return `benchmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateGoalId(): string {
    return `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getStatus(): any {
    return {
      initialized: this.initialized,
      kpis: Array.from(this.kpis.values()).reduce(
        (sum, kpis) => sum + kpis.length,
        0,
      ),
      benchmarks: Array.from(this.benchmarks.values()).reduce(
        (sum, benchmarks) => sum + benchmarks.length,
        0,
      ),
      goals: Array.from(this.goals.values()).reduce(
        (sum, goals) => sum + goals.length,
        0,
      ),
      alerts: Array.from(this.alerts.values()).reduce(
        (sum, alerts) => sum + alerts.length,
        0,
      ),
    };
  }

  async destroy(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    this.emit("info", "Destroying Plugin Metrics Manager...");

    try {
      // Clear all data
      this.kpis.clear();
      this.benchmarks.clear();
      this.goals.clear();
      this.alerts.clear();

      this.initialized = false;
      this.emit("destroyed");
      this.emit("info", "Plugin Metrics Manager destroyed successfully");
    } catch (error) {
      this.emit("error", `Failed to destroy plugin metrics: ${error}`);
      throw error;
    }
  }
}
