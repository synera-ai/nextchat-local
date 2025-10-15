import { EventEmitter } from "events";
import { BaseAgent } from "../core/BaseAgent";
import { AgentManager } from "../core/AgentManager";

export interface AgentFactoryConfig {
  maxAgents: number;
  defaultTimeout: number;
  retryAttempts: number;
  retryDelay: number;
  validationEnabled: boolean;
  autoStart: boolean;
  persistenceEnabled: boolean;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
}

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  version: string;
  type: AgentType;
  capabilities: AgentCapabilities;
  configuration: AgentConfiguration;
  dependencies: AgentDependency[];
  requirements: AgentRequirement[];
  metadata: AgentTemplateMetadata;
}

export interface AgentCapabilities {
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
  custom: string[];
}

export interface AgentConfiguration {
  model: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
  retries: number;
  cacheEnabled: boolean;
  loggingEnabled: boolean;
  monitoringEnabled: boolean;
  custom: Record<string, any>;
}

export interface AgentDependency {
  name: string;
  version: string;
  type: "required" | "optional";
  description: string;
}

export interface AgentRequirement {
  type: "cpu" | "memory" | "storage" | "network" | "gpu";
  value: number;
  unit: string;
  description: string;
}

export interface AgentTemplateMetadata {
  author: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  category: string;
  complexity: "low" | "medium" | "high";
  reliability: number;
  performance: number;
  security: number;
}

export enum AgentType {
  CHAT = "chat",
  TASK = "task",
  ANALYSIS = "analysis",
  CREATIVE = "creative",
  INTEGRATION = "integration",
  UTILITY = "utility",
  CUSTOM = "custom",
}

export interface AgentCreationOptions {
  name?: string;
  description?: string;
  configuration?: Partial<AgentConfiguration>;
  dependencies?: AgentDependency[];
  requirements?: AgentRequirement[];
  metadata?: Partial<AgentTemplateMetadata>;
  autoStart?: boolean;
  validation?: boolean;
}

export interface AgentCreationResult {
  agent: BaseAgent;
  success: boolean;
  errors: string[];
  warnings: string[];
  metadata: AgentCreationMetadata;
}

export interface AgentCreationMetadata {
  creationTime: number;
  templateUsed: string;
  dependenciesResolved: number;
  requirementsMet: number;
  validationPassed: boolean;
  autoStarted: boolean;
}

export class AgentFactory extends EventEmitter {
  private config: AgentFactoryConfig;
  private templates: Map<string, AgentTemplate> = new Map();
  private createdAgents: Map<string, BaseAgent> = new Map();
  private agentManager: AgentManager;
  private isRunning = false;

  constructor(
    agentManager: AgentManager,
    config?: Partial<AgentFactoryConfig>,
  ) {
    super();
    this.agentManager = agentManager;
    this.config = {
      maxAgents: 100,
      defaultTimeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      validationEnabled: true,
      autoStart: true,
      persistenceEnabled: false,
      compressionEnabled: false,
      encryptionEnabled: false,
      ...config,
    };

    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates(): void {
    const defaultTemplates: AgentTemplate[] = [
      {
        id: "chat-agent",
        name: "Chat Agent",
        description: "General purpose conversational AI agent",
        version: "1.0.0",
        type: AgentType.CHAT,
        capabilities: {
          textGeneration: true,
          textCompletion: true,
          textAnalysis: true,
          codeGeneration: false,
          imageGeneration: false,
          audioGeneration: false,
          embedding: false,
          classification: true,
          summarization: true,
          translation: true,
          custom: [],
        },
        configuration: {
          model: "gpt-4",
          temperature: 0.7,
          maxTokens: 4096,
          timeout: 30000,
          retries: 3,
          cacheEnabled: true,
          loggingEnabled: true,
          monitoringEnabled: true,
          custom: {},
        },
        dependencies: [],
        requirements: [
          {
            type: "cpu",
            value: 1,
            unit: "cores",
            description: "Minimum 1 CPU core",
          },
          {
            type: "memory",
            value: 512,
            unit: "MB",
            description: "Minimum 512MB RAM",
          },
        ],
        metadata: {
          author: "System",
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ["chat", "conversation", "general"],
          category: "communication",
          complexity: "medium",
          reliability: 0.9,
          performance: 0.8,
          security: 0.7,
        },
      },
      {
        id: "task-agent",
        name: "Task Agent",
        description: "Agent specialized in task execution and automation",
        version: "1.0.0",
        type: AgentType.TASK,
        capabilities: {
          textGeneration: true,
          textCompletion: true,
          textAnalysis: true,
          codeGeneration: true,
          imageGeneration: false,
          audioGeneration: false,
          embedding: false,
          classification: true,
          summarization: false,
          translation: false,
          custom: ["task_execution", "automation"],
        },
        configuration: {
          model: "gpt-4",
          temperature: 0.3,
          maxTokens: 2048,
          timeout: 60000,
          retries: 5,
          cacheEnabled: true,
          loggingEnabled: true,
          monitoringEnabled: true,
          custom: {},
        },
        dependencies: [],
        requirements: [
          {
            type: "cpu",
            value: 2,
            unit: "cores",
            description: "Minimum 2 CPU cores",
          },
          {
            type: "memory",
            value: 1024,
            unit: "MB",
            description: "Minimum 1GB RAM",
          },
        ],
        metadata: {
          author: "System",
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ["task", "automation", "execution"],
          category: "productivity",
          complexity: "high",
          reliability: 0.95,
          performance: 0.9,
          security: 0.8,
        },
      },
      {
        id: "analysis-agent",
        name: "Analysis Agent",
        description: "Agent specialized in data analysis and insights",
        version: "1.0.0",
        type: AgentType.ANALYSIS,
        capabilities: {
          textGeneration: true,
          textCompletion: true,
          textAnalysis: true,
          codeGeneration: true,
          imageGeneration: false,
          audioGeneration: false,
          embedding: true,
          classification: true,
          summarization: true,
          translation: false,
          custom: ["data_analysis", "insights", "visualization"],
        },
        configuration: {
          model: "gpt-4",
          temperature: 0.2,
          maxTokens: 8192,
          timeout: 120000,
          retries: 3,
          cacheEnabled: true,
          loggingEnabled: true,
          monitoringEnabled: true,
          custom: {},
        },
        dependencies: [],
        requirements: [
          {
            type: "cpu",
            value: 4,
            unit: "cores",
            description: "Minimum 4 CPU cores",
          },
          {
            type: "memory",
            value: 2048,
            unit: "MB",
            description: "Minimum 2GB RAM",
          },
          {
            type: "storage",
            value: 10,
            unit: "GB",
            description: "Minimum 10GB storage",
          },
        ],
        metadata: {
          author: "System",
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ["analysis", "data", "insights"],
          category: "analytics",
          complexity: "high",
          reliability: 0.9,
          performance: 0.85,
          security: 0.8,
        },
      },
    ];

    defaultTemplates.forEach((template) => {
      this.templates.set(template.id, template);
    });
  }

  async createAgent(
    templateId: string,
    options: AgentCreationOptions = {},
  ): Promise<AgentCreationResult> {
    try {
      const startTime = Date.now();

      // Get template
      const template = this.templates.get(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      // Check agent limit
      if (this.createdAgents.size >= this.config.maxAgents) {
        throw new Error("Maximum number of agents reached");
      }

      // Validate options
      const validation = await this.validateCreationOptions(template, options);
      if (!validation.valid && this.config.validationEnabled) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Resolve dependencies
      const dependenciesResolved = await this.resolveDependencies(
        template.dependencies,
      );

      // Check requirements
      const requirementsMet = await this.checkRequirements(
        template.requirements,
      );

      // Create agent configuration
      const agentConfig = this.mergeConfiguration(
        template.configuration,
        options.configuration,
      );

      // Create agent
      const agent = await this.instantiateAgent(template, agentConfig, options);

      // Register agent
      await this.agentManager.registerAgent(agent);
      this.createdAgents.set(agent.id, agent);

      // Auto-start if enabled
      let autoStarted = false;
      if (options.autoStart !== false && this.config.autoStart) {
        await agent.start();
        autoStarted = true;
      }

      const creationTime = Date.now() - startTime;
      const result: AgentCreationResult = {
        agent,
        success: true,
        errors: validation.errors,
        warnings: validation.warnings,
        metadata: {
          creationTime,
          templateUsed: templateId,
          dependenciesResolved,
          requirementsMet,
          validationPassed: validation.valid,
          autoStarted,
        },
      };

      this.emit("agentCreated", { templateId, agent, result });
      return result;
    } catch (error) {
      const result: AgentCreationResult = {
        agent: null as any,
        success: false,
        errors: [error.message],
        warnings: [],
        metadata: {
          creationTime: 0,
          templateUsed: templateId,
          dependenciesResolved: 0,
          requirementsMet: 0,
          validationPassed: false,
          autoStarted: false,
        },
      };

      this.emit("agentCreationError", { templateId, error, result });
      throw error;
    }
  }

  async createCustomAgent(
    template: Omit<AgentTemplate, "id" | "metadata">,
    options: AgentCreationOptions = {},
  ): Promise<AgentCreationResult> {
    try {
      // Create full template
      const fullTemplate: AgentTemplate = {
        ...template,
        id: this.generateTemplateId(),
        metadata: {
          author: "User",
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ["custom"],
          category: "custom",
          complexity: "medium",
          reliability: 0.8,
          performance: 0.8,
          security: 0.7,
          ...options.metadata,
        },
      };

      // Store template
      this.templates.set(fullTemplate.id, fullTemplate);

      // Create agent using template
      return this.createAgent(fullTemplate.id, options);
    } catch (error) {
      this.emit("customAgentCreationError", { template, error });
      throw error;
    }
  }

  async getTemplate(templateId: string): Promise<AgentTemplate | null> {
    return this.templates.get(templateId) || null;
  }

  async getAllTemplates(): Promise<AgentTemplate[]> {
    return Array.from(this.templates.values());
  }

  async getTemplatesByType(type: AgentType): Promise<AgentTemplate[]> {
    return Array.from(this.templates.values()).filter(
      (template) => template.type === type,
    );
  }

  async getTemplatesByCategory(category: string): Promise<AgentTemplate[]> {
    return Array.from(this.templates.values()).filter(
      (template) => template.metadata.category === category,
    );
  }

  async addTemplate(template: AgentTemplate): Promise<void> {
    try {
      this.templates.set(template.id, template);
      this.emit("templateAdded", { template });
    } catch (error) {
      this.emit("templateAdditionError", { template, error });
      throw error;
    }
  }

  async updateTemplate(
    templateId: string,
    updates: Partial<AgentTemplate>,
  ): Promise<boolean> {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        return false;
      }

      const updatedTemplate = {
        ...template,
        ...updates,
        updatedAt: new Date(),
      };
      this.templates.set(templateId, updatedTemplate);

      this.emit("templateUpdated", { templateId, template: updatedTemplate });
      return true;
    } catch (error) {
      this.emit("templateUpdateError", { templateId, error });
      throw error;
    }
  }

  async deleteTemplate(templateId: string): Promise<boolean> {
    try {
      const deleted = this.templates.delete(templateId);
      if (deleted) {
        this.emit("templateDeleted", { templateId });
      }
      return deleted;
    } catch (error) {
      this.emit("templateDeletionError", { templateId, error });
      throw error;
    }
  }

  async getCreatedAgents(): Promise<BaseAgent[]> {
    return Array.from(this.createdAgents.values());
  }

  async getCreatedAgent(agentId: string): Promise<BaseAgent | null> {
    return this.createdAgents.get(agentId) || null;
  }

  async destroyAgent(agentId: string): Promise<boolean> {
    try {
      const agent = this.createdAgents.get(agentId);
      if (!agent) {
        return false;
      }

      // Stop agent
      await agent.stop();

      // Unregister from manager
      await this.agentManager.unregisterAgent(agentId);

      // Remove from created agents
      this.createdAgents.delete(agentId);

      this.emit("agentDestroyed", { agentId, agent });
      return true;
    } catch (error) {
      this.emit("agentDestructionError", { agentId, error });
      throw error;
    }
  }

  private async validateCreationOptions(
    template: AgentTemplate,
    options: AgentCreationOptions,
  ): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate name
    if (options.name && options.name.length < 3) {
      errors.push("Agent name must be at least 3 characters long");
    }

    // Validate configuration
    if (options.configuration) {
      if (
        options.configuration.temperature !== undefined &&
        (options.configuration.temperature < 0 ||
          options.configuration.temperature > 2)
      ) {
        errors.push("Temperature must be between 0 and 2");
      }

      if (
        options.configuration.maxTokens !== undefined &&
        options.configuration.maxTokens < 1
      ) {
        errors.push("Max tokens must be greater than 0");
      }

      if (
        options.configuration.timeout !== undefined &&
        options.configuration.timeout < 1000
      ) {
        warnings.push("Timeout less than 1 second may cause issues");
      }
    }

    // Validate dependencies
    if (options.dependencies) {
      for (const dep of options.dependencies) {
        if (!dep.name || !dep.version) {
          errors.push("Dependency must have name and version");
        }
      }
    }

    // Validate requirements
    if (options.requirements) {
      for (const req of options.requirements) {
        if (!req.type || req.value <= 0) {
          errors.push("Requirement must have valid type and positive value");
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private async resolveDependencies(
    dependencies: AgentDependency[],
  ): Promise<number> {
    let resolved = 0;

    for (const dep of dependencies) {
      try {
        // In a real implementation, you would check if the dependency is available
        // For now, we'll simulate dependency resolution
        if (dep.type === "required") {
          // Simulate dependency check
          await new Promise((resolve) => setTimeout(resolve, 100));
          resolved++;
        }
      } catch (error) {
        if (dep.type === "required") {
          throw new Error(
            `Required dependency ${dep.name} not available: ${error.message}`,
          );
        }
      }
    }

    return resolved;
  }

  private async checkRequirements(
    requirements: AgentRequirement[],
  ): Promise<number> {
    let met = 0;

    for (const req of requirements) {
      try {
        // In a real implementation, you would check system resources
        // For now, we'll simulate requirement checking
        await new Promise((resolve) => setTimeout(resolve, 50));
        met++;
      } catch (error) {
        throw new Error(`Requirement ${req.type} not met: ${error.message}`);
      }
    }

    return met;
  }

  private mergeConfiguration(
    templateConfig: AgentConfiguration,
    optionsConfig?: Partial<AgentConfiguration>,
  ): AgentConfiguration {
    return {
      ...templateConfig,
      ...optionsConfig,
      custom: {
        ...templateConfig.custom,
        ...optionsConfig?.custom,
      },
    };
  }

  private async instantiateAgent(
    template: AgentTemplate,
    config: AgentConfiguration,
    options: AgentCreationOptions,
  ): Promise<BaseAgent> {
    // Create agent instance based on template type
    const agent = new BaseAgent({
      id: this.generateAgentId(),
      name: options.name || template.name,
      description: options.description || template.description,
      version: template.version,
      capabilities: template.capabilities,
      configuration: config,
      dependencies: options.dependencies || template.dependencies,
      requirements: options.requirements || template.requirements,
      metadata: {
        ...template.metadata,
        ...options.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return agent;
  }

  private generateTemplateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAgentId(): string {
    return `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Configuration
  updateConfig(newConfig: Partial<AgentFactoryConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit("configUpdated", { config: this.config });
  }

  getConfig(): AgentFactoryConfig {
    return { ...this.config };
  }

  isRunning(): boolean {
    return this.isRunning;
  }
}
