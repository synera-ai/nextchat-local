// NextChat Plugin System
// This file exports the complete plugin system

// Core plugin system
export * from "./core";

// Plugin management system
export * from "./management";

// Plugin integration system
export * from "./integration";

// Main plugin system class
import { CorePluginManager } from "./core";
import {
  PluginInstaller,
  PluginUpdater,
  DependencyManager,
  initializeManagementSystem,
} from "./management";
import {
  PluginCommunicationSystem,
  PluginHooksSystem,
  initializeIntegrationSystem,
} from "./integration";

export class NextChatPluginSystem {
  private coreManager: CorePluginManager;
  private installer: PluginInstaller;
  private updater: PluginUpdater;
  private dependencyManager: DependencyManager;
  private communicationSystem: PluginCommunicationSystem;
  private hooksSystem: PluginHooksSystem;
  private initialized = false;

  constructor() {
    this.coreManager = new CorePluginManager();
    this.installer = new PluginInstaller();
    this.updater = new PluginUpdater();
    this.dependencyManager = new DependencyManager();
    this.communicationSystem = new PluginCommunicationSystem();
    this.hooksSystem = new PluginHooksSystem();
  }

  // Initialize the complete plugin system
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize core manager
      await this.coreManager.initialize();

      // Initialize management system
      const management = await initializeManagementSystem();
      this.installer = management.installer;
      this.updater = management.updater;
      this.dependencyManager = management.dependencyManager;

      // Initialize integration system
      const integration = await initializeIntegrationSystem();
      this.communicationSystem = integration.communication;
      this.hooksSystem = integration.hooks;

      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize plugin system: ${error}`);
    }
  }

  // Get core plugin manager
  getCoreManager(): CorePluginManager {
    return this.coreManager;
  }

  // Get plugin installer
  getInstaller(): PluginInstaller {
    return this.installer;
  }

  // Get plugin updater
  getUpdater(): PluginUpdater {
    return this.updater;
  }

  // Get dependency manager
  getDependencyManager(): DependencyManager {
    return this.dependencyManager;
  }

  // Get communication system
  getCommunicationSystem(): PluginCommunicationSystem {
    return this.communicationSystem;
  }

  // Get hooks system
  getHooksSystem(): PluginHooksSystem {
    return this.hooksSystem;
  }

  // Get system status
  getStatus(): {
    initialized: boolean;
    core: any;
    management: any;
    integration: any;
    dependencies: any;
  } {
    return {
      initialized: this.initialized,
      core: this.coreManager.getStatus(),
      management: {
        installer: "ready",
        updater: this.updater.getQueueStatus(),
        dependencies: this.dependencyManager.getStats(),
      },
      integration: {
        communication: this.communicationSystem.getStats(),
        hooks: this.hooksSystem.getStats(),
      },
      dependencies: this.dependencyManager.getStats(),
    };
  }

  // Cleanup
  async destroy(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    try {
      await Promise.all([
        this.coreManager.destroy(),
        this.updater.destroy(),
        this.dependencyManager.destroy(),
        this.communicationSystem.destroy(),
        this.hooksSystem.destroy(),
      ]);

      this.initialized = false;
    } catch (error) {
      console.error("Failed to destroy plugin system:", error);
    }
  }
}

// Create default plugin system instance
let defaultPluginSystem: NextChatPluginSystem | null = null;

export function getDefaultPluginSystem(): NextChatPluginSystem {
  if (!defaultPluginSystem) {
    defaultPluginSystem = new NextChatPluginSystem();
  }
  return defaultPluginSystem;
}

export async function initializePluginSystem(): Promise<NextChatPluginSystem> {
  const system = getDefaultPluginSystem();
  await system.initialize();
  return system;
}

export async function destroyPluginSystem(): Promise<void> {
  if (defaultPluginSystem) {
    await defaultPluginSystem.destroy();
    defaultPluginSystem = null;
  }
}
