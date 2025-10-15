import {
  ComponentDefinition,
  ComponentRegistry,
  ComponentLoadResult,
  ComponentLoadError,
} from "../types/architecture";

export interface ComponentRegistryConfig {
  enableLazyLoading: boolean;
  enableCaching: boolean;
  enablePreloading: boolean;
  cacheSize: number;
  preloadThreshold: number;
  enableHotReload: boolean;
  enableErrorBoundary: boolean;
  enablePerformanceTracking: boolean;
  enableAccessibilityValidation: boolean;
  enableTypeValidation: boolean;
}

export interface ComponentMetadata {
  id: string;
  name: string;
  version: string;
  description?: string;
  category: string;
  tags: string[];
  dependencies: string[];
  props: ComponentProp[];
  events: ComponentEvent[];
  slots: ComponentSlot[];
  examples: ComponentExample[];
  documentation: ComponentDocumentation;
  performance: ComponentPerformance;
  accessibility: ComponentAccessibility;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  default?: any;
  description?: string;
  validation?: (value: any) => boolean;
}

export interface ComponentEvent {
  name: string;
  description?: string;
  payload?: any;
}

export interface ComponentSlot {
  name: string;
  description?: string;
  required: boolean;
}

export interface ComponentExample {
  name: string;
  description?: string;
  code: string;
  props?: Record<string, any>;
}

export interface ComponentDocumentation {
  overview: string;
  usage: string;
  api: string;
  examples: string;
  accessibility: string;
  performance: string;
}

export interface ComponentPerformance {
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  complexity: number;
}

export interface ComponentAccessibility {
  wcagLevel: "A" | "AA" | "AAA";
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
  colorContrast: boolean;
  focusManagement: boolean;
}

export class ComponentRegistry {
  private config: ComponentRegistryConfig;
  private components: Map<string, ComponentDefinition> = new Map();
  private metadata: Map<string, ComponentMetadata> = new Map();
  private cache: Map<string, any> = new Map();
  private preloadQueue: Set<string> = new Set();
  private loadingPromises: Map<string, Promise<ComponentLoadResult>> =
    new Map();
  private isInitialized = false;

  constructor(config?: Partial<ComponentRegistryConfig>) {
    this.config = {
      enableLazyLoading: true,
      enableCaching: true,
      enablePreloading: true,
      cacheSize: 100,
      preloadThreshold: 0.8,
      enableHotReload: true,
      enableErrorBoundary: true,
      enablePerformanceTracking: true,
      enableAccessibilityValidation: true,
      enableTypeValidation: true,
      ...config,
    };

    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Initialize component registry
      this.log("ComponentRegistry initialized");
      this.isInitialized = true;
    } catch (error) {
      this.log("Failed to initialize ComponentRegistry:", error);
      throw error;
    }
  }

  // Component registration
  registerComponent(component: ComponentDefinition): void {
    try {
      if (!this.isInitialized) {
        throw new Error("ComponentRegistry not initialized");
      }

      // Validate component
      this.validateComponent(component);

      // Register component
      this.components.set(component.id, component);

      // Create metadata if not provided
      if (!this.metadata.has(component.id)) {
        this.createComponentMetadata(component);
      }

      this.log(`Component registered: ${component.name}`);
    } catch (error) {
      this.log(`Failed to register component ${component.name}:`, error);
      throw error;
    }
  }

  unregisterComponent(componentId: string): void {
    try {
      if (!this.components.has(componentId)) {
        this.log(`Component not found: ${componentId}`);
        return;
      }

      // Remove from registry
      this.components.delete(componentId);
      this.metadata.delete(componentId);
      this.cache.delete(componentId);
      this.preloadQueue.delete(componentId);
      this.loadingPromises.delete(componentId);

      this.log(`Component unregistered: ${componentId}`);
    } catch (error) {
      this.log(`Failed to unregister component ${componentId}:`, error);
      throw error;
    }
  }

  // Component loading
  async loadComponent(
    componentId: string,
    options?: { forceReload?: boolean; preload?: boolean },
  ): Promise<ComponentLoadResult> {
    try {
      if (!this.isInitialized) {
        throw new Error("ComponentRegistry not initialized");
      }

      const opts = { forceReload: false, preload: false, ...options };

      // Check if already loading
      if (this.loadingPromises.has(componentId) && !opts.forceReload) {
        return await this.loadingPromises.get(componentId)!;
      }

      // Check cache
      if (
        this.config.enableCaching &&
        this.cache.has(componentId) &&
        !opts.forceReload
      ) {
        const cached = this.cache.get(componentId);
        this.log(`Component ${componentId} loaded from cache`);
        return cached;
      }

      // Check if component exists
      const component = this.components.get(componentId);
      if (!component) {
        const error: ComponentLoadError = {
          code: "COMPONENT_NOT_FOUND",
          message: `Component not found: ${componentId}`,
          componentId,
        };
        return { success: false, error };
      }

      // Create loading promise
      const loadingPromise = this.loadComponentInternal(component, opts);
      this.loadingPromises.set(componentId, loadingPromise);

      try {
        const result = await loadingPromise;

        // Cache result if successful
        if (result.success && this.config.enableCaching) {
          this.cacheComponent(componentId, result);
        }

        // Clean up loading promise
        this.loadingPromises.delete(componentId);

        this.log(`Component ${componentId} loaded successfully`);
        return result;
      } catch (error) {
        this.loadingPromises.delete(componentId);
        throw error;
      }
    } catch (error) {
      this.log(`Failed to load component ${componentId}:`, error);
      const loadError: ComponentLoadError = {
        code: "LOAD_ERROR",
        message: `Failed to load component: ${error}`,
        componentId,
      };
      return { success: false, error: loadError };
    }
  }

  private async loadComponentInternal(
    component: ComponentDefinition,
    options: { preload?: boolean },
  ): Promise<ComponentLoadResult> {
    try {
      const startTime = Date.now();

      // Load component implementation
      let componentImpl: any;

      if (component.type === "react") {
        componentImpl = await this.loadReactComponent(component);
      } else if (component.type === "vue") {
        componentImpl = await this.loadVueComponent(component);
      } else if (component.type === "svelte") {
        componentImpl = await this.loadSvelteComponent(component);
      } else {
        throw new Error(`Unsupported component type: ${component.type}`);
      }

      // Validate component
      if (this.config.enableTypeValidation) {
        this.validateComponentImplementation(component, componentImpl);
      }

      // Check accessibility
      if (this.config.enableAccessibilityValidation) {
        this.validateComponentAccessibility(component, componentImpl);
      }

      // Track performance
      if (this.config.enablePerformanceTracking) {
        this.trackComponentPerformance(component.id, Date.now() - startTime);
      }

      return {
        success: true,
        component: componentImpl,
        metadata: this.metadata.get(component.id),
        loadTime: Date.now() - startTime,
      };
    } catch (error) {
      this.log(`Failed to load component ${component.name}:`, error);
      const loadError: ComponentLoadError = {
        code: "LOAD_ERROR",
        message: `Failed to load component: ${error}`,
        componentId: component.id,
      };
      return { success: false, error: loadError };
    }
  }

  private async loadReactComponent(
    component: ComponentDefinition,
  ): Promise<any> {
    // Implement React component loading
    if (component.source) {
      // Dynamic import for React components
      const componentModule = await import(component.source);
      return componentModule.default || componentModule[component.name];
    }
    throw new Error("No source specified for React component");
  }

  private async loadVueComponent(component: ComponentDefinition): Promise<any> {
    // Implement Vue component loading
    if (component.source) {
      const componentModule = await import(component.source);
      return componentModule.default || componentModule[component.name];
    }
    throw new Error("No source specified for Vue component");
  }

  private async loadSvelteComponent(
    component: ComponentDefinition,
  ): Promise<any> {
    // Implement Svelte component loading
    if (component.source) {
      const componentModule = await import(component.source);
      return componentModule.default || componentModule[component.name];
    }
    throw new Error("No source specified for Svelte component");
  }

  // Component discovery
  async discoverComponents(source: string): Promise<ComponentDefinition[]> {
    try {
      const discoveredComponents: ComponentDefinition[] = [];

      // Implement component discovery logic
      // This would scan the source directory for component files
      // and extract component definitions

      this.log(
        `Discovered ${discoveredComponents.length} components from ${source}`,
      );
      return discoveredComponents;
    } catch (error) {
      this.log(`Failed to discover components from ${source}:`, error);
      throw error;
    }
  }

  // Component search
  searchComponents(
    query: string,
    filters?: { category?: string; tags?: string[]; type?: string },
  ): ComponentDefinition[] {
    try {
      const results: ComponentDefinition[] = [];
      const searchQuery = query.toLowerCase();

      for (const component of this.components.values()) {
        let matches = false;

        // Search in name and description
        if (
          component.name.toLowerCase().includes(searchQuery) ||
          component.description?.toLowerCase().includes(searchQuery)
        ) {
          matches = true;
        }

        // Apply filters
        if (filters) {
          if (filters.category && component.category !== filters.category) {
            matches = false;
          }
          if (
            filters.tags &&
            !filters.tags.some((tag) => component.tags.includes(tag))
          ) {
            matches = false;
          }
          if (filters.type && component.type !== filters.type) {
            matches = false;
          }
        }

        if (matches) {
          results.push(component);
        }
      }

      this.log(`Found ${results.length} components matching "${query}"`);
      return results;
    } catch (error) {
      this.log(`Failed to search components:`, error);
      throw error;
    }
  }

  // Component preloading
  async preloadComponents(componentIds: string[]): Promise<void> {
    try {
      if (!this.config.enablePreloading) {
        return;
      }

      const preloadPromises = componentIds.map((id) =>
        this.loadComponent(id, { preload: true }),
      );
      await Promise.all(preloadPromises);

      this.log(`Preloaded ${componentIds.length} components`);
    } catch (error) {
      this.log(`Failed to preload components:`, error);
      throw error;
    }
  }

  // Component validation
  private validateComponent(component: ComponentDefinition): void {
    if (!component.id || !component.name || !component.type) {
      throw new Error("Component must have id, name, and type");
    }

    if (!component.source && !component.implementation) {
      throw new Error("Component must have either source or implementation");
    }

    if (component.dependencies) {
      for (const dep of component.dependencies) {
        if (!this.components.has(dep)) {
          throw new Error(`Component dependency not found: ${dep}`);
        }
      }
    }
  }

  private validateComponentImplementation(
    component: ComponentDefinition,
    implementation: any,
  ): void {
    // Implement component implementation validation
    if (!implementation) {
      throw new Error("Component implementation is null or undefined");
    }

    // Check if it's a valid React component
    if (component.type === "react") {
      if (
        typeof implementation !== "function" &&
        typeof implementation !== "object"
      ) {
        throw new Error("Invalid React component implementation");
      }
    }
  }

  private validateComponentAccessibility(
    component: ComponentDefinition,
    implementation: any,
  ): void {
    // Implement accessibility validation
    const metadata = this.metadata.get(component.id);
    if (metadata && metadata.accessibility) {
      // Check accessibility requirements
      if (!metadata.accessibility.keyboardNavigation) {
        this.log(
          `Warning: Component ${component.name} may not support keyboard navigation`,
        );
      }
      if (!metadata.accessibility.screenReaderSupport) {
        this.log(
          `Warning: Component ${component.name} may not support screen readers`,
        );
      }
    }
  }

  // Component metadata
  private createComponentMetadata(component: ComponentDefinition): void {
    const metadata: ComponentMetadata = {
      id: component.id,
      name: component.name,
      version: component.version || "1.0.0",
      description: component.description,
      category: component.category || "general",
      tags: component.tags || [],
      dependencies: component.dependencies || [],
      props: component.props || [],
      events: component.events || [],
      slots: component.slots || [],
      examples: component.examples || [],
      documentation: component.documentation || {
        overview: "",
        usage: "",
        api: "",
        examples: "",
        accessibility: "",
        performance: "",
      },
      performance: {
        renderTime: 0,
        memoryUsage: 0,
        bundleSize: 0,
        complexity: 0,
      },
      accessibility: {
        wcagLevel: "A",
        keyboardNavigation: false,
        screenReaderSupport: false,
        colorContrast: false,
        focusManagement: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.metadata.set(component.id, metadata);
  }

  updateComponentMetadata(
    componentId: string,
    updates: Partial<ComponentMetadata>,
  ): void {
    const metadata = this.metadata.get(componentId);
    if (metadata) {
      Object.assign(metadata, updates);
      metadata.updatedAt = new Date();
      this.metadata.set(componentId, metadata);
    }
  }

  // Component caching
  private cacheComponent(
    componentId: string,
    result: ComponentLoadResult,
  ): void {
    if (this.cache.size >= this.config.cacheSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(componentId, result);
  }

  // Performance tracking
  private trackComponentPerformance(
    componentId: string,
    loadTime: number,
  ): void {
    const metadata = this.metadata.get(componentId);
    if (metadata) {
      metadata.performance.renderTime = loadTime;
      metadata.updatedAt = new Date();
    }
  }

  // Public methods
  getComponent(componentId: string): ComponentDefinition | undefined {
    return this.components.get(componentId);
  }

  getComponentMetadata(componentId: string): ComponentMetadata | undefined {
    return this.metadata.get(componentId);
  }

  getAllComponents(): ComponentDefinition[] {
    return Array.from(this.components.values());
  }

  getComponentsByCategory(category: string): ComponentDefinition[] {
    return Array.from(this.components.values()).filter(
      (c) => c.category === category,
    );
  }

  getComponentsByType(type: string): ComponentDefinition[] {
    return Array.from(this.components.values()).filter((c) => c.type === type);
  }

  getComponentCount(): number {
    return this.components.size;
  }

  clearCache(): void {
    this.cache.clear();
  }

  // Configuration
  updateConfig(newConfig: Partial<ComponentRegistryConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): ComponentRegistryConfig {
    return { ...this.config };
  }

  isInitialized(): boolean {
    return this.isInitialized;
  }

  private log(message: string, ...args: any[]): void {
    console.log(`[ComponentRegistry] ${message}`, ...args);
  }
}

// Create and export a default instance
export const componentRegistry = new ComponentRegistry();
