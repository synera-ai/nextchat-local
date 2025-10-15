import {
  ModuleDefinition,
  ModuleExports,
  ComponentDefinition,
  ServiceDefinition,
} from "../types/architecture";

export interface ModuleLoaderConfig {
  basePath: string;
  cacheEnabled: boolean;
  cacheTTL: number;
  lazyLoading: boolean;
  preloadModules: string[];
  errorRetryAttempts: number;
  errorRetryDelay: number;
  enableLogging: boolean;
  enableMetrics: boolean;
}

export interface ModuleCache {
  [moduleId: string]: {
    module: ModuleDefinition;
    exports: ModuleExports;
    loadedAt: Date;
    lastAccessed: Date;
    accessCount: number;
  };
}

export interface ModuleMetrics {
  totalModules: number;
  loadedModules: number;
  failedModules: number;
  averageLoadTime: number;
  cacheHitRate: number;
  errorRate: number;
  lastLoadTime?: Date;
}

export interface LoadModuleOptions {
  forceReload?: boolean;
  timeout?: number;
  retries?: number;
  dependencies?: string[];
  onProgress?: (progress: number) => void;
}

export class ModuleLoader {
  private config: ModuleLoaderConfig;
  private cache: ModuleCache = {};
  private loadedModules: Map<string, ModuleDefinition> = new Map();
  private loadingPromises: Map<string, Promise<ModuleDefinition>> = new Map();
  private metrics: ModuleMetrics = {
    totalModules: 0,
    loadedModules: 0,
    failedModules: 0,
    averageProcessingTime: 0,
    cacheHitRate: 0,
    errorRate: 0,
  };
  private isRunning = false;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config?: Partial<ModuleLoaderConfig>) {
    this.config = {
      basePath: "/modules",
      cacheEnabled: true,
      cacheTTL: 300000, // 5 minutes
      lazyLoading: true,
      preloadModules: [],
      errorRetryAttempts: 3,
      errorRetryDelay: 1000,
      enableLogging: true,
      enableMetrics: true,
      ...config,
    };

    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Preload specified modules
      if (this.config.preloadModules.length > 0) {
        await this.preloadModules(this.config.preloadModules);
      }

      // Start cleanup timer
      this.startCleanupTimer();

      this.isRunning = true;
      this.log("ModuleLoader initialized");
    } catch (error) {
      this.log("Failed to initialize ModuleLoader:", error);
      throw error;
    }
  }

  async loadModule(
    moduleId: string,
    options: LoadModuleOptions = {},
  ): Promise<ModuleDefinition> {
    const startTime = Date.now();

    try {
      // Check if already loading
      if (this.loadingPromises.has(moduleId)) {
        return this.loadingPromises.get(moduleId)!;
      }

      // Check cache first
      if (this.config.cacheEnabled && !options.forceReload) {
        const cached = this.getCachedModule(moduleId);
        if (cached) {
          this.updateMetrics("cacheHit");
          this.log(`Module ${moduleId} loaded from cache`);
          return cached;
        }
      }

      // Check if already loaded
      if (this.loadedModules.has(moduleId) && !options.forceReload) {
        const loadedModule = this.loadedModules.get(moduleId)!;
        this.log(`Module ${moduleId} already loaded`);
        return loadedModule;
      }

      // Create loading promise
      const loadingPromise = this.loadModuleInternal(moduleId, options);
      this.loadingPromises.set(moduleId, loadingPromise);

      try {
        const loadedModule = await loadingPromise;

        // Store in cache
        if (this.config.cacheEnabled) {
          this.cacheModule(moduleId, loadedModule);
        }

        // Store in loaded modules
        this.loadedModules.set(moduleId, loadedModule);

        // Update metrics
        const loadTime = Date.now() - startTime;
        this.updateMetrics("loaded", loadTime);

        this.log(`Module ${moduleId} loaded successfully in ${loadTime}ms`);
        return loadedModule;
      } finally {
        this.loadingPromises.delete(moduleId);
      }
    } catch (error) {
      this.updateMetrics("error");
      this.log(`Failed to load module ${moduleId}:`, error);
      throw error;
    }
  }

  private async loadModuleInternal(
    moduleId: string,
    options: LoadModuleOptions,
  ): Promise<ModuleDefinition> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    // Load dependencies first
    if (options.dependencies && options.dependencies.length > 0) {
      await this.loadDependencies(options.dependencies);
    }

    // Retry logic
    for (
      let attempt = 0;
      attempt <= (options.retries || this.config.errorRetryAttempts);
      attempt++
    ) {
      try {
        if (attempt > 0) {
          await this.delay(this.config.errorRetryDelay * attempt);
          this.log(
            `Retrying to load module ${moduleId} (attempt ${attempt + 1})`,
          );
        }

        // Load module definition
        const moduleDefinition = await this.loadModuleDefinition(moduleId);

        // Load module exports
        const exports = await this.loadModuleExports(
          moduleId,
          moduleDefinition,
        );

        // Validate module
        await this.validateModule(moduleDefinition, exports);

        // Initialize module
        await this.initializeModule(moduleDefinition, exports);

        const loadTime = Date.now() - startTime;
        this.log(`Module ${moduleId} loaded in ${loadTime}ms`);

        return moduleDefinition;
      } catch (error) {
        lastError = error as Error;
        this.log(
          `Attempt ${attempt + 1} failed for module ${moduleId}:`,
          error,
        );

        if (attempt === (options.retries || this.config.errorRetryAttempts)) {
          break;
        }
      }
    }

    throw new Error(
      `Failed to load module ${moduleId} after ${
        (options.retries || this.config.errorRetryAttempts) + 1
      } attempts: ${lastError?.message}`,
    );
  }

  private async loadModuleDefinition(
    moduleId: string,
  ): Promise<ModuleDefinition> {
    try {
      // In a real implementation, this would load from a module registry or file system
      // For now, we'll simulate loading a module definition
      const modulePath = `${this.config.basePath}/${moduleId}/module.json`;

      // Simulate network request
      await this.delay(100);

      // Return mock module definition
      return {
        id: moduleId,
        name: `Module ${moduleId}`,
        version: "1.0.0",
        description: `Description for module ${moduleId}`,
        dependencies: [],
        exports: {
          components: {},
          hooks: {},
          services: {},
          types: {},
          constants: {},
        },
        routes: [],
        components: [],
        services: [],
        metadata: {
          author: "System",
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ["module"],
          category: "feature",
          complexity: "medium",
          reliability: 0.9,
          performance: 0.8,
          security: 0.7,
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to load module definition for ${moduleId}: ${error.message}`,
      );
    }
  }

  private async loadModuleExports(
    moduleId: string,
    definition: ModuleDefinition,
  ): Promise<ModuleExports> {
    try {
      // In a real implementation, this would load the actual module exports
      // For now, we'll simulate loading exports
      const exportsPath = `${this.config.basePath}/${moduleId}/index.js`;

      // Simulate network request
      await this.delay(200);

      // Return mock exports
      return {
        components: {},
        hooks: {},
        services: {},
        types: {},
        constants: {},
      };
    } catch (error) {
      throw new Error(
        `Failed to load module exports for ${moduleId}: ${error.message}`,
      );
    }
  }

  private async validateModule(
    definition: ModuleDefinition,
    exports: ModuleExports,
  ): Promise<void> {
    // Validate module definition
    if (!definition.id || !definition.name || !definition.version) {
      throw new Error("Invalid module definition: missing required fields");
    }

    // Validate exports
    if (!exports || typeof exports !== "object") {
      throw new Error("Invalid module exports: must be an object");
    }

    // Validate dependencies
    for (const dependency of definition.dependencies) {
      if (!this.loadedModules.has(dependency)) {
        throw new Error(`Missing dependency: ${dependency}`);
      }
    }

    this.log(`Module ${definition.id} validation passed`);
  }

  private async initializeModule(
    definition: ModuleDefinition,
    exports: ModuleExports,
  ): Promise<void> {
    try {
      // Initialize module services
      for (const service of definition.services) {
        await this.initializeService(service, exports);
      }

      // Initialize module components
      for (const component of definition.components) {
        await this.initializeComponent(component, exports);
      }

      this.log(`Module ${definition.id} initialization completed`);
    } catch (error) {
      throw new Error(
        `Failed to initialize module ${definition.id}: ${error.message}`,
      );
    }
  }

  private async initializeService(
    service: ServiceDefinition,
    exports: ModuleExports,
  ): Promise<void> {
    try {
      const serviceInstance = exports.services[service.name];
      if (serviceInstance && typeof serviceInstance.initialize === "function") {
        await serviceInstance.initialize();
      }
    } catch (error) {
      this.log(`Failed to initialize service ${service.name}:`, error);
    }
  }

  private async initializeComponent(
    component: ComponentDefinition,
    exports: ModuleExports,
  ): Promise<void> {
    try {
      const componentInstance = exports.components[component.name];
      if (
        componentInstance &&
        typeof componentInstance.initialize === "function"
      ) {
        await componentInstance.initialize();
      }
    } catch (error) {
      this.log(`Failed to initialize component ${component.name}:`, error);
    }
  }

  private async loadDependencies(dependencies: string[]): Promise<void> {
    const loadPromises = dependencies.map((dep) => this.loadModule(dep));
    await Promise.all(loadPromises);
  }

  private async preloadModules(moduleIds: string[]): Promise<void> {
    const loadPromises = moduleIds.map((id) => this.loadModule(id));
    await Promise.allSettled(loadPromises);
  }

  private getCachedModule(moduleId: string): ModuleDefinition | null {
    const cached = this.cache[moduleId];
    if (!cached) return null;

    // Check if cache is expired
    const now = Date.now();
    if (now - cached.loadedAt.getTime() > this.config.cacheTTL) {
      delete this.cache[moduleId];
      return null;
    }

    // Update access info
    cached.lastAccessed = new Date();
    cached.accessCount++;

    return cached.module;
  }

  private cacheModule(moduleId: string, module: ModuleDefinition): void {
    this.cache[moduleId] = {
      module,
      exports: module.exports,
      loadedAt: new Date(),
      lastAccessed: new Date(),
      accessCount: 1,
    };
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cacheTTL);
  }

  private cleanup(): void {
    const now = Date.now();

    // Clean up expired cache entries
    for (const [moduleId, cached] of Object.entries(this.cache)) {
      if (now - cached.loadedAt.getTime() > this.config.cacheTTL) {
        delete this.cache[moduleId];
      }
    }
  }

  private updateMetrics(action: string, value?: number): void {
    switch (action) {
      case "loaded":
        this.metrics.loadedModules++;
        if (value) {
          this.metrics.averageLoadTime =
            (this.metrics.averageLoadTime + value) / 2;
        }
        this.metrics.lastLoadTime = new Date();
        break;
      case "error":
        this.metrics.failedModules++;
        this.metrics.errorRate =
          this.metrics.failedModules /
          (this.metrics.loadedModules + this.metrics.failedModules);
        break;
      case "cacheHit":
        this.metrics.cacheHitRate = (this.metrics.cacheHitRate + 1) / 2;
        break;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private log(message: string, ...args: any[]): void {
    if (this.config.enableLogging) {
      console.log(`[ModuleLoader] ${message}`, ...args);
    }
  }

  // Public methods
  async unloadModule(moduleId: string): Promise<void> {
    try {
      const loadedModule = this.loadedModules.get(moduleId);
      if (!loadedModule) {
        this.log(`Module ${moduleId} not loaded`);
        return;
      }

      // Destroy module services
      for (const service of loadedModule.services) {
        await this.destroyService(service, loadedModule.exports);
      }

      // Remove from loaded modules
      this.loadedModules.delete(moduleId);

      // Remove from cache
      if (this.cache[moduleId]) {
        delete this.cache[moduleId];
      }

      this.log(`Module ${moduleId} unloaded`);
    } catch (error) {
      this.log(`Failed to unload module ${moduleId}:`, error);
      throw error;
    }
  }

  private async destroyService(
    service: ServiceDefinition,
    exports: ModuleExports,
  ): Promise<void> {
    try {
      const serviceInstance = exports.services[service.name];
      if (serviceInstance && typeof serviceInstance.destroy === "function") {
        await serviceInstance.destroy();
      }
    } catch (error) {
      this.log(`Failed to destroy service ${service.name}:`, error);
    }
  }

  getLoadedModules(): string[] {
    return Array.from(this.loadedModules.keys());
  }

  getModule(moduleId: string): ModuleDefinition | null {
    return this.loadedModules.get(moduleId) || null;
  }

  getMetrics(): ModuleMetrics {
    return { ...this.metrics };
  }

  clearCache(): void {
    this.cache = {};
  }

  stop(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.isRunning = false;
  }

  // Configuration
  updateConfig(newConfig: Partial<ModuleLoaderConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): ModuleLoaderConfig {
    return { ...this.config };
  }

  isRunning(): boolean {
    return this.isRunning;
  }
}

// Create and export a default instance
export const moduleLoader = new ModuleLoader();
