// Component system exports
export { ComponentRegistry, componentRegistry } from "./component-registry";
export { LazyLoader, lazyLoader } from "./lazy-loader";

// Re-export types
export type {
  ComponentRegistryConfig,
  ComponentMetadata,
  ComponentProp,
  ComponentEvent,
  ComponentSlot,
  ComponentExample,
  ComponentDocumentation,
  ComponentPerformance,
  ComponentAccessibility,
} from "./component-registry";

export type {
  LazyLoaderConfig,
  LazyLoadOptions,
  LazyLoadResult,
  LazyLoadPerformance,
  LazyLoadAccessibility,
  LazyLoadBundle,
  LazyLoadCache,
  LazyLoadAnalytics,
  LazyLoadMonitoring,
  LazyLoadMetrics,
  LazyLoadAlert,
  LazyLoadTrends,
} from "./lazy-loader";
