// Plugin Analytics System
// Comprehensive analytics and insights for plugins

import { EventEmitter } from "events";
import {
  AnalyticsData,
  UsageMetrics,
  PerformanceMetrics,
  DownloadMetrics,
  PopularityMetrics,
  TrendMetrics,
} from "../types";

export class PluginAnalyticsManager extends EventEmitter {
  private initialized: boolean = false;

  // Analytics data
  public usage: Map<string, UsageMetrics> = new Map();
  public performance: Map<string, PerformanceMetrics> = new Map();
  public downloads: Map<string, DownloadMetrics> = new Map();
  public popularity: Map<string, PopularityMetrics> = new Map();
  public trends: Map<string, TrendMetrics> = new Map();

  constructor() {
    super();
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      this.emit("warn", "Plugin analytics already initialized");
      return;
    }

    this.emit("info", "Initializing Plugin Analytics Manager...");

    try {
      // Initialize analytics systems
      await this.initializeUsage();
      await this.initializePerformance();
      await this.initializeDownloads();
      await this.initializePopularity();
      await this.initializeTrends();

      this.initialized = true;
      this.emit("initialized");
      this.emit("info", "Plugin Analytics Manager initialized successfully");
    } catch (error) {
      this.emit("error", `Failed to initialize plugin analytics: ${error}`);
      throw error;
    }
  }

  private async initializeUsage(): Promise<void> {
    this.usage = new Map();
  }

  private async initializePerformance(): Promise<void> {
    this.performance = new Map();
  }

  private async initializeDownloads(): Promise<void> {
    this.downloads = new Map();
  }

  private async initializePopularity(): Promise<void> {
    this.popularity = new Map();
  }

  private async initializeTrends(): Promise<void> {
    this.trends = new Map();
  }

  // Usage analytics
  async trackUsage(
    pluginId: string,
    usageData: Partial<UsageMetrics>,
  ): Promise<void> {
    this.emit("info", `Tracking usage for plugin: ${pluginId}`);

    try {
      const existing = this.usage.get(pluginId);
      const usage: UsageMetrics = {
        pluginId,
        totalUsers: (existing?.totalUsers || 0) + (usageData.totalUsers || 0),
        activeUsers:
          (existing?.activeUsers || 0) + (usageData.activeUsers || 0),
        sessions: (existing?.sessions || 0) + (usageData.sessions || 0),
        sessionDuration:
          usageData.sessionDuration || existing?.sessionDuration || 0,
        features: usageData.features || existing?.features || {},
        userRetention: usageData.userRetention || existing?.userRetention || 0,
        lastUpdated: new Date(),
      };

      this.usage.set(pluginId, usage);
      this.emit("analytics:usage:updated", usage);
    } catch (error) {
      this.emit("error", `Failed to track usage: ${error}`);
      throw error;
    }
  }

  async getUsageAnalytics(pluginId: string): Promise<UsageMetrics | null> {
    return this.usage.get(pluginId) || null;
  }

  // Performance analytics
  async trackPerformance(
    pluginId: string,
    performanceData: Partial<PerformanceMetrics>,
  ): Promise<void> {
    this.emit("info", `Tracking performance for plugin: ${pluginId}`);

    try {
      const existing = this.performance.get(pluginId);
      const performance: PerformanceMetrics = {
        pluginId,
        loadTime: performanceData.loadTime || existing?.loadTime || 0,
        responseTime:
          performanceData.responseTime || existing?.responseTime || 0,
        memoryUsage: performanceData.memoryUsage || existing?.memoryUsage || 0,
        cpuUsage: performanceData.cpuUsage || existing?.cpuUsage || 0,
        errorRate: performanceData.errorRate || existing?.errorRate || 0,
        uptime: performanceData.uptime || existing?.uptime || 0,
        lastUpdated: new Date(),
      };

      this.performance.set(pluginId, performance);
      this.emit("analytics:performance:updated", performance);
    } catch (error) {
      this.emit("error", `Failed to track performance: ${error}`);
      throw error;
    }
  }

  async getPerformanceAnalytics(
    pluginId: string,
  ): Promise<PerformanceMetrics | null> {
    return this.performance.get(pluginId) || null;
  }

  // Download analytics
  async trackDownload(
    pluginId: string,
    downloadData: Partial<DownloadMetrics>,
  ): Promise<void> {
    this.emit("info", `Tracking download for plugin: ${pluginId}`);

    try {
      const existing = this.downloads.get(pluginId);
      const downloads: DownloadMetrics = {
        pluginId,
        total: (existing?.total || 0) + (downloadData.total || 0),
        today: (existing?.today || 0) + (downloadData.today || 0),
        thisWeek: (existing?.thisWeek || 0) + (downloadData.thisWeek || 0),
        thisMonth: (existing?.thisMonth || 0) + (downloadData.thisMonth || 0),
        byCountry: downloadData.byCountry || existing?.byCountry || {},
        byPlatform: downloadData.byPlatform || existing?.byPlatform || {},
        byVersion: downloadData.byVersion || existing?.byVersion || {},
        lastUpdated: new Date(),
      };

      this.downloads.set(pluginId, downloads);
      this.emit("analytics:downloads:updated", downloads);
    } catch (error) {
      this.emit("error", `Failed to track downloads: ${error}`);
      throw error;
    }
  }

  async getDownloadAnalytics(
    pluginId: string,
  ): Promise<DownloadMetrics | null> {
    return this.downloads.get(pluginId) || null;
  }

  // Popularity analytics
  async trackPopularity(
    pluginId: string,
    popularityData: Partial<PopularityMetrics>,
  ): Promise<void> {
    this.emit("info", `Tracking popularity for plugin: ${pluginId}`);

    try {
      const existing = this.popularity.get(pluginId);
      const popularity: PopularityMetrics = {
        pluginId,
        rank: popularityData.rank || existing?.rank || 0,
        score: popularityData.score || existing?.score || 0,
        trending: popularityData.trending || existing?.trending || false,
        featured: popularityData.featured || existing?.featured || false,
        socialShares:
          popularityData.socialShares || existing?.socialShares || 0,
        mentions: popularityData.mentions || existing?.mentions || 0,
        bookmarks: popularityData.bookmarks || existing?.bookmarks || 0,
        lastUpdated: new Date(),
      };

      this.popularity.set(pluginId, popularity);
      this.emit("analytics:popularity:updated", popularity);
    } catch (error) {
      this.emit("error", `Failed to track popularity: ${error}`);
      throw error;
    }
  }

  async getPopularityAnalytics(
    pluginId: string,
  ): Promise<PopularityMetrics | null> {
    return this.popularity.get(pluginId) || null;
  }

  // Trend analytics
  async trackTrend(
    pluginId: string,
    trendData: Partial<TrendMetrics>,
  ): Promise<void> {
    this.emit("info", `Tracking trend for plugin: ${pluginId}`);

    try {
      const existing = this.trends.get(pluginId);
      const trend: TrendMetrics = {
        pluginId,
        direction: trendData.direction || existing?.direction || "stable",
        velocity: trendData.velocity || existing?.velocity || 0,
        acceleration: trendData.acceleration || existing?.acceleration || 0,
        volatility: trendData.volatility || existing?.volatility || 0,
        seasonality: trendData.seasonality || existing?.seasonality || {},
        forecast: trendData.forecast || existing?.forecast || [],
        lastUpdated: new Date(),
      };

      this.trends.set(pluginId, trend);
      this.emit("analytics:trends:updated", trend);
    } catch (error) {
      this.emit("error", `Failed to track trends: ${error}`);
      throw error;
    }
  }

  async getTrendAnalytics(pluginId: string): Promise<TrendMetrics | null> {
    return this.trends.get(pluginId) || null;
  }

  // Comprehensive analytics
  async getComprehensiveAnalytics(
    pluginId: string,
  ): Promise<AnalyticsData | null> {
    this.emit(
      "info",
      `Getting comprehensive analytics for plugin: ${pluginId}`,
    );

    try {
      const usage = this.usage.get(pluginId);
      const performance = this.performance.get(pluginId);
      const downloads = this.downloads.get(pluginId);
      const popularity = this.popularity.get(pluginId);
      const trends = this.trends.get(pluginId);

      if (!usage && !performance && !downloads && !popularity && !trends) {
        return null;
      }

      return {
        pluginId,
        usage,
        performance,
        downloads,
        popularity,
        trends,
        generatedAt: new Date(),
      };
    } catch (error) {
      this.emit("error", `Failed to get comprehensive analytics: ${error}`);
      throw error;
    }
  }

  // Analytics aggregation
  async getAggregatedAnalytics(pluginIds: string[]): Promise<AnalyticsData[]> {
    this.emit(
      "info",
      `Getting aggregated analytics for ${pluginIds.length} plugins`,
    );

    try {
      const analytics: AnalyticsData[] = [];

      for (const pluginId of pluginIds) {
        const data = await this.getComprehensiveAnalytics(pluginId);
        if (data) {
          analytics.push(data);
        }
      }

      return analytics;
    } catch (error) {
      this.emit("error", `Failed to get aggregated analytics: ${error}`);
      throw error;
    }
  }

  // Top performing plugins
  async getTopPerformingPlugins(
    metric: string,
    limit: number = 10,
  ): Promise<any[]> {
    this.emit("info", `Getting top performing plugins by ${metric}`);

    try {
      const results: any[] = [];

      switch (metric) {
        case "usage":
          for (const [pluginId, usage] of this.usage) {
            results.push({
              pluginId,
              value: usage.totalUsers,
              metric: "totalUsers",
            });
          }
          break;
        case "downloads":
          for (const [pluginId, downloads] of this.downloads) {
            results.push({
              pluginId,
              value: downloads.total,
              metric: "totalDownloads",
            });
          }
          break;
        case "popularity":
          for (const [pluginId, popularity] of this.popularity) {
            results.push({
              pluginId,
              value: popularity.score,
              metric: "popularityScore",
            });
          }
          break;
        case "performance":
          for (const [pluginId, performance] of this.performance) {
            results.push({
              pluginId,
              value: performance.uptime,
              metric: "uptime",
            });
          }
          break;
      }

      return results.sort((a, b) => b.value - a.value).slice(0, limit);
    } catch (error) {
      this.emit("error", `Failed to get top performing plugins: ${error}`);
      throw error;
    }
  }

  // Analytics export
  async exportAnalytics(
    pluginId: string,
    format: "json" | "csv" = "json",
  ): Promise<string> {
    this.emit("info", `Exporting analytics for plugin: ${pluginId}`);

    try {
      const analytics = await this.getComprehensiveAnalytics(pluginId);
      if (!analytics) {
        throw new Error(`No analytics data found for plugin ${pluginId}`);
      }

      if (format === "json") {
        return JSON.stringify(analytics, null, 2);
      } else if (format === "csv") {
        // Convert to CSV format
        const csv = this.convertToCSV(analytics);
        return csv;
      }

      throw new Error(`Unsupported export format: ${format}`);
    } catch (error) {
      this.emit("error", `Failed to export analytics: ${error}`);
      throw error;
    }
  }

  private convertToCSV(analytics: AnalyticsData): string {
    const rows: string[] = [];

    // Header
    rows.push("Metric,Value,Timestamp");

    // Usage metrics
    if (analytics.usage) {
      rows.push(
        `Total Users,${analytics.usage.totalUsers},${analytics.usage.lastUpdated}`,
      );
      rows.push(
        `Active Users,${analytics.usage.activeUsers},${analytics.usage.lastUpdated}`,
      );
      rows.push(
        `Sessions,${analytics.usage.sessions},${analytics.usage.lastUpdated}`,
      );
    }

    // Performance metrics
    if (analytics.performance) {
      rows.push(
        `Load Time,${analytics.performance.loadTime},${analytics.performance.lastUpdated}`,
      );
      rows.push(
        `Response Time,${analytics.performance.responseTime},${analytics.performance.lastUpdated}`,
      );
      rows.push(
        `Error Rate,${analytics.performance.errorRate},${analytics.performance.lastUpdated}`,
      );
    }

    // Download metrics
    if (analytics.downloads) {
      rows.push(
        `Total Downloads,${analytics.downloads.total},${analytics.downloads.lastUpdated}`,
      );
      rows.push(
        `Today Downloads,${analytics.downloads.today},${analytics.downloads.lastUpdated}`,
      );
    }

    return rows.join("\n");
  }

  getStatus(): any {
    return {
      initialized: this.initialized,
      usage: this.usage.size,
      performance: this.performance.size,
      downloads: this.downloads.size,
      popularity: this.popularity.size,
      trends: this.trends.size,
    };
  }

  async destroy(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    this.emit("info", "Destroying Plugin Analytics Manager...");

    try {
      // Clear all data
      this.usage.clear();
      this.performance.clear();
      this.downloads.clear();
      this.popularity.clear();
      this.trends.clear();

      this.initialized = false;
      this.emit("destroyed");
      this.emit("info", "Plugin Analytics Manager destroyed successfully");
    } catch (error) {
      this.emit("error", `Failed to destroy plugin analytics: ${error}`);
      throw error;
    }
  }
}
