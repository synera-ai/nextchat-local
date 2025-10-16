import { EventEmitter } from "events";

export interface EventHandler {
  id: string;
  handler: (...args: any[]) => void;
  once?: boolean;
  priority?: number;
}

export interface EventMetadata {
  timestamp: Date;
  source: string;
  correlationId?: string;
  tags?: string[];
  version?: string;
}

export interface EventOptions {
  priority?: number;
  timeout?: number;
  retries?: number;
  persistent?: boolean;
  metadata?: Partial<EventMetadata>;
}

export interface EventBusConfig {
  maxListeners: number;
  enableLogging: boolean;
  enableMetrics: boolean;
  enablePersistence: boolean;
  persistenceKey: string;
  cleanupInterval: number;
}

export class EventBus extends EventEmitter {
  private config: EventBusConfig;
  private handlers: Map<string, EventHandler[]> = new Map();
  private eventHistory: Array<{
    event: string;
    data: any;
    metadata: EventMetadata;
  }> = [];
  private metrics: EventMetrics = {
    totalEvents: 0,
    eventsByType: new Map(),
    averageProcessingTime: 0,
    errorRate: 0,
    lastEvent: undefined,
  };
  private isRunning = false;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config?: Partial<EventBusConfig>) {
    super();
    this.config = {
      maxListeners: 1000,
      enableLogging: true,
      enableMetrics: true,
      enablePersistence: false,
      persistenceKey: "eventBus",
      cleanupInterval: 60000, // 1 minute
      ...config,
    };

    this.setupEventHandlers();
    this.loadPersistedData();
  }

  private setupEventHandlers(): void {
    // Set max listeners
    this.setMaxListeners(this.config.maxListeners);

    // Handle new listener events
    this.on("newListener", (event: string) => {
      if (this.config.enableLogging) {
        console.log(`EventBus: New listener added for event "${event}"`);
      }
    });

    // Handle remove listener events
    this.on("removeListener", (event: string) => {
      if (this.config.enableLogging) {
        console.log(`EventBus: Listener removed for event "${event}"`);
      }
    });

    // Handle error events
    this.on("error", (error: Error) => {
      console.error("EventBus: Error occurred:", error);
      this.updateMetrics("error");
    });
  }

  private loadPersistedData(): void {
    if (!this.config.enablePersistence) return;

    try {
      const persisted = localStorage.getItem(this.config.persistenceKey);
      if (persisted) {
        const data = JSON.parse(persisted);
        this.eventHistory = data.eventHistory || [];
        this.metrics = data.metrics || this.metrics;
      }
    } catch (error) {
      console.warn("EventBus: Failed to load persisted data:", error);
    }
  }

  private savePersistedData(): void {
    if (!this.config.enablePersistence) return;

    try {
      const data = {
        eventHistory: this.eventHistory,
        metrics: this.metrics,
      };
      localStorage.setItem(this.config.persistenceKey, JSON.stringify(data));
    } catch (error) {
      console.warn("EventBus: Failed to save persisted data:", error);
    }
  }

  emit(event: string, data?: any, options?: EventOptions): boolean {
    const startTime = Date.now();
    const metadata: EventMetadata = {
      timestamp: new Date(),
      source: options?.metadata?.source || "unknown",
      correlationId: options?.metadata?.correlationId,
      tags: options?.metadata?.tags || [],
      version: options?.metadata?.version || "1.0.0",
    };

    try {
      // Update metrics
      if (this.config.enableMetrics) {
        this.updateMetrics("emit", event);
      }

      // Add to history
      this.eventHistory.push({ event, data, metadata });

      // Emit the event
      const result = super.emit(event, data, metadata);

      // Log if enabled
      if (this.config.enableLogging) {
        console.log(`EventBus: Emitted event "${event}"`, { data, metadata });
      }

      // Save persisted data
      this.savePersistedData();

      return result;
    } catch (error) {
      console.error(`EventBus: Error emitting event "${event}":`, error);
      this.updateMetrics("error");
      throw error;
    } finally {
      // Update processing time
      if (this.config.enableMetrics) {
        const processingTime = Date.now() - startTime;
        this.updateProcessingTime(processingTime);
      }
    }
  }

  on(
    event: string,
    handler: (...args: any[]) => void,
    options?: EventOptions,
  ): this {
    const handlerId = this.generateHandlerId();
    const eventHandler: EventHandler = {
      id: handlerId,
      handler,
      priority: options?.priority || 0,
    };

    // Store handler
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(eventHandler);

    // Sort by priority
    this.handlers
      .get(event)!
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // Add to EventEmitter
    super.on(event, handler);

    if (this.config.enableLogging) {
      console.log(`EventBus: Added handler for event "${event}"`, {
        handlerId,
        priority: eventHandler.priority,
      });
    }

    return this;
  }

  once(
    event: string,
    handler: (...args: any[]) => void,
    options?: EventOptions,
  ): this {
    const handlerId = this.generateHandlerId();
    const eventHandler: EventHandler = {
      id: handlerId,
      handler,
      once: true,
      priority: options?.priority || 0,
    };

    // Store handler
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(eventHandler);

    // Sort by priority
    this.handlers
      .get(event)!
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // Add to EventEmitter
    super.once(event, handler);

    if (this.config.enableLogging) {
      console.log(`EventBus: Added once handler for event "${event}"`, {
        handlerId,
        priority: eventHandler.priority,
      });
    }

    return this;
  }

  off(event: string, handler: (...args: any[]) => void): this {
    // Remove from handlers map
    const handlers = this.handlers.get(event);
    if (handlers) {
      const index = handlers.findIndex((h) => h.handler === handler);
      if (index !== -1) {
        handlers.splice(index, 1);
        if (handlers.length === 0) {
          this.handlers.delete(event);
        }
      }
    }

    // Remove from EventEmitter
    super.off(event, handler);

    if (this.config.enableLogging) {
      console.log(`EventBus: Removed handler for event "${event}"`);
    }

    return this;
  }

  removeAllListeners(event?: string): this {
    if (event) {
      this.handlers.delete(event);
    } else {
      this.handlers.clear();
    }

    super.removeAllListeners(event);

    if (this.config.enableLogging) {
      console.log(
        `EventBus: Removed all listeners${
          event ? ` for event "${event}"` : ""
        }`,
      );
    }

    return this;
  }

  async waitFor(event: string, timeout?: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeoutId = timeout
        ? setTimeout(() => {
            reject(new Error(`Timeout waiting for event "${event}"`));
          }, timeout)
        : undefined;

      this.once(event, (data) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        resolve(data);
      });
    });
  }

  async emitAndWait(
    event: string,
    data?: any,
    responseEvent?: string,
    timeout?: number,
  ): Promise<any> {
    const correlationId = this.generateCorrelationId();
    const responseEventName =
      responseEvent || `${event}:response:${correlationId}`;

    // Emit the event
    this.emit(event, data, {
      metadata: { correlationId },
    });

    // Wait for response
    return this.waitFor(responseEventName, timeout);
  }

  getEventHistory(
    event?: string,
    limit?: number,
  ): Array<{ event: string; data: any; metadata: EventMetadata }> {
    let history = this.eventHistory;

    if (event) {
      history = history.filter((h) => h.event === event);
    }

    if (limit) {
      history = history.slice(-limit);
    }

    return history;
  }

  getMetrics(): EventMetrics {
    return { ...this.metrics };
  }

  getHandlerCount(event?: string): number {
    if (event) {
      return this.handlers.get(event)?.length || 0;
    }

    let total = 0;
    for (const handlers of this.handlers.values()) {
      total += handlers.length;
    }
    return total;
  }

  getEvents(): string[] {
    return Array.from(this.handlers.keys());
  }

  clearHistory(): void {
    this.eventHistory = [];
    this.savePersistedData();
  }

  clearMetrics(): void {
    this.metrics = {
      totalEvents: 0,
      eventsByType: new Map(),
      averageProcessingTime: 0,
      errorRate: 0,
      lastEvent: undefined,
    };
    this.savePersistedData();
  }

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);

    this.emit("eventBus:started");
  }

  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }

    this.emit("eventBus:stopped");
  }

  private cleanup(): void {
    // Clean up old event history
    const maxHistory = 1000;
    if (this.eventHistory.length > maxHistory) {
      this.eventHistory = this.eventHistory.slice(-maxHistory);
    }

    // Save persisted data
    this.savePersistedData();
  }

  private updateMetrics(action: string, event?: string): void {
    this.metrics.totalEvents++;
    this.metrics.lastEvent = new Date();

    if (event) {
      const count = this.metrics.eventsByType.get(event) || 0;
      this.metrics.eventsByType.set(event, count + 1);
    }

    if (action === "error") {
      this.metrics.errorRate = (this.metrics.errorRate + 1) / 2;
    }
  }

  private updateProcessingTime(time: number): void {
    this.metrics.averageProcessingTime =
      (this.metrics.averageProcessingTime + time) / 2;
  }

  private generateHandlerId(): string {
    return `handler_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Configuration
  updateConfig(newConfig: Partial<EventBusConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.setMaxListeners(this.config.maxListeners);
  }

  getConfig(): EventBusConfig {
    return { ...this.config };
  }

  getIsRunning(): boolean {
    return this.isRunning;
  }
}

export interface EventMetrics {
  totalEvents: number;
  eventsByType: Map<string, number>;
  averageProcessingTime: number;
  errorRate: number;
  lastEvent?: Date;
}

// Create and export a default instance
export const eventBus = new EventBus();
