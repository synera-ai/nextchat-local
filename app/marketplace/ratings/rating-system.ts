// Rating System
// Comprehensive plugin rating and scoring system

import { EventEmitter } from "events";
import {
  PluginRating,
  RatingBreakdown,
  RatingStats,
  RatingTrend,
  RatingComparison,
} from "../types";

export class RatingSystemManager extends EventEmitter {
  private initialized: boolean = false;

  // Rating data
  public ratings: Map<string, PluginRating[]> = new Map();
  public ratingStats: Map<string, RatingStats> = new Map();
  public ratingTrends: Map<string, RatingTrend[]> = new Map();

  constructor() {
    super();
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      this.emit("warn", "Rating system already initialized");
      return;
    }

    this.emit("info", "Initializing Rating System Manager...");

    try {
      // Initialize rating systems
      await this.initializeRatings();
      await this.initializeStats();
      await this.initializeTrends();

      this.initialized = true;
      this.emit("initialized");
      this.emit("info", "Rating System Manager initialized successfully");
    } catch (error) {
      this.emit("error", `Failed to initialize rating system: ${error}`);
      throw error;
    }
  }

  private async initializeRatings(): Promise<void> {
    this.ratings = new Map();
  }

  private async initializeStats(): Promise<void> {
    this.ratingStats = new Map();
  }

  private async initializeTrends(): Promise<void> {
    this.ratingTrends = new Map();
  }

  // Rating management
  async rate(pluginId: string, userId: string, rating: number): Promise<void> {
    this.emit("info", `Rating plugin ${pluginId}: ${rating}/5`);

    try {
      // Validate rating
      if (rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5");
      }

      // Check if user already rated this plugin
      const existingRatings = this.ratings.get(pluginId) || [];
      const existingRating = existingRatings.find((r) => r.userId === userId);

      if (existingRating) {
        // Update existing rating
        existingRating.rating = rating;
        existingRating.updatedAt = new Date();
        this.emit("rating:updated", { pluginId, userId, rating });
      } else {
        // Create new rating
        const newRating: PluginRating = {
          id: this.generateRatingId(),
          pluginId,
          userId,
          rating,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        existingRatings.push(newRating);
        this.ratings.set(pluginId, existingRatings);
        this.emit("rating:created", newRating);
      }

      // Update rating stats
      await this.updateRatingStats(pluginId);
    } catch (error) {
      this.emit("error", `Failed to rate plugin: ${error}`);
      throw error;
    }
  }

  async getRating(pluginId: string): Promise<RatingStats | null> {
    return this.ratingStats.get(pluginId) || null;
  }

  async getUserRating(pluginId: string, userId: string): Promise<number> {
    const pluginRatings = this.ratings.get(pluginId) || [];
    const userRating = pluginRatings.find((r) => r.userId === userId);
    return userRating ? userRating.rating : 0;
  }

  async breakdown(pluginId: string): Promise<RatingBreakdown> {
    this.emit("info", `Getting rating breakdown for plugin: ${pluginId}`);

    try {
      const pluginRatings = this.ratings.get(pluginId) || [];

      if (pluginRatings.length === 0) {
        return {
          pluginId,
          functionality: 0,
          performance: 0,
          usability: 0,
          documentation: 0,
          support: 0,
          totalRatings: 0,
          lastUpdated: new Date(),
        };
      }

      // Calculate breakdown (this would come from detailed ratings in a real system)
      const totalRatings = pluginRatings.length;
      const averageRating =
        pluginRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

      // Simulate breakdown based on overall rating
      const breakdown: RatingBreakdown = {
        pluginId,
        functionality: Math.min(5, averageRating + (Math.random() - 0.5) * 0.5),
        performance: Math.min(5, averageRating + (Math.random() - 0.5) * 0.5),
        usability: Math.min(5, averageRating + (Math.random() - 0.5) * 0.5),
        documentation: Math.min(5, averageRating + (Math.random() - 0.5) * 0.5),
        support: Math.min(5, averageRating + (Math.random() - 0.5) * 0.5),
        totalRatings,
        lastUpdated: new Date(),
      };

      return breakdown;
    } catch (error) {
      this.emit("error", `Failed to get rating breakdown: ${error}`);
      throw error;
    }
  }

  // Rating statistics
  private async updateRatingStats(pluginId: string): Promise<void> {
    const pluginRatings = this.ratings.get(pluginId) || [];

    if (pluginRatings.length === 0) {
      this.ratingStats.delete(pluginId);
      return;
    }

    const totalRatings = pluginRatings.length;
    const totalScore = pluginRatings.reduce(
      (sum, rating) => sum + rating.rating,
      0,
    );
    const averageRating = totalScore / totalRatings;

    // Calculate rating distribution
    const distribution = {
      5: pluginRatings.filter((r) => r.rating === 5).length,
      4: pluginRatings.filter((r) => r.rating === 4).length,
      3: pluginRatings.filter((r) => r.rating === 3).length,
      2: pluginRatings.filter((r) => r.rating === 2).length,
      1: pluginRatings.filter((r) => r.rating === 1).length,
    };

    // Calculate weighted average (more recent ratings have higher weight)
    const now = Date.now();
    const weightedSum = pluginRatings.reduce((sum, rating) => {
      const daysSinceRating =
        (now - new Date(rating.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      const weight = Math.max(0.1, 1 - daysSinceRating / 365); // Decay over 1 year
      return sum + rating.rating * weight;
    }, 0);

    const totalWeight = pluginRatings.reduce((sum, rating) => {
      const daysSinceRating =
        (now - new Date(rating.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      const weight = Math.max(0.1, 1 - daysSinceRating / 365);
      return sum + weight;
    }, 0);

    const weightedAverage =
      totalWeight > 0 ? weightedSum / totalWeight : averageRating;

    // Calculate confidence score (based on number of ratings)
    const confidenceScore = Math.min(
      1,
      Math.log(totalRatings + 1) / Math.log(100),
    );

    // Calculate trend
    const trend = await this.calculateTrend(pluginId);

    const stats: RatingStats = {
      pluginId,
      average: Math.round(averageRating * 10) / 10,
      weightedAverage: Math.round(weightedAverage * 10) / 10,
      total: totalRatings,
      distribution,
      confidence: Math.round(confidenceScore * 100) / 100,
      trend,
      lastUpdated: new Date(),
    };

    this.ratingStats.set(pluginId, stats);
  }

  // Rating trends
  private async calculateTrend(
    pluginId: string,
  ): Promise<"up" | "down" | "stable"> {
    const trends = this.ratingTrends.get(pluginId) || [];

    if (trends.length < 2) {
      return "stable";
    }

    const recent = trends.slice(-7); // Last 7 data points
    const older = trends.slice(-14, -7); // Previous 7 data points

    if (recent.length === 0 || older.length === 0) {
      return "stable";
    }

    const recentAvg =
      recent.reduce((sum, t) => sum + t.average, 0) / recent.length;
    const olderAvg =
      older.reduce((sum, t) => sum + t.average, 0) / older.length;

    const difference = recentAvg - olderAvg;

    if (difference > 0.1) return "up";
    if (difference < -0.1) return "down";
    return "stable";
  }

  async addTrendData(pluginId: string, average: number): Promise<void> {
    const trend: RatingTrend = {
      id: this.generateTrendId(),
      pluginId,
      average,
      totalRatings: this.ratings.get(pluginId)?.length || 0,
      timestamp: new Date(),
    };

    const trends = this.ratingTrends.get(pluginId) || [];
    trends.push(trend);

    // Keep only last 30 data points
    if (trends.length > 30) {
      trends.splice(0, trends.length - 30);
    }

    this.ratingTrends.set(pluginId, trends);
  }

  async getTrendData(
    pluginId: string,
    days: number = 30,
  ): Promise<RatingTrend[]> {
    const trends = this.ratingTrends.get(pluginId) || [];
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return trends.filter((trend) => new Date(trend.timestamp) >= cutoffDate);
  }

  // Rating comparisons
  async compareRatings(pluginIds: string[]): Promise<RatingComparison[]> {
    this.emit("info", `Comparing ratings for ${pluginIds.length} plugins`);

    try {
      const comparisons: RatingComparison[] = [];

      for (const pluginId of pluginIds) {
        const stats = this.ratingStats.get(pluginId);
        if (stats) {
          comparisons.push({
            pluginId,
            average: stats.average,
            total: stats.total,
            confidence: stats.confidence,
            trend: stats.trend,
            rank: 0, // Would be calculated based on comparison
          });
        }
      }

      // Sort by average rating and assign ranks
      comparisons.sort((a, b) => b.average - a.average);
      comparisons.forEach((comp, index) => {
        comp.rank = index + 1;
      });

      return comparisons;
    } catch (error) {
      this.emit("error", `Failed to compare ratings: ${error}`);
      throw error;
    }
  }

  // Rating analytics
  async getRatingAnalytics(pluginId?: string): Promise<any> {
    if (pluginId) {
      const stats = this.ratingStats.get(pluginId);
      const trends = this.ratingTrends.get(pluginId) || [];
      return {
        [pluginId]: {
          stats,
          trends: trends.slice(-30), // Last 30 data points
        },
      };
    }

    // Return analytics for all plugins
    const analytics: any = {};
    for (const [id, stats] of this.ratingStats) {
      const trends = this.ratingTrends.get(id) || [];
      analytics[id] = {
        stats,
        trends: trends.slice(-30),
      };
    }
    return analytics;
  }

  // Top rated plugins
  async getTopRatedPlugins(limit: number = 10): Promise<RatingComparison[]> {
    const allStats = Array.from(this.ratingStats.values());

    return allStats
      .filter((stats) => stats.total >= 5) // Minimum 5 ratings
      .sort((a, b) => {
        // Sort by weighted average, then by confidence, then by total ratings
        if (b.weightedAverage !== a.weightedAverage) {
          return b.weightedAverage - a.weightedAverage;
        }
        if (b.confidence !== a.confidence) {
          return b.confidence - a.confidence;
        }
        return b.total - a.total;
      })
      .slice(0, limit)
      .map((stats, index) => ({
        pluginId: stats.pluginId,
        average: stats.average,
        total: stats.total,
        confidence: stats.confidence,
        trend: stats.trend,
        rank: index + 1,
      }));
  }

  // Rating validation
  async validateRating(
    pluginId: string,
    userId: string,
    rating: number,
  ): Promise<{ valid: boolean; reason?: string }> {
    // Check if plugin exists
    if (!this.ratings.has(pluginId)) {
      return { valid: false, reason: "Plugin not found" };
    }

    // Check rating range
    if (rating < 1 || rating > 5) {
      return { valid: false, reason: "Rating must be between 1 and 5" };
    }

    // Check if user has installed the plugin (in a real system)
    // This would check against the plugin management system

    // Check for spam/abuse (in a real system)
    // This would check user's rating history and patterns

    return { valid: true };
  }

  // Utility methods
  private generateRatingId(): string {
    return `rating_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTrendId(): string {
    return `trend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getStatus(): any {
    return {
      initialized: this.initialized,
      totalRatings: Array.from(this.ratings.values()).reduce(
        (sum, ratings) => sum + ratings.length,
        0,
      ),
      totalStats: this.ratingStats.size,
      totalTrends: Array.from(this.ratingTrends.values()).reduce(
        (sum, trends) => sum + trends.length,
        0,
      ),
    };
  }

  async destroy(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    this.emit("info", "Destroying Rating System Manager...");

    try {
      // Clear all data
      this.ratings.clear();
      this.ratingStats.clear();
      this.ratingTrends.clear();

      this.initialized = false;
      this.emit("destroyed");
      this.emit("info", "Rating System Manager destroyed successfully");
    } catch (error) {
      this.emit("error", `Failed to destroy rating system: ${error}`);
      throw error;
    }
  }
}
