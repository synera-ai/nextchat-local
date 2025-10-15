// Plugin Integration System
// This file exports the plugin integration components

export { PluginAPI } from "./plugin-api";
export { PluginCommunicationSystem } from "./plugin-communication";
export { PluginHooksSystem } from "./plugin-hooks";

// Export types
export type { RequestOptions, LogLevel, HealthStatus } from "./plugin-api";

export type {
  Message,
  PublishOptions,
  DirectMessageOptions,
  RequestOptions as CommunicationRequestOptions,
} from "./plugin-communication";

export type { HookExecution, HookMetrics } from "./plugin-hooks";

// Create default integration system
import { PluginCommunicationSystem } from "./plugin-communication";
import { PluginHooksSystem } from "./plugin-hooks";

let defaultCommunicationSystem: PluginCommunicationSystem | null = null;
let defaultHooksSystem: PluginHooksSystem | null = null;

export function getDefaultCommunicationSystem(): PluginCommunicationSystem {
  if (!defaultCommunicationSystem) {
    defaultCommunicationSystem = new PluginCommunicationSystem();
  }
  return defaultCommunicationSystem;
}

export function getDefaultHooksSystem(): PluginHooksSystem {
  if (!defaultHooksSystem) {
    defaultHooksSystem = new PluginHooksSystem();
  }
  return defaultHooksSystem;
}

export async function initializeIntegrationSystem(): Promise<{
  communication: PluginCommunicationSystem;
  hooks: PluginHooksSystem;
}> {
  const communication = getDefaultCommunicationSystem();
  const hooks = getDefaultHooksSystem();

  await Promise.all([communication.initialize(), hooks.initialize()]);

  return {
    communication,
    hooks,
  };
}

export async function destroyIntegrationSystem(): Promise<void> {
  if (defaultCommunicationSystem) {
    await defaultCommunicationSystem.destroy();
    defaultCommunicationSystem = null;
  }

  if (defaultHooksSystem) {
    await defaultHooksSystem.destroy();
    defaultHooksSystem = null;
  }
}
