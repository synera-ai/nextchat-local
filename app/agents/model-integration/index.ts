import { ModelRegistry } from "./registry";
import { ModelExecutor } from "./executor";
import { ModelCache } from "./cache";
import { ModelMonitor } from "./monitor";

export interface ModelIntegrationConfig {
  registry?: {
    cacheTTL?: number;
    maxRetries?: number;
    timeout?: number;
  };
  executor?: {
    maxConcurrentExecutions?: number;
    defaultTimeout?: number;
    retryAttempts?: number;
    retryDelay?: number;
    circuitBreakerThreshold?: number;
    circuitBreakerTimeout?: number;
  };
  cache?: {
    maxSize?: number;
    defaultTTL?: number;
    cleanupInterval?: number;
    compressionEnabled?: boolean;
    encryptionEnabled?: boolean;
  };
  monitor?: {
    metricsInterval?: number;
    alertThresholds?: {
      errorRate?: number;
      responseTime?: number;
      queueLength?: number;
      cacheHitRate?: number;
      memoryUsage?: number;
      cpuUsage?: number;
    };
    retentionPeriod?: number;
    enableRealTimeMonitoring?: boolean;
    enablePerformanceTracking?: boolean;
    enableErrorTracking?: boolean;
  };
}

export class ModelIntegrationSystem {
  public registry: ModelRegistry;
  public executor: ModelExecutor;
  public cache: ModelCache;
  public monitor: ModelMonitor;

  constructor(config?: ModelIntegrationConfig) {
    // Initialize components
    this.registry = new ModelRegistry();
    this.cache = new ModelCache(config?.cache);
    this.executor = new ModelExecutor(this.registry, config?.executor);
    this.monitor = new ModelMonitor(
      this.registry,
      this.executor,
      this.cache,
      config?.monitor,
    );

    this.setupEventForwarding();
  }

  private setupEventForwarding(): void {
    // Forward events from components to the main system
    this.registry.on("*", (event, ...args) => {
      this.emit(`registry:${event}`, ...args);
    });

    this.executor.on("*", (event, ...args) => {
      this.emit(`executor:${event}`, ...args);
    });

    this.cache.on("*", (event, ...args) => {
      this.emit(`cache:${event}`, ...args);
    });

    this.monitor.on("*", (event, ...args) => {
      this.emit(`monitor:${event}`, ...args);
    });
  }

  async initialize(): Promise<void> {
    try {
      // Start monitoring
      await this.monitor.startMonitoring();

      // Initialize default models
      await this.registry.getAvailableModels();

      console.log("Model Integration System initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Model Integration System:", error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    try {
      // Stop monitoring
      await this.monitor.stopMonitoring();

      // Clear cache
      await this.cache.clear();

      // Destroy cache
      this.cache.destroy();

      console.log("Model Integration System shutdown successfully");
    } catch (error) {
      console.error("Failed to shutdown Model Integration System:", error);
      throw error;
    }
  }

  // Convenience methods
  async executeModel(modelId: string, input: any, options?: any): Promise<any> {
    return this.executor.executeModel(modelId, input, options);
  }

  async executeModelAsync(
    modelId: string,
    input: any,
    options?: any,
  ): Promise<any> {
    return this.executor.executeModelAsync(modelId, input, options);
  }

  async getAvailableModels(): Promise<any[]> {
    return this.registry.getAvailableModels();
  }

  async getModelMetrics(modelId: string): Promise<any> {
    return this.monitor.getModelMetrics(modelId);
  }

  async getSystemMetrics(): Promise<any> {
    return this.monitor.getSystemMetrics();
  }

  async getAlerts(activeOnly: boolean = true): Promise<any[]> {
    return this.monitor.getAlerts(activeOnly);
  }

  async generatePerformanceReport(
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    return this.monitor.generatePerformanceReport(startDate, endDate);
  }
}

// Export individual components
export { ModelRegistry, ModelExecutor, ModelCache, ModelMonitor };

// Export types
export type {
  AIModel,
  ModelCapabilities,
  ModelMetadata,
  ModelResult,
  ModelExecutionMetadata,
  ModelMetrics as RegistryModelMetrics,
  ModelExecution,
  ModelStatus,
  ModelExecutionOptions,
  AsyncModelResult,
} from "./registry";

export type {
  ModelExecutorConfig,
  ExecutionContext,
  ExecutionStatus,
  ExecutionResult,
  ExecutionMetadata,
} from "./executor";

export type {
  CacheConfig,
  CacheEntry,
  CacheStats,
  CacheOptions,
} from "./cache";

export type {
  MonitoringConfig,
  AlertThresholds,
  ModelMetrics,
  SystemMetrics,
  SystemHealth,
  HealthIssue,
  Alert,
  PerformanceReport,
} from "./monitor";

// Create and export a default instance
export const modelIntegrationSystem = new ModelIntegrationSystem();
