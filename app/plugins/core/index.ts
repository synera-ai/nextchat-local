// Core Plugin System
// This file exports the main plugin system components

export { CorePluginManager } from "./plugin-manager";
export { PluginConfigurationManager } from "./configuration";
export { PluginLifecycleManager } from "./lifecycle";
export { PluginSecurityManager } from "./security";
export { PluginDiscoveryManager } from "./discovery";
export { PluginExecutionManager } from "./execution";
export { PluginEventManager } from "./events";
export { PluginPerformanceManager } from "./performance";

// Export types
export type {
  Plugin,
  PluginInstance,
  PluginManager,
  PluginMetadata,
  PluginConfig,
  PluginState,
  PluginCapabilities,
  Tool,
  Resource,
  Action,
  Hook,
  Middleware,
  PluginConfigSchema,
  PluginSearchFilters,
  PluginInstallationResult,
  PluginEvents,
} from "./types";

export {
  PluginError,
  PluginConfigurationError,
  PluginExecutionError,
  PluginDependencyError,
} from "./types";

// Export performance types
export type {
  PerformanceMetrics,
  PerformanceHistoryEntry,
  PerformanceThresholds,
  PerformanceAlert,
  PerformanceReport,
} from "./performance";

// Export security types
export type { SecurityPolicy } from "./security";

// Export discovery types
export type { DiscoverySource } from "./discovery";

// Export execution types
export type { ExecutionContext } from "./execution";

// Create default plugin manager instance
import { CorePluginManager } from "./plugin-manager";

let defaultPluginManager: CorePluginManager | null = null;

export function getDefaultPluginManager(): CorePluginManager {
  if (!defaultPluginManager) {
    defaultPluginManager = new CorePluginManager();
  }
  return defaultPluginManager;
}

export async function initializePluginSystem(): Promise<CorePluginManager> {
  const manager = getDefaultPluginManager();
  await manager.initialize();
  return manager;
}

export async function destroyPluginSystem(): Promise<void> {
  if (defaultPluginManager) {
    await defaultPluginManager.destroy();
    defaultPluginManager = null;
  }
}
