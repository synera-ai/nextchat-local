export interface ModuleDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  dependencies: string[];
  exports: ModuleExports;
  routes: RouteDefinition[];
  components: ComponentDefinition[];
  services: ServiceDefinition[];
  metadata: ModuleMetadata;
}

export interface ModuleExports {
  components: Record<string, React.ComponentType<any>>;
  hooks: Record<string, Function>;
  services: Record<string, any>;
  types: Record<string, any>;
  constants: Record<string, any>;
}

export interface RouteDefinition {
  path: string;
  component: string;
  exact?: boolean;
  protected?: boolean;
  lazy?: boolean;
  metadata?: RouteMetadata;
}

export interface RouteMetadata {
  title: string;
  description: string;
  tags: string[];
  permissions: string[];
}

export interface ComponentDefinition {
  name: string;
  type: ComponentType;
  props: Record<string, any>;
  dependencies: string[];
  metadata: ComponentMetadata;
}

export interface ComponentMetadata {
  description: string;
  category: string;
  tags: string[];
  version: string;
  author: string;
}

export enum ComponentType {
  PRIMITIVE = "primitive",
  COMPOSITE = "composite",
  FEATURE = "feature",
  LAYOUT = "layout",
}

export interface ServiceDefinition {
  name: string;
  type: ServiceType;
  dependencies: string[];
  configuration: Record<string, any>;
  metadata: ServiceMetadata;
}

export interface ServiceMetadata {
  description: string;
  version: string;
  author: string;
  tags: string[];
}

export enum ServiceType {
  API = "api",
  STORAGE = "storage",
  CACHE = "cache",
  AUTH = "auth",
  NOTIFICATION = "notification",
  ANALYTICS = "analytics",
}

export interface ModuleMetadata {
  author: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  category: string;
  complexity: "low" | "medium" | "high";
  reliability: number;
  performance: number;
  security: number;
}

export interface ModuleCommunication {
  eventBus: EventBus;
  sharedState: SharedState;
  api: ModuleAPI;
  resources: ResourceManager;
}

export interface EventBus {
  emit: (event: string, data?: any) => void;
  on: (event: string, handler: Function) => void;
  off: (event: string, handler: Function) => void;
  once: (event: string, handler: Function) => void;
}

export interface SharedState {
  get: (key: string) => any;
  set: (key: string, value: any) => void;
  subscribe: (key: string, handler: Function) => void;
  unsubscribe: (key: string, handler: Function) => void;
}

export interface ModuleAPI {
  request: (endpoint: string, options?: RequestOptions) => Promise<any>;
  get: (endpoint: string, options?: RequestOptions) => Promise<any>;
  post: (
    endpoint: string,
    data?: any,
    options?: RequestOptions,
  ) => Promise<any>;
  put: (endpoint: string, data?: any, options?: RequestOptions) => Promise<any>;
  delete: (endpoint: string, options?: RequestOptions) => Promise<any>;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  cache?: boolean;
}

export interface ResourceManager {
  get: (resourceId: string) => Promise<any>;
  set: (resourceId: string, resource: any) => Promise<void>;
  delete: (resourceId: string) => Promise<void>;
  list: (filter?: ResourceFilter) => Promise<string[]>;
}

export interface ResourceFilter {
  type?: string;
  tags?: string[];
  owner?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

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
  notifications: NotificationState;

  // Performance state
  performance: PerformanceState;
  analytics: AnalyticsState;
}

export interface UserState {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
  permissions: string[];
  session: SessionState;
}

export interface UserPreferences {
  theme: "light" | "dark" | "auto";
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  frequency: "immediate" | "daily" | "weekly";
}

export interface PrivacyPreferences {
  dataCollection: boolean;
  analytics: boolean;
  personalization: boolean;
}

export interface SessionState {
  id: string;
  startTime: Date;
  lastActivity: Date;
  isActive: boolean;
  metadata: Record<string, any>;
}

export interface AppState {
  version: string;
  environment: "development" | "staging" | "production";
  features: FeatureFlags;
  configuration: AppConfiguration;
  status: AppStatus;
}

export interface FeatureFlags {
  [key: string]: boolean;
}

export interface AppConfiguration {
  api: APIConfiguration;
  storage: StorageConfiguration;
  cache: CacheConfiguration;
  monitoring: MonitoringConfiguration;
}

export interface APIConfiguration {
  baseUrl: string;
  timeout: number;
  retries: number;
  rateLimit: RateLimitConfiguration;
}

export interface RateLimitConfiguration {
  requests: number;
  window: number;
  burst: number;
}

export interface StorageConfiguration {
  type: "local" | "session" | "indexeddb" | "remote";
  encryption: boolean;
  compression: boolean;
  ttl: number;
}

export interface CacheConfiguration {
  enabled: boolean;
  ttl: number;
  maxSize: number;
  strategy: "lru" | "fifo" | "lfu";
}

export interface MonitoringConfiguration {
  enabled: boolean;
  endpoint: string;
  sampleRate: number;
  metrics: string[];
}

export interface AppStatus {
  health: "healthy" | "degraded" | "unhealthy";
  uptime: number;
  lastError?: Error;
  performance: PerformanceMetrics;
}

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversation?: string;
  messages: Record<string, Message[]>;
  typing: Record<string, boolean>;
  status: ChatStatus;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  tags: string[];
  metadata: Record<string, any>;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: Date;
  metadata: MessageMetadata;
}

export interface MessageMetadata {
  model?: string;
  tokens?: number;
  cost?: number;
  duration?: number;
  error?: string;
}

export interface ChatStatus {
  isConnected: boolean;
  isTyping: boolean;
  lastActivity: Date;
  error?: string;
}

export interface SettingsState {
  general: GeneralSettings;
  appearance: AppearanceSettings;
  behavior: BehaviorSettings;
  privacy: PrivacySettings;
  advanced: AdvancedSettings;
}

export interface GeneralSettings {
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
}

export interface AppearanceSettings {
  theme: "light" | "dark" | "auto";
  fontSize: "small" | "medium" | "large";
  fontFamily: string;
  animations: boolean;
  compactMode: boolean;
}

export interface BehaviorSettings {
  autoSave: boolean;
  autoComplete: boolean;
  suggestions: boolean;
  shortcuts: Record<string, string>;
}

export interface PrivacySettings {
  dataCollection: boolean;
  analytics: boolean;
  personalization: boolean;
  cookies: boolean;
}

export interface AdvancedSettings {
  debugMode: boolean;
  experimentalFeatures: boolean;
  customCSS: string;
  customJS: string;
}

export interface PluginState {
  installed: Plugin[];
  active: string[];
  available: Plugin[];
  loading: string[];
  errors: Record<string, string>;
}

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  dependencies: string[];
  capabilities: PluginCapabilities;
  configuration: Record<string, any>;
  status: PluginStatus;
  metadata: PluginMetadata;
}

export interface PluginCapabilities {
  tools: Tool[];
  resources: Resource[];
  actions: Action[];
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  handler: Function;
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  uri: string;
  permissions: string[];
}

export interface Action {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  handler: Function;
}

export interface PluginStatus {
  isInstalled: boolean;
  isActive: boolean;
  isEnabled: boolean;
  lastUsed?: Date;
  errorCount: number;
  lastError?: string;
}

export interface PluginMetadata {
  category: string;
  tags: string[];
  rating: number;
  downloads: number;
  size: number;
  license: string;
  homepage: string;
  repository: string;
}

export interface AgentState {
  agents: Agent[];
  active: string[];
  loading: string[];
  errors: Record<string, string>;
}

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  capabilities: AgentCapabilities;
  configuration: AgentConfiguration;
  metadata: AgentMetadata;
}

export interface AgentType {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
}

export interface AgentStatus {
  isRunning: boolean;
  isHealthy: boolean;
  lastActivity: Date;
  errorCount: number;
  lastError?: string;
}

export interface AgentCapabilities {
  textGeneration: boolean;
  textCompletion: boolean;
  textAnalysis: boolean;
  codeGeneration: boolean;
  imageGeneration: boolean;
  audioGeneration: boolean;
  embedding: boolean;
  classification: boolean;
  summarization: boolean;
  translation: boolean;
}

export interface AgentConfiguration {
  model: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
  retries: number;
  cacheEnabled: boolean;
  loggingEnabled: boolean;
  monitoringEnabled: boolean;
}

export interface AgentMetadata {
  version: string;
  author: string;
  description: string;
  tags: string[];
  category: string;
  complexity: "low" | "medium" | "high";
  reliability: number;
  performance: number;
  security: number;
}

export interface UIState {
  theme: "light" | "dark" | "auto";
  sidebar: SidebarState;
  modals: ModalState[];
  toasts: ToastState[];
  loading: LoadingState;
  errors: ErrorState[];
}

export interface SidebarState {
  isOpen: boolean;
  width: number;
  activeTab: string;
  tabs: SidebarTab[];
}

export interface SidebarTab {
  id: string;
  name: string;
  icon: string;
  component: string;
  badge?: number;
}

export interface ModalState {
  id: string;
  component: string;
  props: Record<string, any>;
  isOpen: boolean;
  onClose?: Function;
}

export interface ToastState {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration: number;
  actions?: ToastAction[];
}

export interface ToastAction {
  label: string;
  action: Function;
}

export interface LoadingState {
  global: boolean;
  components: Record<string, boolean>;
  operations: Record<string, boolean>;
}

export interface ErrorState {
  id: string;
  type: "error" | "warning" | "info";
  message: string;
  details?: string;
  timestamp: Date;
  resolved: boolean;
  actions?: ErrorAction[];
}

export interface ErrorAction {
  label: string;
  action: Function;
}

export interface NotificationState {
  items: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
}

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: Function;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  email: boolean;
  frequency: "immediate" | "daily" | "weekly";
}

export interface PerformanceState {
  metrics: PerformanceMetrics;
  history: PerformanceSnapshot[];
  alerts: PerformanceAlert[];
  monitoring: PerformanceMonitoring;
}

export interface PerformanceSnapshot {
  timestamp: Date;
  metrics: PerformanceMetrics;
  context: Record<string, any>;
}

export interface PerformanceAlert {
  id: string;
  type: "warning" | "error" | "critical";
  message: string;
  threshold: number;
  current: number;
  timestamp: Date;
  resolved: boolean;
}

export interface PerformanceMonitoring {
  enabled: boolean;
  interval: number;
  thresholds: PerformanceThresholds;
  reporting: PerformanceReporting;
}

export interface PerformanceThresholds {
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  errorRate: number;
}

export interface PerformanceReporting {
  enabled: boolean;
  endpoint: string;
  frequency: number;
  includeHistory: boolean;
}

export interface AnalyticsState {
  events: AnalyticsEvent[];
  metrics: AnalyticsMetrics;
  settings: AnalyticsSettings;
}

export interface AnalyticsEvent {
  id: string;
  type: string;
  name: string;
  properties: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

export interface AnalyticsMetrics {
  pageViews: number;
  uniqueUsers: number;
  sessions: number;
  bounceRate: number;
  averageSessionDuration: number;
}

export interface AnalyticsSettings {
  enabled: boolean;
  trackingId: string;
  anonymize: boolean;
  respectDoNotTrack: boolean;
  customDimensions: Record<string, any>;
}
