import { EventEmitter } from "events";
import {
  PluginStub,
  StubCapability,
  SimulationConfig,
  SimulationType,
} from "./stub-generator";

export interface SimulationResult {
  id: string;
  stubId: string;
  capability: string;
  input: any;
  output: any;
  metadata: SimulationMetadata;
  timestamp: Date;
  duration: number;
  success: boolean;
  error?: string;
}

export interface SimulationMetadata {
  simulationType: SimulationType;
  responseDelay: number;
  cacheHit: boolean;
  retryCount: number;
  dataVariation: boolean;
  contextAware: boolean;
  errorType?: string;
  confidence: number;
}

export interface SimulationContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  timestamp: Date;
  environment: "development" | "staging" | "production";
  userAgent?: string;
  ipAddress?: string;
  metadata: Record<string, any>;
}

export interface SimulationOptions {
  timeout?: number;
  retries?: number;
  context?: SimulationContext;
  skipCache?: boolean;
  forceError?: boolean;
  errorType?: string;
  responseDelay?: number;
  dataVariation?: boolean;
  contextAwareness?: boolean;
}

export interface SimulationStats {
  totalSimulations: number;
  successfulSimulations: number;
  failedSimulations: number;
  averageResponseTime: number;
  averageConfidence: number;
  errorRate: number;
  cacheHitRate: number;
  lastSimulation?: Date;
}

export class SimulationEngine extends EventEmitter {
  private stubCache: Map<string, PluginStub> = new Map();
  private simulationCache: Map<string, SimulationResult> = new Map();
  private simulationStats: Map<string, SimulationStats> = new Map();
  private contextHistory: Map<string, SimulationContext[]> = new Map();
  private isRunning = false;

  constructor() {
    super();
  }

  async simulate(
    stub: PluginStub,
    capability: string,
    input: any,
    options: SimulationOptions = {},
  ): Promise<SimulationResult> {
    const startTime = Date.now();
    const simulationId = this.generateSimulationId();

    try {
      // Validate inputs
      this.validateSimulationInputs(stub, capability, input);

      // Get capability configuration
      const capabilityConfig = stub.capabilities[capability];
      if (!capabilityConfig) {
        throw new Error(
          `Capability ${capability} not found in stub ${stub.id}`,
        );
      }

      // Check cache first
      const cacheKey = this.generateCacheKey(
        stub.id,
        capability,
        input,
        options.context,
      );
      if (!options.skipCache) {
        const cachedResult = this.simulationCache.get(cacheKey);
        if (cachedResult && this.isCacheValid(cachedResult)) {
          this.updateStats(stub.id, cachedResult, true);
          this.emit("simulationCacheHit", {
            simulationId,
            stubId: stub.id,
            capability,
          });
          return cachedResult;
        }
      }

      // Create simulation context
      const context = this.createSimulationContext(options.context, stub);

      // Simulate response delay
      const responseDelay = await this.simulateResponseDelay(
        capabilityConfig.simulationConfig.responseDelay,
        options.responseDelay,
      );

      // Determine if simulation should succeed or fail
      const shouldSucceed = this.shouldSimulationSucceed(
        capabilityConfig,
        options,
        context,
      );

      let result: SimulationResult;
      if (shouldSucceed) {
        result = await this.simulateSuccess(
          simulationId,
          stub,
          capability,
          input,
          context,
          responseDelay,
          options,
        );
      } else {
        result = await this.simulateFailure(
          simulationId,
          stub,
          capability,
          input,
          context,
          responseDelay,
          options,
        );
      }

      // Cache result
      if (!options.skipCache) {
        this.simulationCache.set(cacheKey, result);
      }

      // Update statistics
      this.updateStats(stub.id, result, false);

      // Store context history
      this.storeContextHistory(stub.id, context);

      this.emit("simulationCompleted", { simulationId, result });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const result: SimulationResult = {
        id: simulationId,
        stubId: stub.id,
        capability,
        input,
        output: null,
        metadata: {
          simulationType: SimulationType.STATIC,
          responseDelay: 0,
          cacheHit: false,
          retryCount: 0,
          dataVariation: false,
          contextAware: false,
          confidence: 0,
        },
        timestamp: new Date(),
        duration,
        success: false,
        error: error.message,
      };

      this.updateStats(stub.id, result, false);
      this.emit("simulationError", { simulationId, error, result });
      throw error;
    }
  }

  async simulateAsync(
    stub: PluginStub,
    capability: string,
    input: any,
    options: SimulationOptions = {},
  ): Promise<AsyncSimulationResult> {
    const simulationId = this.generateSimulationId();
    const startTime = Date.now();

    try {
      const promise = this.simulate(stub, capability, input, options);

      return {
        id: simulationId,
        stubId: stub.id,
        capability,
        status: "running",
        startTime: new Date(startTime),
        promise,
        cancel: () => {
          this.emit("simulationCancelled", {
            simulationId,
            stubId: stub.id,
            capability,
          });
        },
      };
    } catch (error) {
      this.emit("simulationError", { simulationId, error });
      throw error;
    }
  }

  async batchSimulate(
    simulations: BatchSimulationRequest[],
  ): Promise<SimulationResult[]> {
    const results: SimulationResult[] = [];
    const promises = simulations.map(async (request) => {
      try {
        const result = await this.simulate(
          request.stub,
          request.capability,
          request.input,
          request.options,
        );
        return result;
      } catch (error) {
        return {
          id: this.generateSimulationId(),
          stubId: request.stub.id,
          capability: request.capability,
          input: request.input,
          output: null,
          metadata: {
            simulationType: SimulationType.STATIC,
            responseDelay: 0,
            cacheHit: false,
            retryCount: 0,
            dataVariation: false,
            contextAware: false,
            confidence: 0,
          },
          timestamp: new Date(),
          duration: 0,
          success: false,
          error: error.message,
        } as SimulationResult;
      }
    });

    const batchResults = await Promise.all(promises);
    results.push(...batchResults);

    this.emit("batchSimulationCompleted", { results });
    return results;
  }

  async getSimulationStats(stubId: string): Promise<SimulationStats | null> {
    return this.simulationStats.get(stubId) || null;
  }

  async getAllSimulationStats(): Promise<Map<string, SimulationStats>> {
    return new Map(this.simulationStats);
  }

  async getContextHistory(
    stubId: string,
    limit?: number,
  ): Promise<SimulationContext[]> {
    const history = this.contextHistory.get(stubId) || [];
    return limit ? history.slice(-limit) : history;
  }

  async clearCache(stubId?: string): Promise<void> {
    if (stubId) {
      // Clear cache for specific stub
      for (const [key, result] of this.simulationCache) {
        if (result.stubId === stubId) {
          this.simulationCache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.simulationCache.clear();
    }

    this.emit("cacheCleared", { stubId });
  }

  async clearStats(stubId?: string): Promise<void> {
    if (stubId) {
      this.simulationStats.delete(stubId);
    } else {
      this.simulationStats.clear();
    }

    this.emit("statsCleared", { stubId });
  }

  private validateSimulationInputs(
    stub: PluginStub,
    capability: string,
    input: any,
  ): void {
    if (!stub || !stub.id) {
      throw new Error("Invalid stub provided");
    }

    if (!capability || typeof capability !== "string") {
      throw new Error("Invalid capability name provided");
    }

    if (!stub.capabilities[capability]) {
      throw new Error(`Capability ${capability} not found in stub ${stub.id}`);
    }
  }

  private createSimulationContext(
    providedContext?: SimulationContext,
    stub?: PluginStub,
  ): SimulationContext {
    const baseContext: SimulationContext = {
      timestamp: new Date(),
      environment: "development",
      metadata: {},
    };

    if (providedContext) {
      return {
        ...baseContext,
        ...providedContext,
        timestamp: new Date(),
      };
    }

    return baseContext;
  }

  private async simulateResponseDelay(
    config: SimulationConfig["responseDelay"],
    overrideDelay?: number,
  ): Promise<number> {
    if (overrideDelay !== undefined) {
      await this.delay(overrideDelay);
      return overrideDelay;
    }

    const delay = this.calculateDelay(config);
    await this.delay(delay);
    return delay;
  }

  private calculateDelay(config: SimulationConfig["responseDelay"]): number {
    switch (config.distribution) {
      case "uniform":
        return Math.random() * (config.max - config.min) + config.min;
      case "normal":
        // Simple normal distribution approximation
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        const mean = (config.min + config.max) / 2;
        const stdDev = (config.max - config.min) / 6;
        return Math.max(config.min, Math.min(config.max, mean + z0 * stdDev));
      case "exponential":
        const lambda = 1 / ((config.min + config.max) / 2);
        return Math.max(
          config.min,
          Math.min(config.max, -Math.log(1 - Math.random()) / lambda),
        );
      default:
        return Math.random() * (config.max - config.min) + config.min;
    }
  }

  private shouldSimulationSucceed(
    capability: StubCapability,
    options: SimulationOptions,
    context: SimulationContext,
  ): boolean {
    // Force error if requested
    if (options.forceError) {
      return false;
    }

    // Use capability success rate
    const successRate = capability.successRate;
    return Math.random() < successRate;
  }

  private async simulateSuccess(
    simulationId: string,
    stub: PluginStub,
    capability: string,
    input: any,
    context: SimulationContext,
    responseDelay: number,
    options: SimulationOptions,
  ): Promise<SimulationResult> {
    const startTime = Date.now();

    // Generate simulated output
    const output = await this.generateSimulatedOutput(
      stub,
      capability,
      input,
      context,
      options,
    );

    const duration = Date.now() - startTime;
    const capabilityConfig = stub.capabilities[capability];

    return {
      id: simulationId,
      stubId: stub.id,
      capability,
      input,
      output,
      metadata: {
        simulationType: capabilityConfig.simulationType,
        responseDelay,
        cacheHit: false,
        retryCount: 0,
        dataVariation:
          options.dataVariation ||
          capabilityConfig.simulationConfig.dataVariation.enabled,
        contextAware:
          options.contextAwareness ||
          capabilityConfig.simulationConfig.contextAwareness,
        confidence: this.calculateConfidence(capabilityConfig, context),
      },
      timestamp: new Date(),
      duration,
      success: true,
    };
  }

  private async simulateFailure(
    simulationId: string,
    stub: PluginStub,
    capability: string,
    input: any,
    context: SimulationContext,
    responseDelay: number,
    options: SimulationOptions,
  ): Promise<SimulationResult> {
    const startTime = Date.now();

    // Select error type
    const errorType = this.selectErrorType(
      stub.capabilities[capability].simulationConfig.errorTypes,
      options.errorType,
    );

    const duration = Date.now() - startTime;
    const capabilityConfig = stub.capabilities[capability];

    return {
      id: simulationId,
      stubId: stub.id,
      capability,
      input,
      output: null,
      metadata: {
        simulationType: capabilityConfig.simulationType,
        responseDelay,
        cacheHit: false,
        retryCount: 0,
        dataVariation: false,
        contextAware: false,
        errorType: errorType.type,
        confidence: 0,
      },
      timestamp: new Date(),
      duration,
      success: false,
      error: errorType.message,
    };
  }

  private async generateSimulatedOutput(
    stub: PluginStub,
    capability: string,
    input: any,
    context: SimulationContext,
    options: SimulationOptions,
  ): Promise<any> {
    const capabilityConfig = stub.capabilities[capability];
    const outputSchema = capabilityConfig.outputSchema;

    // Generate base output based on schema
    let output = this.generateOutputFromSchema(outputSchema);

    // Apply data variation if enabled
    if (
      options.dataVariation ||
      capabilityConfig.simulationConfig.dataVariation.enabled
    ) {
      output = this.applyDataVariation(
        output,
        capabilityConfig.simulationConfig.dataVariation,
      );
    }

    // Apply context awareness if enabled
    if (
      options.contextAwareness ||
      capabilityConfig.simulationConfig.contextAwareness
    ) {
      output = this.applyContextAwareness(output, context);
    }

    return output;
  }

  private generateOutputFromSchema(schema: any): any {
    if (!schema || typeof schema !== "object") {
      return { result: "Simulated output" };
    }

    const output: any = {};

    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        const property = prop as any;
        output[key] = this.generateValueFromProperty(property);
      }
    }

    return output;
  }

  private generateValueFromProperty(property: any): any {
    switch (property.type) {
      case "string":
        if (property.enum) {
          return property.enum[
            Math.floor(Math.random() * property.enum.length)
          ];
        }
        return `Generated ${property.type} value`;
      case "number":
        const min = property.minimum || 0;
        const max = property.maximum || 100;
        return Math.random() * (max - min) + min;
      case "boolean":
        return Math.random() < 0.5;
      case "array":
        const items = property.items || { type: "string" };
        const length = Math.floor(Math.random() * 5) + 1;
        return Array.from({ length }, () =>
          this.generateValueFromProperty(items),
        );
      case "object":
        if (property.properties) {
          const obj: any = {};
          for (const [key, prop] of Object.entries(property.properties)) {
            obj[key] = this.generateValueFromProperty(prop);
          }
          return obj;
        }
        return {};
      default:
        return `Generated ${property.type} value`;
    }
  }

  private applyDataVariation(
    output: any,
    config: SimulationConfig["dataVariation"],
  ): any {
    if (!config.enabled) return output;

    return this.varyData(
      output,
      config.variationFactor,
      config.preserveStructure,
      config.randomizeValues,
    );
  }

  private varyData(
    data: any,
    variationFactor: number,
    preserveStructure: boolean,
    randomizeValues: boolean,
  ): any {
    if (typeof data === "string" && randomizeValues) {
      return this.varyString(data, variationFactor);
    } else if (typeof data === "number" && randomizeValues) {
      return this.varyNumber(data, variationFactor);
    } else if (Array.isArray(data)) {
      return data.map((item) =>
        this.varyData(
          item,
          variationFactor,
          preserveStructure,
          randomizeValues,
        ),
      );
    } else if (typeof data === "object" && data !== null) {
      const varied: any = {};
      for (const [key, value] of Object.entries(data)) {
        varied[key] = this.varyData(
          value,
          variationFactor,
          preserveStructure,
          randomizeValues,
        );
      }
      return varied;
    }

    return data;
  }

  private varyString(str: string, variationFactor: number): string {
    if (Math.random() < variationFactor) {
      const variations = [
        str.toUpperCase(),
        str.toLowerCase(),
        str.split("").reverse().join(""),
        str + " (varied)",
      ];
      return variations[Math.floor(Math.random() * variations.length)];
    }
    return str;
  }

  private varyNumber(num: number, variationFactor: number): number {
    if (Math.random() < variationFactor) {
      const variation = num * (0.8 + Math.random() * 0.4); // ±20% variation
      return Math.round(variation * 100) / 100;
    }
    return num;
  }

  private applyContextAwareness(output: any, context: SimulationContext): any {
    // Add context-aware modifications to output
    if (typeof output === "object" && output !== null) {
      return {
        ...output,
        context: {
          environment: context.environment,
          timestamp: context.timestamp,
          userId: context.userId,
          sessionId: context.sessionId,
        },
      };
    }

    return output;
  }

  private selectErrorType(
    errorTypes: SimulationConfig["errorTypes"],
    preferredType?: string,
  ): SimulationConfig["errorTypes"][0] {
    if (preferredType) {
      const preferred = errorTypes.find((et) => et.type === preferredType);
      if (preferred) return preferred;
    }

    // Select based on probability
    const random = Math.random();
    let cumulativeProbability = 0;

    for (const errorType of errorTypes) {
      cumulativeProbability += errorType.probability;
      if (random <= cumulativeProbability) {
        return errorType;
      }
    }

    // Fallback to first error type
    return (
      errorTypes[0] || {
        type: "unknown",
        message: "Unknown error",
        probability: 1,
        recoverable: false,
      }
    );
  }

  private calculateConfidence(
    capability: StubCapability,
    context: SimulationContext,
  ): number {
    let confidence = 0.8; // Base confidence

    // Adjust based on capability reliability
    confidence *= capability.successRate;

    // Adjust based on context
    if (context.environment === "production") {
      confidence *= 0.9; // Slightly lower confidence in production
    }

    // Add some randomness
    confidence += (Math.random() - 0.5) * 0.2;

    return Math.max(0, Math.min(1, confidence));
  }

  private generateCacheKey(
    stubId: string,
    capability: string,
    input: any,
    context?: SimulationContext,
  ): string {
    const contextKey = context ? JSON.stringify(context) : "";
    return `${stubId}:${capability}:${JSON.stringify(input)}:${contextKey}`;
  }

  private isCacheValid(result: SimulationResult): boolean {
    // Cache is valid for 5 minutes
    const cacheTTL = 5 * 60 * 1000;
    return Date.now() - result.timestamp.getTime() < cacheTTL;
  }

  private updateStats(
    stubId: string,
    result: SimulationResult,
    cacheHit: boolean,
  ): void {
    const stats = this.simulationStats.get(stubId) || {
      totalSimulations: 0,
      successfulSimulations: 0,
      failedSimulations: 0,
      averageResponseTime: 0,
      averageConfidence: 0,
      errorRate: 0,
      cacheHitRate: 0,
    };

    stats.totalSimulations++;
    if (result.success) {
      stats.successfulSimulations++;
    } else {
      stats.failedSimulations++;
    }

    stats.averageResponseTime =
      (stats.averageResponseTime + result.duration) / 2;
    stats.averageConfidence =
      (stats.averageConfidence + result.metadata.confidence) / 2;
    stats.errorRate = stats.failedSimulations / stats.totalSimulations;

    if (cacheHit) {
      stats.cacheHitRate = (stats.cacheHitRate + 1) / 2;
    }

    stats.lastSimulation = result.timestamp;
    this.simulationStats.set(stubId, stats);
  }

  private storeContextHistory(
    stubId: string,
    context: SimulationContext,
  ): void {
    const history = this.contextHistory.get(stubId) || [];
    history.push(context);

    // Keep only last 100 contexts
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }

    this.contextHistory.set(stubId, history);
  }

  private generateSimulationId(): string {
    return `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Supporting interfaces
export interface AsyncSimulationResult {
  id: string;
  stubId: string;
  capability: string;
  status: "running" | "completed" | "failed" | "cancelled";
  startTime: Date;
  promise: Promise<SimulationResult>;
  cancel: () => void;
}

export interface BatchSimulationRequest {
  stub: PluginStub;
  capability: string;
  input: any;
  options?: SimulationOptions;
}
