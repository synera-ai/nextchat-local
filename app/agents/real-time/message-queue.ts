import { EventEmitter } from "events";

export interface MessageQueueConfig {
  maxQueueSize: number;
  messageTTL: number;
  retryAttempts: number;
  retryDelay: number;
  batchSize: number;
  processingInterval: number;
  priorityLevels: number;
  persistenceEnabled: boolean;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
}

export interface QueuedMessage {
  id: string;
  type: string;
  payload: any;
  priority: number;
  timestamp: Date;
  ttl: number;
  retryCount: number;
  maxRetries: number;
  senderId?: string;
  recipientId?: string;
  correlationId?: string;
  replyTo?: string;
  metadata: MessageMetadata;
}

export interface MessageMetadata {
  tags: string[];
  source: string;
  destination: string;
  routingKey?: string;
  exchange?: string;
  headers: Record<string, any>;
  compression?: boolean;
  encryption?: boolean;
  checksum?: string;
}

export interface MessageHandler {
  id: string;
  type: string;
  handler: (message: QueuedMessage) => Promise<void>;
  priority: number;
  enabled: boolean;
  retryOnFailure: boolean;
  timeout: number;
}

export interface QueueStats {
  totalMessages: number;
  queuedMessages: number;
  processedMessages: number;
  failedMessages: number;
  averageProcessingTime: number;
  messagesPerSecond: number;
  queueSize: number;
  oldestMessage?: Date;
  newestMessage?: Date;
  errorRate: number;
  retryRate: number;
}

export interface QueueMetrics {
  throughput: number;
  latency: number;
  errorRate: number;
  retryRate: number;
  queueDepth: number;
  processingRate: number;
  averageWaitTime: number;
  peakThroughput: number;
  peakLatency: number;
}

export class MessageQueue extends EventEmitter {
  private config: MessageQueueConfig;
  private queues: Map<string, QueuedMessage[]> = new Map();
  private handlers: Map<string, MessageHandler[]> = new Map();
  private processing: Map<string, boolean> = new Map();
  private stats: Map<string, QueueStats> = new Map();
  private metrics: Map<string, QueueMetrics> = new Map();
  private processingTimer?: NodeJS.Timeout;
  private cleanupTimer?: NodeJS.Timeout;
  private isRunning = false;

  constructor(config?: Partial<MessageQueueConfig>) {
    super();
    this.config = {
      maxQueueSize: 10000,
      messageTTL: 300000, // 5 minutes
      retryAttempts: 3,
      retryDelay: 1000,
      batchSize: 10,
      processingInterval: 100,
      priorityLevels: 5,
      persistenceEnabled: false,
      compressionEnabled: false,
      encryptionEnabled: false,
      ...config,
    };
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error("Message queue is already running");
    }

    try {
      // Start processing timer
      this.processingTimer = setInterval(() => {
        this.processQueues();
      }, this.config.processingInterval);

      // Start cleanup timer
      this.cleanupTimer = setInterval(() => {
        this.cleanupExpiredMessages();
      }, this.config.messageTTL / 2);

      this.isRunning = true;
      this.emit("queueStarted");
    } catch (error) {
      this.emit("queueError", { error });
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
      this.emit("queueStopped");
    } catch (error) {
      this.emit("queueError", { error });
      throw error;
    }
  }

  async enqueue(
    queueName: string,
    message: Omit<QueuedMessage, "id" | "timestamp" | "retryCount">,
  ): Promise<string> {
    try {
      // Check queue size limit
      const queue = this.queues.get(queueName) || [];
      if (queue.length >= this.config.maxQueueSize) {
        throw new Error(`Queue ${queueName} is full`);
      }

      // Create queued message
      const queuedMessage: QueuedMessage = {
        id: this.generateMessageId(),
        timestamp: new Date(),
        retryCount: 0,
        ...message,
      };

      // Add to queue
      this.queues.set(queueName, [...queue, queuedMessage]);

      // Update stats
      this.updateStats(queueName, "enqueued");

      this.emit("messageEnqueued", { queueName, message: queuedMessage });
      return queuedMessage.id;
    } catch (error) {
      this.emit("enqueueError", { queueName, error });
      throw error;
    }
  }

  async dequeue(
    queueName: string,
    count: number = 1,
  ): Promise<QueuedMessage[]> {
    try {
      const queue = this.queues.get(queueName) || [];
      if (queue.length === 0) {
        return [];
      }

      // Sort by priority and timestamp
      const sortedQueue = queue.sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority; // Higher priority first
        }
        return a.timestamp.getTime() - b.timestamp.getTime(); // Older first
      });

      // Take messages
      const messages = sortedQueue.splice(0, count);
      this.queues.set(queueName, sortedQueue);

      // Update stats
      this.updateStats(queueName, "dequeued", messages.length);

      this.emit("messagesDequeued", { queueName, messages });
      return messages;
    } catch (error) {
      this.emit("dequeueError", { queueName, error });
      throw error;
    }
  }

  async registerHandler(handler: MessageHandler): Promise<void> {
    try {
      const handlers = this.handlers.get(handler.type) || [];
      handlers.push(handler);
      this.handlers.set(handler.type, handlers);

      this.emit("handlerRegistered", { handler });
    } catch (error) {
      this.emit("handlerRegistrationError", { handler, error });
      throw error;
    }
  }

  async unregisterHandler(handlerId: string): Promise<boolean> {
    try {
      for (const [type, handlers] of this.handlers) {
        const index = handlers.findIndex((h) => h.id === handlerId);
        if (index !== -1) {
          handlers.splice(index, 1);
          this.handlers.set(type, handlers);
          this.emit("handlerUnregistered", { handlerId, type });
          return true;
        }
      }
      return false;
    } catch (error) {
      this.emit("handlerUnregistrationError", { handlerId, error });
      throw error;
    }
  }

  async processMessage(message: QueuedMessage): Promise<void> {
    try {
      const handlers = this.handlers.get(message.type) || [];
      if (handlers.length === 0) {
        this.emit("noHandlerFound", { message });
        return;
      }

      // Find the best handler
      const handler = this.selectHandler(handlers, message);
      if (!handler) {
        this.emit("noSuitableHandler", { message });
        return;
      }

      // Process message
      await this.executeHandler(handler, message);
    } catch (error) {
      this.emit("messageProcessingError", { message, error });
      throw error;
    }
  }

  private async executeHandler(
    handler: MessageHandler,
    message: QueuedMessage,
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // Set timeout
      const timeoutId = setTimeout(() => {
        this.emit("handlerTimeout", { handler, message });
      }, handler.timeout);

      // Execute handler
      await handler.handler(message);

      clearTimeout(timeoutId);

      // Update stats
      this.updateStats(message.type, "processed", 1, Date.now() - startTime);

      this.emit("messageProcessed", {
        message,
        handler,
        duration: Date.now() - startTime,
      });
    } catch (error) {
      this.updateStats(message.type, "failed", 1, Date.now() - startTime);

      // Handle retry
      if (handler.retryOnFailure && message.retryCount < message.maxRetries) {
        await this.retryMessage(message);
      } else {
        this.emit("messageFailed", { message, handler, error });
      }
    }
  }

  private async retryMessage(message: QueuedMessage): Promise<void> {
    try {
      message.retryCount++;

      // Add delay before retry
      await new Promise((resolve) =>
        setTimeout(resolve, this.config.retryDelay * message.retryCount),
      );

      // Re-enqueue message
      const queueName = this.getQueueNameForMessage(message);
      await this.enqueue(queueName, message);

      this.emit("messageRetried", { message });
    } catch (error) {
      this.emit("messageRetryError", { message, error });
    }
  }

  private selectHandler(
    handlers: MessageHandler[],
    message: QueuedMessage,
  ): MessageHandler | null {
    // Filter enabled handlers
    const enabledHandlers = handlers.filter((h) => h.enabled);
    if (enabledHandlers.length === 0) {
      return null;
    }

    // Sort by priority
    enabledHandlers.sort((a, b) => b.priority - a.priority);

    // Return highest priority handler
    return enabledHandlers[0];
  }

  private async processQueues(): Promise<void> {
    for (const [queueName, queue] of this.queues) {
      if (queue.length === 0 || this.processing.get(queueName)) {
        continue;
      }

      this.processing.set(queueName, true);

      try {
        // Process batch of messages
        const messages = await this.dequeue(queueName, this.config.batchSize);

        for (const message of messages) {
          await this.processMessage(message);
        }
      } catch (error) {
        this.emit("queueProcessingError", { queueName, error });
      } finally {
        this.processing.set(queueName, false);
      }
    }
  }

  private async cleanupExpiredMessages(): Promise<void> {
    const now = Date.now();

    for (const [queueName, queue] of this.queues) {
      const validMessages = queue.filter((message) => {
        const age = now - message.timestamp.getTime();
        return age < message.ttl;
      });

      const expiredCount = queue.length - validMessages.length;
      if (expiredCount > 0) {
        this.queues.set(queueName, validMessages);
        this.updateStats(queueName, "expired", expiredCount);
        this.emit("messagesExpired", { queueName, count: expiredCount });
      }
    }
  }

  private async waitForProcessingComplete(): Promise<void> {
    const maxWaitTime = 5000; // 5 seconds
    const startTime = Date.now();

    while (this.processing.size > 0 && Date.now() - startTime < maxWaitTime) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  // Queue management
  async createQueue(queueName: string): Promise<void> {
    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
      this.stats.set(queueName, this.initializeQueueStats());
      this.metrics.set(queueName, this.initializeQueueMetrics());
      this.emit("queueCreated", { queueName });
    }
  }

  async deleteQueue(queueName: string): Promise<boolean> {
    const deleted = this.queues.delete(queueName);
    if (deleted) {
      this.stats.delete(queueName);
      this.metrics.delete(queueName);
      this.emit("queueDeleted", { queueName });
    }
    return deleted;
  }

  async getQueueSize(queueName: string): Promise<number> {
    const queue = this.queues.get(queueName) || [];
    return queue.length;
  }

  async getAllQueues(): Promise<string[]> {
    return Array.from(this.queues.keys());
  }

  // Statistics and monitoring
  async getStats(
    queueName?: string,
  ): Promise<QueueStats | Map<string, QueueStats>> {
    if (queueName) {
      return this.stats.get(queueName) || this.initializeQueueStats();
    }
    return new Map(this.stats);
  }

  async getMetrics(
    queueName?: string,
  ): Promise<QueueMetrics | Map<string, QueueMetrics>> {
    if (queueName) {
      return this.metrics.get(queueName) || this.initializeQueueMetrics();
    }
    return new Map(this.metrics);
  }

  async getQueueInfo(queueName: string): Promise<any> {
    const queue = this.queues.get(queueName) || [];
    const stats = this.stats.get(queueName) || this.initializeQueueStats();
    const metrics =
      this.metrics.get(queueName) || this.initializeQueueMetrics();

    return {
      name: queueName,
      size: queue.length,
      stats,
      metrics,
      oldestMessage: queue.length > 0 ? queue[0].timestamp : null,
      newestMessage:
        queue.length > 0 ? queue[queue.length - 1].timestamp : null,
    };
  }

  // Message management
  async getMessage(messageId: string): Promise<QueuedMessage | null> {
    for (const queue of this.queues.values()) {
      const message = queue.find((m) => m.id === messageId);
      if (message) {
        return message;
      }
    }
    return null;
  }

  async removeMessage(messageId: string): Promise<boolean> {
    for (const [queueName, queue] of this.queues) {
      const index = queue.findIndex((m) => m.id === messageId);
      if (index !== -1) {
        queue.splice(index, 1);
        this.queues.set(queueName, queue);
        this.emit("messageRemoved", { messageId, queueName });
        return true;
      }
    }
    return false;
  }

  async clearQueue(queueName: string): Promise<number> {
    const queue = this.queues.get(queueName) || [];
    const count = queue.length;

    if (count > 0) {
      this.queues.set(queueName, []);
      this.emit("queueCleared", { queueName, count });
    }

    return count;
  }

  // Utility methods
  private initializeQueueStats(): QueueStats {
    return {
      totalMessages: 0,
      queuedMessages: 0,
      processedMessages: 0,
      failedMessages: 0,
      averageProcessingTime: 0,
      messagesPerSecond: 0,
      queueSize: 0,
      errorRate: 0,
      retryRate: 0,
    };
  }

  private initializeQueueMetrics(): QueueMetrics {
    return {
      throughput: 0,
      latency: 0,
      errorRate: 0,
      retryRate: 0,
      queueDepth: 0,
      processingRate: 0,
      averageWaitTime: 0,
      peakThroughput: 0,
      peakLatency: 0,
    };
  }

  private updateStats(
    queueName: string,
    action: string,
    count: number = 1,
    processingTime?: number,
  ): void {
    const stats = this.stats.get(queueName) || this.initializeQueueStats();

    switch (action) {
      case "enqueued":
        stats.totalMessages += count;
        stats.queuedMessages += count;
        stats.queueSize += count;
        break;
      case "dequeued":
        stats.queuedMessages -= count;
        stats.queueSize -= count;
        break;
      case "processed":
        stats.processedMessages += count;
        if (processingTime) {
          stats.averageProcessingTime =
            (stats.averageProcessingTime + processingTime) / 2;
        }
        break;
      case "failed":
        stats.failedMessages += count;
        break;
      case "expired":
        stats.queuedMessages -= count;
        stats.queueSize -= count;
        break;
    }

    // Calculate derived stats
    stats.errorRate =
      stats.totalMessages > 0 ? stats.failedMessages / stats.totalMessages : 0;
    stats.retryRate =
      stats.totalMessages > 0
        ? (stats.totalMessages -
            stats.processedMessages -
            stats.failedMessages) /
          stats.totalMessages
        : 0;

    this.stats.set(queueName, stats);
  }

  private getQueueNameForMessage(message: QueuedMessage): string {
    // Simple queue name generation - in a real implementation, this would be more sophisticated
    return message.type;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Configuration
  updateConfig(newConfig: Partial<MessageQueueConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit("configUpdated", { config: this.config });
  }

  isRunning(): boolean {
    return this.isRunning;
  }
}
