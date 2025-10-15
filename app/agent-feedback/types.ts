// AI Agent Visual Feedback Types
// Core types for the AI agent visual feedback system

export interface VisualFeedbackSystem {
  // Core visual feedback components
  statusIndicators: StatusIndicatorSystem;
  progressVisualization: ProgressVisualizationSystem;
  activityFeed: ActivityFeedSystem;
  agentManagement: AgentManagementSystem;

  // Performance and analytics
  performance: PerformanceMonitoring;
  analytics: AnalyticsSystem;
  debugging: DebuggingSystem;

  // User experience
  userExperience: UserExperienceSystem;
  feedback: FeedbackSystem;
  optimization: OptimizationSystem;
}

export interface StatusIndicatorSystem {
  // Status indicator components
  components: StatusIndicatorComponent[];
  types: StatusIndicatorType[];
  states: StatusIndicatorState[];

  // Status management
  management: StatusManagement;
  updates: StatusUpdates;
  notifications: StatusNotifications;

  // Status customization
  customization: StatusCustomization;
  theming: StatusTheming;
  accessibility: StatusAccessibility;
}

export interface ProgressVisualizationSystem {
  // Progress components
  components: ProgressComponent[];
  types: ProgressType[];
  animations: ProgressAnimation[];

  // Progress management
  management: ProgressManagement;
  updates: ProgressUpdates;
  completion: ProgressCompletion;

  // Progress customization
  customization: ProgressCustomization;
  theming: ProgressTheming;
  accessibility: ProgressAccessibility;
}

export interface ActivityFeedSystem {
  // Activity feed components
  components: ActivityFeedComponent[];
  types: ActivityType[];
  filters: ActivityFilter[];

  // Activity management
  management: ActivityManagement;
  updates: ActivityUpdates;
  history: ActivityHistory;

  // Activity customization
  customization: ActivityCustomization;
  theming: ActivityTheming;
  accessibility: ActivityAccessibility;
}

export interface AgentManagementSystem {
  // Agent management components
  components: AgentManagementComponent[];
  controls: AgentControl[];
  monitoring: AgentMonitoring[];

  // Agent management
  management: AgentManagement;
  configuration: AgentConfiguration;
  debugging: AgentDebugging;

  // Agent customization
  customization: AgentCustomization;
  theming: AgentTheming;
  accessibility: AgentAccessibility;
}

// Status Indicator Types
export type StatusIndicatorType =
  | "agent-status"
  | "connection-status"
  | "error-status"
  | "success-status"
  | "warning-status"
  | "loading-status";

export type StatusIndicatorState =
  | "active"
  | "inactive"
  | "error"
  | "warning"
  | "success"
  | "loading"
  | "unknown";

export interface StatusIndicatorComponent {
  id: string;
  type: StatusIndicatorType;
  state: StatusIndicatorState;
  message?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface StatusManagement {
  initialize(): Promise<void>;
  updateStatus(
    componentId: string,
    state: StatusIndicatorState,
    message?: string,
  ): void;
  getStatus(componentId: string): StatusIndicatorComponent | null;
  getAllStatuses(): StatusIndicatorComponent[];
  clearStatus(componentId: string): void;
  destroy(): Promise<void>;
}

export interface StatusUpdates {
  subscribe(callback: (update: StatusIndicatorComponent) => void): () => void;
  unsubscribe(callback: (update: StatusIndicatorComponent) => void): void;
  publish(update: StatusIndicatorComponent): void;
}

export interface StatusNotifications {
  show(component: StatusIndicatorComponent): void;
  hide(componentId: string): void;
  clear(): void;
}

export interface StatusCustomization {
  setTheme(theme: StatusTheme): void;
  setSize(size: StatusSize): void;
  setAnimation(animation: StatusAnimation): void;
}

export interface StatusTheming {
  colors: StatusColors;
  sizes: StatusSizes;
  animations: StatusAnimations;
}

export interface StatusAccessibility {
  ariaLabel: string;
  ariaDescription?: string;
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
}

// Progress Visualization Types
export type ProgressType =
  | "task-progress"
  | "step-progress"
  | "circular-progress"
  | "linear-progress"
  | "indeterminate-progress";

export interface ProgressComponent {
  id: string;
  type: ProgressType;
  value: number; // 0-100
  max: number;
  label?: string;
  description?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ProgressManagement {
  initialize(): Promise<void>;
  updateProgress(componentId: string, value: number, max?: number): void;
  getProgress(componentId: string): ProgressComponent | null;
  getAllProgress(): ProgressComponent[];
  completeProgress(componentId: string): void;
  resetProgress(componentId: string): void;
  destroy(): Promise<void>;
}

export interface ProgressUpdates {
  subscribe(callback: (update: ProgressComponent) => void): () => void;
  unsubscribe(callback: (update: ProgressComponent) => void): void;
  publish(update: ProgressComponent): void;
}

export interface ProgressCompletion {
  onComplete(callback: (component: ProgressComponent) => void): void;
  triggerComplete(componentId: string): void;
}

export interface ProgressCustomization {
  setTheme(theme: ProgressTheme): void;
  setSize(size: ProgressSize): void;
  setAnimation(animation: ProgressAnimation): void;
}

export interface ProgressTheming {
  colors: ProgressColors;
  sizes: ProgressSizes;
  animations: ProgressAnimations;
}

export interface ProgressAccessibility {
  ariaLabel: string;
  ariaValueNow: number;
  ariaValueMin: number;
  ariaValueMax: number;
  ariaValueText?: string;
}

// Activity Feed Types
export type ActivityType =
  | "agent-start"
  | "agent-stop"
  | "agent-error"
  | "agent-success"
  | "task-start"
  | "task-complete"
  | "task-error"
  | "system-event"
  | "user-action";

export interface ActivityFeedComponent {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: Date;
  severity: ActivitySeverity;
  metadata?: Record<string, any>;
}

export type ActivitySeverity =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "critical";

export interface ActivityManagement {
  initialize(): Promise<void>;
  addActivity(
    activity: Omit<ActivityFeedComponent, "id" | "timestamp">,
  ): string;
  getActivity(activityId: string): ActivityFeedComponent | null;
  getAllActivities(): ActivityFeedComponent[];
  clearActivities(): void;
  filterActivities(filter: ActivityFilter): ActivityFeedComponent[];
  destroy(): Promise<void>;
}

export interface ActivityUpdates {
  subscribe(callback: (activity: ActivityFeedComponent) => void): () => void;
  unsubscribe(callback: (activity: ActivityFeedComponent) => void): void;
  publish(activity: ActivityFeedComponent): void;
}

export interface ActivityHistory {
  getHistory(limit?: number): ActivityFeedComponent[];
  exportHistory(format: "json" | "csv"): string;
  clearHistory(): void;
}

export interface ActivityFilter {
  types?: ActivityType[];
  severity?: ActivitySeverity[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}

export interface ActivityCustomization {
  setTheme(theme: ActivityTheme): void;
  setLayout(layout: ActivityLayout): void;
  setFilters(filters: ActivityFilter): void;
}

export interface ActivityTheming {
  colors: ActivityColors;
  layouts: ActivityLayouts;
  typography: ActivityTypography;
}

export interface ActivityAccessibility {
  ariaLabel: string;
  ariaDescription?: string;
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
}

// Agent Management Types
export type AgentControl =
  | "start"
  | "stop"
  | "restart"
  | "pause"
  | "resume"
  | "configure";

export interface AgentManagementComponent {
  id: string;
  name: string;
  status: AgentStatus;
  controls: AgentControl[];
  configuration: AgentConfiguration;
  monitoring: AgentMonitoring;
  timestamp: Date;
}

export type AgentStatus =
  | "running"
  | "stopped"
  | "paused"
  | "error"
  | "starting"
  | "stopping";

export interface AgentManagement {
  initialize(): Promise<void>;
  startAgent(agentId: string): Promise<void>;
  stopAgent(agentId: string): Promise<void>;
  restartAgent(agentId: string): Promise<void>;
  pauseAgent(agentId: string): Promise<void>;
  resumeAgent(agentId: string): Promise<void>;
  configureAgent(agentId: string, config: AgentConfiguration): Promise<void>;
  getAllAgents(): AgentManagementComponent[];
  destroy(): Promise<void>;
  on(event: string, listener: (...args: any[]) => void): void;
}

export interface AgentConfiguration {
  settings: Record<string, any>;
  permissions: string[];
  rateLimits: Record<string, any>;
  hooks: Record<string, any>;
  middleware: Record<string, any>;
}

export interface AgentMonitoring {
  metrics: AgentMetrics;
  logs: AgentLog[];
  performance: AgentPerformance;
  health: AgentHealth;
}

export interface AgentDebugging {
  enableDebugging(agentId: string): void;
  disableDebugging(agentId: string): void;
  getDebugInfo(agentId: string): AgentDebugInfo;
  setBreakpoint(agentId: string, breakpoint: AgentBreakpoint): void;
  removeBreakpoint(agentId: string, breakpointId: string): void;
}

export interface AgentCustomization {
  setTheme(theme: AgentTheme): void;
  setLayout(layout: AgentLayout): void;
  setControls(controls: AgentControl[]): void;
}

export interface AgentTheming {
  colors: AgentColors;
  layouts: AgentLayouts;
  controls: AgentControlStyles;
}

export interface AgentAccessibility {
  ariaLabel: string;
  ariaDescription?: string;
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
}

// Performance and Analytics Types
export interface PerformanceMonitoring {
  initialize(): Promise<void>;
  destroy(): Promise<void>;
  metrics: PerformanceMetrics;
  alerts: PerformanceAlert[];
  optimization: PerformanceOptimization;
  on(event: string, listener: (...args: any[]) => void): void;
}

export interface AnalyticsSystem {
  initialize(): Promise<void>;
  destroy(): Promise<void>;
  dashboard: AnalyticsDashboard;
  statistics: UsageStatistics;
  reports: AnalyticsReport[];
  on(event: string, listener: (...args: any[]) => void): void;
}

export interface DebuggingSystem {
  initialize(): Promise<void>;
  destroy(): Promise<void>;
  tools: DebuggingTool[];
  logs: DebugLog[];
  breakpoints: DebugBreakpoint[];
  on(event: string, listener: (...args: any[]) => void): void;
}

export interface UserExperienceSystem {
  initialize(): Promise<void>;
  destroy(): Promise<void>;
  metrics: UserExperienceMetrics;
  feedback: UserFeedback[];
  optimization: UserExperienceOptimization;
  on(event: string, listener: (...args: any[]) => void): void;
}

export interface FeedbackSystem {
  initialize(): Promise<void>;
  destroy(): Promise<void>;
  collect(feedback: UserFeedback): void;
  analyze(feedback: UserFeedback[]): FeedbackAnalysis;
  report(analysis: FeedbackAnalysis): FeedbackReport;
  on(event: string, listener: (...args: any[]) => void): void;
}

export interface OptimizationSystem {
  initialize(): Promise<void>;
  destroy(): Promise<void>;
  optimize(): OptimizationResult;
  monitor(): OptimizationMonitoring;
  report(): OptimizationReport;
  on(event: string, listener: (...args: any[]) => void): void;
}

// Supporting Types
export interface StatusTheme {
  colors: StatusColors;
  sizes: StatusSizes;
  animations: StatusAnimations;
}

export interface StatusColors {
  active: string;
  inactive: string;
  error: string;
  warning: string;
  success: string;
  loading: string;
  unknown: string;
}

export interface StatusSizes {
  small: string;
  medium: string;
  large: string;
}

export interface StatusAnimations {
  pulse: boolean;
  spin: boolean;
  fade: boolean;
}

export interface StatusAnimation {
  type: "pulse" | "spin" | "fade";
  duration: number;
  easing: string;
}

export interface StatusSize {
  width: string;
  height: string;
}

export interface ProgressTheme {
  colors: ProgressColors;
  sizes: ProgressSizes;
  animations: ProgressAnimations;
}

export interface ProgressColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  success: string;
  error: string;
  warning: string;
}

export interface ProgressSizes {
  small: string;
  medium: string;
  large: string;
}

export interface ProgressAnimations {
  smooth: boolean;
  bounce: boolean;
  pulse: boolean;
}

export interface ProgressAnimation {
  type: "smooth" | "bounce" | "pulse";
  duration: number;
  easing: string;
}

export interface ProgressSize {
  width: string;
  height: string;
}

export interface ActivityTheme {
  colors: ActivityColors;
  layouts: ActivityLayouts;
  typography: ActivityTypography;
}

export interface ActivityColors {
  background: string;
  text: string;
  border: string;
  info: string;
  success: string;
  warning: string;
  error: string;
  critical: string;
}

export interface ActivityLayouts {
  list: string;
  grid: string;
  timeline: string;
}

export interface ActivityTypography {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
}

export interface ActivityLayout {
  type: "list" | "grid" | "timeline";
  columns?: number;
  spacing?: string;
}

export interface AgentTheme {
  colors: AgentColors;
  layouts: AgentLayouts;
  controls: AgentControlStyles;
}

export interface AgentColors {
  background: string;
  text: string;
  border: string;
  primary: string;
  secondary: string;
  success: string;
  error: string;
  warning: string;
}

export interface AgentLayouts {
  compact: string;
  expanded: string;
  dashboard: string;
}

export interface AgentControlStyles {
  button: string;
  input: string;
  select: string;
  toggle: string;
}

export interface AgentLayout {
  type: "compact" | "expanded" | "dashboard";
  columns?: number;
  spacing?: string;
}

export interface AgentMetrics {
  cpuUsage: number;
  memoryUsage: number;
  responseTime: number;
  errorRate: number;
  uptime: number;
}

export interface AgentLog {
  id: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AgentPerformance {
  avgResponseTime: number;
  totalRequests: number;
  successRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface AgentHealth {
  status: "healthy" | "warning" | "error";
  message: string;
  metrics: Record<string, any>;
}

export interface AgentDebugInfo {
  agentId: string;
  state: any;
  variables: Record<string, any>;
  callStack: string[];
  breakpoints: AgentBreakpoint[];
}

export interface AgentBreakpoint {
  id: string;
  condition: string;
  enabled: boolean;
  hitCount: number;
}

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  availability: number;
}

export interface PerformanceAlert {
  id: string;
  type: "threshold" | "anomaly" | "error";
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: Date;
}

export interface PerformanceOptimization {
  suggestions: OptimizationSuggestion[];
  applied: OptimizationResult[];
  pending: OptimizationResult[];
}

export interface OptimizationSuggestion {
  id: string;
  type: "performance" | "memory" | "network" | "ui";
  description: string;
  impact: "low" | "medium" | "high";
  effort: "low" | "medium" | "high";
}

export interface OptimizationResult {
  id: string;
  type: string;
  description: string;
  impact: number;
  applied: boolean;
  timestamp: Date;
}

export interface OptimizationMonitoring {
  metrics: Record<string, number>;
  trends: Record<string, number[]>;
  alerts: PerformanceAlert[];
}

export interface OptimizationReport {
  summary: string;
  metrics: Record<string, number>;
  recommendations: OptimizationSuggestion[];
  applied: OptimizationResult[];
}

export interface AnalyticsDashboard {
  widgets: AnalyticsWidget[];
  layout: DashboardLayout;
  filters: DashboardFilter[];
}

export interface AnalyticsWidget {
  id: string;
  type: "chart" | "metric" | "table" | "text";
  title: string;
  data: any;
  config: Record<string, any>;
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  widgets: WidgetPosition[];
}

export interface WidgetPosition {
  widgetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DashboardFilter {
  id: string;
  type: "date" | "agent" | "type" | "severity";
  value: any;
}

export interface UsageStatistics {
  totalAgents: number;
  activeAgents: number;
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  uptime: number;
}

export interface AnalyticsReport {
  id: string;
  title: string;
  type: "daily" | "weekly" | "monthly" | "custom";
  data: any;
  generatedAt: Date;
}

export interface DebuggingTool {
  id: string;
  name: string;
  type: "inspector" | "profiler" | "logger" | "tracer";
  enabled: boolean;
  config: Record<string, any>;
}

export interface DebugLog {
  id: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  timestamp: Date;
  source: string;
  metadata?: Record<string, any>;
}

export interface DebugBreakpoint {
  id: string;
  condition: string;
  enabled: boolean;
  hitCount: number;
  lastHit?: Date;
}

export interface UserExperienceMetrics {
  loadTime: number;
  interactionTime: number;
  errorRate: number;
  satisfaction: number;
  engagement: number;
}

export interface UserFeedback {
  id: string;
  type: "rating" | "comment" | "bug" | "feature";
  rating?: number;
  comment?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface UserExperienceOptimization {
  suggestions: OptimizationSuggestion[];
  applied: OptimizationResult[];
  metrics: UserExperienceMetrics;
}

export interface FeedbackAnalysis {
  sentiment: "positive" | "neutral" | "negative";
  themes: string[];
  recommendations: string[];
  metrics: Record<string, number>;
}

export interface FeedbackReport {
  summary: string;
  analysis: FeedbackAnalysis;
  recommendations: string[];
  generatedAt: Date;
}
