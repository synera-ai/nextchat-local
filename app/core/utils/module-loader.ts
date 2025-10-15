// Module loading system for NextChat

import { Module, ModuleConfig } from '../types';
import { eventBus, eventCreators } from './event-bus';

export interface ModuleLoader {
  load: (moduleId: string) => Promise<Module>;
  unload: (moduleId: string) => Promise<void>;
  getModule: (moduleId: string) => Module | null;
  getAllModules: () => Module[];
  isLoaded: (moduleId: string) => boolean;
}

export interface ModuleRegistry {
  modules: Map<string, Module>;
  configs: Map<string, ModuleConfig>;
  dependencies: Map<string, string[]>;
}

class NextChatModuleLoader implements ModuleLoader {
  private registry: ModuleRegistry = {
    modules: new Map(),
    configs: new Map(),
    dependencies: new Map(),
  };

  private loadingPromises: Map<string, Promise<Module>> = new Map();

  async load(moduleId: string): Promise<Module> {
    // Check if already loaded
    if (this.registry.modules.has(moduleId)) {
      return this.registry.modules.get(moduleId)!;
    }

    // Check if already loading
    if (this.loadingPromises.has(moduleId)) {
      return this.loadingPromises.get(moduleId)!;
    }

    // Start loading
    const loadingPromise = this.loadModule(moduleId);
    this.loadingPromises.set(moduleId, loadingPromise);

    try {
      const module = await loadingPromise;
      this.registry.modules.set(moduleId, module);
      this.loadingPromises.delete(moduleId);
      
      // Initialize module
      await module.initialize();
      
      // Emit event
      eventBus.emit({
        type: 'module:loaded',
        payload: { moduleId },
        timestamp: Date.now(),
        source: 'module-loader',
      });

      return module;
    } catch (error) {
      this.loadingPromises.delete(moduleId);
      throw error;
    }
  }

  async unload(moduleId: string): Promise<void> {
    const module = this.registry.modules.get(moduleId);
    if (!module) {
      return;
    }

    try {
      // Destroy module
      await module.destroy();
      
      // Remove from registry
      this.registry.modules.delete(moduleId);
      this.registry.configs.delete(moduleId);
      this.registry.dependencies.delete(moduleId);
      
      // Emit event
      eventBus.emit({
        type: 'module:unloaded',
        payload: { moduleId },
        timestamp: Date.now(),
        source: 'module-loader',
      });
    } catch (error) {
      console.error(`[ModuleLoader] Error unloading module ${moduleId}:`, error);
      throw error;
    }
  }

  getModule(moduleId: string): Module | null {
    return this.registry.modules.get(moduleId) || null;
  }

  getAllModules(): Module[] {
    return Array.from(this.registry.modules.values());
  }

  isLoaded(moduleId: string): boolean {
    return this.registry.modules.has(moduleId);
  }

  private async loadModule(moduleId: string): Promise<Module> {
    try {
      // Load module configuration
      const config = await this.loadModuleConfig(moduleId);
      this.registry.configs.set(moduleId, config);

      // Check dependencies
      await this.loadDependencies(config.dependencies);

      // Load module implementation
      const module = await this.loadModuleImplementation(moduleId);
      
      // Store dependencies
      this.registry.dependencies.set(moduleId, config.dependencies);

      return module;
    } catch (error) {
      console.error(`[ModuleLoader] Error loading module ${moduleId}:`, error);
      throw error;
    }
  }

  private async loadModuleConfig(moduleId: string): Promise<ModuleConfig> {
    try {
      // Try to load from module directory
      const configPath = `/modules/${moduleId}/config.json`;
      const response = await fetch(configPath);
      
      if (!response.ok) {
        throw new Error(`Failed to load module config: ${response.statusText}`);
      }
      
      const config = await response.json();
      return {
        id: moduleId,
        enabled: true,
        config: config,
      };
    } catch (error) {
      // Fallback to default config
      return {
        id: moduleId,
        enabled: true,
        config: {},
      };
    }
  }

  private async loadDependencies(dependencies: string[]): Promise<void> {
    const loadPromises = dependencies.map(dep => this.load(dep));
    await Promise.all(loadPromises);
  }

  private async loadModuleImplementation(moduleId: string): Promise<Module> {
    try {
      // Dynamic import of module
      const modulePath = `/modules/${moduleId}/index.js`;
      const moduleExports = await import(modulePath);
      
      // Create module instance
      const module: Module = {
        id: moduleId,
        name: moduleExports.name || moduleId,
        version: moduleExports.version || '1.0.0',
        dependencies: moduleExports.dependencies || [],
        exports: moduleExports,
        initialize: moduleExports.initialize || (() => Promise.resolve()),
        destroy: moduleExports.destroy || (() => Promise.resolve()),
      };

      return module;
    } catch (error) {
      // Fallback to creating a basic module
      return {
        id: moduleId,
        name: moduleId,
        version: '1.0.0',
        dependencies: [],
        exports: {},
        initialize: () => Promise.resolve(),
        destroy: () => Promise.resolve(),
      };
    }
  }
}

// Create global module loader instance
export const moduleLoader = new NextChatModuleLoader();

// Module utilities
export const moduleUtils = {
  // Create module
  createModule: (id: string, config: Partial<Module>): Module => ({
    id,
    name: id,
    version: '1.0.0',
    dependencies: [],
    exports: {},
    initialize: () => Promise.resolve(),
    destroy: () => Promise.resolve(),
    ...config,
  }),

  // Validate module
  validateModule: (module: Module): boolean => {
    return !!(
      module.id &&
      module.name &&
      module.version &&
      typeof module.initialize === 'function' &&
      typeof module.destroy === 'function'
    );
  },

  // Get module dependencies
  getModuleDependencies: (moduleId: string): string[] => {
    return moduleLoader['registry'].dependencies.get(moduleId) || [];
  },

  // Check if module has dependency
  hasDependency: (moduleId: string, dependencyId: string): boolean => {
    const dependencies = moduleUtils.getModuleDependencies(moduleId);
    return dependencies.includes(dependencyId);
  },

  // Get modules by dependency
  getModulesByDependency: (dependencyId: string): string[] => {
    const modules: string[] = [];
    for (const [moduleId, dependencies] of moduleLoader['registry'].dependencies.entries()) {
      if (dependencies.includes(dependencyId)) {
        modules.push(moduleId);
      }
    }
    return modules;
  },
};

// Module hooks for React
export function useModuleLoader() {
  return moduleLoader;
}

export function useModule(moduleId: string) {
  const loader = useModuleLoader();
  const [module, setModule] = React.useState<Module | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const loadModule = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const loadedModule = await loader.load(moduleId);
        setModule(loadedModule);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadModule();
  }, [moduleId, loader]);

  return { module, loading, error };
}

// Module middleware
export const moduleMiddleware = {
  // Enable module logging
  enableLogging: () => {
    eventBus.on('module:loaded', (event) => {
      console.log('[ModuleLoader] Module loaded:', event.payload.moduleId);
    });
    
    eventBus.on('module:unloaded', (event) => {
      console.log('[ModuleLoader] Module unloaded:', event.payload.moduleId);
    });
  },

  // Enable module performance monitoring
  enablePerformanceMonitoring: () => {
    const startTimes = new Map<string, number>();
    
    eventBus.on('module:load:start', (event) => {
      startTimes.set(event.payload.moduleId, Date.now());
    });
    
    eventBus.on('module:loaded', (event) => {
      const startTime = startTimes.get(event.payload.moduleId);
      if (startTime) {
        const loadTime = Date.now() - startTime;
        console.log(`[ModuleLoader] Module ${event.payload.moduleId} loaded in ${loadTime}ms`);
        startTimes.delete(event.payload.moduleId);
      }
    });
  },

  // Enable module error handling
  enableErrorHandling: () => {
    eventBus.on('module:error', (event) => {
      console.error('[ModuleLoader] Module error:', event.payload);
      // Could send to error reporting service
    });
  },
};

// Export default
export default moduleLoader;
