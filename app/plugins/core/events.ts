// Plugin Event Manager
// This file handles plugin events, hooks, and middleware

import { EventEmitter } from "events";
import { PluginInstance, Hook, Middleware, PluginError } from "./types";

export class PluginEventManager extends EventEmitter {
  private initialized = false;
  private hooks: Map<string, Hook[]> = new Map();
  private middleware: Map<string, Middleware[]> = new Map();
  private eventQueue: EventQueueItem[] = [];
  private processing = false;

  constructor() {
    super();
  }

  // Initialize the event manager
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
  }

  // Register plugin hooks
  registerHooks(plugin: PluginInstance): void {
    if (!this.initialized) {
      throw new PluginError(
        "Event manager not initialized",
        "system",
        "NOT_INITIALIZED",
      );
    }

    const pluginHooks = plugin.instance.getHooks();
    for (const hook of pluginHooks) {
      this.registerHook(plugin.metadata.id, hook);
    }
  }

  // Register plugin middleware
  registerMiddleware(plugin: PluginInstance): void {
    if (!this.initialized) {
      throw new PluginError(
        "Event manager not initialized",
        "system",
        "NOT_INITIALIZED",
      );
    }

    const pluginMiddleware = plugin.instance.getMiddleware();
    for (const middleware of pluginMiddleware) {
      this.registerMiddlewareItem(plugin.metadata.id, middleware);
    }
  }

  // Register individual hook
  private registerHook(pluginId: string, hook: Hook): void {
    const eventHooks = this.hooks.get(hook.event) || [];

    // Remove existing hook from same plugin
    const filteredHooks = eventHooks.filter(
      (h) => !h.name.startsWith(`${pluginId}:`),
    );

    // Add new hook with plugin prefix
    const prefixedHook: Hook = {
      ...hook,
      name: `${pluginId}:${hook.name}`,
    };

    filteredHooks.push(prefixedHook);

    // Sort by priority
    filteredHooks.sort((a, b) => b.priority - a.priority);

    this.hooks.set(hook.event, filteredHooks);
  }

  // Register individual middleware
  private registerMiddlewareItem(
    pluginId: string,
    middleware: Middleware,
  ): void {
    const typeMiddleware = this.middleware.get(middleware.type) || [];

    // Remove existing middleware from same plugin
    const filteredMiddleware = typeMiddleware.filter(
      (m) => !m.name.startsWith(`${pluginId}:`),
    );

    // Add new middleware with plugin prefix
    const prefixedMiddleware: Middleware = {
      ...middleware,
      name: `${pluginId}:${middleware.name}`,
    };

    filteredMiddleware.push(prefixedMiddleware);

    // Sort by priority
    filteredMiddleware.sort((a, b) => b.priority - a.priority);

    this.middleware.set(middleware.type, filteredMiddleware);
  }

  // Unregister plugin hooks
  unregisterHooks(pluginId: string): void {
    for (const [event, hooks] of this.hooks.entries()) {
      const filteredHooks = hooks.filter(
        (hook) => !hook.name.startsWith(`${pluginId}:`),
      );
      if (filteredHooks.length === 0) {
        this.hooks.delete(event);
      } else {
        this.hooks.set(event, filteredHooks);
      }
    }
  }

  // Unregister plugin middleware
  unregisterMiddleware(pluginId: string): void {
    for (const [type, middleware] of this.middleware.entries()) {
      const filteredMiddleware = middleware.filter(
        (m) => !m.name.startsWith(`${pluginId}:`),
      );
      if (filteredMiddleware.length === 0) {
        this.middleware.delete(type);
      } else {
        this.middleware.set(type, filteredMiddleware);
      }
    }
  }

  // Emit event with hooks
  async emitEvent(event: string, data: any): Promise<any> {
    if (!this.initialized) {
      throw new PluginError(
        "Event manager not initialized",
        "system",
        "NOT_INITIALIZED",
      );
    }

    try {
      // Get hooks for this event
      const eventHooks = this.hooks.get(event) || [];

      // Execute hooks in priority order
      let result = data;
      for (const hook of eventHooks) {
        try {
          result = await hook.handler(result);

          // Remove hook if it's a one-time hook
          if (hook.once) {
            this.removeHook(event, hook.name);
          }
        } catch (error) {
          console.error(`Hook ${hook.name} failed for event ${event}:`, error);
        }
      }

      // Emit the event
      this.emit(event, result);

      return result;
    } catch (error) {
      throw new PluginError(
        `Failed to emit event ${event}: ${error}`,
        "system",
        "EVENT_ERROR",
        error,
      );
    }
  }

  // Process request through middleware
  async processRequest(context: any): Promise<any> {
    if (!this.initialized) {
      throw new PluginError(
        "Event manager not initialized",
        "system",
        "NOT_INITIALIZED",
      );
    }

    try {
      // Get request middleware
      const requestMiddleware = this.middleware.get("request") || [];

      // Execute middleware in priority order
      let result = context;
      for (const middleware of requestMiddleware) {
        result = await middleware.handler(result, async () => result);
      }

      return result;
    } catch (error) {
      throw new PluginError(
        `Failed to process request: ${error}`,
        "system",
        "MIDDLEWARE_ERROR",
        error,
      );
    }
  }

  // Process response through middleware
  async processResponse(context: any, response: any): Promise<any> {
    if (!this.initialized) {
      throw new PluginError(
        "Event manager not initialized",
        "system",
        "NOT_INITIALIZED",
      );
    }

    try {
      // Get response middleware
      const responseMiddleware = this.middleware.get("response") || [];

      // Execute middleware in priority order
      let result = response;
      for (const middleware of responseMiddleware) {
        result = await middleware.handler(
          { ...context, response: result },
          async () => result,
        );
      }

      return result;
    } catch (error) {
      throw new PluginError(
        `Failed to process response: ${error}`,
        "system",
        "MIDDLEWARE_ERROR",
        error,
      );
    }
  }

  // Process error through middleware
  async processError(context: any, error: Error): Promise<Error> {
    if (!this.initialized) {
      throw new PluginError(
        "Event manager not initialized",
        "system",
        "NOT_INITIALIZED",
      );
    }

    try {
      // Get error middleware
      const errorMiddleware = this.middleware.get("error") || [];

      // Execute middleware in priority order
      let result = error;
      for (const middleware of errorMiddleware) {
        result = await middleware.handler(
          { ...context, error: result },
          async () => result,
        );
      }

      return result;
    } catch (err) {
      console.error("Error middleware failed:", err);
      return error;
    }
  }

  // Queue event for processing
  queueEvent(event: string, data: any, priority: number = 0): void {
    this.eventQueue.push({
      event,
      data,
      priority,
      timestamp: Date.now(),
    });

    // Sort by priority and timestamp
    this.eventQueue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.timestamp - b.timestamp;
    });

    // Process queue if not already processing
    if (!this.processing) {
      this.processEventQueue();
    }
  }

  // Process event queue
  private async processEventQueue(): Promise<void> {
    if (this.processing || this.eventQueue.length === 0) {
      return;
    }

    this.processing = true;

    try {
      while (this.eventQueue.length > 0) {
        const item = this.eventQueue.shift();
        if (item) {
          try {
            await this.emitEvent(item.event, item.data);
          } catch (error) {
            console.error(
              `Failed to process queued event ${item.event}:`,
              error,
            );
          }
        }
      }
    } finally {
      this.processing = false;
    }
  }

  // Remove specific hook
  private removeHook(event: string, hookName: string): void {
    const eventHooks = this.hooks.get(event) || [];
    const filteredHooks = eventHooks.filter((hook) => hook.name !== hookName);

    if (filteredHooks.length === 0) {
      this.hooks.delete(event);
    } else {
      this.hooks.set(event, filteredHooks);
    }
  }

  // Get hooks for event
  getHooks(event: string): Hook[] {
    return this.hooks.get(event) || [];
  }

  // Get middleware for type
  getMiddleware(type: string): Middleware[] {
    return this.middleware.get(type) || [];
  }

  // Get all registered hooks
  getAllHooks(): Map<string, Hook[]> {
    return new Map(this.hooks);
  }

  // Get all registered middleware
  getAllMiddleware(): Map<string, Middleware[]> {
    return new Map(this.middleware);
  }

  // Get event queue status
  getQueueStatus(): {
    queueLength: number;
    processing: boolean;
    oldestEvent: Date | null;
  } {
    return {
      queueLength: this.eventQueue.length,
      processing: this.processing,
      oldestEvent:
        this.eventQueue.length > 0
          ? new Date(this.eventQueue[0].timestamp)
          : null,
    };
  }

  // Get event statistics
  getStats(): {
    totalHooks: number;
    totalMiddleware: number;
    eventsWithHooks: number;
    middlewareTypes: number;
  } {
    const totalHooks = Array.from(this.hooks.values()).reduce(
      (sum, hooks) => sum + hooks.length,
      0,
    );
    const totalMiddleware = Array.from(this.middleware.values()).reduce(
      (sum, middleware) => sum + middleware.length,
      0,
    );

    return {
      totalHooks,
      totalMiddleware,
      eventsWithHooks: this.hooks.size,
      middlewareTypes: this.middleware.size,
    };
  }

  // Cleanup
  async destroy(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    this.hooks.clear();
    this.middleware.clear();
    this.eventQueue = [];
    this.processing = false;
    this.initialized = false;
  }
}

// Event queue item interface
interface EventQueueItem {
  event: string;
  data: any;
  priority: number;
  timestamp: number;
}
