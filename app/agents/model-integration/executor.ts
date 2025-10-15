import { EventEmitter } from "events";
import { ModelRegistry, ModelResult, ModelExecutionOptions } from "./registry";

export interface ModelExecutorConfig {
  maxConcurrentExecutions: number;
  defaultTimeout: number;
  retryAttempts: number;
  retryDelay: number;
  circuitBreakerThreshold: number;
  circuitBreakerTimeout: number;
}

export interface ExecutionContext {
  id: string;
  modelId: string;
  input: any;
  options?: ModelExecutionOptions;
  startTime: number;
  retryCount: number;
  status: ExecutionStatus;
}

export enum ExecutionStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  TIMEOUT = "timeout",
}

export interface ExecutionResult {
  id: string;
  modelId: string;
  result?: ModelResult;
  error?: string;
  status: ExecutionStatus;
  duration: number;
  retryCount: number;
  metadata: ExecutionMetadata;
}

export interface ExecutionMetadata {
  queueTime: number;
  executionTime: number;
  totalTime: number;
  cacheHit: boolean;
  circuitBreakerOpen: boolean;
  retryAttempts: number;
}

export class ModelExecutor extends EventEmitter {
  private registry: ModelRegistry;
  private config: ModelExecutorConfig;
  private executionQueue: ExecutionContext[] = [];
  private activeExecutions: Map<string, ExecutionContext> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private executionHistory: Map<string, ExecutionResult[]> = new Map();
  private isProcessing = false;

  constructor(registry: ModelRegistry, config?: Partial<ModelExecutorConfig>) {
    super();
    this.registry = registry;
    this.config = {
      maxConcurrentExecutions: 10,
      defaultTimeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      circuitBreakerThreshold: 5,
      circuitBreakerTimeout: 60000,
      ...config,
    };

    this.initializeCircuitBreakers();
  }

  private initializeCircuitBreakers(): void {
    // Initialize circuit breakers for each model
    this.registry.getAvailableModels().then((models) => {
      models.forEach((model) => {
        this.circuitBreakers.set(
          model.id,
          new CircuitBreaker(
            this.config.circuitBreakerThreshold,
            this.config.circuitBreakerTimeout,
          ),
        );
      });
    });
  }

  async executeModel(
    modelId: string,
    input: any,
    options?: ModelExecutionOptions,
  ): Promise<ModelResult> {
    const executionId = this.generateExecutionId();
    const startTime = Date.now();

    const context: ExecutionContext = {
      id: executionId,
      modelId,
      input,
      options,
      startTime,
      retryCount: 0,
      status: ExecutionStatus.PENDING,
    };

    try {
      // Check circuit breaker
      const circuitBreaker = this.circuitBreakers.get(modelId);
      if (circuitBreaker && circuitBreaker.isOpen()) {
        throw new Error(`Circuit breaker is open for model ${modelId}`);
      }

      // Add to queue
      this.executionQueue.push(context);
      this.emit("executionQueued", { executionId, modelId });

      // Process queue
      await this.processQueue();

      // Wait for completion
      return await this.waitForCompletion(executionId);
    } catch (error) {
      this.emit("executionError", { executionId, modelId, error });
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

    const context: ExecutionContext = {
      id: executionId,
      modelId,
      input,
      options,
      startTime,
      retryCount: 0,
      status: ExecutionStatus.PENDING,
    };

    // Add to queue
    this.executionQueue.push(context);
    this.emit("executionQueued", { executionId, modelId });

    // Process queue
    this.processQueue();

    return {
      id: executionId,
      modelId,
      status: "running",
      startTime: new Date(startTime),
      promise: this.waitForCompletion(executionId),
      cancel: () => this.cancelExecution(executionId),
    };
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (
        this.executionQueue.length > 0 &&
        this.activeExecutions.size < this.config.maxConcurrentExecutions
      ) {
        const context = this.executionQueue.shift();
        if (context) {
          await this.executeContext(context);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async executeContext(context: ExecutionContext): Promise<void> {
    const { id, modelId, input, options } = context;

    try {
      context.status = ExecutionStatus.RUNNING;
      this.activeExecutions.set(id, context);

      this.emit("executionStarted", { executionId: id, modelId });

      // Set timeout
      const timeout = options?.timeout || this.config.defaultTimeout;
      const timeoutId = setTimeout(() => {
        this.handleTimeout(id);
      }, timeout);

      // Execute model
      const result = await this.registry.executeModel(modelId, input, options);

      clearTimeout(timeoutId);

      // Record success
      this.recordExecution(id, modelId, result, ExecutionStatus.COMPLETED);
      this.circuitBreakers.get(modelId)?.recordSuccess();

      this.emit("executionCompleted", { executionId: id, modelId, result });
    } catch (error) {
      // Record failure
      this.recordExecution(
        id,
        modelId,
        null,
        ExecutionStatus.FAILED,
        error.message,
      );
      this.circuitBreakers.get(modelId)?.recordFailure();

      // Retry if possible
      if (context.retryCount < this.config.retryAttempts) {
        await this.retryExecution(context);
      } else {
        this.emit("executionFailed", { executionId: id, modelId, error });
      }
    } finally {
      this.activeExecutions.delete(id);
      // Continue processing queue
      this.processQueue();
    }
  }

  private async retryExecution(context: ExecutionContext): Promise<void> {
    context.retryCount++;
    context.status = ExecutionStatus.PENDING;

    // Add delay before retry
    await new Promise((resolve) =>
      setTimeout(resolve, this.config.retryDelay * context.retryCount),
    );

    // Add back to queue
    this.executionQueue.push(context);
    this.emit("executionRetried", {
      executionId: context.id,
      modelId: context.modelId,
      retryCount: context.retryCount,
    });
  }

  private handleTimeout(executionId: string): void {
    const context = this.activeExecutions.get(executionId);
    if (context) {
      context.status = ExecutionStatus.TIMEOUT;
      this.recordExecution(
        executionId,
        context.modelId,
        null,
        ExecutionStatus.TIMEOUT,
        "Execution timeout",
      );
      this.activeExecutions.delete(executionId);
      this.emit("executionTimeout", { executionId, modelId: context.modelId });
    }
  }

  private async waitForCompletion(executionId: string): Promise<ModelResult> {
    return new Promise((resolve, reject) => {
      const checkCompletion = () => {
        const result = this.getExecutionResult(executionId);
        if (result) {
          if (result.status === ExecutionStatus.COMPLETED && result.result) {
            resolve(result.result);
          } else {
            reject(new Error(result.error || "Execution failed"));
          }
        } else {
          // Check again in 100ms
          setTimeout(checkCompletion, 100);
        }
      };
      checkCompletion();
    });
  }

  private cancelExecution(executionId: string): void {
    const context = this.activeExecutions.get(executionId);
    if (context) {
      context.status = ExecutionStatus.CANCELLED;
      this.recordExecution(
        executionId,
        context.modelId,
        null,
        ExecutionStatus.CANCELLED,
        "Execution cancelled",
      );
      this.activeExecutions.delete(executionId);
      this.emit("executionCancelled", {
        executionId,
        modelId: context.modelId,
      });
    }
  }

  private recordExecution(
    executionId: string,
    modelId: string,
    result: ModelResult | null,
    status: ExecutionStatus,
    error?: string,
  ): void {
    const context = this.activeExecutions.get(executionId);
    const duration = Date.now() - (context?.startTime || Date.now());

    const executionResult: ExecutionResult = {
      id: executionId,
      modelId,
      result,
      error,
      status,
      duration,
      retryCount: context?.retryCount || 0,
      metadata: {
        queueTime: 0, // TODO: Calculate queue time
        executionTime: duration,
        totalTime: duration,
        cacheHit: result?.metadata.cacheHit || false,
        circuitBreakerOpen:
          this.circuitBreakers.get(modelId)?.isOpen() || false,
        retryAttempts: context?.retryCount || 0,
      },
    };

    const history = this.executionHistory.get(modelId) || [];
    history.push(executionResult);
    this.executionHistory.set(modelId, history);
  }

  private getExecutionResult(executionId: string): ExecutionResult | null {
    for (const history of this.executionHistory.values()) {
      const result = history.find((r) => r.id === executionId);
      if (result) return result;
    }
    return null;
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods for monitoring and management
  getQueueStatus(): {
    queueLength: number;
    activeExecutions: number;
    maxConcurrent: number;
  } {
    return {
      queueLength: this.executionQueue.length,
      activeExecutions: this.activeExecutions.size,
      maxConcurrent: this.config.maxConcurrentExecutions,
    };
  }

  getExecutionHistory(modelId?: string): ExecutionResult[] {
    if (modelId) {
      return this.executionHistory.get(modelId) || [];
    }

    const allHistory: ExecutionResult[] = [];
    for (const history of this.executionHistory.values()) {
      allHistory.push(...history);
    }
    return allHistory;
  }

  getCircuitBreakerStatus(modelId: string): {
    isOpen: boolean;
    failureCount: number;
    lastFailureTime?: Date;
  } {
    const circuitBreaker = this.circuitBreakers.get(modelId);
    if (!circuitBreaker) {
      return { isOpen: false, failureCount: 0 };
    }

    return {
      isOpen: circuitBreaker.isOpen(),
      failureCount: circuitBreaker.getFailureCount(),
      lastFailureTime: circuitBreaker.getLastFailureTime(),
    };
  }

  clearHistory(modelId?: string): void {
    if (modelId) {
      this.executionHistory.delete(modelId);
    } else {
      this.executionHistory.clear();
    }
  }
}

class CircuitBreaker {
  private failureThreshold: number;
  private timeout: number;
  private failureCount = 0;
  private lastFailureTime?: Date;
  private state: "closed" | "open" | "half-open" = "closed";

  constructor(failureThreshold: number, timeout: number) {
    this.failureThreshold = failureThreshold;
    this.timeout = timeout;
  }

  recordSuccess(): void {
    this.failureCount = 0;
    this.state = "closed";
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();

    if (this.failureCount >= this.failureThreshold) {
      this.state = "open";
    }
  }

  isOpen(): boolean {
    if (this.state === "open") {
      // Check if timeout has passed
      if (
        this.lastFailureTime &&
        Date.now() - this.lastFailureTime.getTime() > this.timeout
      ) {
        this.state = "half-open";
        return false;
      }
      return true;
    }
    return false;
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  getLastFailureTime(): Date | undefined {
    return this.lastFailureTime;
  }
}

export interface AsyncModelResult {
  id: string;
  modelId: string;
  status: "running" | "completed" | "failed" | "cancelled";
  startTime: Date;
  promise: Promise<ModelResult>;
  cancel: () => void;
}
