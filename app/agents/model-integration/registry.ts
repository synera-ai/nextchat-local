import { EventEmitter } from "events";

export interface AIModel {
  id: string;
  name: string;
  version: string;
  description: string;
  capabilities: ModelCapabilities;
  provider: string;
  endpoint: string;
  apiKey?: string;
  maxTokens?: number;
  temperature?: number;
  status: ModelStatus;
  metadata: ModelMetadata;
}

export interface ModelCapabilities {
  textGeneration: boolean;
  textCompletion: boolean;
  textAnalysis: boolean;
  codeGeneration: boolean;
  imageGeneration: boolean;
  audioGeneration: boolean;
  embedding: boolean;
  classification: boolean;
  summarization: boolean;
  translation: boolean;
}

export interface ModelMetadata {
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
  usageCount: number;
  averageResponseTime: number;
  successRate: number;
  costPerToken?: number;
  maxContextLength?: number;
  supportedLanguages: string[];
  tags: string[];
}

export interface ModelResult {
  id: string;
  modelId: string;
  input: any;
  output: any;
  metadata: ModelExecutionMetadata;
  timestamp: Date;
  duration: number;
  success: boolean;
  error?: string;
}

export interface ModelExecutionMetadata {
  tokensUsed: number;
  cost: number;
  latency: number;
  cacheHit: boolean;
  retryCount: number;
  modelVersion: string;
}

export interface ModelMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageResponseTime: number;
  averageCost: number;
  totalCost: number;
  cacheHitRate: number;
  errorRate: number;
  lastExecution?: Date;
}

export interface ModelExecution {
  id: string;
  modelId: string;
  timestamp: Date;
  duration: number;
  success: boolean;
  input: any;
  output: any;
  error?: string;
  metadata: ModelExecutionMetadata;
}

export enum ModelStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  MAINTENANCE = "maintenance",
  ERROR = "error",
  DEPRECATED = "deprecated",
}

export class ModelRegistry extends EventEmitter {
  private models: Map<string, AIModel> = new Map();
  private executions: Map<string, ModelExecution[]> = new Map();
  private metrics: Map<string, ModelMetrics> = new Map();
  private cache: Map<string, ModelResult> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    super();
    this.initializeDefaultModels();
  }

  private initializeDefaultModels(): void {
    // Initialize with default models
    const defaultModels: AIModel[] = [
      {
        id: "gpt-4",
        name: "GPT-4",
        version: "4.0",
        description: "Advanced language model for complex tasks",
        capabilities: {
          textGeneration: true,
          textCompletion: true,
          textAnalysis: true,
          codeGeneration: true,
          imageGeneration: false,
          audioGeneration: false,
          embedding: false,
          classification: true,
          summarization: true,
          translation: true,
        },
        provider: "OpenAI",
        endpoint: "https://api.openai.com/v1/chat/completions",
        maxTokens: 4096,
        temperature: 0.7,
        status: ModelStatus.ACTIVE,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          usageCount: 0,
          averageResponseTime: 0,
          successRate: 100,
          costPerToken: 0.00003,
          maxContextLength: 8192,
          supportedLanguages: [
            "en",
            "es",
            "fr",
            "de",
            "it",
            "pt",
            "ru",
            "zh",
            "ja",
            "ko",
          ],
          tags: ["language", "general", "advanced"],
        },
      },
      {
        id: "claude-3-sonnet",
        name: "Claude 3 Sonnet",
        version: "3.0",
        description: "Balanced performance and capability model",
        capabilities: {
          textGeneration: true,
          textCompletion: true,
          textAnalysis: true,
          codeGeneration: true,
          imageGeneration: false,
          audioGeneration: false,
          embedding: false,
          classification: true,
          summarization: true,
          translation: true,
        },
        provider: "Anthropic",
        endpoint: "https://api.anthropic.com/v1/messages",
        maxTokens: 4096,
        temperature: 0.7,
        status: ModelStatus.ACTIVE,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          usageCount: 0,
          averageResponseTime: 0,
          successRate: 100,
          costPerToken: 0.000015,
          maxContextLength: 200000,
          supportedLanguages: [
            "en",
            "es",
            "fr",
            "de",
            "it",
            "pt",
            "ru",
            "zh",
            "ja",
            "ko",
          ],
          tags: ["language", "general", "balanced"],
        },
      },
    ];

    defaultModels.forEach((model) => this.registerModel(model));
  }

  async registerModel(model: AIModel): Promise<void> {
    try {
      // Validate model
      this.validateModel(model);

      // Set default metadata
      model.metadata = {
        ...model.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0,
        averageResponseTime: 0,
        successRate: 100,
      };

      // Register model
      this.models.set(model.id, model);
      this.executions.set(model.id, []);
      this.metrics.set(model.id, {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        averageResponseTime: 0,
        averageCost: 0,
        totalCost: 0,
        cacheHitRate: 0,
        errorRate: 0,
      });

      this.emit("modelRegistered", model);
    } catch (error) {
      this.emit("modelRegistrationError", { model, error });
      throw error;
    }
  }

  async unregisterModel(modelId: string): Promise<void> {
    try {
      const model = this.models.get(modelId);
      if (!model) {
        throw new Error(`Model ${modelId} not found`);
      }

      this.models.delete(modelId);
      this.executions.delete(modelId);
      this.metrics.delete(modelId);
      this.clearModelCache(modelId);

      this.emit("modelUnregistered", model);
    } catch (error) {
      this.emit("modelUnregistrationError", { modelId, error });
      throw error;
    }
  }

  async executeModel(
    modelId: string,
    input: any,
    options?: ModelExecutionOptions,
  ): Promise<ModelResult> {
    const startTime = Date.now();

    try {
      const model = this.models.get(modelId);
      if (!model) {
        throw new Error(`Model ${modelId} not found`);
      }

      if (model.status !== ModelStatus.ACTIVE) {
        throw new Error(`Model ${modelId} is not active`);
      }

      // Check cache first
      const cacheKey = this.generateCacheKey(modelId, input);
      const cachedResult = this.getCachedResult(cacheKey);
      if (cachedResult && !options?.skipCache) {
        this.updateMetrics(modelId, startTime, true, 0, true);
        return cachedResult;
      }

      // Execute model
      const result = await this.executeModelRequest(model, input, options);
      const duration = Date.now() - startTime;

      // Cache result
      if (!options?.skipCache) {
        this.cacheResult(cacheKey, result);
      }

      // Update metrics
      this.updateMetrics(modelId, startTime, true, result.metadata.cost, false);

      // Store execution
      this.storeExecution(modelId, result, duration, true);

      this.emit("modelExecuted", { modelId, result, duration });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.updateMetrics(modelId, startTime, false, 0, false);
      this.storeExecution(modelId, null, duration, false, error.message);

      this.emit("modelExecutionError", { modelId, error, duration });
      throw error;
    }
  }

  async executeModelAsync(
    modelId: string,
    input: any,
    options?: ModelExecutionOptions,
  ): Promise<AsyncModelResult> {
    const executionId = this.generateExecutionId();
    const startTime = Date.now();

    try {
      // Start async execution
      const promise = this.executeModel(modelId, input, options);

      return {
        id: executionId,
        modelId,
        status: "running",
        startTime: new Date(startTime),
        promise,
        cancel: () => {
          // Implement cancellation logic
          this.emit("modelExecutionCancelled", { executionId, modelId });
        },
      };
    } catch (error) {
      this.emit("modelExecutionError", { executionId, modelId, error });
      throw error;
    }
  }

  async getAvailableModels(): Promise<AIModel[]> {
    return Array.from(this.models.values());
  }

  async getModelCapabilities(modelId: string): Promise<ModelCapabilities> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }
    return model.capabilities;
  }

  async getModelMetrics(modelId: string): Promise<ModelMetrics> {
    const metrics = this.metrics.get(modelId);
    if (!metrics) {
      throw new Error(`Model ${modelId} not found`);
    }
    return { ...metrics };
  }

  async getModelHistory(
    modelId: string,
    limit?: number,
  ): Promise<ModelExecution[]> {
    const executions = this.executions.get(modelId) || [];
    return limit ? executions.slice(-limit) : executions;
  }

  private validateModel(model: AIModel): void {
    if (!model.id || !model.name || !model.version) {
      throw new Error("Model must have id, name, and version");
    }
    if (!model.capabilities) {
      throw new Error("Model must have capabilities defined");
    }
    if (!model.provider || !model.endpoint) {
      throw new Error("Model must have provider and endpoint");
    }
  }

  private async executeModelRequest(
    model: AIModel,
    input: any,
    options?: ModelExecutionOptions,
  ): Promise<ModelResult> {
    // This is a simplified implementation
    // In a real implementation, you would make actual API calls to the model providers

    const result: ModelResult = {
      id: this.generateExecutionId(),
      modelId: model.id,
      input,
      output: this.simulateModelOutput(model, input),
      metadata: {
        tokensUsed: this.estimateTokens(input),
        cost: this.calculateCost(model, input),
        latency: 0,
        cacheHit: false,
        retryCount: 0,
        modelVersion: model.version,
      },
      timestamp: new Date(),
      duration: 0,
      success: true,
    };

    return result;
  }

  private simulateModelOutput(model: AIModel, input: any): any {
    // Simulate model output based on capabilities
    if (model.capabilities.textGeneration) {
      return {
        text: `Generated response from ${
          model.name
        } for input: ${JSON.stringify(input)}`,
        confidence: 0.95,
      };
    }
    if (model.capabilities.codeGeneration) {
      return {
        code: `// Generated code from ${model.name}\nfunction example() {\n  return "Hello World";\n}`,
        language: "javascript",
      };
    }
    return { result: "Model output simulation" };
  }

  private estimateTokens(input: any): number {
    // Simple token estimation
    const text = JSON.stringify(input);
    return Math.ceil(text.length / 4);
  }

  private calculateCost(model: AIModel, input: any): number {
    const tokens = this.estimateTokens(input);
    return tokens * (model.metadata.costPerToken || 0);
  }

  private generateCacheKey(modelId: string, input: any): string {
    return `${modelId}:${JSON.stringify(input)}`;
  }

  private getCachedResult(cacheKey: string): ModelResult | null {
    const expiry = this.cacheExpiry.get(cacheKey);
    if (expiry && Date.now() > expiry) {
      this.cache.delete(cacheKey);
      this.cacheExpiry.delete(cacheKey);
      return null;
    }
    return this.cache.get(cacheKey) || null;
  }

  private cacheResult(cacheKey: string, result: ModelResult): void {
    this.cache.set(cacheKey, result);
    this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);
  }

  private clearModelCache(modelId: string): void {
    for (const [key] of this.cache) {
      if (key.startsWith(modelId)) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }
  }

  private updateMetrics(
    modelId: string,
    startTime: number,
    success: boolean,
    cost: number,
    cacheHit: boolean,
  ): void {
    const metrics = this.metrics.get(modelId);
    if (!metrics) return;

    const duration = Date.now() - startTime;

    metrics.totalExecutions++;
    if (success) {
      metrics.successfulExecutions++;
    } else {
      metrics.failedExecutions++;
    }

    metrics.averageResponseTime = (metrics.averageResponseTime + duration) / 2;
    metrics.totalCost += cost;
    metrics.averageCost = metrics.totalCost / metrics.totalExecutions;

    if (cacheHit) {
      metrics.cacheHitRate = (metrics.cacheHitRate + 1) / 2;
    }

    metrics.errorRate = metrics.failedExecutions / metrics.totalExecutions;
    metrics.lastExecution = new Date();
  }

  private storeExecution(
    modelId: string,
    result: ModelResult | null,
    duration: number,
    success: boolean,
    error?: string,
  ): void {
    const executions = this.executions.get(modelId) || [];
    const execution: ModelExecution = {
      id: result?.id || this.generateExecutionId(),
      modelId,
      timestamp: new Date(),
      duration,
      success,
      input: result?.input,
      output: result?.output,
      error,
      metadata: result?.metadata || {
        tokensUsed: 0,
        cost: 0,
        latency: duration,
        cacheHit: false,
        retryCount: 0,
        modelVersion: "unknown",
      },
    };

    executions.push(execution);
    this.executions.set(modelId, executions);
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export interface ModelExecutionOptions {
  skipCache?: boolean;
  timeout?: number;
  retries?: number;
  temperature?: number;
  maxTokens?: number;
}

export interface AsyncModelResult {
  id: string;
  modelId: string;
  status: "running" | "completed" | "failed" | "cancelled";
  startTime: Date;
  promise: Promise<ModelResult>;
  cancel: () => void;
}
