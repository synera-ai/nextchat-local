import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  addMcpServer,
  deleteCustomServer,
  exportCustomServers,
  getClientsStatus,
  getClientTools,
  getCustomServers,
  getMcpConfigFromFile,
  importCustomServers,
  isMcpEnabled,
  pauseMcpServer,
  restartAllClients,
  resumeMcpServer,
} from "../mcp/actions";
import {
  CustomServerDefinition,
  ListToolsResponse,
  McpConfigData,
  PresetServer,
  ServerConfig,
  ServerStatusResponse,
  ServerDefinition,
} from "../mcp/types";
import { Path } from "../constant";

export function useMcpMarket() {
  const navigate = useNavigate();

  // Core state
  const [mcpEnabled, setMcpEnabled] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [userConfig, setUserConfig] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<McpConfigData>();
  const [clientStatuses, setClientStatuses] = useState<
    Record<string, ServerStatusResponse>
  >({});
  const [loadingPresets, setLoadingPresets] = useState(true);
  const [presetServers, setPresetServers] = useState<PresetServer[]>([]);
  const [customServers, setCustomServers] = useState<CustomServerDefinition[]>(
    [],
  );
  const [allServers, setAllServers] = useState<ServerDefinition[]>([]);
  const [loadingStates, setLoadingStates] = useState<Record<string, string>>(
    {},
  );

  // UI state
  const [editingServerId, setEditingServerId] = useState<string | undefined>();
  const [tools, setTools] = useState<ListToolsResponse["tools"] | null>(null);
  const [viewingServerId, setViewingServerId] = useState<string | undefined>();
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [editingCustomServer, setEditingCustomServer] = useState<
    CustomServerDefinition | undefined
  >();
  const [selectedTemplateId, setSelectedTemplateId] = useState<
    string | undefined
  >();
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState("");

  // Check MCP status
  useEffect(() => {
    const checkMcpStatus = async () => {
      const enabled = await isMcpEnabled();
      setMcpEnabled(enabled);
      if (!enabled) {
        navigate(Path.Home);
      }
    };
    checkMcpStatus();
  }, [navigate]);

  // Status polling
  useEffect(() => {
    if (!mcpEnabled) return;

    const pollStatus = async () => {
      try {
        const statuses = await getClientsStatus();
        setClientStatuses(statuses);
      } catch (error) {
        console.error("Failed to get client statuses:", error);
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 5000);
    return () => clearInterval(interval);
  }, [mcpEnabled]);

  // Load configuration and servers
  useEffect(() => {
    if (!mcpEnabled) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const [configData, customServersData] = await Promise.all([
          getMcpConfigFromFile(),
          getCustomServers(),
        ]);

        setConfig(configData);
        setCustomServers(customServersData);

        // Load preset servers
        setLoadingPresets(true);
        const presets = await import("../mcp/templates");
        setPresetServers(presets.PRESET_SERVERS);
        setLoadingPresets(false);

        // Combine all servers
        const allServersList = [
          ...presets.PRESET_SERVERS,
          ...customServersData,
        ];
        setAllServers(allServersList);
      } catch (error) {
        console.error("Failed to load MCP data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [mcpEnabled]);

  // Server management functions
  const handleAddServer = async (serverConfig: ServerConfig) => {
    try {
      setLoadingStates((prev) => ({ ...prev, [serverConfig.id]: "Adding..." }));
      await addMcpServer(serverConfig);

      // Reload configuration
      const newConfig = await getMcpConfigFromFile();
      setConfig(newConfig);

      setLoadingStates((prev) => ({ ...prev, [serverConfig.id]: "" }));
    } catch (error) {
      console.error("Failed to add server:", error);
      setLoadingStates((prev) => ({ ...prev, [serverConfig.id]: "" }));
    }
  };

  const handleDeleteCustomServer = async (serverId: string) => {
    try {
      setLoadingStates((prev) => ({ ...prev, [serverId]: "Deleting..." }));
      await deleteCustomServer(serverId);

      // Reload custom servers
      const updatedCustomServers = await getCustomServers();
      setCustomServers(updatedCustomServers);

      // Update all servers list
      const allServersList = [...presetServers, ...updatedCustomServers];
      setAllServers(allServersList);

      setLoadingStates((prev) => ({ ...prev, [serverId]: "" }));
    } catch (error) {
      console.error("Failed to delete custom server:", error);
      setLoadingStates((prev) => ({ ...prev, [serverId]: "" }));
    }
  };

  const handlePauseServer = async (serverId: string) => {
    try {
      setLoadingStates((prev) => ({ ...prev, [serverId]: "Pausing..." }));
      await pauseMcpServer(serverId);

      // Reload statuses
      const statuses = await getClientsStatus();
      setClientStatuses(statuses);

      setLoadingStates((prev) => ({ ...prev, [serverId]: "" }));
    } catch (error) {
      console.error("Failed to pause server:", error);
      setLoadingStates((prev) => ({ ...prev, [serverId]: "" }));
    }
  };

  const handleResumeServer = async (serverId: string) => {
    try {
      setLoadingStates((prev) => ({ ...prev, [serverId]: "Resuming..." }));
      await resumeMcpServer(serverId);

      // Reload statuses
      const statuses = await getClientsStatus();
      setClientStatuses(statuses);

      setLoadingStates((prev) => ({ ...prev, [serverId]: "" }));
    } catch (error) {
      console.error("Failed to resume server:", error);
      setLoadingStates((prev) => ({ ...prev, [serverId]: "" }));
    }
  };

  const handleRestartAll = async () => {
    try {
      setLoadingStates((prev) => ({
        ...prev,
        all: "Restarting all servers...",
      }));
      await restartAllClients();

      // Reload statuses
      const statuses = await getClientsStatus();
      setClientStatuses(statuses);

      setLoadingStates((prev) => ({ ...prev, all: "" }));
    } catch (error) {
      console.error("Failed to restart all servers:", error);
      setLoadingStates((prev) => ({ ...prev, all: "" }));
    }
  };

  const handleViewTools = async (serverId: string) => {
    try {
      setLoadingStates((prev) => ({ ...prev, [serverId]: "Loading tools..." }));
      const toolsResponse = await getClientTools(serverId);
      setTools(toolsResponse.tools);
      setViewingServerId(serverId);
      setLoadingStates((prev) => ({ ...prev, [serverId]: "" }));
    } catch (error) {
      console.error("Failed to load tools:", error);
      setLoadingStates((prev) => ({ ...prev, [serverId]: "" }));
    }
  };

  const handleExportCustomServers = async () => {
    try {
      await exportCustomServers();
    } catch (error) {
      console.error("Failed to export custom servers:", error);
    }
  };

  const handleImportCustomServers = async () => {
    try {
      setLoadingStates((prev) => ({ ...prev, import: "Importing..." }));
      await importCustomServers(importData);

      // Reload custom servers
      const updatedCustomServers = await getCustomServers();
      setCustomServers(updatedCustomServers);

      // Update all servers list
      const allServersList = [...presetServers, ...updatedCustomServers];
      setAllServers(allServersList);

      setShowImportModal(false);
      setImportData("");
      setLoadingStates((prev) => ({ ...prev, import: "" }));
    } catch (error) {
      console.error("Failed to import custom servers:", error);
      setLoadingStates((prev) => ({ ...prev, import: "" }));
    }
  };

  // Filtered servers based on search
  const filteredServers = allServers.filter(
    (server) =>
      server.name.toLowerCase().includes(searchText.toLowerCase()) ||
      server.description?.toLowerCase().includes(searchText.toLowerCase()),
  );

  return {
    // State
    mcpEnabled,
    searchText,
    setSearchText,
    userConfig,
    setUserConfig,
    isLoading,
    config,
    clientStatuses,
    loadingPresets,
    presetServers,
    customServers,
    allServers,
    loadingStates,
    editingServerId,
    setEditingServerId,
    tools,
    viewingServerId,
    setViewingServerId,
    showCustomForm,
    setShowCustomForm,
    editingCustomServer,
    setEditingCustomServer,
    selectedTemplateId,
    setSelectedTemplateId,
    showImportModal,
    setShowImportModal,
    importData,
    setImportData,
    filteredServers,

    // Actions
    handleAddServer,
    handleDeleteCustomServer,
    handlePauseServer,
    handleResumeServer,
    handleRestartAll,
    handleViewTools,
    handleExportCustomServers,
    handleImportCustomServers,
  };
}
