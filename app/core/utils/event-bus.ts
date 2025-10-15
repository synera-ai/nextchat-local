// Event bus system for NextChat

import { AppEvent, PluginEvent, AgentEvent } from '../types';

export interface EventBus {
  emit: (event: AppEvent) => void;
  on: (eventType: string, handler: EventHandler) => () => void;
  off: (eventType: string, handler: EventHandler) => void;
  once: (eventType: string, handler: EventHandler) => void;
  removeAllListeners: (eventType?: string) => void;
  getListeners: (eventType: string) => EventHandler[];
}

export type EventHandler = (event: AppEvent) => void;

export interface EventSubscription {
  eventType: string;
  handler: EventHandler;
  id: string;
}

class NextChatEventBus implements EventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map();
  private subscriptions: Map<string, EventSubscription> = new Map();
  private eventHistory: AppEvent[] = [];
  private maxHistorySize = 1000;

  emit(event: AppEvent): void {
    // Add to history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Get listeners for this event type
    const handlers = this.listeners.get(event.type);
    if (!handlers) return;

    // Execute all handlers
    handlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error(`[EventBus] Error in handler for ${event.type}:`, error);
      }
    });
  }

  on(eventType: string, handler: EventHandler): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(handler);

    // Create subscription
    const subscription: EventSubscription = {
      eventType,
      handler,
      id: this.generateId(),
    };
    this.subscriptions.set(subscription.id, subscription);

    // Return unsubscribe function
    return () => this.off(eventType, handler);
  }

  off(eventType: string, handler: EventHandler): void {
    const handlers = this.listeners.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.listeners.delete(eventType);
      }
    }

    // Remove subscription
    for (const [id, subscription] of this.subscriptions.entries()) {
      if (subscription.eventType === eventType && subscription.handler === handler) {
        this.subscriptions.delete(id);
        break;
      }
    }
  }

  once(eventType: string, handler: EventHandler): void {
    const onceHandler = (event: AppEvent) => {
      handler(event);
      this.off(eventType, onceHandler);
    };
    this.on(eventType, onceHandler);
  }

  removeAllListeners(eventType?: string): void {
    if (eventType) {
      this.listeners.delete(eventType);
      // Remove subscriptions for this event type
      for (const [id, subscription] of this.subscriptions.entries()) {
        if (subscription.eventType === eventType) {
          this.subscriptions.delete(id);
        }
      }
    } else {
      this.listeners.clear();
      this.subscriptions.clear();
    }
  }

  getListeners(eventType: string): EventHandler[] {
    const handlers = this.listeners.get(eventType);
    return handlers ? Array.from(handlers) : [];
  }

  // Utility methods
  getEventHistory(): AppEvent[] {
    return [...this.eventHistory];
  }

  getEventHistoryByType(eventType: string): AppEvent[] {
    return this.eventHistory.filter(event => event.type === eventType);
  }

  getSubscriptionCount(eventType?: string): number {
    if (eventType) {
      return this.listeners.get(eventType)?.size || 0;
    }
    return this.subscriptions.size;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

// Create global event bus instance
export const eventBus = new NextChatEventBus();

// Event type constants
export const EVENT_TYPES = {
  // App events
  APP_INIT: 'app:init',
  APP_READY: 'app:ready',
  APP_ERROR: 'app:error',
  APP_SHUTDOWN: 'app:shutdown',

  // User events
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  USER_UPDATE: 'user:update',

  // Chat events
  CHAT_SESSION_CREATE: 'chat:session:create',
  CHAT_SESSION_UPDATE: 'chat:session:update',
  CHAT_SESSION_DELETE: 'chat:session:delete',
  CHAT_MESSAGE_SEND: 'chat:message:send',
  CHAT_MESSAGE_RECEIVE: 'chat:message:receive',

  // Plugin events
  PLUGIN_INSTALL: 'plugin:install',
  PLUGIN_UNINSTALL: 'plugin:uninstall',
  PLUGIN_ENABLE: 'plugin:enable',
  PLUGIN_DISABLE: 'plugin:disable',
  PLUGIN_UPDATE: 'plugin:update',
  PLUGIN_ERROR: 'plugin:error',

  // Agent events
  AGENT_CREATE: 'agent:create',
  AGENT_START: 'agent:start',
  AGENT_STOP: 'agent:stop',
  AGENT_UPDATE: 'agent:update',
  AGENT_ERROR: 'agent:error',

  // UI events
  UI_SIDEBAR_TOGGLE: 'ui:sidebar:toggle',
  UI_MODAL_OPEN: 'ui:modal:open',
  UI_MODAL_CLOSE: 'ui:modal:close',
  UI_NOTIFICATION_SHOW: 'ui:notification:show',
  UI_NOTIFICATION_HIDE: 'ui:notification:hide',

  // Performance events
  PERFORMANCE_METRIC: 'performance:metric',
  PERFORMANCE_WARNING: 'performance:warning',
  PERFORMANCE_ERROR: 'performance:error',
} as const;

// Event creators
export const eventCreators = {
  // App events
  createAppInitEvent: (): AppEvent => ({
    type: EVENT_TYPES.APP_INIT,
    payload: { timestamp: Date.now() },
    timestamp: Date.now(),
    source: 'app',
  }),

  createAppReadyEvent: (): AppEvent => ({
    type: EVENT_TYPES.APP_READY,
    payload: { timestamp: Date.now() },
    timestamp: Date.now(),
    source: 'app',
  }),

  createAppErrorEvent: (error: Error): AppEvent => ({
    type: EVENT_TYPES.APP_ERROR,
    payload: { error: error.message, stack: error.stack },
    timestamp: Date.now(),
    source: 'app',
  }),

  // User events
  createUserLoginEvent: (userId: string): AppEvent => ({
    type: EVENT_TYPES.USER_LOGIN,
    payload: { userId },
    timestamp: Date.now(),
    source: 'user',
  }),

  createUserLogoutEvent: (userId: string): AppEvent => ({
    type: EVENT_TYPES.USER_LOGOUT,
    payload: { userId },
    timestamp: Date.now(),
    source: 'user',
  }),

  // Chat events
  createChatSessionCreateEvent: (sessionId: string): AppEvent => ({
    type: EVENT_TYPES.CHAT_SESSION_CREATE,
    payload: { sessionId },
    timestamp: Date.now(),
    source: 'chat',
  }),

  createChatMessageSendEvent: (messageId: string, content: string): AppEvent => ({
    type: EVENT_TYPES.CHAT_MESSAGE_SEND,
    payload: { messageId, content },
    timestamp: Date.now(),
    source: 'chat',
  }),

  // Plugin events
  createPluginInstallEvent: (pluginId: string): PluginEvent => ({
    type: EVENT_TYPES.PLUGIN_INSTALL,
    payload: { pluginId },
    timestamp: Date.now(),
    source: 'plugin',
    pluginId,
  }),

  createPluginErrorEvent: (pluginId: string, error: Error): PluginEvent => ({
    type: EVENT_TYPES.PLUGIN_ERROR,
    payload: { error: error.message, stack: error.stack },
    timestamp: Date.now(),
    source: 'plugin',
    pluginId,
  }),

  // Agent events
  createAgentStartEvent: (agentId: string): AgentEvent => ({
    type: EVENT_TYPES.AGENT_START,
    payload: { agentId },
    timestamp: Date.now(),
    source: 'agent',
    agentId,
  }),

  createAgentErrorEvent: (agentId: string, error: Error): AgentEvent => ({
    type: EVENT_TYPES.AGENT_ERROR,
    payload: { error: error.message, stack: error.stack },
    timestamp: Date.now(),
    source: 'agent',
    agentId,
  }),

  // UI events
  createUISidebarToggleEvent: (isOpen: boolean): AppEvent => ({
    type: EVENT_TYPES.UI_SIDEBAR_TOGGLE,
    payload: { isOpen },
    timestamp: Date.now(),
    source: 'ui',
  }),

  createUINotificationShowEvent: (notificationId: string, type: string, message: string): AppEvent => ({
    type: EVENT_TYPES.UI_NOTIFICATION_SHOW,
    payload: { notificationId, type, message },
    timestamp: Date.now(),
    source: 'ui',
  }),

  // Performance events
  createPerformanceMetricEvent: (metric: string, value: number): AppEvent => ({
    type: EVENT_TYPES.PERFORMANCE_METRIC,
    payload: { metric, value },
    timestamp: Date.now(),
    source: 'performance',
  }),
};

// Event bus hooks for React
export function useEventBus() {
  return eventBus;
}

export function useEventSubscription(eventType: string, handler: EventHandler) {
  const bus = useEventBus();
  
  React.useEffect(() => {
    const unsubscribe = bus.on(eventType, handler);
    return unsubscribe;
  }, [eventType, handler]);
}

// Event bus middleware
export const eventBusMiddleware = {
  // Log all events
  enableLogging: () => {
    eventBus.on('*', (event) => {
      console.log('[EventBus]', event);
    });
  },

  // Performance monitoring
  enablePerformanceMonitoring: () => {
    const startTimes = new Map<string, number>();
    
    eventBus.on('*', (event) => {
      if (event.type.endsWith(':start')) {
        startTimes.set(event.type, Date.now());
      } else if (event.type.endsWith(':end')) {
        const startType = event.type.replace(':end', ':start');
        const startTime = startTimes.get(startType);
        if (startTime) {
          const duration = Date.now() - startTime;
          eventBus.emit(eventCreators.createPerformanceMetricEvent(`event:${event.type}`, duration));
          startTimes.delete(startType);
        }
      }
    });
  },

  // Error handling
  enableErrorHandling: () => {
    eventBus.on(EVENT_TYPES.APP_ERROR, (event) => {
      console.error('[EventBus Error]', event.payload);
      // Could send to error reporting service
    });
  },
};

// Export default
export default eventBus;
