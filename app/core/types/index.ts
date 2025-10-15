// Core type definitions for the NextChat application

export interface AppState {
  // Core state
  user: UserState;
  app: AppState;
  
  // Module state
  chat: ChatState;
  settings: SettingsState;
  plugins: PluginState;
  agents: AgentState;
  
  // UI state
  ui: UIState;
  
  // Performance state
  performance: PerformanceState;
}

export interface UserState {
  id: string;
  name: string;
  email: string;
  preferences: UserPreferences;
  session: UserSession;
}

export interface AppState {
  version: string;
  environment: 'development' | 'staging' | 'production';
  config: AppConfig;
  status: AppStatus;
}

export interface ChatState {
  sessions: ChatSession[];
  currentSessionIndex: number;
  lastInput: string;
}

export interface SettingsState {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface PluginState {
  plugins: Record<string, Plugin>;
  installedPlugins: string[];
  enabledPlugins: string[];
}

export interface AgentState {
  agents: Record<string, Agent>;
  activeAgents: string[];
  agentStatus: Record<string, AgentStatus>;
}

export interface UIState {
  sidebar: SidebarState;
  modals: ModalState;
  notifications: NotificationState;
  loading: LoadingState;
}

export interface PerformanceState {
  metrics: PerformanceMetrics;
  monitoring: MonitoringState;
}

// Supporting types
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
}

export interface UserSession {
  id: string;
  startTime: number;
  lastActivity: number;
  isActive: boolean;
}

export interface AppConfig {
  apiUrl: string;
  wsUrl: string;
  features: Record<string, boolean>;
  limits: Record<string, number>;
}

export interface AppStatus {
  isOnline: boolean;
  isInitialized: boolean;
  lastError?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
  sound: boolean;
}

export interface PrivacySettings {
  dataCollection: boolean;
  analytics: boolean;
  crashReporting: boolean;
}

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  dependencies: string[];
  capabilities: PluginCapabilities;
  config: PluginConfig;
  status: PluginStatus;
}

export interface PluginCapabilities {
  tools: Tool[];
  resources: Resource[];
  actions: Action[];
}

export interface PluginConfig {
  enabled: boolean;
  settings: Record<string, any>;
  permissions: string[];
}

export interface PluginStatus {
  isInstalled: boolean;
  isEnabled: boolean;
  isActive: boolean;
  lastError?: string;
}

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  config: AgentConfig;
  status: AgentStatus;
  capabilities: AgentCapabilities;
}

export interface AgentConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface AgentStatus {
  isActive: boolean;
  isProcessing: boolean;
  lastActivity: number;
  errorCount: number;
  lastError?: string;
}

export interface AgentCapabilities {
  tools: string[];
  resources: string[];
  actions: string[];
}

export interface SidebarState {
  isOpen: boolean;
  width: number;
  activeTab: string;
}

export interface ModalState {
  activeModals: string[];
  modalData: Record<string, any>;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

export interface LoadingState {
  isLoading: boolean;
  loadingTasks: string[];
}

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  networkLatency: number;
  errorRate: number;
}

export interface MonitoringState {
  isEnabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  metrics: Record<string, number>;
}

// Utility types
export interface Tool {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (params: any) => Promise<any>;
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  content: any;
  metadata: Record<string, any>;
}

export interface Action {
  id: string;
  name: string;
  description: string;
  handler: (params: any) => Promise<any>;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
}

export type AgentType = 'chat' | 'task' | 'analysis' | 'creative' | 'integration' | 'utility';

// Event types
export interface AppEvent {
  type: string;
  payload: any;
  timestamp: number;
  source: string;
}

export interface PluginEvent extends AppEvent {
  pluginId: string;
}

export interface AgentEvent extends AppEvent {
  agentId: string;
}

// Store types
export interface StoreSlice<T> {
  state: T;
  actions: Record<string, (...args: any[]) => void>;
  selectors: Record<string, (state: T) => any>;
}

export interface StoreMiddleware {
  name: string;
  handler: (store: any) => (next: any) => (action: any) => any;
}

// Module types
export interface Module {
  id: string;
  name: string;
  version: string;
  dependencies: string[];
  exports: Record<string, any>;
  initialize: () => Promise<void>;
  destroy: () => Promise<void>;
}

export interface ModuleConfig {
  id: string;
  enabled: boolean;
  config: Record<string, any>;
}
