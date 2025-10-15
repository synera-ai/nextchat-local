import { ErrorBoundary } from "../error";
import { CustomServerForm } from "../custom-server-form";
import { useMcpMarket } from "../../hooks/useMcpMarket";
import { McpMarketHeader } from "./McpMarketHeader";
import { McpMarketSearch } from "./McpMarketSearch";
import { McpMarketGrid } from "./McpMarketGrid";
import { McpMarketModals } from "./McpMarketModals";
import styles from "../mcp-market.module.scss";

export function McpMarketPage() {
  const {
    // State
    mcpEnabled,
    searchText,
    setSearchText,
    isLoading,
    config,
    clientStatuses,
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
    customServers,

    // Actions
    handleAddServer,
    handleDeleteCustomServer,
    handlePauseServer,
    handleResumeServer,
    handleRestartAll,
    handleViewTools,
    handleExportCustomServers,
    handleImportCustomServers,
  } = useMcpMarket();

  // Event handlers
  const handleCreateCustomServer = () => {
    setEditingCustomServer(undefined);
    setSelectedTemplateId(undefined);
    setShowCustomForm(true);
  };

  const handleEditServer = (serverId: string) => {
    const server = customServers.find((s) => s.id === serverId);
    if (server) {
      setEditingCustomServer(server);
      setShowCustomForm(true);
    }
  };

  const handleDeleteServer = async (serverId: string) => {
    if (confirm("Are you sure you want to delete this custom server?")) {
      await handleDeleteCustomServer(serverId);
    }
  };

  const handleViewTools = async (serverId: string) => {
    await handleViewTools(serverId);
  };

  const handleCloseToolsModal = () => {
    setViewingServerId(undefined);
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
    setImportData("");
  };

  const handleImportClick = () => {
    setShowImportModal(true);
  };

  const handleViewGithub = (serverId: string) => {
    const server = filteredServers.find((s) => s.id === serverId);
    if (server && "github" in server) {
      window.open(server.github, "_blank");
    }
  };

  if (!mcpEnabled) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className={styles["mcp-market-page"]}>
        <McpMarketHeader
          config={config}
          isLoading={isLoading}
          customServersCount={customServers.length}
          loadingStates={loadingStates}
          onCreateCustomServer={handleCreateCustomServer}
          onExportCustomServers={handleExportCustomServers}
          onImportClick={handleImportClick}
          onRestartAll={handleRestartAll}
        />

        <div className={styles["mcp-market-content"]}>
          <McpMarketSearch
            searchText={searchText}
            onSearchChange={setSearchText}
          />

          <McpMarketGrid
            servers={filteredServers}
            clientStatuses={clientStatuses}
            loadingStates={loadingStates}
            onEditServer={handleEditServer}
            onDeleteServer={handleDeleteServer}
            onPauseServer={handlePauseServer}
            onResumeServer={handleResumeServer}
            onViewTools={handleViewTools}
            onViewGithub={handleViewGithub}
          />
        </div>

        <McpMarketModals
          showToolsModal={!!viewingServerId}
          tools={tools}
          viewingServerId={viewingServerId}
          onCloseToolsModal={handleCloseToolsModal}
          showImportModal={showImportModal}
          importData={importData}
          onImportDataChange={setImportData}
          onImportServers={handleImportCustomServers}
          onCloseImportModal={handleCloseImportModal}
          importLoading={!!loadingStates.import}
        />

        {showCustomForm && (
          <CustomServerForm
            editingServer={editingCustomServer}
            selectedTemplateId={selectedTemplateId}
            onClose={() => setShowCustomForm(false)}
            onSave={async (serverConfig) => {
              await handleAddServer(serverConfig);
              setShowCustomForm(false);
            }}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
