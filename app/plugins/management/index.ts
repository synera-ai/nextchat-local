// Plugin Management System
// This file exports the plugin management components

export { PluginInstaller } from "./plugin-installer";
export { PluginUpdater } from "./plugin-updater";
export { DependencyManager } from "./dependency-manager";

// Export types
export type { InstallationOptions, InstallationTask } from "./plugin-installer";

export type {
  UpdateInfo,
  UpdateType,
  UpdateOptions,
  UpdateResult,
  UpdateTask,
} from "./plugin-updater";

export type {
  DependencyCheckResult,
  Conflict,
  ConflictResolution,
  DependencyTree,
} from "./dependency-manager";

// Create default management system
import { PluginInstaller } from "./plugin-installer";
import { PluginUpdater } from "./plugin-updater";
import { DependencyManager } from "./dependency-manager";

let defaultInstaller: PluginInstaller | null = null;
let defaultUpdater: PluginUpdater | null = null;
let defaultDependencyManager: DependencyManager | null = null;

export function getDefaultInstaller(): PluginInstaller {
  if (!defaultInstaller) {
    defaultInstaller = new PluginInstaller();
  }
  return defaultInstaller;
}

export function getDefaultUpdater(): PluginUpdater {
  if (!defaultUpdater) {
    defaultUpdater = new PluginUpdater();
  }
  return defaultUpdater;
}

export function getDefaultDependencyManager(): DependencyManager {
  if (!defaultDependencyManager) {
    defaultDependencyManager = new DependencyManager();
  }
  return defaultDependencyManager;
}

export async function initializeManagementSystem(): Promise<{
  installer: PluginInstaller;
  updater: PluginUpdater;
  dependencyManager: DependencyManager;
}> {
  const installer = getDefaultInstaller();
  const updater = getDefaultUpdater();
  const dependencyManager = getDefaultDependencyManager();

  await Promise.all([updater.initialize(), dependencyManager.initialize()]);

  return {
    installer,
    updater,
    dependencyManager,
  };
}

export async function destroyManagementSystem(): Promise<void> {
  if (defaultUpdater) {
    await defaultUpdater.destroy();
    defaultUpdater = null;
  }

  if (defaultDependencyManager) {
    await defaultDependencyManager.destroy();
    defaultDependencyManager = null;
  }

  defaultInstaller = null;
}
