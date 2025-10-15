// Plugin Configuration Manager
// This file handles plugin configuration, validation, and persistence

import { EventEmitter } from "events";
import { z } from "zod";
import {
  PluginConfig,
  PluginMetadata,
  PluginConfigurationError,
  PluginConfigSchema,
} from "./types";

export class PluginConfigurationManager extends EventEmitter {
  private configs: Map<string, PluginConfig> = new Map();
  private schemas: Map<string, PluginConfigSchema> = new Map();
  private initialized = false;

  constructor() {
    super();
  }

  // Initialize the configuration manager
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Load existing configurations
      await this.loadConfigurations();
      this.initialized = true;
    } catch (error) {
      throw new PluginConfigurationError(
        "system",
        `Failed to initialize configuration manager: ${error}`,
        error,
      );
    }
  }

  // Load configurations from storage
  private async loadConfigurations(): Promise<void> {
    try {
      // In a real implementation, this would load from persistent storage
      // For now, we'll use an empty configuration
      this.configs.clear();
    } catch (error) {
      console.error("Failed to load configurations:", error);
    }
  }

  // Save configurations to storage
  private async saveConfigurations(): Promise<void> {
    try {
      // In a real implementation, this would save to persistent storage
      // For now, we'll just emit an event
      this.emit("configurations:saved");
    } catch (error) {
      console.error("Failed to save configurations:", error);
    }
  }

  // Register plugin configuration schema
  registerSchema(pluginId: string, schema: PluginConfigSchema): void {
    this.schemas.set(pluginId, schema);
  }

  // Get plugin configuration schema
  getSchema(pluginId: string): PluginConfigSchema | undefined {
    return this.schemas.get(pluginId);
  }

  // Create default configuration for plugin
  createDefaultConfig(metadata: PluginMetadata): PluginConfig {
    const schema = metadata.configSchema;
    const defaultConfig: PluginConfig = {
      enabled: false,
      settings: {},
      permissions: [],
      rateLimits: {},
      hooks: {},
      middleware: {},
    };

    // Set default values from schema
    if (schema && schema.properties) {
      for (const [key, property] of Object.entries(schema.properties)) {
        if (property.default !== undefined) {
          defaultConfig.settings[key] = property.default;
        }
      }
    }

    // Set default permissions from metadata
    if (metadata.capabilities) {
      defaultConfig.permissions = [
        ...metadata.capabilities.tools.map((t) => `tool:${t.name}`),
        ...metadata.capabilities.actions.map((a) => `action:${a.name}`),
        ...metadata.capabilities.resources.map((r) => `resource:${r.name}`),
      ];
    }

    // Set default hooks and middleware
    if (metadata.capabilities) {
      for (const hook of metadata.capabilities.hooks) {
        defaultConfig.hooks[hook.name] = true;
      }
      for (const middleware of metadata.capabilities.middleware) {
        defaultConfig.middleware[middleware.name] = true;
      }
    }

    return defaultConfig;
  }

  // Configure plugin
  async configurePlugin(
    pluginId: string,
    config: Partial<PluginConfig>,
  ): Promise<void> {
    if (!this.initialized) {
      throw new PluginConfigurationError(
        "system",
        "Configuration manager not initialized",
      );
    }

    try {
      // Get existing configuration
      const existingConfig =
        this.configs.get(pluginId) ||
        this.createDefaultConfig({} as PluginMetadata);

      // Merge configurations
      const newConfig: PluginConfig = {
        ...existingConfig,
        ...config,
        settings: {
          ...existingConfig.settings,
          ...config.settings,
        },
        permissions: config.permissions || existingConfig.permissions,
        rateLimits: {
          ...existingConfig.rateLimits,
          ...config.rateLimits,
        },
        hooks: {
          ...existingConfig.hooks,
          ...config.hooks,
        },
        middleware: {
          ...existingConfig.middleware,
          ...config.middleware,
        },
      };

      // Validate configuration
      await this.validateConfig(pluginId, newConfig);

      // Save configuration
      this.configs.set(pluginId, newConfig);
      await this.saveConfigurations();

      this.emit("plugin:configured", pluginId, newConfig);
    } catch (error) {
      if (error instanceof PluginConfigurationError) {
        throw error;
      }
      throw new PluginConfigurationError(
        pluginId,
        `Failed to configure plugin: ${error}`,
        error,
      );
    }
  }

  // Validate plugin configuration
  async validateConfig(pluginId: string, config: PluginConfig): Promise<void> {
    const schema = this.schemas.get(pluginId);
    if (!schema) {
      return; // No schema to validate against
    }

    try {
      // Create Zod schema from configuration schema
      const zodSchema = this.createZodSchema(schema);

      // Validate settings
      if (schema.properties) {
        const settingsSchema = z.object(
          Object.fromEntries(
            Object.entries(schema.properties).map(([key, prop]) => [
              key,
              this.createZodType(prop),
            ]),
          ),
        );

        settingsSchema.parse(config.settings);
      }

      // Validate required fields
      if (schema.required) {
        for (const requiredField of schema.required) {
          if (!(requiredField in config.settings)) {
            throw new PluginConfigurationError(
              pluginId,
              `Required configuration field '${requiredField}' is missing`,
            );
          }
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new PluginConfigurationError(
          pluginId,
          `Configuration validation failed: ${error.errors
            .map((e) => e.message)
            .join(", ")}`,
          error.errors,
        );
      }
      throw error;
    }
  }

  // Create Zod schema from configuration schema
  private createZodSchema(schema: PluginConfigSchema): z.ZodSchema {
    if (!schema.properties) {
      return z.object({});
    }

    const zodProperties = Object.fromEntries(
      Object.entries(schema.properties).map(([key, prop]) => [
        key,
        this.createZodType(prop),
      ]),
    );

    return z.object(zodProperties);
  }

  // Create Zod type from property definition
  private createZodType(property: any): z.ZodType {
    let zodType: z.ZodType;

    switch (property.type) {
      case "string":
        let stringType = z.string();
        if (property.pattern) {
          stringType = stringType.regex(new RegExp(property.pattern));
        }
        zodType = stringType;
        break;
      case "number":
        let numberType = z.number();
        if (property.minimum !== undefined) {
          numberType = numberType.min(property.minimum);
        }
        if (property.maximum !== undefined) {
          numberType = numberType.max(property.maximum);
        }
        zodType = numberType;
        break;
      case "boolean":
        zodType = z.boolean();
        break;
      case "array":
        let arrayType = z.array(z.any());
        if (property.minItems !== undefined) {
          arrayType = arrayType.min(property.minItems);
        }
        zodType = arrayType;
        break;
      case "object":
        zodType = z.object({});
        break;
      default:
        zodType = z.any();
    }

    // Add enum validation if specified
    if (property.enum) {
      zodType = z.enum(property.enum);
    }

    // Make optional if not required
    if (!property.required) {
      zodType = zodType.optional();
    }

    return zodType;
  }

  // Get plugin configuration
  getConfig(pluginId: string): PluginConfig | undefined {
    return this.configs.get(pluginId);
  }

  // Get all plugin configurations
  getAllConfigs(): Map<string, PluginConfig> {
    return new Map(this.configs);
  }

  // Remove plugin configuration
  async removePluginConfig(pluginId: string): Promise<void> {
    this.configs.delete(pluginId);
    this.schemas.delete(pluginId);
    await this.saveConfigurations();
  }

  // Get installed plugins from configuration
  async getInstalledPlugins(): Promise<
    Array<{ id: string; config: PluginConfig }>
  > {
    const installed: Array<{ id: string; config: PluginConfig }> = [];

    for (const [pluginId, config] of this.configs.entries()) {
      installed.push({ id: pluginId, config });
    }

    return installed;
  }

  // Export configuration
  exportConfig(pluginId: string): string {
    const config = this.configs.get(pluginId);
    if (!config) {
      throw new PluginConfigurationError(pluginId, "Configuration not found");
    }

    return JSON.stringify(config, null, 2);
  }

  // Import configuration
  async importConfig(pluginId: string, configJson: string): Promise<void> {
    try {
      const config = JSON.parse(configJson) as PluginConfig;
      await this.configurePlugin(pluginId, config);
    } catch (error) {
      throw new PluginConfigurationError(
        pluginId,
        `Failed to import configuration: ${error}`,
        error,
      );
    }
  }

  // Reset configuration to defaults
  async resetConfig(pluginId: string, metadata: PluginMetadata): Promise<void> {
    const defaultConfig = this.createDefaultConfig(metadata);
    await this.configurePlugin(pluginId, defaultConfig);
  }

  // Get configuration statistics
  getStats(): {
    totalConfigs: number;
    enabledConfigs: number;
    configsWithErrors: number;
  } {
    const configs = Array.from(this.configs.values());
    return {
      totalConfigs: configs.length,
      enabledConfigs: configs.filter((c) => c.enabled).length,
      configsWithErrors: 0, // This would be tracked in a real implementation
    };
  }

  // Cleanup
  async destroy(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    try {
      await this.saveConfigurations();
      this.configs.clear();
      this.schemas.clear();
      this.initialized = false;
    } catch (error) {
      console.error("Failed to destroy configuration manager:", error);
    }
  }
}
