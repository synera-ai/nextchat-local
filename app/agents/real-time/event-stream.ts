import { EventEmitter } from "events";

export interface EventStreamConfig {
  maxSubscribers: number;
  eventTTL: number;
  batchSize: number;
  processingInterval: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  persistenceEnabled: boolean;
  maxEventHistory: number;
  cleanupInterval: number;
}

export interface StreamEvent {
  id: string;
  type: string;
  data: any;
  timestamp: Date;
  source: string;
  metadata: EventMetadata;
  ttl?: number;
  priority: number;
}

export interface EventMetadata {
  correlationId?: string;
  causationId?: string;
  tags: string[];
  version: string;
  schema: string;
  headers: Record<string, any>;
  compression?: boolean;
  encryption?: boolean;
  checksum?: string;
}

export interface EventSubscriber {
  id: string;
  name: string;
  filters: EventFilter[];
  handler: (event: StreamEvent) => Promise<void>;
  enabled: boolean;
  subscribedAt: Date;
  lastActivity: Date;
  metadata: SubscriberMetadata;
}

export interface EventFilter {
  type?: string;
  source?: string;
  tags?: string[];
  priority?: number;
  custom?: (event: StreamEvent) => boolean;
}

export interface SubscriberMetadata {
  userId?: string;
  sessionId?: string;
  connectionId?: string;
  subscriptionType: "real-time" | "batch" | "historical";
  batchSize?: number;
  timeout?: number;
  retryOnFailure?: boolean;
  maxRetries?: number;
}

export interface StreamStats {
  totalEvents: number;
  activeSubscribers: number;
  eventsPerSecond: number;
  averageLatency: number;
  errorRate: number;
  throughput: number;
  queueDepth: number;
  oldestEvent?: Date;
  newestEvent?: Date;
}

export interface StreamMetrics {
  publishRate: number;
  subscribeRate: number;
  deliveryRate: number;
  failureRate: number;
  averageDeliveryTime: number;
  peakThroughput: number;
  peakLatency: number;
  totalSubscribers: number;
  activeSubscribers: number;
}

export class EventStream extends EventEmitter {
  private config: EventStreamConfig;
  private subscribers: Map<string, EventSubscriber> = new Map();
  private eventHistory: StreamEvent[] = [];
  private eventQueue: StreamEvent[] = [];
  private processing: boolean = false;
  private stats: StreamStats;
  private metrics: StreamMetrics;
  private processingTimer?: NodeJS.Timeout;
  private cleanupTimer?: NodeJS.Timeout;
  private isRunning = false;

  constructor(config?: Partial<EventStreamConfig>) {
    super();
    this.config = {
      maxSubscribers: 1000,
      eventTTL: 300000, // 5 minutes
      batchSize: 100,
      processingInterval: 50,
      compressionEnabled: false,
      encryptionEnabled: false,
      persistenceEnabled: false,
      maxEventHistory: 10000,
      cleanupInterval: 60000, // 1 minute
      ...config,
    };

    this.stats = this.initializeStats();
    this.metrics = this.initializeMetrics();
  }

  private initializeStats(): StreamStats {
    return {
      totalEvents: 0,
      activeSubscribers: 0,
      eventsPerSecond: 0,
      averageLatency: 0,
      errorRate: 0,
      throughput: 0,
      queueDepth: 0,
    };
  }

  private initializeMetrics(): StreamMetrics {
    return {
      publishRate: 0,
      subscribeRate: 0,
      deliveryRate: 0,
      failureRate: 0,
      averageDeliveryTime: 0,
      peakThroughput: 0,
      peakLatency: 0,
      totalSubscribers: 0,
      activeSubscribers: 0,
    };
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error("Event stream is already running");
    }

    try {
      // Start processing timer
      this.processingTimer = setInterval(() => {
        this.processEvents();
      }, this.config.processingInterval);

      // Start cleanup timer
      this.cleanupTimer = setInterval(() => {
        this.cleanupExpiredEvents();
      }, this.config.cleanupInterval);

      this.isRunning = true;
      this.emit("streamStarted");
    } catch (error) {
      this.emit("streamError", { error });
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      // Stop timers
      if (this.processingTimer) {
        clearInterval(this.processingTimer);
        this.processingTimer = undefined;
      }

      if (this.cleanupTimer) {
        clearInterval(this.cleanupTimer);
        this.cleanupTimer = undefined;
      }

      // Wait for processing to complete
      await this.waitForProcessingComplete();

      this.isRunning = false;
      this.emit("streamStopped");
    } catch (error) {
      this.emit("streamError", { error });
      throw error;
    }
  }

  async publish(event: Omit<StreamEvent, "id" | "timestamp">): Promise<string> {
    try {
      // Check subscriber limit
      if (this.subscribers.size >= this.config.maxSubscribers) {
        throw new Error("Maximum number of subscribers reached");
      }

      // Create stream event
      const streamEvent: StreamEvent = {
        id: this.generateEventId(),
        timestamp: new Date(),
        ...event,
      };

      // Add to queue
      this.eventQueue.push(streamEvent);

      // Add to history
      this.eventHistory.push(streamEvent);
      if (this.eventHistory.length > this.config.maxEventHistory) {
        this.eventHistory.shift();
      }

      // Update stats
      this.updateStats("published");
      this.updateMetrics("published");

      this.emit("eventPublished", { event: streamEvent });
      return streamEvent.id;
    } catch (error) {
      this.emit("publishError", { error });
      throw error;
    }
  }

  async subscribe(
    subscriber: Omit<EventSubscriber, "id" | "subscribedAt" | "lastActivity">,
  ): Promise<string> {
    try {
      // Check subscriber limit
      if (this.subscribers.size >= this.config.maxSubscribers) {
        throw new Error("Maximum number of subscribers reached");
      }

      // Create subscriber
      const eventSubscriber: EventSubscriber = {
        id: this.generateSubscriberId(),
        subscribedAt: new Date(),
        lastActivity: new Date(),
        ...subscriber,
      };

      // Store subscriber
      this.subscribers.set(eventSubscriber.id, eventSubscriber);

      // Update stats
      this.updateStats("subscribed");
      this.updateMetrics("subscribed");

      this.emit("subscriberAdded", { subscriber: eventSubscriber });
      return eventSubscriber.id;
    } catch (error) {
      this.emit("subscribeError", { error });
      throw error;
    }
  }

  async unsubscribe(subscriberId: string): Promise<boolean> {
    try {
      const subscriber = this.subscribers.get(subscriberId);
      if (!subscriber) {
        return false;
      }

      this.subscribers.delete(subscriberId);

      // Update stats
      this.updateStats("unsubscribed");
      this.updateMetrics("unsubscribed");

      this.emit("subscriberRemoved", { subscriberId, subscriber });
      return true;
    } catch (error) {
      this.emit("unsubscribeError", { error });
      throw error;
    }
  }

  async getEvent(eventId: string): Promise<StreamEvent | null> {
    return this.eventHistory.find((event) => event.id === eventId) || null;
  }

  async getEvents(
    filter?: EventFilter,
    limit?: number,
  ): Promise<StreamEvent[]> {
    let events = this.eventHistory;

    if (filter) {
      events = events.filter((event) => this.matchesFilter(event, filter));
    }

    if (limit) {
      events = events.slice(-limit);
    }

    return events;
  }

  async getSubscriber(subscriberId: string): Promise<EventSubscriber | null> {
    return this.subscribers.get(subscriberId) || null;
  }

  async getAllSubscribers(): Promise<EventSubscriber[]> {
    return Array.from(this.subscribers.values());
  }

  async getSubscribersByFilter(
    filter: EventFilter,
  ): Promise<EventSubscriber[]> {
    return Array.from(this.subscribers.values()).filter(
      (subscriber) =>
        subscriber.enabled && this.subscriberMatchesFilter(subscriber, filter),
    );
  }

  private async processEvents(): Promise<void> {
    if (this.processing || this.eventQueue.length === 0) {
      return;
    }

    this.processing = true;

    try {
      // Process batch of events
      const events = this.eventQueue.splice(0, this.config.batchSize);

      for (const event of events) {
        await this.deliverEvent(event);
      }
    } catch (error) {
      this.emit("processingError", { error });
    } finally {
      this.processing = false;
    }
  }

  private async deliverEvent(event: StreamEvent): Promise<void> {
    const startTime = Date.now();

    try {
      // Find matching subscribers
      const matchingSubscribers = this.findMatchingSubscribers(event);

      if (matchingSubscribers.length === 0) {
        this.emit("noSubscribers", { event });
        return;
      }

      // Deliver to subscribers
      const deliveryPromises = matchingSubscribers.map((subscriber) =>
        this.deliverToSubscriber(subscriber, event),
      );

      await Promise.allSettled(deliveryPromises);

      // Update stats
      const deliveryTime = Date.now() - startTime;
      this.updateStats("delivered", matchingSubscribers.length, deliveryTime);
      this.updateMetrics("delivered", matchingSubscribers.length, deliveryTime);

      this.emit("eventDelivered", {
        event,
        subscriberCount: matchingSubscribers.length,
        deliveryTime,
      });
    } catch (error) {
      this.updateStats("deliveryError");
      this.updateMetrics("deliveryError");
      this.emit("deliveryError", { event, error });
    }
  }

  private async deliverToSubscriber(
    subscriber: EventSubscriber,
    event: StreamEvent,
  ): Promise<void> {
    try {
      // Update subscriber activity
      subscriber.lastActivity = new Date();

      // Set timeout
      const timeoutId = setTimeout(() => {
        this.emit("subscriberTimeout", { subscriber, event });
      }, subscriber.metadata.timeout || 30000);

      // Deliver event
      await subscriber.handler(event);

      clearTimeout(timeoutId);

      this.emit("eventDeliveredToSubscriber", { subscriber, event });
    } catch (error) {
      this.emit("subscriberError", { subscriber, event, error });

      // Handle retry
      if (subscriber.metadata.retryOnFailure) {
        await this.retryDelivery(subscriber, event);
      }
    }
  }

  private async retryDelivery(
    subscriber: EventSubscriber,
    event: StreamEvent,
  ): Promise<void> {
    try {
      const maxRetries = subscriber.metadata.maxRetries || 3;
      const retryCount = (event.metadata as any).retryCount || 0;

      if (retryCount < maxRetries) {
        // Add retry count to event metadata
        const retryEvent = {
          ...event,
          metadata: {
            ...event.metadata,
            retryCount: retryCount + 1,
          },
        };

        // Re-queue event for retry
        this.eventQueue.push(retryEvent);

        this.emit("deliveryRetried", {
          subscriber,
          event,
          retryCount: retryCount + 1,
        });
      } else {
        this.emit("deliveryFailed", { subscriber, event, retryCount });
      }
    } catch (error) {
      this.emit("retryError", { subscriber, event, error });
    }
  }

  private findMatchingSubscribers(event: StreamEvent): EventSubscriber[] {
    return Array.from(this.subscribers.values()).filter(
      (subscriber) =>
        subscriber.enabled && this.matchesSubscriberFilters(event, subscriber),
    );
  }

  private matchesSubscriberFilters(
    event: StreamEvent,
    subscriber: EventSubscriber,
  ): boolean {
    return subscriber.filters.some((filter) =>
      this.matchesFilter(event, filter),
    );
  }

  private matchesFilter(event: StreamEvent, filter: EventFilter): boolean {
    if (filter.type && event.type !== filter.type) {
      return false;
    }

    if (filter.source && event.source !== filter.source) {
      return false;
    }

    if (filter.tags && filter.tags.length > 0) {
      const hasMatchingTag = filter.tags.some((tag) =>
        event.metadata.tags.includes(tag),
      );
      if (!hasMatchingTag) {
        return false;
      }
    }

    if (filter.priority !== undefined && event.priority !== filter.priority) {
      return false;
    }

    if (filter.custom && !filter.custom(event)) {
      return false;
    }

    return true;
  }

  private subscriberMatchesFilter(
    subscriber: EventSubscriber,
    filter: EventFilter,
  ): boolean {
    // Check if subscriber's filters match the given filter
    return subscriber.filters.some((subFilter) =>
      this.filtersMatch(subFilter, filter),
    );
  }

  private filtersMatch(filter1: EventFilter, filter2: EventFilter): boolean {
    if (filter1.type && filter2.type && filter1.type !== filter2.type) {
      return false;
    }

    if (filter1.source && filter2.source && filter1.source !== filter2.source) {
      return false;
    }

    if (
      filter1.priority !== undefined &&
      filter2.priority !== undefined &&
      filter1.priority !== filter2.priority
    ) {
      return false;
    }

    return true;
  }

  private async cleanupExpiredEvents(): Promise<void> {
    const now = Date.now();
    const ttl = this.config.eventTTL;

    // Clean up event history
    const validEvents = this.eventHistory.filter((event) => {
      const age = now - event.timestamp.getTime();
      return age < (event.ttl || ttl);
    });

    const expiredCount = this.eventHistory.length - validEvents.length;
    if (expiredCount > 0) {
      this.eventHistory = validEvents;
      this.emit("eventsExpired", { count: expiredCount });
    }

    // Clean up event queue
    const validQueueEvents = this.eventQueue.filter((event) => {
      const age = now - event.timestamp.getTime();
      return age < (event.ttl || ttl);
    });

    const expiredQueueCount = this.eventQueue.length - validQueueEvents.length;
    if (expiredQueueCount > 0) {
      this.eventQueue = validQueueEvents;
      this.emit("queueEventsExpired", { count: expiredQueueCount });
    }
  }

  private async waitForProcessingComplete(): Promise<void> {
    const maxWaitTime = 5000; // 5 seconds
    const startTime = Date.now();

    while (this.processing && Date.now() - startTime < maxWaitTime) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  // Statistics and monitoring
  async getStats(): Promise<StreamStats> {
    return { ...this.stats };
  }

  async getMetrics(): Promise<StreamMetrics> {
    return { ...this.metrics };
  }

  async getEventHistory(limit?: number): Promise<StreamEvent[]> {
    if (limit) {
      return this.eventHistory.slice(-limit);
    }
    return [...this.eventHistory];
  }

  async getQueueStatus(): Promise<{ queueSize: number; processing: boolean }> {
    return {
      queueSize: this.eventQueue.length,
      processing: this.processing,
    };
  }

  // Utility methods
  private updateStats(
    action: string,
    count: number = 1,
    latency?: number,
  ): void {
    switch (action) {
      case "published":
        this.stats.totalEvents += count;
        this.stats.queueDepth += count;
        break;
      case "subscribed":
        this.stats.activeSubscribers += count;
        break;
      case "unsubscribed":
        this.stats.activeSubscribers -= count;
        break;
      case "delivered":
        this.stats.queueDepth -= count;
        if (latency) {
          this.stats.averageLatency = (this.stats.averageLatency + latency) / 2;
        }
        break;
      case "deliveryError":
        this.stats.errorRate = (this.stats.errorRate + 1) / 2;
        break;
    }
  }

  private updateMetrics(
    action: string,
    count: number = 1,
    latency?: number,
  ): void {
    switch (action) {
      case "published":
        this.metrics.publishRate = (this.metrics.publishRate + count) / 2;
        break;
      case "subscribed":
        this.metrics.subscribeRate = (this.metrics.subscribeRate + count) / 2;
        this.metrics.totalSubscribers += count;
        this.metrics.activeSubscribers += count;
        break;
      case "unsubscribed":
        this.metrics.activeSubscribers -= count;
        break;
      case "delivered":
        this.metrics.deliveryRate = (this.metrics.deliveryRate + count) / 2;
        if (latency) {
          this.metrics.averageDeliveryTime =
            (this.metrics.averageDeliveryTime + latency) / 2;
        }
        break;
      case "deliveryError":
        this.metrics.failureRate = (this.metrics.failureRate + 1) / 2;
        break;
    }
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSubscriberId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Configuration
  updateConfig(newConfig: Partial<EventStreamConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit("configUpdated", { config: this.config });
  }

  isRunning(): boolean {
    return this.isRunning;
  }
}
