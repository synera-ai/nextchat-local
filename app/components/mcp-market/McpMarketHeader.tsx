import { IconButton } from "../button";
import { showToast } from "../ui-lib";
import DownloadIcon from "../../icons/download.svg";
import UploadIcon from "../../icons/upload.svg";
import RestartIcon from "../../icons/reload.svg";
import AddIcon from "../../icons/add.svg";
import styles from "../mcp-market.module.scss";

interface McpMarketHeaderProps {
  config?: any;
  isLoading: boolean;
  customServersCount: number;
  loadingStates: Record<string, string>;
  onCreateCustomServer: () => void;
  onExportCustomServers: () => void;
  onImportClick: () => void;
  onRestartAll: () => void;
}

export function McpMarketHeader({
  config,
  isLoading,
  customServersCount,
  loadingStates,
  onCreateCustomServer,
  onExportCustomServers,
  onImportClick,
  onRestartAll,
}: McpMarketHeaderProps) {
  const handleCreateCustomServer = () => {
    onCreateCustomServer();
  };

  const handleExportCustomServers = async () => {
    try {
      await onExportCustomServers();
      showToast("Custom servers exported successfully");
    } catch (error) {
      showToast("Failed to export custom servers", "error");
    }
  };

  const handleImportClick = () => {
    onImportClick();
  };

  const handleRestartAll = async () => {
    try {
      await onRestartAll();
      showToast("All servers restarted successfully");
    } catch (error) {
      showToast("Failed to restart all servers", "error");
    }
  };

  return (
    <div className="window-header">
      <div className="window-header-title">
        <div className="window-header-main-title">
          MCP Market
          {loadingStates["all"] && (
            <span className={styles["loading-indicator"]}>
              {loadingStates["all"]}
            </span>
          )}
        </div>
        <div className="window-header-sub-title">
          {Object.keys(config?.mcpServers ?? {}).length} servers configured
        </div>
      </div>

      <div className="window-actions">
        <div className="window-action-button">
          <IconButton
            icon={<AddIcon />}
            bordered
            onClick={handleCreateCustomServer}
            text="Create Custom"
            disabled={isLoading}
          />
        </div>
        <div className="window-action-button">
          <IconButton
            icon={<DownloadIcon />}
            bordered
            onClick={handleExportCustomServers}
            text="Export"
            disabled={isLoading || customServersCount === 0}
          />
        </div>
        <div className="window-action-button">
          <IconButton
            icon={<UploadIcon />}
            bordered
            onClick={handleImportClick}
            text="Import"
            disabled={isLoading}
          />
        </div>
        <div className="window-action-button">
          <IconButton
            icon={<RestartIcon />}
            bordered
            onClick={handleRestartAll}
            text="Restart All"
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
