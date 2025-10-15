// Plugin Communication System
// This file handles inter-plugin communication and messaging

import { EventEmitter } from "events";
import { PluginInstance } from "../core/types";

export class PluginCommunicationSystem extends EventEmitter {
  private messageQueue: Message[] = [];
  private subscribers: Map<string, Set<PluginInstance>> = new Map();
  private messageHistory: Map<string, Message[]> = new Map();
  private processing = false;

  constructor() {
    super();
  }

  // Initialize the communication system
  async initialize(): Promise<void> {
    // Start message processing
    this.startMessageProcessing();
  }

  // Start message processing
  private startMessageProcessing(): void {
    setInterval(() => {
      this.processMessageQueue();
    }, 100); // Process messages every 100ms
  }

  // Subscribe plugin to channel
  subscribe(plugin: PluginInstance, channel: string): void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }

    this.subscribers.get(channel)!.add(plugin);
    this.emit("plugin:subscribed", plugin.metadata.id, channel);
  }

  // Unsubscribe plugin from channel
  unsubscribe(plugin: PluginInstance, channel: string): void {
    const channelSubscribers = this.subscribers.get(channel);
    if (channelSubscribers) {
      channelSubscribers.delete(plugin);
      if (channelSubscribers.size === 0) {
        this.subscribers.delete(channel);
      }
    }
    this.emit("plugin:unsubscribed", plugin.metadata.id, channel);
  }

  // Publish message to channel
  publish(channel: string, message: any, options: PublishOptions = {}): void {
    const msg: Message = {
      id: this.generateMessageId(),
      channel,
      data: message,
      sender: options.sender || "system",
      timestamp: new Date(),
      ttl: options.ttl || 300000, // 5 minutes default TTL
      priority: options.priority || 0,
      replyTo: options.replyTo,
    };

    this.messageQueue.push(msg);
    this.addToHistory(channel, msg);

    this.emit("message:published", msg);
  }

  // Send direct message to plugin
  sendDirectMessage(
    plugin: PluginInstance,
    message: any,
    options: DirectMessageOptions = {},
  ): void {
    const msg: Message = {
      id: this.generateMessageId(),
      channel: `direct:${plugin.metadata.id}`,
      data: message,
      sender: options.sender || "system",
      timestamp: new Date(),
      ttl: options.ttl || 300000,
      priority: options.priority || 0,
      replyTo: options.replyTo,
    };

    this.messageQueue.push(msg);
    this.emit("message:direct", msg, plugin);
  }

  // Request-response pattern
  async request(
    plugin: PluginInstance,
    message: any,
    options: RequestOptions = {},
  ): Promise<any> {
    const requestId = this.generateMessageId();
    const timeout = options.timeout || 30000; // 30 seconds default timeout

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Request timeout"));
      }, timeout);

      // Listen for response
      const responseHandler = (response: Message) => {
        if (response.replyTo === requestId) {
          clearTimeout(timeoutId);
          this.off("message:response", responseHandler);
          resolve(response.data);
        }
      };

      this.on("message:response", responseHandler);

      // Send request
      this.sendDirectMessage(plugin, message, {
        sender: options.sender || "system",
        replyTo: requestId,
      });
    });
  }

  // Process message queue
  private async processMessageQueue(): Promise<void> {
    if (this.processing || this.messageQueue.length === 0) {
      return;
    }

    this.processing = true;

    try {
      // Sort messages by priority
      this.messageQueue.sort((a, b) => b.priority - a.priority);

      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        if (message) {
          await this.processMessage(message);
        }
      }
    } finally {
      this.processing = false;
    }
  }

  // Process individual message
  private async processMessage(message: Message): Promise<void> {
    try {
      // Check TTL
      if (Date.now() - message.timestamp.getTime() > message.ttl) {
        this.emit("message:expired", message);
        return;
      }

      // Handle direct messages
      if (message.channel.startsWith("direct:")) {
        const pluginId = message.channel.substring(7);
        const plugin = this.findPluginById(pluginId);
        if (plugin) {
          this.emit("message:delivered", message, plugin);
        }
        return;
      }

      // Handle channel messages
      const subscribers = this.subscribers.get(message.channel);
      if (subscribers) {
        for (const plugin of subscribers) {
          this.emit("message:delivered", message, plugin);
        }
      }

      this.emit("message:processed", message);
    } catch (error) {
      this.emit("message:error", message, error);
    }
  }

  // Find plugin by ID
  private findPluginById(pluginId: string): PluginInstance | null {
    // In a real implementation, this would find the plugin from the registry
    return null;
  }

  // Add message to history
  private addToHistory(channel: string, message: Message): void {
    if (!this.messageHistory.has(channel)) {
      this.messageHistory.set(channel, []);
    }

    const history = this.messageHistory.get(channel)!;
    history.push(message);

    // Keep only last 100 messages per channel
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
  }

  // Generate unique message ID
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get message history for channel
  getMessageHistory(channel: string, limit: number = 50): Message[] {
    const history = this.messageHistory.get(channel) || [];
    return history.slice(-limit);
  }

  // Get subscribers for channel
  getSubscribers(channel: string): PluginInstance[] {
    const subscribers = this.subscribers.get(channel);
    return subscribers ? Array.from(subscribers) : [];
  }

  // Get all channels
  getAllChannels(): string[] {
    return Array.from(this.subscribers.keys());
  }

  // Get communication statistics
  getStats(): {
    totalMessages: number;
    activeChannels: number;
    totalSubscribers: number;
    queueLength: number;
    processing: boolean;
  } {
    let totalSubscribers = 0;
    for (const subscribers of this.subscribers.values()) {
      totalSubscribers += subscribers.size;
    }

    return {
      totalMessages: Array.from(this.messageHistory.values()).reduce(
        (sum, history) => sum + history.length,
        0,
      ),
      activeChannels: this.subscribers.size,
      totalSubscribers,
      queueLength: this.messageQueue.length,
      processing: this.processing,
    };
  }

  // Cleanup
  async destroy(): Promise<void> {
    this.messageQueue = [];
    this.subscribers.clear();
    this.messageHistory.clear();
    this.processing = false;
    this.removeAllListeners();
  }
}

// Message interface
export interface Message {
  id: string;
  channel: string;
  data: any;
  sender: string;
  timestamp: Date;
  ttl: number;
  priority: number;
  replyTo?: string;
}

// Publish options interface
export interface PublishOptions {
  sender?: string;
  ttl?: number;
  priority?: number;
  replyTo?: string;
}

// Direct message options interface
export interface DirectMessageOptions {
  sender?: string;
  ttl?: number;
  priority?: number;
  replyTo?: string;
}

// Request options interface
export interface RequestOptions {
  sender?: string;
  timeout?: number;
}
