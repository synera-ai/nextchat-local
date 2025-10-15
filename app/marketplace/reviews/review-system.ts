// Review System
// Comprehensive plugin review and rating system

import { EventEmitter } from "events";
import {
  PluginReview,
  ReviewFilters,
  ReviewStats,
  ReviewHelpfulness,
  ReviewReport,
  ReviewModeration,
} from "../types";

export class ReviewSystemManager extends EventEmitter {
  private initialized: boolean = false;

  // Review data
  public reviews: Map<string, PluginReview[]> = new Map();
  public reviewStats: Map<string, ReviewStats> = new Map();
  public helpfulness: Map<string, ReviewHelpfulness[]> = new Map();
  public reports: Map<string, ReviewReport[]> = new Map();
  public moderation: Map<string, ReviewModeration[]> = new Map();

  constructor() {
    super();
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      this.emit("warn", "Review system already initialized");
      return;
    }

    this.emit("info", "Initializing Review System Manager...");

    try {
      // Initialize review systems
      await this.initializeReviews();
      await this.initializeStats();
      await this.initializeHelpfulness();
      await this.initializeReports();
      await this.initializeModeration();

      this.initialized = true;
      this.emit("initialized");
      this.emit("info", "Review System Manager initialized successfully");
    } catch (error) {
      this.emit("error", `Failed to initialize review system: ${error}`);
      throw error;
    }
  }

  private async initializeReviews(): Promise<void> {
    this.reviews = new Map();
  }

  private async initializeStats(): Promise<void> {
    this.reviewStats = new Map();
  }

  private async initializeHelpfulness(): Promise<void> {
    this.helpfulness = new Map();
  }

  private async initializeReports(): Promise<void> {
    this.reports = new Map();
  }

  private async initializeModeration(): Promise<void> {
    this.moderation = new Map();
  }

  // Review management
  async create(review: Partial<PluginReview>): Promise<PluginReview> {
    this.emit("info", `Creating review for plugin: ${review.pluginId}`);

    try {
      const newReview: PluginReview = {
        id: this.generateReviewId(),
        pluginId: review.pluginId || "",
        userId: review.userId || "",
        rating: review.rating || 0,
        title: review.title || "",
        content: review.content || "",
        pros: review.pros || [],
        cons: review.pros || [],
        useCases: review.useCases || [],
        version: review.version || "1.0.0",
        helpful: 0,
        notHelpful: 0,
        verified: review.verified || false,
        isPublic: review.isPublic !== false,
        tags: review.tags || [],
        images: review.images || [],
        videos: review.videos || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add review to plugin
      const pluginReviews = this.reviews.get(newReview.pluginId) || [];
      pluginReviews.push(newReview);
      this.reviews.set(newReview.pluginId, pluginReviews);

      // Update review stats
      await this.updateReviewStats(newReview.pluginId);

      this.emit("review:created", newReview);
      return newReview;
    } catch (error) {
      this.emit("error", `Failed to create review: ${error}`);
      throw error;
    }
  }

  async update(
    reviewId: string,
    updates: Partial<PluginReview>,
  ): Promise<PluginReview> {
    this.emit("info", `Updating review: ${reviewId}`);

    try {
      const review = await this.getReview(reviewId);
      if (!review) {
        throw new Error(`Review ${reviewId} not found`);
      }

      const updatedReview = {
        ...review,
        ...updates,
        updatedAt: new Date(),
      };

      // Update review in plugin reviews
      const pluginReviews = this.reviews.get(review.pluginId) || [];
      const index = pluginReviews.findIndex((r) => r.id === reviewId);
      if (index !== -1) {
        pluginReviews[index] = updatedReview;
        this.reviews.set(review.pluginId, pluginReviews);
      }

      // Update review stats
      await this.updateReviewStats(review.pluginId);

      this.emit("review:updated", updatedReview);
      return updatedReview;
    } catch (error) {
      this.emit("error", `Failed to update review: ${error}`);
      throw error;
    }
  }

  async delete(reviewId: string): Promise<void> {
    this.emit("info", `Deleting review: ${reviewId}`);

    try {
      const review = await this.getReview(reviewId);
      if (!review) {
        throw new Error(`Review ${reviewId} not found`);
      }

      // Remove review from plugin reviews
      const pluginReviews = this.reviews.get(review.pluginId) || [];
      const filteredReviews = pluginReviews.filter((r) => r.id !== reviewId);
      this.reviews.set(review.pluginId, filteredReviews);

      // Update review stats
      await this.updateReviewStats(review.pluginId);

      this.emit("review:deleted", reviewId);
    } catch (error) {
      this.emit("error", `Failed to delete review: ${error}`);
      throw error;
    }
  }

  async getReview(reviewId: string): Promise<PluginReview | null> {
    for (const [pluginId, reviews] of this.reviews) {
      const review = reviews.find((r) => r.id === reviewId);
      if (review) {
        return review;
      }
    }
    return null;
  }

  async list(
    pluginId: string,
    filters?: ReviewFilters,
  ): Promise<PluginReview[]> {
    this.emit("info", `Listing reviews for plugin: ${pluginId}`);

    try {
      let reviews = this.reviews.get(pluginId) || [];

      // Apply filters
      if (filters) {
        reviews = this.applyFilters(reviews, filters);
      }

      // Sort reviews
      if (filters?.sortBy) {
        reviews = this.sortReviews(reviews, filters.sortBy, filters.sortOrder);
      }

      // Paginate results
      if (filters?.page && filters?.limit) {
        const start = (filters.page - 1) * filters.limit;
        const end = start + filters.limit;
        reviews = reviews.slice(start, end);
      }

      return reviews;
    } catch (error) {
      this.emit("error", `Failed to list reviews: ${error}`);
      throw error;
    }
  }

  // Helpfulness management
  async helpful(reviewId: string, helpful: boolean): Promise<void> {
    this.emit(
      "info",
      `Marking review as ${helpful ? "helpful" : "not helpful"}: ${reviewId}`,
    );

    try {
      const review = await this.getReview(reviewId);
      if (!review) {
        throw new Error(`Review ${reviewId} not found`);
      }

      // Update helpfulness counts
      if (helpful) {
        review.helpful++;
      } else {
        review.notHelpful++;
      }

      // Update review
      await this.update(reviewId, {
        helpful: review.helpful,
        notHelpful: review.notHelpful,
      });

      this.emit("review:helpfulness:updated", { reviewId, helpful });
    } catch (error) {
      this.emit("error", `Failed to update helpfulness: ${error}`);
      throw error;
    }
  }

  // Review statistics
  async getReviewStats(pluginId: string): Promise<ReviewStats | null> {
    return this.reviewStats.get(pluginId) || null;
  }

  private async updateReviewStats(pluginId: string): Promise<void> {
    const reviews = this.reviews.get(pluginId) || [];

    if (reviews.length === 0) {
      this.reviewStats.delete(pluginId);
      return;
    }

    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / totalReviews;

    // Calculate rating distribution
    const distribution = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    // Calculate helpfulness stats
    const totalHelpful = reviews.reduce(
      (sum, review) => sum + review.helpful,
      0,
    );
    const totalNotHelpful = reviews.reduce(
      (sum, review) => sum + review.notHelpful,
      0,
    );
    const helpfulnessRate =
      totalHelpful + totalNotHelpful > 0
        ? totalHelpful / (totalHelpful + totalNotHelpful)
        : 0;

    // Calculate recent activity
    const recentReviews = reviews.filter((r) => {
      const daysSinceCreated =
        (Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreated <= 30;
    });

    const stats: ReviewStats = {
      pluginId,
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      distribution,
      helpfulnessRate: Math.round(helpfulnessRate * 100) / 100,
      recentReviews: recentReviews.length,
      verifiedReviews: reviews.filter((r) => r.verified).length,
      lastUpdated: new Date(),
    };

    this.reviewStats.set(pluginId, stats);
  }

  // Review reporting and moderation
  async reportReview(
    reviewId: string,
    reportData: Partial<ReviewReport>,
  ): Promise<ReviewReport> {
    this.emit("info", `Reporting review: ${reviewId}`);

    try {
      const report: ReviewReport = {
        id: this.generateReportId(),
        reviewId,
        reporterId: reportData.reporterId || "",
        reason: reportData.reason || "inappropriate",
        description: reportData.description || "",
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const reports = this.reports.get(reviewId) || [];
      reports.push(report);
      this.reports.set(reviewId, reports);

      this.emit("review:reported", report);
      return report;
    } catch (error) {
      this.emit("error", `Failed to report review: ${error}`);
      throw error;
    }
  }

  async moderateReview(
    reviewId: string,
    action: Partial<ReviewModeration>,
  ): Promise<ReviewModeration> {
    this.emit("info", `Moderating review: ${reviewId}`);

    try {
      const moderation: ReviewModeration = {
        id: this.generateModerationId(),
        reviewId,
        moderatorId: action.moderatorId || "",
        action: action.action || "warning",
        reason: action.reason || "",
        description: action.description || "",
        createdAt: new Date(),
      };

      const moderations = this.moderation.get(reviewId) || [];
      moderations.push(moderation);
      this.moderation.set(reviewId, moderations);

      // Apply moderation action
      if (moderation.action === "hide") {
        const review = await this.getReview(reviewId);
        if (review) {
          await this.update(reviewId, { isPublic: false });
        }
      } else if (moderation.action === "delete") {
        await this.delete(reviewId);
      }

      this.emit("review:moderated", moderation);
      return moderation;
    } catch (error) {
      this.emit("error", `Failed to moderate review: ${error}`);
      throw error;
    }
  }

  // Helper methods
  private applyFilters(
    reviews: PluginReview[],
    filters: ReviewFilters,
  ): PluginReview[] {
    let filtered = [...reviews];

    // Filter by rating
    if (filters.rating) {
      filtered = filtered.filter((review) => review.rating === filters.rating);
    }

    // Filter by verified status
    if (filters.verified !== undefined) {
      filtered = filtered.filter(
        (review) => review.verified === filters.verified,
      );
    }

    // Filter by helpfulness
    if (filters.helpfulOnly) {
      filtered = filtered.filter(
        (review) => review.helpful > review.notHelpful,
      );
    }

    // Filter by date range
    if (filters.dateFrom) {
      filtered = filtered.filter(
        (review) => new Date(review.createdAt) >= new Date(filters.dateFrom!),
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(
        (review) => new Date(review.createdAt) <= new Date(filters.dateTo!),
      );
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((review) =>
        filters.tags!.some((tag) => review.tags.includes(tag)),
      );
    }

    return filtered;
  }

  private sortReviews(
    reviews: PluginReview[],
    sortBy: string,
    sortOrder: "asc" | "desc" = "desc",
  ): PluginReview[] {
    return reviews.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "rating":
          comparison = a.rating - b.rating;
          break;
        case "helpful":
          comparison = a.helpful - b.helpful;
          break;
        case "relevance":
          // Relevance would be calculated based on search query
          comparison = 0;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }

  // Utility methods
  private generateReviewId(): string {
    return `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateModerationId(): string {
    return `moderation_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  // Analytics
  async getReviewAnalytics(pluginId?: string): Promise<any> {
    if (pluginId) {
      const stats = this.reviewStats.get(pluginId);
      return stats ? { [pluginId]: stats } : {};
    }

    // Return analytics for all plugins
    const analytics: any = {};
    for (const [id, stats] of this.reviewStats) {
      analytics[id] = stats;
    }
    return analytics;
  }

  getStatus(): any {
    return {
      initialized: this.initialized,
      totalReviews: Array.from(this.reviews.values()).reduce(
        (sum, reviews) => sum + reviews.length,
        0,
      ),
      totalStats: this.reviewStats.size,
      totalReports: Array.from(this.reports.values()).reduce(
        (sum, reports) => sum + reports.length,
        0,
      ),
      totalModerations: Array.from(this.moderation.values()).reduce(
        (sum, moderations) => sum + moderations.length,
        0,
      ),
    };
  }

  async destroy(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    this.emit("info", "Destroying Review System Manager...");

    try {
      // Clear all data
      this.reviews.clear();
      this.reviewStats.clear();
      this.helpfulness.clear();
      this.reports.clear();
      this.moderation.clear();

      this.initialized = false;
      this.emit("destroyed");
      this.emit("info", "Review System Manager destroyed successfully");
    } catch (error) {
      this.emit("error", `Failed to destroy review system: ${error}`);
      throw error;
    }
  }
}
