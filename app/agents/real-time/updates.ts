import { EventEmitter } from "events";
import { WebSocketManager, MessageType } from "./websocket";
import { MessageQueue } from "./message-queue";
import { EventStream, StreamEvent, EventFilter } from "./event-stream";

export interface RealTimeUpdateConfig {
  websocket: {
    port: number;
    host: string;
    path: string;
    maxConnections: number;
    heartbeatInterval: number;
    heartbeatTimeout: number;
    messageTimeout: number;
    compressionEnabled: boolean;
    authenticationRequired: boolean;
    corsOrigins: string[];
  };
  messageQueue: {
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
  };
  eventStream: {
    maxSubscribers: number;
    eventTTL: number;
    batchSize: number;
    processingInterval: number;
    compressionEnabled: boolean;
    encryptionEnabled: boolean;
    persistenceEnabled: boolean;
    maxEventHistory: number;
    cleanupInterval: number;
  };
  updates: {
    enableRealTimeUpdates: boolean;
    enableBatchUpdates: boolean;
    enableHistoricalUpdates: boolean;
    updateInterval: number;
    maxUpdateSize: number;
    compressionEnabled: boolean;
    encryptionEnabled: boolean;
  };
}

export interface UpdateMessage {
  id: string;
  type: UpdateType;
  payload: any;
  timestamp: Date;
  source: string;
  target: UpdateTarget;
  metadata: UpdateMetadata;
}

export interface UpdateTarget {
  type: "user" | "session" | "connection" | "broadcast" | "filtered";
  id?: string;
  filter?: EventFilter;
  tags?: string[];
}

export interface UpdateMetadata {
  priority: "low" | "normal" | "high" | "critical";
  ttl?: number;
  retryCount?: number;
  maxRetries?: number;
  correlationId?: string;
  tags: string[];
  compression?: boolean;
  encryption?: boolean;
  checksum?: string;
}

export enum UpdateType {
  AGENT_STATUS = "agent_status",
  AGENT_PROGRESS = "agent_progress",
  AGENT_RESULT = "agent_result",
  AGENT_ERROR = "agent_error",
  SYSTEM_NOTIFICATION = "system_notification",
  USER_NOTIFICATION = "user_notification",
  DATA_UPDATE = "data_update",
  CONFIGURATION_UPDATE = "configuration_update",
  PERFORMANCE_UPDATE = "performance_update",
  CUSTOM = "custom",
}

export interface UpdateStats {
  totalUpdates: number;
  successfulUpdates: number;
  failedUpdates: number;
  averageLatency: number;
  updatesPerSecond: number;
  errorRate: number;
  retryRate: number;
  queueDepth: number;
  activeConnections: number;
  activeSubscribers: number;
}

export interface UpdateMetrics {
  throughput: number;
  latency: number;
  errorRate: number;
  retryRate: number;
  deliveryRate: number;
  peakThroughput: number;
  peakLatency: number;
  averageUpdateSize: number;
  compressionRatio: number;
}

export class RealTimeUpdates extends EventEmitter {
  private config: RealTimeUpdateConfig;
  private websocket: WebSocketManager;
  private messageQueue: MessageQueue;
  private eventStream: EventStream;
  private stats: UpdateStats;
  private metrics: UpdateMetrics;
  private isRunning = false;

  constructor(config?: Partial<RealTimeUpdateConfig>) {
    super();
    this.config = {
      websocket: {
        port: 8080,
        host: "localhost",
        path: "/ws",
        maxConnections: 1000,
        heartbeatInterval: 30000,
        heartbeatTimeout: 60000,
        messageTimeout: 30000,
        compressionEnabled: true,
        authenticationRequired: false,
        corsOrigins: ["*"],
      },
      messageQueue: {
        maxQueueSize: 10000,
        messageTTL: 300000,
        retryAttempts: 3,
        retryDelay: 1000,
        batchSize: 10,
        processingInterval: 100,
        priorityLevels: 5,
        persistenceEnabled: false,
        compressionEnabled: false,
        encryptionEnabled: false,
      },
      eventStream: {
        maxSubscribers: 1000,
        eventTTL: 300000,
        batchSize: 100,
        processingInterval: 50,
        compressionEnabled: false,
        encryptionEnabled: false,
        persistenceEnabled: false,
        maxEventHistory: 10000,
        cleanupInterval: 60000,
      },
      updates: {
        enableRealTimeUpdates: true,
        enableBatchUpdates: true,
        enableHistoricalUpdates: true,
        updateInterval: 1000,
        maxUpdateSize: 1024 * 1024, // 1MB
        compressionEnabled: true,
        encryptionEnabled: false,
      },
      ...config,
    };

    // Initialize components
    this.websocket = new WebSocketManager(this.config.websocket);
    this.messageQueue = new MessageQueue(this.config.messageQueue);
    this.eventStream = new EventStream(this.config.eventStream);

    this.stats = this.initializeStats();
    this.metrics = this.initializeMetrics();

    this.setupEventForwarding();
  }

  private initializeStats(): UpdateStats {
    return {
      totalUpdates: 0,
      successfulUpdates: 0,
      failedUpdates: 0,
      averageLatency: 0,
      updatesPerSecond: 0,
      errorRate: 0,
      retryRate: 0,
      queueDepth: 0,
      activeConnections: 0,
      activeSubscribers: 0,
    };
  }

  private initializeMetrics(): UpdateMetrics {
    return {
      throughput: 0,
      latency: 0,
      errorRate: 0,
      retryRate: 0,
      deliveryRate: 0,
      peakThroughput: 0,
      peakLatency: 0,
      averageUpdateSize: 0,
      compressionRatio: 0,
    };
  }

  private setupEventForwarding(): void {
    // Forward events from components
    this.websocket.on("*", (event, ...args) => {
      this.emit(`websocket:${event}`, ...args);
    });

    this.messageQueue.on("*", (event, ...args) => {
      this.emit(`messageQueue:${event}`, ...args);
    });

    this.eventStream.on("*", (event, ...args) => {
      this.emit(`eventStream:${event}`, ...args);
    });

    // Set up cross-component communication
    this.setupCrossComponentCommunication();
  }

  private setupCrossComponentCommunication(): void {
    // WebSocket to MessageQueue
    this.websocket.on("messageReceived", (data) => {
      this.messageQueue.enqueue("websocket", {
        type: "websocket_message",
        payload: data.message,
        priority: 3,
        ttl: this.config.messageQueue.messageTTL,
        maxRetries: this.config.messageQueue.retryAttempts,
        senderId: data.connectionId,
        metadata: {
          tags: ["websocket", "incoming"],
          source: "websocket",
          destination: "messageQueue",
          headers: {},
        },
      });
    });

    // MessageQueue to EventStream
    this.messageQueue.on("messageProcessed", (data) => {
      this.eventStream.publish({
        type: "message_processed",
        data: data.message,
        source: "messageQueue",
        metadata: {
          tags: ["messageQueue", "processed"],
          version: "1.0",
          schema: "message",
          headers: {},
        },
        priority: 2,
      });
    });

    // EventStream to WebSocket
    this.eventStream.on("eventPublished", (data) => {
      this.broadcastUpdate({
        type: UpdateType.DATA_UPDATE,
        payload: data.event,
        source: "eventStream",
        target: { type: "broadcast" },
        metadata: {
          priority: "normal",
          tags: ["eventStream", "broadcast"],
        },
      });
    });
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error("Real-time updates system is already running");
    }

    try {
      // Start components
      await this.websocket.start();
      await this.messageQueue.start();
      await this.eventStream.start();

      this.isRunning = true;
      this.emit("systemStarted");
    } catch (error) {
      this.emit("systemError", { error });
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      // Stop components
      await this.websocket.stop();
      await this.messageQueue.stop();
      await this.eventStream.stop();

      this.isRunning = false;
      this.emit("systemStopped");
    } catch (error) {
      this.emit("systemError", { error });
      throw error;
    }
  }

  async sendUpdate(
    update: Omit<UpdateMessage, "id" | "timestamp">,
  ): Promise<string> {
    try {
      const updateMessage: UpdateMessage = {
        id: this.generateUpdateId(),
        timestamp: new Date(),
        ...update,
      };

      // Send via appropriate channel
      switch (update.target.type) {
        case "user":
          await this.sendToUser(update.target.id!, updateMessage);
          break;
        case "session":
          await this.sendToSession(update.target.id!, updateMessage);
          break;
        case "connection":
          await this.sendToConnection(update.target.id!, updateMessage);
          break;
        case "broadcast":
          await this.broadcastUpdate(updateMessage);
          break;
        case "filtered":
          await this.sendToFiltered(update.target.filter!, updateMessage);
          break;
      }

      // Update stats
      this.updateStats("sent");

      this.emit("updateSent", { update: updateMessage });
      return updateMessage.id;
    } catch (error) {
      this.updateStats("failed");
      this.emit("updateError", { error });
      throw error;
    }
  }

  async sendToUser(userId: string, update: UpdateMessage): Promise<number> {
    try {
      const sentCount = await this.websocket.sendToUser(userId, {
        type: MessageType.USER_MESSAGE,
        payload: update,
        metadata: {
          priority: update.metadata.priority,
          tags: update.metadata.tags,
        },
      });

      this.emit("updateSentToUser", { userId, update, sentCount });
      return sentCount;
    } catch (error) {
      this.emit("updateError", { userId, error });
      throw error;
    }
  }

  async sendToSession(
    sessionId: string,
    update: UpdateMessage,
  ): Promise<number> {
    try {
      const sentCount = await this.websocket.sendToSession(sessionId, {
        type: MessageType.USER_MESSAGE,
        payload: update,
        metadata: {
          priority: update.metadata.priority,
          tags: update.metadata.tags,
        },
      });

      this.emit("updateSentToSession", { sessionId, update, sentCount });
      return sentCount;
    } catch (error) {
      this.emit("updateError", { sessionId, error });
      throw error;
    }
  }

  async sendToConnection(
    connectionId: string,
    update: UpdateMessage,
  ): Promise<boolean> {
    try {
      const success = await this.websocket.sendMessage(connectionId, {
        type: MessageType.USER_MESSAGE,
        payload: update,
        metadata: {
          priority: update.metadata.priority,
          tags: update.metadata.tags,
        },
      });

      this.emit("updateSentToConnection", { connectionId, update, success });
      return success;
    } catch (error) {
      this.emit("updateError", { connectionId, error });
      throw error;
    }
  }

  async broadcastUpdate(update: UpdateMessage): Promise<number> {
    try {
      const sentCount = await this.websocket.broadcastMessage({
        type: MessageType.SYSTEM_NOTIFICATION,
        payload: update,
        metadata: {
          priority: update.metadata.priority,
          tags: update.metadata.tags,
        },
      });

      this.emit("updateBroadcasted", { update, sentCount });
      return sentCount;
    } catch (error) {
      this.emit("updateError", { error });
      throw error;
    }
  }

  async sendToFiltered(
    filter: EventFilter,
    update: UpdateMessage,
  ): Promise<number> {
    try {
      const subscribers = await this.eventStream.getSubscribersByFilter(filter);
      let sentCount = 0;

      for (const subscriber of subscribers) {
        if (subscriber.metadata.connectionId) {
          const success = await this.sendToConnection(
            subscriber.metadata.connectionId,
            update,
          );
          if (success) sentCount++;
        }
      }

      this.emit("updateSentToFiltered", { filter, update, sentCount });
      return sentCount;
    } catch (error) {
      this.emit("updateError", { filter, error });
      throw error;
    }
  }

  async subscribeToUpdates(
    subscriberId: string,
    filters: EventFilter[],
    handler: (update: UpdateMessage) => Promise<void>,
  ): Promise<string> {
    try {
      const eventSubscriber = await this.eventStream.subscribe({
        name: `Update Subscriber ${subscriberId}`,
        filters,
        handler: async (event: StreamEvent) => {
          const update = event.data as UpdateMessage;
          await handler(update);
        },
        enabled: true,
        metadata: {
          subscriptionType: "real-time",
          timeout: 30000,
          retryOnFailure: true,
          maxRetries: 3,
        },
      });

      this.emit("updateSubscriberAdded", { subscriberId, eventSubscriber });
      return eventSubscriber;
    } catch (error) {
      this.emit("updateError", { subscriberId, error });
      throw error;
    }
  }

  async unsubscribeFromUpdates(subscriberId: string): Promise<boolean> {
    try {
      const success = await this.eventStream.unsubscribe(subscriberId);
      this.emit("updateSubscriberRemoved", { subscriberId, success });
      return success;
    } catch (error) {
      this.emit("updateError", { subscriberId, error });
      throw error;
    }
  }

  async getUpdateHistory(
    filter?: EventFilter,
    limit?: number,
  ): Promise<UpdateMessage[]> {
    try {
      const events = await this.eventStream.getEvents(filter, limit);
      return events.map((event) => event.data as UpdateMessage);
    } catch (error) {
      this.emit("updateError", { error });
      throw error;
    }
  }

  async getConnectionStats(connectionId: string): Promise<any> {
    try {
      const websocketStats =
        await this.websocket.getConnectionStats(connectionId);
      const messageQueueStats = await this.messageQueue.getStats();
      const eventStreamStats = await this.eventStream.getStats();

      return {
        connection: websocketStats,
        messageQueue: messageQueueStats,
        eventStream: eventStreamStats,
      };
    } catch (error) {
      this.emit("updateError", { connectionId, error });
      throw error;
    }
  }

  async getSystemStats(): Promise<UpdateStats> {
    try {
      const websocketStats = await this.websocket.getStats();
      const messageQueueStats = await this.messageQueue.getStats();
      const eventStreamStats = await this.eventStream.getStats();

      this.stats.activeConnections = websocketStats.activeConnections;
      this.stats.activeSubscribers = eventStreamStats.activeSubscribers;
      this.stats.queueDepth = (messageQueueStats as any).queueDepth || 0;

      return { ...this.stats };
    } catch (error) {
      this.emit("updateError", { error });
      throw error;
    }
  }

  async getSystemMetrics(): Promise<UpdateMetrics> {
    try {
      const websocketStats = await this.websocket.getStats();
      const messageQueueStats = await this.messageQueue.getStats();
      const eventStreamStats = await this.eventStream.getStats();

      this.metrics.throughput = websocketStats.messagesPerSecond;
      this.metrics.latency = websocketStats.averageResponseTime;
      this.metrics.deliveryRate = eventStreamStats.eventsPerSecond;

      return { ...this.metrics };
    } catch (error) {
      this.emit("updateError", { error });
      throw error;
    }
  }

  // Utility methods
  private updateStats(
    action: string,
    count: number = 1,
    latency?: number,
  ): void {
    switch (action) {
      case "sent":
        this.stats.totalUpdates += count;
        this.stats.successfulUpdates += count;
        if (latency) {
          this.stats.averageLatency = (this.stats.averageLatency + latency) / 2;
        }
        break;
      case "failed":
        this.stats.failedUpdates += count;
        break;
    }

    // Calculate derived stats
    this.stats.errorRate =
      this.stats.totalUpdates > 0
        ? this.stats.failedUpdates / this.stats.totalUpdates
        : 0;
    this.stats.retryRate =
      this.stats.totalUpdates > 0
        ? (this.stats.totalUpdates -
            this.stats.successfulUpdates -
            this.stats.failedUpdates) /
          this.stats.totalUpdates
        : 0;
  }

  private updateMetrics(
    action: string,
    count: number = 1,
    latency?: number,
  ): void {
    switch (action) {
      case "sent":
        this.metrics.throughput = (this.metrics.throughput + count) / 2;
        if (latency) {
          this.metrics.latency = (this.metrics.latency + latency) / 2;
        }
        break;
      case "failed":
        this.metrics.errorRate = (this.metrics.errorRate + 1) / 2;
        break;
    }
  }

  private generateUpdateId(): string {
    return `upd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Configuration
  updateConfig(newConfig: Partial<RealTimeUpdateConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Update component configs
    this.websocket.updateConfig(newConfig.websocket);
    this.messageQueue.updateConfig(newConfig.messageQueue);
    this.eventStream.updateConfig(newConfig.eventStream);

    this.emit("configUpdated", { config: this.config });
  }

  isRunning(): boolean {
    return this.isRunning;
  }

  // Component access
  getWebSocketManager(): WebSocketManager {
    return this.websocket;
  }

  getMessageQueue(): MessageQueue {
    return this.messageQueue;
  }

  getEventStream(): EventStream {
    return this.eventStream;
  }
}
