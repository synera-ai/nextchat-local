"use server";
import {
  createClient,
  executeRequest,
  listTools,
  removeClient,
} from "./client";
import { MCPClientLogger } from "./logger";
import {
  CustomServerDefinition,
  DEFAULT_MCP_CONFIG,
  McpClientData,
  McpConfigData,
  McpRequestMessage,
  ServerConfig,
  ServerStatusResponse,
} from "./types";
import fs from "fs/promises";
import path from "path";
import { getServerSideConfig } from "../config/server";

const logger = new MCPClientLogger("MCP Actions");
const CONFIG_PATH = path.join(process.cwd(), "app/mcp/mcp_config.json");
const CUSTOM_SERVERS_PATH = path.join(
  process.cwd(),
  "app/mcp/custom_servers.json",
);

const clientsMap = new Map<string, McpClientData>();

// 获取客户端状态
export async function getClientsStatus(): Promise<
  Record<string, ServerStatusResponse>
> {
  const config = await getMcpConfigFromFile();
  const result: Record<string, ServerStatusResponse> = {};

  for (const clientId of Object.keys(config.mcpServers)) {
    const status = clientsMap.get(clientId);
    const serverConfig = config.mcpServers[clientId];

    if (!serverConfig) {
      result[clientId] = { status: "undefined", errorMsg: null };
      continue;
    }

    if (serverConfig.status === "paused") {
      result[clientId] = { status: "paused", errorMsg: null };
      continue;
    }

    if (!status) {
      result[clientId] = { status: "undefined", errorMsg: null };
      continue;
    }

    if (
      status.client === null &&
      status.tools === null &&
      status.errorMsg === null
    ) {
      result[clientId] = { status: "initializing", errorMsg: null };
      continue;
    }

    if (status.errorMsg) {
      result[clientId] = { status: "error", errorMsg: status.errorMsg };
      continue;
    }

    if (status.client) {
      result[clientId] = { status: "active", errorMsg: null };
      continue;
    }

    result[clientId] = { status: "error", errorMsg: "Client not found" };
  }

  return result;
}

// 获取客户端工具
export async function getClientTools(clientId: string) {
  return clientsMap.get(clientId)?.tools ?? null;
}

// 获取可用客户端数量
export async function getAvailableClientsCount() {
  let count = 0;
  clientsMap.forEach((map) => !map.errorMsg && count++);
  return count;
}

// 获取所有客户端工具
export async function getAllTools() {
  const result = [];
  for (const [clientId, status] of clientsMap.entries()) {
    result.push({
      clientId,
      tools: status.tools,
    });
  }
  return result;
}

// 初始化单个客户端
async function initializeSingleClient(
  clientId: string,
  serverConfig: ServerConfig,
) {
  // 如果服务器状态是暂停，则不初始化
  if (serverConfig.status === "paused") {
    logger.info(`Skipping initialization for paused client [${clientId}]`);
    return;
  }

  logger.info(`Initializing client [${clientId}]...`);

  // 先设置初始化状态
  clientsMap.set(clientId, {
    client: null,
    tools: null,
    errorMsg: null, // null 表示正在初始化
  });

  // 异步初始化
  createClient(clientId, serverConfig)
    .then(async (client) => {
      const tools = await listTools(client);
      logger.info(
        `Supported tools for [${clientId}]: ${JSON.stringify(tools, null, 2)}`,
      );
      clientsMap.set(clientId, { client, tools, errorMsg: null });
      logger.success(`Client [${clientId}] initialized successfully`);
    })
    .catch((error) => {
      clientsMap.set(clientId, {
        client: null,
        tools: null,
        errorMsg: error instanceof Error ? error.message : String(error),
      });
      logger.error(`Failed to initialize client [${clientId}]: ${error}`);
    });
}

// 初始化系统
export async function initializeMcpSystem() {
  logger.info("MCP Actions starting...");
  try {
    // 检查是否已有活跃的客户端
    if (clientsMap.size > 0) {
      logger.info("MCP system already initialized, skipping...");
      return;
    }

    const config = await getMcpConfigFromFile();
    // 初始化所有客户端
    for (const [clientId, serverConfig] of Object.entries(config.mcpServers)) {
      await initializeSingleClient(clientId, serverConfig);
    }
    return config;
  } catch (error) {
    logger.error(`Failed to initialize MCP system: ${error}`);
    throw error;
  }
}

// 添加服务器
export async function addMcpServer(clientId: string, config: ServerConfig) {
  try {
    const currentConfig = await getMcpConfigFromFile();
    const isNewServer = !(clientId in currentConfig.mcpServers);

    // 如果是新服务器，设置默认状态为 active
    if (isNewServer && !config.status) {
      config.status = "active";
    }

    const newConfig = {
      ...currentConfig,
      mcpServers: {
        ...currentConfig.mcpServers,
        [clientId]: config,
      },
    };
    await updateMcpConfig(newConfig);

    // 只有新服务器或状态为 active 的服务器才初始化
    if (isNewServer || config.status === "active") {
      await initializeSingleClient(clientId, config);
    }

    return newConfig;
  } catch (error) {
    logger.error(`Failed to add server [${clientId}]: ${error}`);
    throw error;
  }
}

// 暂停服务器
export async function pauseMcpServer(clientId: string) {
  try {
    const currentConfig = await getMcpConfigFromFile();
    const serverConfig = currentConfig.mcpServers[clientId];
    if (!serverConfig) {
      throw new Error(`Server ${clientId} not found`);
    }

    // 先更新配置
    const newConfig: McpConfigData = {
      ...currentConfig,
      mcpServers: {
        ...currentConfig.mcpServers,
        [clientId]: {
          ...serverConfig,
          status: "paused",
        },
      },
    };
    await updateMcpConfig(newConfig);

    // 然后关闭客户端
    const client = clientsMap.get(clientId);
    if (client?.client) {
      await removeClient(client.client);
    }
    clientsMap.delete(clientId);

    return newConfig;
  } catch (error) {
    logger.error(`Failed to pause server [${clientId}]: ${error}`);
    throw error;
  }
}

// 恢复服务器
export async function resumeMcpServer(clientId: string): Promise<void> {
  try {
    const currentConfig = await getMcpConfigFromFile();
    const serverConfig = currentConfig.mcpServers[clientId];
    if (!serverConfig) {
      throw new Error(`Server ${clientId} not found`);
    }

    // 先尝试初始化客户端
    logger.info(`Trying to initialize client [${clientId}]...`);
    try {
      const client = await createClient(clientId, serverConfig);
      const tools = await listTools(client);
      clientsMap.set(clientId, { client, tools, errorMsg: null });
      logger.success(`Client [${clientId}] initialized successfully`);

      // 初始化成功后更新配置
      const newConfig: McpConfigData = {
        ...currentConfig,
        mcpServers: {
          ...currentConfig.mcpServers,
          [clientId]: {
            ...serverConfig,
            status: "active" as const,
          },
        },
      };
      await updateMcpConfig(newConfig);
    } catch (error) {
      const currentConfig = await getMcpConfigFromFile();
      const serverConfig = currentConfig.mcpServers[clientId];

      // 如果配置中存在该服务器，则更新其状态为 error
      if (serverConfig) {
        serverConfig.status = "error";
        await updateMcpConfig(currentConfig);
      }

      // 初始化失败
      clientsMap.set(clientId, {
        client: null,
        tools: null,
        errorMsg: error instanceof Error ? error.message : String(error),
      });
      logger.error(`Failed to initialize client [${clientId}]: ${error}`);
      throw error;
    }
  } catch (error) {
    logger.error(`Failed to resume server [${clientId}]: ${error}`);
    throw error;
  }
}

// 移除服务器
export async function removeMcpServer(clientId: string) {
  try {
    const currentConfig = await getMcpConfigFromFile();
    const { [clientId]: _, ...rest } = currentConfig.mcpServers;
    const newConfig = {
      ...currentConfig,
      mcpServers: rest,
    };
    await updateMcpConfig(newConfig);

    // 关闭并移除客户端
    const client = clientsMap.get(clientId);
    if (client?.client) {
      await removeClient(client.client);
    }
    clientsMap.delete(clientId);

    return newConfig;
  } catch (error) {
    logger.error(`Failed to remove server [${clientId}]: ${error}`);
    throw error;
  }
}

// 重启所有客户端
export async function restartAllClients() {
  logger.info("Restarting all clients...");
  try {
    // 关闭所有客户端
    for (const client of clientsMap.values()) {
      if (client.client) {
        await removeClient(client.client);
      }
    }

    // 清空状态
    clientsMap.clear();

    // 重新初始化
    const config = await getMcpConfigFromFile();
    for (const [clientId, serverConfig] of Object.entries(config.mcpServers)) {
      await initializeSingleClient(clientId, serverConfig);
    }
    return config;
  } catch (error) {
    logger.error(`Failed to restart clients: ${error}`);
    throw error;
  }
}

// 执行 MCP 请求
export async function executeMcpAction(
  clientId: string,
  request: McpRequestMessage,
) {
  try {
    const client = clientsMap.get(clientId);
    if (!client?.client) {
      throw new Error(`Client ${clientId} not found`);
    }
    logger.info(`Executing request for [${clientId}]`);
    return await executeRequest(client.client, request);
  } catch (error) {
    logger.error(`Failed to execute request for [${clientId}]: ${error}`);
    throw error;
  }
}

// 获取 MCP 配置文件
export async function getMcpConfigFromFile(): Promise<McpConfigData> {
  try {
    const configStr = await fs.readFile(CONFIG_PATH, "utf-8");
    return JSON.parse(configStr);
  } catch (error) {
    logger.error(`Failed to load MCP config, using default config: ${error}`);
    return DEFAULT_MCP_CONFIG;
  }
}

// 更新 MCP 配置文件
async function updateMcpConfig(config: McpConfigData): Promise<void> {
  try {
    // 确保目录存在
    await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
  } catch (error) {
    throw error;
  }
}

// 检查 MCP 是否启用
export async function isMcpEnabled() {
  try {
    const serverConfig = getServerSideConfig();
    return serverConfig.enableMcp;
  } catch (error) {
    logger.error(`Failed to check MCP status: ${error}`);
    return false;
  }
}

// Custom Server Management Functions

// 获取自定义服务器列表
export async function getCustomServers(): Promise<CustomServerDefinition[]> {
  try {
    const customServersStr = await fs.readFile(CUSTOM_SERVERS_PATH, "utf-8");
    const data = JSON.parse(customServersStr);
    return data.servers || [];
  } catch (error) {
    logger.error(`Failed to load custom servers, using empty list: ${error}`);
    return [];
  }
}

// 保存自定义服务器
export async function saveCustomServer(
  server: CustomServerDefinition,
): Promise<void> {
  try {
    const existingServers = await getCustomServers();
    const serverIndex = existingServers.findIndex((s) => s.id === server.id);

    const updatedServer = {
      ...server,
      updatedAt: new Date().toISOString(),
    };

    if (serverIndex >= 0) {
      // Update existing server
      existingServers[serverIndex] = updatedServer;
    } else {
      // Add new server
      existingServers.push(updatedServer);
    }

    const data = { servers: existingServers };
    await fs.mkdir(path.dirname(CUSTOM_SERVERS_PATH), { recursive: true });
    await fs.writeFile(CUSTOM_SERVERS_PATH, JSON.stringify(data, null, 2));

    logger.info(`Custom server [${server.id}] saved successfully`);
  } catch (error) {
    logger.error(`Failed to save custom server [${server.id}]: ${error}`);
    throw error;
  }
}

// 删除自定义服务器
export async function deleteCustomServer(serverId: string): Promise<void> {
  try {
    const existingServers = await getCustomServers();
    const filteredServers = existingServers.filter((s) => s.id !== serverId);

    const data = { servers: filteredServers };
    await fs.writeFile(CUSTOM_SERVERS_PATH, JSON.stringify(data, null, 2));

    logger.info(`Custom server [${serverId}] deleted successfully`);
  } catch (error) {
    logger.error(`Failed to delete custom server [${serverId}]: ${error}`);
    throw error;
  }
}

// 检查服务器ID是否唯一
export async function isServerIdUnique(
  serverId: string,
  excludeId?: string,
): Promise<boolean> {
  try {
    const customServers = await getCustomServers();
    const existingServer = customServers.find(
      (s) => s.id === serverId && s.id !== excludeId,
    );
    return !existingServer;
  } catch (error) {
    logger.error(`Failed to check server ID uniqueness: ${error}`);
    return false;
  }
}

// 导出自定义服务器配置
export async function exportCustomServers(): Promise<string> {
  try {
    const customServers = await getCustomServers();
    const exportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      servers: customServers,
    };
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    logger.error(`Failed to export custom servers: ${error}`);
    throw error;
  }
}

// 导入自定义服务器配置
export async function importCustomServers(
  jsonData: string,
): Promise<{ imported: number; errors: string[] }> {
  try {
    const data = JSON.parse(jsonData);

    if (!data.servers || !Array.isArray(data.servers)) {
      throw new Error("Invalid import format: servers array not found");
    }

    const existingServers = await getCustomServers();
    const existingIds = new Set(existingServers.map((s) => s.id));

    let imported = 0;
    const errors: string[] = [];

    for (const serverData of data.servers) {
      try {
        // Validate server data
        if (!serverData.id || !serverData.name || !serverData.command) {
          errors.push(`Invalid server data: missing required fields`);
          continue;
        }

        // Check for ID conflicts
        if (existingIds.has(serverData.id)) {
          errors.push(`Server ID '${serverData.id}' already exists`);
          continue;
        }

        // Create custom server definition
        const customServer: CustomServerDefinition = {
          ...serverData,
          custom: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Save server
        await saveCustomServer(customServer);
        existingIds.add(serverData.id);
        imported++;
      } catch (error) {
        errors.push(
          `Failed to import server '${serverData.id || "unknown"}': ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    logger.info(`Imported ${imported} custom servers, ${errors.length} errors`);
    return { imported, errors };
  } catch (error) {
    logger.error(`Failed to import custom servers: ${error}`);
    throw error;
  }
}
