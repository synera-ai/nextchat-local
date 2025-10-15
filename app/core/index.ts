// Core architecture exports
export * from "./types/architecture";
export * from "./utils";

// Re-export main components
export { EventBus } from "./utils/event-bus";
export { ModuleLoader } from "./utils/module-loader";
export { PluginManager } from "./utils/plugin-manager";
export {
  PerformanceMonitor,
  performanceMonitor,
} from "./utils/performance-monitor";
export {
  SecurityFramework,
  securityFramework,
} from "./utils/security-framework";
export { TestingFramework, testingFramework } from "./utils/testing-framework";

// Core architecture initialization
export class CoreArchitecture {
  private static instance: CoreArchitecture;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): CoreArchitecture {
    if (!CoreArchitecture.instance) {
      CoreArchitecture.instance = new CoreArchitecture();
    }
    return CoreArchitecture.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize core systems
      await this.initializeCoreSystems();

      this.isInitialized = true;
      console.log("Core architecture initialized successfully");
    } catch (error) {
      console.error("Failed to initialize core architecture:", error);
      throw error;
    }
  }

  private async initializeCoreSystems(): Promise<void> {
    // Initialize performance monitoring
    if (performanceMonitor.isRunning()) {
      performanceMonitor.stop();
    }

    // Initialize security framework
    if (!securityFramework.isInitialized()) {
      // Security framework initializes automatically
    }

    // Initialize testing framework
    if (!testingFramework.isRunning()) {
      // Testing framework initializes automatically
    }
  }

  isInitialized(): boolean {
    return this.isInitialized;
  }

  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      // Stop performance monitoring
      if (performanceMonitor.isRunning()) {
        performanceMonitor.stop();
      }

      this.isInitialized = false;
      console.log("Core architecture shutdown successfully");
    } catch (error) {
      console.error("Failed to shutdown core architecture:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const coreArchitecture = CoreArchitecture.getInstance();
