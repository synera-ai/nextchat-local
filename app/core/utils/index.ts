// Core utilities exports
export { EventBus } from "./event-bus";
export { ModuleLoader } from "./module-loader";
export { PluginManager } from "./plugin-manager";
export { PerformanceMonitor, performanceMonitor } from "./performance-monitor";
export { SecurityFramework, securityFramework } from "./security-framework";
export { TestingFramework, testingFramework } from "./testing-framework";

// Re-export types
export type {
  EventBusConfig,
  EventHandler,
  EventSubscription,
  EventFilter,
} from "./event-bus";

export type {
  ModuleLoaderConfig,
  ModuleDefinition,
  ModuleLoadResult,
  ModuleLoadError,
} from "./module-loader";

export type {
  PluginManagerConfig,
  PluginDefinition,
  PluginLoadResult,
  PluginLoadError,
} from "./plugin-manager";

export type {
  PerformanceMonitorConfig,
  WebVitals,
  CustomMetric,
  PerformanceReport,
  PerformanceSummary,
  PerformanceTrends,
} from "./performance-monitor";

export type {
  SecurityConfig,
  PasswordPolicy,
  RateLimitConfig,
  UserSession,
  SecurityEvent,
} from "./security-framework";

export type {
  TestConfig,
  TestContext,
  TestAssertion,
  TestCoverage,
  TestMetrics,
} from "./testing-framework";
