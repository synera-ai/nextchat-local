// MCP Server Card Component
import { IconButton } from "../button";
import { ServerDefinition, ServerStatusResponse } from "../../mcp/types";
import { addMcpServer } from "../../mcp/actions";
import styles from "../mcp-market.module.scss";
import clsx from "clsx";
import EditIcon from "../../icons/edit.svg";
import PlayIcon from "../../icons/play.svg";
import StopIcon from "../../icons/pause.svg";
import EyeIcon from "../../icons/eye.svg";
import DeleteIcon from "../../icons/delete.svg";

interface McpServerCardProps {
  server: ServerDefinition;
  clientStatuses: Record<string, ServerStatusResponse>;
  loadingStates: Record<string, string>;
  isServerAdded: (id: string) => boolean;
  onEditServer: (server: ServerDefinition) => void;
  onViewTools: (serverId: string) => void;
  onStatusChange: (serverId: string, action: "start" | "stop") => void;
}

export function McpServerCard({
  server,
  clientStatuses,
  loadingStates,
  isServerAdded,
  onEditServer,
  onViewTools,
  onStatusChange,
}: McpServerCardProps) {
  const status = clientStatuses[server.id];
  const isAdded = isServerAdded(server.id);
  const isLoading = loadingStates[server.id];

  const handleAddServer = async () => {
    try {
      // Convert server to ServerConfig format
      const serverConfig = {
        command: server.command,
        args: server.args || [],
        env: server.env || {},
      };
      await addMcpServer(server.id, serverConfig);
    } catch (error) {
      console.error("Failed to add server:", error);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "green";
      case "inactive":
        return "red";
      case "error":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <div
      className={clsx(styles["mcp-market-item"], {
        [styles["loading"]]: isLoading,
      })}
    >
      <div className={styles["mcp-market-header"]}>
        <div className={styles["mcp-market-title"]}>
          <div className={styles["mcp-market-name"]}>
            {server.name}
            {"custom" in server && (
              <span className={styles["custom-badge"]} title="Custom Server">
                Custom
              </span>
            )}
            {status && (
              <span
                className={styles["status-badge"]}
                style={{ color: getStatusColor(status.status) }}
                title={`Status: ${status.status}`}
              >
                ●
              </span>
            )}
          </div>
          <div className={styles["tags-container"]}>
            {server.tags.map((tag, index) => (
              <span key={index} className={styles["tag"]}>
                {tag}
              </span>
            ))}
          </div>
          <div
            className={clsx(styles["mcp-market-info"], "one-line")}
            title={server.description}
          >
            {server.description}
          </div>
        </div>
        <div className={styles["mcp-market-actions"]}>
          {isAdded ? (
            <>
              {server.configurable && (
                <IconButton
                  icon={<EditIcon />}
                  onClick={() => onEditServer(server)}
                  title="Configure Server"
                />
              )}
              <IconButton
                icon={<EyeIcon />}
                onClick={() => onViewTools(server.id)}
                title="View Tools"
              />
              {status?.status === "active" ? (
                <IconButton
                  icon={<StopIcon />}
                  onClick={() => onStatusChange(server.id, "stop")}
                  title="Stop Server"
                />
              ) : (
                <IconButton
                  icon={<PlayIcon />}
                  onClick={() => onStatusChange(server.id, "start")}
                  title="Start Server"
                />
              )}
              {"custom" in server && (
                <IconButton
                  icon={<DeleteIcon />}
                  onClick={() => {
                    // Handle delete custom server
                  }}
                  title="Delete Custom Server"
                />
              )}
            </>
          ) : (
            <IconButton
              icon={<PlayIcon />}
              onClick={handleAddServer}
              title="Add Server"
            />
          )}
        </div>
      </div>
    </div>
  );
}
