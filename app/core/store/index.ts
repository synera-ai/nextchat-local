// Centralized store for NextChat

import { createEnhancedStore } from "../utils/store";
import {
  AppState,
  UserState,
  ChatState,
  SettingsState,
  PluginState,
  AgentState,
  UIState,
  PerformanceState,
} from "../types";
import { eventBus } from "../utils/event-bus";

// Initial state
const initialState: AppState = {
  user: {
    id: "",
    name: "",
    email: "",
    preferences: {
      theme: "auto",
      language: "en",
      timezone: "UTC",
      dateFormat: "MM/DD/YYYY",
    },
    session: {
      id: "",
      startTime: Date.now(),
      lastActivity: Date.now(),
      isActive: true,
    },
  },
  app: {
    version: "1.0.0",
    environment: "development",
    config: {
      apiUrl: "/api",
      wsUrl: "/ws",
      features: {},
      limits: {},
    },
    status: {
      isOnline: true,
      isInitialized: false,
    },
  },
  chat: {
    sessions: [],
    currentSessionIndex: 0,
    lastInput: "",
  },
  settings: {
    theme: "auto",
    language: "en",
    notifications: {
      email: true,
      push: true,
      inApp: true,
      sound: true,
    },
    privacy: {
      dataCollection: false,
      analytics: false,
      crashReporting: false,
    },
  },
  plugins: {
    plugins: {},
    installedPlugins: [],
    enabledPlugins: [],
  },
  agents: {
    agents: {},
    activeAgents: [],
    agentStatus: {},
  },
  ui: {
    sidebar: {
      isOpen: true,
      width: 300,
      activeTab: "chat",
    },
    modals: {
      activeModals: [],
      modalData: {},
    },
    notifications: {
      notifications: [],
      unreadCount: 0,
    },
    loading: {
      isLoading: false,
      loadingTasks: [],
    },
  },
  performance: {
    metrics: {
      renderTime: 0,
      memoryUsage: 0,
      networkLatency: 0,
      errorRate: 0,
    },
    monitoring: {
      isEnabled: true,
      logLevel: "info",
      metrics: {},
    },
  },
};

// Store actions
const createActions = (set: any, get: any) => ({
  // App actions
  initializeApp: () => {
    set((state: AppState) => {
      state.app.status.isInitialized = true;
    });
    eventBus.emit("app:ready");
  },

  setAppError: (error: Error) => {
    set((state: AppState) => {
      state.app.status.lastError = error.message;
    });
    eventBus.emit("app:error", error);
  },

  setOnlineStatus: (isOnline: boolean) => {
    set((state: AppState) => {
      state.app.status.isOnline = isOnline;
    });
  },

  // User actions
  setUser: (user: Partial<UserState>) => {
    set((state: AppState) => {
      Object.assign(state.user, user);
    });
  },

  updateUserPreferences: (preferences: Partial<UserState["preferences"]>) => {
    set((state: AppState) => {
      Object.assign(state.user.preferences, preferences);
    });
  },

  updateUserSession: (session: Partial<UserState["session"]>) => {
    set((state: AppState) => {
      Object.assign(state.user.session, session);
      state.user.session.lastActivity = Date.now();
    });
  },

  // Chat actions
  setChatSessions: (sessions: ChatState["sessions"]) => {
    set((state: AppState) => {
      state.chat.sessions = sessions;
    });
  },

  addChatSession: (session: ChatState["sessions"][0]) => {
    set((state: AppState) => {
      state.chat.sessions.unshift(session);
    });
    eventBus.emit("chat:session:created", session.id);
  },

  updateChatSession: (
    sessionId: string,
    updates: Partial<ChatState["sessions"][0]>,
  ) => {
    set((state: AppState) => {
      const session = state.chat.sessions.find((s) => s.id === sessionId);
      if (session) {
        Object.assign(session, updates);
      }
    });
  },

  setCurrentSessionIndex: (index: number) => {
    set((state: AppState) => {
      state.chat.currentSessionIndex = index;
    });
  },

  // Settings actions
  updateSettings: (settings: Partial<SettingsState>) => {
    set((state: AppState) => {
      Object.assign(state.settings, settings);
    });
  },

  updateTheme: (theme: SettingsState["theme"]) => {
    set((state: AppState) => {
      state.settings.theme = theme;
      state.user.preferences.theme = theme;
    });
  },

  updateNotifications: (
    notifications: Partial<SettingsState["notifications"]>,
  ) => {
    set((state: AppState) => {
      Object.assign(state.settings.notifications, notifications);
    });
  },

  // Plugin actions
  addPlugin: (plugin: PluginState["plugins"][string]) => {
    set((state: AppState) => {
      state.plugins.plugins[plugin.id] = plugin;
      if (plugin.status.isInstalled) {
        state.plugins.installedPlugins.push(plugin.id);
      }
      if (plugin.status.isEnabled) {
        state.plugins.enabledPlugins.push(plugin.id);
      }
    });
    eventBus.emit("plugin:installed", plugin.id);
  },

  updatePlugin: (
    pluginId: string,
    updates: Partial<PluginState["plugins"][string]>,
  ) => {
    set((state: AppState) => {
      const plugin = state.plugins.plugins[pluginId];
      if (plugin) {
        Object.assign(plugin, updates);
      }
    });
  },

  enablePlugin: (pluginId: string) => {
    set((state: AppState) => {
      const plugin = state.plugins.plugins[pluginId];
      if (plugin) {
        plugin.status.isEnabled = true;
        if (!state.plugins.enabledPlugins.includes(pluginId)) {
          state.plugins.enabledPlugins.push(pluginId);
        }
      }
    });
    eventBus.emit("plugin:uninstalled", pluginId);
  },

  disablePlugin: (pluginId: string) => {
    set((state: AppState) => {
      const plugin = state.plugins.plugins[pluginId];
      if (plugin) {
        plugin.status.isEnabled = false;
        state.plugins.enabledPlugins = state.plugins.enabledPlugins.filter(
          (id) => id !== pluginId,
        );
      }
    });
  },

  // Agent actions
  addAgent: (agent: AgentState["agents"][string]) => {
    set((state: AppState) => {
      state.agents.agents[agent.id] = agent;
    });
  },

  updateAgent: (
    agentId: string,
    updates: Partial<AgentState["agents"][string]>,
  ) => {
    set((state: AppState) => {
      const agent = state.agents.agents[agentId];
      if (agent) {
        Object.assign(agent, updates);
      }
    });
  },

  startAgent: (agentId: string) => {
    set((state: AppState) => {
      const agent = state.agents.agents[agentId];
      if (agent) {
        agent.status.isActive = true;
        if (!state.agents.activeAgents.includes(agentId)) {
          state.agents.activeAgents.push(agentId);
        }
      }
    });
    eventBus.emit("agent:started", agentId);
  },

  stopAgent: (agentId: string) => {
    set((state: AppState) => {
      const agent = state.agents.agents[agentId];
      if (agent) {
        agent.status.isActive = false;
        state.agents.activeAgents = state.agents.activeAgents.filter(
          (id) => id !== agentId,
        );
      }
    });
  },

  // UI actions
  toggleSidebar: () => {
    set((state: AppState) => {
      state.ui.sidebar.isOpen = !state.ui.sidebar.isOpen;
    });
    eventBus.emit("ui:sidebar:toggled", get().ui.sidebar.isOpen);
  },

  setSidebarWidth: (width: number) => {
    set((state: AppState) => {
      state.ui.sidebar.width = width;
    });
  },

  openModal: (modalId: string, data?: any) => {
    set((state: AppState) => {
      if (!state.ui.modals.activeModals.includes(modalId)) {
        state.ui.modals.activeModals.push(modalId);
      }
      if (data) {
        state.ui.modals.modalData[modalId] = data;
      }
    });
  },

  closeModal: (modalId: string) => {
    set((state: AppState) => {
      state.ui.modals.activeModals = state.ui.modals.activeModals.filter(
        (id) => id !== modalId,
      );
      delete state.ui.modals.modalData[modalId];
    });
  },

  addNotification: (
    notification: UIState["notifications"]["notifications"][0],
  ) => {
    set((state: AppState) => {
      state.ui.notifications.notifications.unshift(notification);
      if (!notification.isRead) {
        state.ui.notifications.unreadCount++;
      }
    });
    eventBus.emit("ui:notification:show", {
      id: notification.id,
      type: notification.type,
      message: notification.message,
    });
  },

  markNotificationAsRead: (notificationId: string) => {
    set((state: AppState) => {
      const notification = state.ui.notifications.notifications.find(
        (n) => n.id === notificationId,
      );
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.ui.notifications.unreadCount--;
      }
    });
  },

  setLoading: (isLoading: boolean, task?: string) => {
    set((state: AppState) => {
      state.ui.loading.isLoading = isLoading;
      if (task) {
        if (isLoading) {
          state.ui.loading.loadingTasks.push(task);
        } else {
          state.ui.loading.loadingTasks = state.ui.loading.loadingTasks.filter(
            (t) => t !== task,
          );
        }
      }
    });
  },

  // Performance actions
  updatePerformanceMetrics: (metrics: Partial<PerformanceState["metrics"]>) => {
    set((state: AppState) => {
      Object.assign(state.performance.metrics, metrics);
    });
  },

  recordPerformanceMetric: (metric: string, value: number) => {
    set((state: AppState) => {
      state.performance.monitoring.metrics[metric] = value;
    });
    eventBus.emit("performance:metric", { metric, value });
  },

  // Utility actions
  reset: () => {
    set(() => initialState);
  },

  // Selectors
  getCurrentSession: () => {
    const state = get();
    return state.chat.sessions[state.chat.currentSessionIndex] || null;
  },

  getActivePlugins: () => {
    const state = get();
    return state.plugins.enabledPlugins
      .map((id) => state.plugins.plugins[id])
      .filter(Boolean);
  },

  getActiveAgents: () => {
    const state = get();
    return state.agents.activeAgents
      .map((id) => state.agents.agents[id])
      .filter(Boolean);
  },

  getUnreadNotifications: () => {
    const state = get();
    return state.ui.notifications.notifications.filter((n) => !n.isRead);
  },
});

// Create the store
export const useAppStore = createEnhancedStore(
  "app",
  initialState,
  createActions,
  {
    persist: true,
    devtools: true,
    immer: true,
    middleware: [
      {
        name: "event-emitter",
        handler: (store) => (next) => (action) => {
          const result = next(action);
          // Emit events for certain actions
          if (action.type === "initializeApp") {
            eventBus.emit("app:ready");
          }
          return result;
        },
      },
    ],
  },
);

// Export store types
export type AppStore = typeof useAppStore;
export type AppStoreState = ReturnType<typeof useAppStore.getState>;
export type AppStoreActions = ReturnType<typeof useAppStore.getState>;

// Store hooks
export const useAppState = () => useAppStore();
export const useAppActions = () => useAppStore();
export const useAppSelector = <T>(selector: (state: AppStoreState) => T) =>
  useAppStore(selector);

// Specific selectors
export const useUser = () => useAppStore((state) => state.user);
export const useChat = () => useAppStore((state) => state.chat);
export const useSettings = () => useAppStore((state) => state.settings);
export const usePlugins = () => useAppStore((state) => state.plugins);
export const useAgents = () => useAppStore((state) => state.agents);
export const useUI = () => useAppStore((state) => state.ui);
export const usePerformance = () => useAppStore((state) => state.performance);

// Export default
export default useAppStore;
