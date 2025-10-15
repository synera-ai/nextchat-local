import { CustomServerDefinition } from "./types";

export interface ServerTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  server: Omit<CustomServerDefinition, "custom" | "createdAt" | "updatedAt">;
}

export const SERVER_TEMPLATES: ServerTemplate[] = [
  {
    id: "simple-cli",
    name: "Simple CLI Tool",
    description: "A basic command-line tool that requires no configuration",
    category: "Basic",
    server: {
      id: "my-cli-tool",
      name: "My CLI Tool",
      description: "A simple command-line tool",
      repo: "",
      tags: ["cli", "simple"],
      command: "npx",
      baseArgs: ["my-package"],
      configurable: false,
    },
  },
  {
    id: "string-config",
    name: "Tool with String Configuration",
    description: "A tool that requires a single string configuration parameter",
    category: "Basic",
    server: {
      id: "my-string-tool",
      name: "My String Tool",
      description: "A tool that requires a string configuration",
      repo: "",
      tags: ["config", "string"],
      command: "python",
      baseArgs: ["-m", "my_tool"],
      configurable: true,
      configSchema: {
        properties: {
          apiKey: {
            type: "string",
            description: "API key for authentication",
            required: true,
          },
        },
      },
      argsMapping: {
        apiKey: {
          type: "single",
          position: 2,
        },
      },
    },
  },
  {
    id: "array-config",
    name: "Tool with Array Configuration",
    description: "A tool that accepts multiple file paths or URLs",
    category: "Advanced",
    server: {
      id: "my-array-tool",
      name: "My Array Tool",
      description: "A tool that processes multiple files or URLs",
      repo: "",
      tags: ["config", "array", "files"],
      command: "node",
      baseArgs: ["my-script.js"],
      configurable: true,
      configSchema: {
        properties: {
          paths: {
            type: "array",
            description: "File paths to process",
            required: true,
            itemLabel: "Path",
            addButtonText: "Add Path",
          },
        },
      },
      argsMapping: {
        paths: {
          type: "spread",
          position: 1,
        },
      },
    },
  },
  {
    id: "env-config",
    name: "Tool with Environment Variables",
    description: "A tool that uses environment variables for configuration",
    category: "Advanced",
    server: {
      id: "my-env-tool",
      name: "My Environment Tool",
      description: "A tool that uses environment variables",
      repo: "",
      tags: ["config", "environment", "secure"],
      command: "python",
      baseArgs: ["-m", "my_env_tool"],
      configurable: true,
      configSchema: {
        properties: {
          databaseUrl: {
            type: "string",
            description: "Database connection URL",
            required: true,
          },
          apiEndpoint: {
            type: "string",
            description: "API endpoint URL",
            required: false,
          },
        },
      },
      argsMapping: {
        databaseUrl: {
          type: "env",
          key: "DATABASE_URL",
        },
        apiEndpoint: {
          type: "env",
          key: "API_ENDPOINT",
        },
      },
    },
  },
  {
    id: "mixed-config",
    name: "Tool with Mixed Configuration",
    description: "A complex tool with both arguments and environment variables",
    category: "Advanced",
    server: {
      id: "my-mixed-tool",
      name: "My Mixed Tool",
      description: "A tool with mixed configuration types",
      repo: "",
      tags: ["config", "mixed", "advanced"],
      command: "uvx",
      baseArgs: ["my-tool"],
      configurable: true,
      configSchema: {
        properties: {
          host: {
            type: "string",
            description: "Server hostname",
            required: true,
          },
          port: {
            type: "string",
            description: "Server port",
            required: false,
          },
          files: {
            type: "array",
            description: "Files to process",
            required: true,
            itemLabel: "File",
            addButtonText: "Add File",
          },
          apiKey: {
            type: "string",
            description: "API key for authentication",
            required: true,
          },
        },
      },
      argsMapping: {
        host: {
          type: "single",
          position: 1,
        },
        port: {
          type: "single",
          position: 2,
        },
        files: {
          type: "spread",
          position: 3,
        },
        apiKey: {
          type: "env",
          key: "API_KEY",
        },
      },
    },
  },
];

export function getTemplateById(id: string): ServerTemplate | undefined {
  return SERVER_TEMPLATES.find((template) => template.id === id);
}

export function getTemplatesByCategory(category: string): ServerTemplate[] {
  return SERVER_TEMPLATES.filter((template) => template.category === category);
}

export function getAllCategories(): string[] {
  const categories = new Set(
    SERVER_TEMPLATES.map((template) => template.category),
  );
  return Array.from(categories).sort();
}

export function createServerFromTemplate(
  templateId: string,
  customizations: Partial<CustomServerDefinition> = {},
): CustomServerDefinition | null {
  const template = getTemplateById(templateId);
  if (!template) {
    return null;
  }

  const now = new Date().toISOString();

  return {
    ...template.server,
    ...customizations,
    custom: true,
    createdAt: now,
    updatedAt: now,
  };
}
