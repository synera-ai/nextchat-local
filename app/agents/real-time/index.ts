import { WebSocketManager } from "./websocket";
import { MessageQueue } from "./message-queue";
import { EventStream } from "./event-stream";
import { RealTimeUpdates } from "./updates";

export interface RealTimeConfig {
  websocket?: {
    port?: number;
    host?: string;
    path?: string;
    maxConnections?: number;
    heartbeatInterval?: number;
    heartbeatTimeout?: number;
    messageTimeout?: number;
    compressionEnabled?: boolean;
    authenticationRequired?: boolean;
    corsOrigins?: string[];
  };
  messageQueue?: {
    maxQueueSize?: number;
    messageTTL?: number;
    retryAttempts?: number;
    retryDelay?: number;
    batchSize?: number;
    processingInterval?: number;
    priorityLevels?: number;
    persistenceEnabled?: boolean;
    compressionEnabled?: boolean;
    encryptionEnabled?: boolean;
  };
  eventStream?: {
    maxSubscribers?: number;
    eventTTL?: number;
    batchSize?: number;
    processingInterval?: number;
    compressionEnabled?: boolean;
    encryptionEnabled?: boolean;
    persistenceEnabled?: boolean;
    maxEventHistory?: number;
    cleanupInterval?: number;
  };
  updates?: {
    enableRealTimeUpdates?: boolean;
    enableBatchUpdates?: boolean;
    enableHistoricalUpdates?: boolean;
    updateInterval?: number;
    maxUpdateSize?: number;
    compressionEnabled?: boolean;
    encryptionEnabled?: boolean;
  };
}

export class RealTimeSystem {
  public websocket: WebSocketManager;
  public messageQueue: MessageQueue;
  public eventStream: EventStream;
  public updates: RealTimeUpdates;

  constructor(config?: RealTimeConfig) {
    // Initialize components
    this.websocket = new WebSocketManager(config?.websocket);
    this.messageQueue = new MessageQueue(config?.messageQueue);
    this.eventStream = new EventStream(config?.eventStream);
    this.updates = new RealTimeUpdates({
      websocket: config?.websocket,
      messageQueue: config?.messageQueue,
      eventStream: config?.eventStream,
      updates: config?.updates,
    });

    this.setupEventForwarding();
  }

  private setupEventForwarding(): void {
    // Forward events from components to the main system
    this.websocket.on("*", (event, ...args) => {
      this.emit(`websocket:${event}`, ...args);
    });

    this.messageQueue.on("*", (event, ...args) => {
      this.emit(`messageQueue:${event}`, ...args);
    });

    this.eventStream.on("*", (event, ...args) => {
      this.emit(`eventStream:${event}`, ...args);
    });

    this.updates.on("*", (event, ...args) => {
      this.emit(`updates:${event}`, ...args);
    });
  }

  async initialize(): Promise<void> {
    try {
      // Start all components
      await this.updates.start();

      console.log("Real-time system initialized successfully");
    } catch (error) {
      console.error("Failed to initialize real-time system:", error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    try {
      // Stop all components
      await this.updates.stop();

      console.log("Real-time system shutdown successfully");
    } catch (error) {
      console.error("Failed to shutdown real-time system:", error);
      throw error;
    }
  }

  // Convenience methods
  async sendUpdate(update: any): Promise<string> {
    return this.updates.sendUpdate(update);
  }

  async broadcastUpdate(update: any): Promise<number> {
    return this.updates.broadcastUpdate(update);
  }

  async sendToUser(userId: string, update: any): Promise<number> {
    return this.updates.sendToUser(userId, update);
  }

  async sendToSession(sessionId: string, update: any): Promise<number> {
    return this.updates.sendToSession(sessionId, update);
  }

  async sendToConnection(connectionId: string, update: any): Promise<boolean> {
    return this.updates.sendToConnection(connectionId, update);
  }

  async subscribeToUpdates(
    subscriberId: string,
    filters: any[],
    handler: any,
  ): Promise<string> {
    return this.updates.subscribeToUpdates(subscriberId, filters, handler);
  }

  async unsubscribeFromUpdates(subscriberId: string): Promise<boolean> {
    return this.updates.unsubscribeFromUpdates(subscriberId);
  }

  async getSystemStats(): Promise<any> {
    return this.updates.getSystemStats();
  }

  async getSystemMetrics(): Promise<any> {
    return this.updates.getSystemMetrics();
  }

  async getUpdateHistory(filter?: any, limit?: number): Promise<any[]> {
    return this.updates.getUpdateHistory(filter, limit);
  }

  async getConnectionStats(connectionId: string): Promise<any> {
    return this.updates.getConnectionStats(connectionId);
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

  getRealTimeUpdates(): RealTimeUpdates {
    return this.updates;
  }

  // Configuration
  updateConfig(newConfig: RealTimeConfig): void {
    this.updates.updateConfig(newConfig);
  }

  isRunning(): boolean {
    return this.updates.isRunning();
  }
}

// Export individual components
export { WebSocketManager, MessageQueue, EventStream, RealTimeUpdates };

// Export types
export type {
  WebSocketConfig,
  WebSocketConnection,
  WebSocketMessage,
  WebSocketStats,
  MessageType,
} from "./websocket";

export type {
  MessageQueueConfig,
  QueuedMessage,
  MessageHandler,
  QueueStats,
  QueueMetrics,
} from "./message-queue";

export type {
  EventStreamConfig,
  StreamEvent,
  EventMetadata,
  EventSubscriber,
  EventFilter,
  SubscriberMetadata,
  StreamStats,
  StreamMetrics,
} from "./event-stream";

export type {
  RealTimeUpdateConfig,
  UpdateMessage,
  UpdateTarget,
  UpdateMetadata,
  UpdateType,
  UpdateStats,
  UpdateMetrics,
} from "./updates";

// Create and export a default instance
export const realTimeSystem = new RealTimeSystem();
