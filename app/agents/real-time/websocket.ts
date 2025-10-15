import { EventEmitter } from "events";
import { WebSocket, WebSocketServer } from "ws";

export interface WebSocketConfig {
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
}

export interface WebSocketConnection {
  id: string;
  socket: WebSocket;
  userId?: string;
  sessionId?: string;
  connectedAt: Date;
  lastActivity: Date;
  isAuthenticated: boolean;
  metadata: ConnectionMetadata;
}

export interface ConnectionMetadata {
  userAgent?: string;
  ipAddress?: string;
  protocol?: string;
  extensions?: string[];
  headers?: Record<string, string>;
}

export interface WebSocketMessage {
  id: string;
  type: MessageType;
  payload: any;
  timestamp: Date;
  senderId?: string;
  recipientId?: string;
  replyTo?: string;
  metadata: MessageMetadata;
}

export interface MessageMetadata {
  priority: "low" | "normal" | "high" | "critical";
  ttl?: number;
  retryCount?: number;
  maxRetries?: number;
  correlationId?: string;
  tags?: string[];
}

export enum MessageType {
  HEARTBEAT = "heartbeat",
  AUTHENTICATION = "authentication",
  AGENT_STATUS = "agent_status",
  AGENT_COMMAND = "agent_command",
  AGENT_RESPONSE = "agent_response",
  AGENT_ERROR = "agent_error",
  SYSTEM_NOTIFICATION = "system_notification",
  USER_MESSAGE = "user_message",
  DATA_UPDATE = "data_update",
  CUSTOM = "custom",
}

export interface WebSocketStats {
  totalConnections: number;
  activeConnections: number;
  totalMessages: number;
  messagesPerSecond: number;
  averageResponseTime: number;
  errorRate: number;
  uptime: number;
  lastActivity: Date;
}

export class WebSocketManager extends EventEmitter {
  private server: WebSocketServer | null = null;
  private config: WebSocketConfig;
  private connections: Map<string, WebSocketConnection> = new Map();
  private messageQueue: Map<string, WebSocketMessage[]> = new Map();
  private stats: WebSocketStats;
  private heartbeatTimer?: NodeJS.Timeout;
  private cleanupTimer?: NodeJS.Timeout;
  private isRunning = false;
  private startTime: Date;

  constructor(config?: Partial<WebSocketConfig>) {
    super();
    this.config = {
      port: 8080,
      host: "localhost",
      path: "/ws",
      maxConnections: 1000,
      heartbeatInterval: 30000, // 30 seconds
      heartbeatTimeout: 60000, // 60 seconds
      messageTimeout: 30000, // 30 seconds
      compressionEnabled: true,
      authenticationRequired: false,
      corsOrigins: ["*"],
      ...config,
    };

    this.startTime = new Date();
    this.stats = this.initializeStats();
  }

  private initializeStats(): WebSocketStats {
    return {
      totalConnections: 0,
      activeConnections: 0,
      totalMessages: 0,
      messagesPerSecond: 0,
      averageResponseTime: 0,
      errorRate: 0,
      uptime: 0,
      lastActivity: new Date(),
    };
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error("WebSocket server is already running");
    }

    try {
      // Create WebSocket server
      this.server = new WebSocketServer({
        port: this.config.port,
        host: this.config.host,
        path: this.config.path,
        perMessageDeflate: this.config.compressionEnabled,
      });

      // Set up event handlers
      this.setupServerEventHandlers();

      // Start timers
      this.startHeartbeatTimer();
      this.startCleanupTimer();

      this.isRunning = true;
      this.emit("serverStarted", {
        port: this.config.port,
        host: this.config.host,
      });
    } catch (error) {
      this.emit("serverError", { error });
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      // Close all connections
      for (const connection of this.connections.values()) {
        connection.socket.close(1000, "Server shutting down");
      }

      // Close server
      if (this.server) {
        this.server.close();
        this.server = null;
      }

      // Stop timers
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = undefined;
      }

      if (this.cleanupTimer) {
        clearInterval(this.cleanupTimer);
        this.cleanupTimer = undefined;
      }

      this.isRunning = false;
      this.emit("serverStopped");
    } catch (error) {
      this.emit("serverError", { error });
      throw error;
    }
  }

  private setupServerEventHandlers(): void {
    if (!this.server) return;

    this.server.on("connection", (socket: WebSocket, request) => {
      this.handleNewConnection(socket, request);
    });

    this.server.on("error", (error) => {
      this.emit("serverError", { error });
    });

    this.server.on("close", () => {
      this.emit("serverClosed");
    });
  }

  private handleNewConnection(socket: WebSocket, request: any): void {
    // Check connection limit
    if (this.connections.size >= this.config.maxConnections) {
      socket.close(1013, "Server overloaded");
      return;
    }

    const connectionId = this.generateConnectionId();
    const connection: WebSocketConnection = {
      id: connectionId,
      socket,
      connectedAt: new Date(),
      lastActivity: new Date(),
      isAuthenticated: !this.config.authenticationRequired,
      metadata: {
        userAgent: request.headers["user-agent"],
        ipAddress: request.connection.remoteAddress,
        protocol: request.headers["sec-websocket-protocol"],
        headers: request.headers,
      },
    };

    // Store connection
    this.connections.set(connectionId, connection);
    this.messageQueue.set(connectionId, []);

    // Update stats
    this.stats.totalConnections++;
    this.stats.activeConnections++;
    this.stats.lastActivity = new Date();

    // Set up connection event handlers
    this.setupConnectionEventHandlers(connection);

    this.emit("connectionEstablished", { connectionId, connection });
  }

  private setupConnectionEventHandlers(connection: WebSocketConnection): void {
    connection.socket.on("message", (data: Buffer) => {
      this.handleMessage(connection, data);
    });

    connection.socket.on("close", (code: number, reason: Buffer) => {
      this.handleConnectionClose(connection, code, reason);
    });

    connection.socket.on("error", (error: Error) => {
      this.handleConnectionError(connection, error);
    });

    connection.socket.on("pong", () => {
      connection.lastActivity = new Date();
      this.emit("heartbeatReceived", { connectionId: connection.id });
    });
  }

  private async handleMessage(
    connection: WebSocketConnection,
    data: Buffer,
  ): Promise<void> {
    try {
      const message = this.parseMessage(data);
      connection.lastActivity = new Date();

      // Update stats
      this.stats.totalMessages++;
      this.stats.lastActivity = new Date();

      // Handle authentication
      if (message.type === MessageType.AUTHENTICATION) {
        await this.handleAuthentication(connection, message);
        return;
      }

      // Check authentication
      if (this.config.authenticationRequired && !connection.isAuthenticated) {
        this.sendError(connection, "Authentication required", message.id);
        return;
      }

      // Process message
      await this.processMessage(connection, message);

      this.emit("messageReceived", { connectionId: connection.id, message });
    } catch (error) {
      this.emit("messageError", { connectionId: connection.id, error });
      this.sendError(connection, "Invalid message format", "");
    }
  }

  private async handleAuthentication(
    connection: WebSocketConnection,
    message: WebSocketMessage,
  ): Promise<void> {
    try {
      // Simple authentication logic - in a real implementation, you'd validate credentials
      const { token, userId, sessionId } = message.payload;

      if (token && userId) {
        connection.isAuthenticated = true;
        connection.userId = userId;
        connection.sessionId = sessionId;

        this.sendMessage(connection, {
          id: this.generateMessageId(),
          type: MessageType.AUTHENTICATION,
          payload: { success: true, message: "Authentication successful" },
          timestamp: new Date(),
          metadata: { priority: "normal" },
        });

        this.emit("authenticationSuccess", {
          connectionId: connection.id,
          userId,
          sessionId,
        });
      } else {
        this.sendError(
          connection,
          "Invalid authentication credentials",
          message.id,
        );
        this.emit("authenticationFailed", {
          connectionId: connection.id,
          reason: "Invalid credentials",
        });
      }
    } catch (error) {
      this.sendError(connection, "Authentication error", message.id);
      this.emit("authenticationError", { connectionId: connection.id, error });
    }
  }

  private async processMessage(
    connection: WebSocketConnection,
    message: WebSocketMessage,
  ): Promise<void> {
    switch (message.type) {
      case MessageType.HEARTBEAT:
        await this.handleHeartbeat(connection, message);
        break;
      case MessageType.AGENT_COMMAND:
        await this.handleAgentCommand(connection, message);
        break;
      case MessageType.USER_MESSAGE:
        await this.handleUserMessage(connection, message);
        break;
      case MessageType.CUSTOM:
        await this.handleCustomMessage(connection, message);
        break;
      default:
        this.emit("unknownMessageType", {
          connectionId: connection.id,
          message,
        });
    }
  }

  private async handleHeartbeat(
    connection: WebSocketConnection,
    message: WebSocketMessage,
  ): Promise<void> {
    this.sendMessage(connection, {
      id: this.generateMessageId(),
      type: MessageType.HEARTBEAT,
      payload: { timestamp: new Date().toISOString() },
      timestamp: new Date(),
      metadata: { priority: "low" },
    });
  }

  private async handleAgentCommand(
    connection: WebSocketConnection,
    message: WebSocketMessage,
  ): Promise<void> {
    // Forward agent commands to the agent system
    this.emit("agentCommand", { connectionId: connection.id, message });
  }

  private async handleUserMessage(
    connection: WebSocketConnection,
    message: WebSocketMessage,
  ): Promise<void> {
    // Forward user messages to the appropriate handler
    this.emit("userMessage", { connectionId: connection.id, message });
  }

  private async handleCustomMessage(
    connection: WebSocketConnection,
    message: WebSocketMessage,
  ): Promise<void> {
    // Forward custom messages to the appropriate handler
    this.emit("customMessage", { connectionId: connection.id, message });
  }

  private handleConnectionClose(
    connection: WebSocketConnection,
    code: number,
    reason: Buffer,
  ): void {
    this.connections.delete(connection.id);
    this.messageQueue.delete(connection.id);

    this.stats.activeConnections--;
    this.stats.lastActivity = new Date();

    this.emit("connectionClosed", {
      connectionId: connection.id,
      code,
      reason: reason.toString(),
      connection,
    });
  }

  private handleConnectionError(
    connection: WebSocketConnection,
    error: Error,
  ): void {
    this.emit("connectionError", {
      connectionId: connection.id,
      error,
      connection,
    });
  }

  // Public methods for sending messages
  async sendMessage(
    connectionId: string,
    message: Omit<WebSocketMessage, "id" | "timestamp">,
  ): Promise<boolean> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return false;
    }

    return this.sendMessageToConnection(connection, message);
  }

  async broadcastMessage(
    message: Omit<WebSocketMessage, "id" | "timestamp">,
    filter?: (connection: WebSocketConnection) => boolean,
  ): Promise<number> {
    let sentCount = 0;

    for (const connection of this.connections.values()) {
      if (!filter || filter(connection)) {
        if (await this.sendMessageToConnection(connection, message)) {
          sentCount++;
        }
      }
    }

    return sentCount;
  }

  async sendToUser(
    userId: string,
    message: Omit<WebSocketMessage, "id" | "timestamp">,
  ): Promise<number> {
    let sentCount = 0;

    for (const connection of this.connections.values()) {
      if (connection.userId === userId) {
        if (await this.sendMessageToConnection(connection, message)) {
          sentCount++;
        }
      }
    }

    return sentCount;
  }

  async sendToSession(
    sessionId: string,
    message: Omit<WebSocketMessage, "id" | "timestamp">,
  ): Promise<number> {
    let sentCount = 0;

    for (const connection of this.connections.values()) {
      if (connection.sessionId === sessionId) {
        if (await this.sendMessageToConnection(connection, message)) {
          sentCount++;
        }
      }
    }

    return sentCount;
  }

  private async sendMessageToConnection(
    connection: WebSocketConnection,
    message: Omit<WebSocketMessage, "id" | "timestamp">,
  ): Promise<boolean> {
    try {
      if (connection.socket.readyState !== WebSocket.OPEN) {
        return false;
      }

      const fullMessage: WebSocketMessage = {
        id: this.generateMessageId(),
        timestamp: new Date(),
        ...message,
      };

      const data = JSON.stringify(fullMessage);
      connection.socket.send(data);

      this.emit("messageSent", {
        connectionId: connection.id,
        message: fullMessage,
      });
      return true;
    } catch (error) {
      this.emit("messageSendError", { connectionId: connection.id, error });
      return false;
    }
  }

  private sendError(
    connection: WebSocketConnection,
    error: string,
    messageId: string,
  ): void {
    this.sendMessageToConnection(connection, {
      type: MessageType.AGENT_ERROR,
      payload: { error, messageId },
      metadata: { priority: "high" },
    });
  }

  // Connection management
  async getConnection(
    connectionId: string,
  ): Promise<WebSocketConnection | null> {
    return this.connections.get(connectionId) || null;
  }

  async getConnectionsByUser(userId: string): Promise<WebSocketConnection[]> {
    return Array.from(this.connections.values()).filter(
      (conn) => conn.userId === userId,
    );
  }

  async getConnectionsBySession(
    sessionId: string,
  ): Promise<WebSocketConnection[]> {
    return Array.from(this.connections.values()).filter(
      (conn) => conn.sessionId === sessionId,
    );
  }

  async getAllConnections(): Promise<WebSocketConnection[]> {
    return Array.from(this.connections.values());
  }

  async closeConnection(
    connectionId: string,
    code: number = 1000,
    reason: string = "Closed by server",
  ): Promise<boolean> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return false;
    }

    connection.socket.close(code, reason);
    return true;
  }

  // Statistics and monitoring
  async getStats(): Promise<WebSocketStats> {
    this.stats.uptime = Date.now() - this.startTime.getTime();
    return { ...this.stats };
  }

  async getConnectionStats(connectionId: string): Promise<any> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return null;
    }

    return {
      id: connection.id,
      userId: connection.userId,
      sessionId: connection.sessionId,
      connectedAt: connection.connectedAt,
      lastActivity: connection.lastActivity,
      isAuthenticated: connection.isAuthenticated,
      uptime: Date.now() - connection.connectedAt.getTime(),
      messageCount: this.messageQueue.get(connectionId)?.length || 0,
    };
  }

  // Heartbeat and cleanup
  private startHeartbeatTimer(): void {
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeats();
    }, this.config.heartbeatInterval);
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupInactiveConnections();
    }, this.config.heartbeatTimeout);
  }

  private sendHeartbeats(): void {
    for (const connection of this.connections.values()) {
      if (connection.socket.readyState === WebSocket.OPEN) {
        connection.socket.ping();
      }
    }
  }

  private cleanupInactiveConnections(): void {
    const now = Date.now();
    const timeout = this.config.heartbeatTimeout;

    for (const [connectionId, connection] of this.connections) {
      if (now - connection.lastActivity.getTime() > timeout) {
        this.closeConnection(connectionId, 1000, "Inactive connection");
      }
    }
  }

  // Utility methods
  private parseMessage(data: Buffer): WebSocketMessage {
    try {
      const parsed = JSON.parse(data.toString());
      return {
        id: parsed.id || this.generateMessageId(),
        type: parsed.type || MessageType.CUSTOM,
        payload: parsed.payload || {},
        timestamp: new Date(parsed.timestamp || Date.now()),
        senderId: parsed.senderId,
        recipientId: parsed.recipientId,
        replyTo: parsed.replyTo,
        metadata: {
          priority: parsed.metadata?.priority || "normal",
          ttl: parsed.metadata?.ttl,
          retryCount: parsed.metadata?.retryCount || 0,
          maxRetries: parsed.metadata?.maxRetries || 3,
          correlationId: parsed.metadata?.correlationId,
          tags: parsed.metadata?.tags || [],
        },
      };
    } catch (error) {
      throw new Error("Invalid message format");
    }
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Configuration
  updateConfig(newConfig: Partial<WebSocketConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit("configUpdated", { config: this.config });
  }

  isServerRunning(): boolean {
    return this.isRunning;
  }
}
