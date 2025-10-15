import { CustomServerDefinition } from "../mcp/types";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Validate server ID format
export function validateServerId(id: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!id || id.trim().length === 0) {
    errors.push({ field: "id", message: "Server ID is required" });
    return errors;
  }

  // Check for valid characters (alphanumeric, hyphens, underscores)
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    errors.push({
      field: "id",
      message:
        "Server ID can only contain letters, numbers, hyphens, and underscores",
    });
  }

  // Check length
  if (id.length < 2) {
    errors.push({
      field: "id",
      message: "Server ID must be at least 2 characters long",
    });
  }

  if (id.length > 50) {
    errors.push({
      field: "id",
      message: "Server ID must be less than 50 characters",
    });
  }

  return errors;
}

// Validate basic server information
export function validateBasicInfo(
  server: Partial<CustomServerDefinition>,
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate ID
  if (server.id) {
    errors.push(...validateServerId(server.id));
  }

  // Validate name
  if (!server.name || server.name.trim().length === 0) {
    errors.push({ field: "name", message: "Server name is required" });
  } else if (server.name.length > 100) {
    errors.push({
      field: "name",
      message: "Server name must be less than 100 characters",
    });
  }

  // Validate description
  if (!server.description || server.description.trim().length === 0) {
    errors.push({
      field: "description",
      message: "Server description is required",
    });
  } else if (server.description.length > 500) {
    errors.push({
      field: "description",
      message: "Server description must be less than 500 characters",
    });
  }

  // Validate repository URL (optional but must be valid if provided)
  if (server.repo && server.repo.trim().length > 0) {
    try {
      new URL(server.repo);
    } catch {
      errors.push({
        field: "repo",
        message: "Repository URL must be a valid URL",
      });
    }
  }

  // Validate tags
  if (!server.tags || !Array.isArray(server.tags)) {
    errors.push({ field: "tags", message: "Tags must be an array" });
  } else if (server.tags.length > 10) {
    errors.push({ field: "tags", message: "Maximum 10 tags allowed" });
  } else {
    server.tags.forEach((tag, index) => {
      if (typeof tag !== "string" || tag.trim().length === 0) {
        errors.push({
          field: `tags[${index}]`,
          message: "Each tag must be a non-empty string",
        });
      } else if (tag.length > 20) {
        errors.push({
          field: `tags[${index}]`,
          message: "Each tag must be less than 20 characters",
        });
      }
    });
  }

  return errors;
}

// Validate command configuration
export function validateCommandConfig(
  server: Partial<CustomServerDefinition>,
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate command
  if (!server.command || server.command.trim().length === 0) {
    errors.push({ field: "command", message: "Command is required" });
  } else if (server.command.length > 100) {
    errors.push({
      field: "command",
      message: "Command must be less than 100 characters",
    });
  }

  // Validate base arguments
  if (!server.baseArgs || !Array.isArray(server.baseArgs)) {
    errors.push({
      field: "baseArgs",
      message: "Base arguments must be an array",
    });
  } else {
    server.baseArgs.forEach((arg, index) => {
      if (typeof arg !== "string") {
        errors.push({
          field: `baseArgs[${index}]`,
          message: "Each argument must be a string",
        });
      } else if (arg.length > 200) {
        errors.push({
          field: `baseArgs[${index}]`,
          message: "Each argument must be less than 200 characters",
        });
      }
    });
  }

  return errors;
}

// Validate configuration schema
export function validateConfigSchema(
  server: Partial<CustomServerDefinition>,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!server.configurable || !server.configSchema) {
    return errors; // No schema validation needed for non-configurable servers
  }

  const schema = server.configSchema;

  if (!schema.properties || typeof schema.properties !== "object") {
    errors.push({
      field: "configSchema.properties",
      message: "Schema properties must be an object",
    });
    return errors;
  }

  const propertyNames = Object.keys(schema.properties);

  if (propertyNames.length === 0) {
    errors.push({
      field: "configSchema.properties",
      message: "At least one property is required for configurable servers",
    });
    return errors;
  }

  if (propertyNames.length > 20) {
    errors.push({
      field: "configSchema.properties",
      message: "Maximum 20 properties allowed",
    });
  }

  propertyNames.forEach((propName) => {
    const prop = schema.properties[propName];

    // Validate property name
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(propName)) {
      errors.push({
        field: `configSchema.properties.${propName}`,
        message:
          "Property names must start with a letter and contain only letters, numbers, and underscores",
      });
    }

    // Validate property type
    if (!prop.type || !["string", "array"].includes(prop.type)) {
      errors.push({
        field: `configSchema.properties.${propName}.type`,
        message: "Property type must be 'string' or 'array'",
      });
    }

    // Validate description
    if (prop.description && prop.description.length > 200) {
      errors.push({
        field: `configSchema.properties.${propName}.description`,
        message: "Property description must be less than 200 characters",
      });
    }

    // Validate array-specific properties
    if (prop.type === "array") {
      if (prop.itemLabel && prop.itemLabel.length > 50) {
        errors.push({
          field: `configSchema.properties.${propName}.itemLabel`,
          message: "Item label must be less than 50 characters",
        });
      }

      if (prop.addButtonText && prop.addButtonText.length > 50) {
        errors.push({
          field: `configSchema.properties.${propName}.addButtonText`,
          message: "Add button text must be less than 50 characters",
        });
      }
    }
  });

  return errors;
}

// Validate arguments mapping
export function validateArgsMapping(
  server: Partial<CustomServerDefinition>,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!server.configurable || !server.argsMapping) {
    return errors; // No mapping validation needed for non-configurable servers
  }

  const mapping = server.argsMapping;
  const schema = server.configSchema;

  if (!schema || !schema.properties) {
    errors.push({
      field: "argsMapping",
      message: "Args mapping requires a valid config schema",
    });
    return errors;
  }

  const schemaProperties = Object.keys(schema.properties);
  const mappingKeys = Object.keys(mapping);

  // Check that all mapping keys correspond to schema properties
  mappingKeys.forEach((key) => {
    if (!schemaProperties.includes(key)) {
      errors.push({
        field: `argsMapping.${key}`,
        message: `Mapping key '${key}' does not exist in config schema`,
      });
    }
  });

  // Validate each mapping entry
  mappingKeys.forEach((key) => {
    const mappingEntry = mapping[key];

    if (!mappingEntry || typeof mappingEntry !== "object") {
      errors.push({
        field: `argsMapping.${key}`,
        message: "Mapping entry must be an object",
      });
      return;
    }

    // Validate mapping type
    if (
      !mappingEntry.type ||
      !["single", "spread", "env"].includes(mappingEntry.type)
    ) {
      errors.push({
        field: `argsMapping.${key}.type`,
        message: "Mapping type must be 'single', 'spread', or 'env'",
      });
    }

    // Validate position for single and spread types
    if (["single", "spread"].includes(mappingEntry.type)) {
      if (mappingEntry.position === undefined || mappingEntry.position < 0) {
        errors.push({
          field: `argsMapping.${key}.position`,
          message:
            "Position must be a non-negative number for single and spread mappings",
        });
      }
    }

    // Validate env key for env type
    if (mappingEntry.type === "env") {
      if (!mappingEntry.key || typeof mappingEntry.key !== "string") {
        errors.push({
          field: `argsMapping.${key}.key`,
          message: "Environment key is required for env type mappings",
        });
      } else if (!/^[A-Z_][A-Z0-9_]*$/.test(mappingEntry.key)) {
        errors.push({
          field: `argsMapping.${key}.key`,
          message:
            "Environment key must be uppercase letters, numbers, and underscores, starting with a letter or underscore",
        });
      }
    }
  });

  return errors;
}

// Validate complete server definition
export function validateServerDefinition(
  server: Partial<CustomServerDefinition>,
): ValidationResult {
  const errors: ValidationError[] = [];

  // Run all validation functions
  errors.push(...validateBasicInfo(server));
  errors.push(...validateCommandConfig(server));
  errors.push(...validateConfigSchema(server));
  errors.push(...validateArgsMapping(server));

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Helper function to generate server ID from name
export function generateServerId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
    .substring(0, 50); // Limit length
}

// Helper function to validate and fix server definition
export function sanitizeServerDefinition(
  server: Partial<CustomServerDefinition>,
): Partial<CustomServerDefinition> {
  const sanitized = { ...server };

  // Sanitize basic fields
  if (sanitized.name) {
    sanitized.name = sanitized.name.trim();
  }

  if (sanitized.description) {
    sanitized.description = sanitized.description.trim();
  }

  if (sanitized.repo) {
    sanitized.repo = sanitized.repo.trim();
  }

  if (sanitized.command) {
    sanitized.command = sanitized.command.trim();
  }

  // Sanitize tags
  if (sanitized.tags && Array.isArray(sanitized.tags)) {
    sanitized.tags = sanitized.tags
      .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
      .filter((tag) => tag.length > 0)
      .slice(0, 10); // Limit to 10 tags
  }

  // Sanitize base args
  if (sanitized.baseArgs && Array.isArray(sanitized.baseArgs)) {
    sanitized.baseArgs = sanitized.baseArgs
      .map((arg) => (typeof arg === "string" ? arg.trim() : ""))
      .filter((arg) => arg.length > 0);
  }

  return sanitized;
}
