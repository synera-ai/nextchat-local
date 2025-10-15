import { IconButton } from "../button";
import { List, ListItem } from "../ui-lib";
import EditIcon from "../../icons/edit.svg";
import DeleteIcon from "../../icons/delete.svg";
import PlayIcon from "../../icons/play.svg";
import StopIcon from "../../icons/pause.svg";
import EyeIcon from "../../icons/eye.svg";
import GithubIcon from "../../icons/github.svg";
import { ServerDefinition, ServerStatusResponse } from "../../mcp/types";
import clsx from "clsx";
import styles from "../mcp-market.module.scss";

interface McpMarketGridProps {
  servers: ServerDefinition[];
  clientStatuses: Record<string, ServerStatusResponse>;
  loadingStates: Record<string, string>;
  onEditServer: (serverId: string) => void;
  onDeleteServer: (serverId: string) => void;
  onPauseServer: (serverId: string) => void;
  onResumeServer: (serverId: string) => void;
  onViewTools: (serverId: string) => void;
  onViewGithub?: (serverId: string) => void;
}

export function McpMarketGrid({
  servers,
  clientStatuses,
  loadingStates,
  onEditServer,
  onDeleteServer,
  onPauseServer,
  onResumeServer,
  onViewTools,
  onViewGithub,
}: McpMarketGridProps) {
  const getServerStatus = (serverId: string) => {
    const status = clientStatuses[serverId];
    if (!status) return "unknown";
    return status.status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return styles["status-running"];
      case "paused":
        return styles["status-paused"];
      case "error":
        return styles["status-error"];
      default:
        return styles["status-unknown"];
    }
  };

  const renderServerItem = (server: ServerDefinition) => {
    const status = getServerStatus(server.id);
    const isLoading = loadingStates[server.id];
    const isCustom = "custom" in server;

    return (
      <ListItem key={server.id} className={styles["server-item"]}>
        <div className={styles["server-content"]}>
          <div className={styles["server-header"]}>
            <div className={styles["server-title"]}>
              <h3>{server.name}</h3>
              <span
                className={clsx(styles["status-badge"], getStatusColor(status))}
              >
                {status}
              </span>
            </div>
            <div className={styles["server-actions"]}>
              {isLoading && (
                <span className={styles["loading-indicator"]}>{isLoading}</span>
              )}

              <IconButton
                icon={<EyeIcon />}
                onClick={() => onViewTools(server.id)}
                title="View Tools"
                disabled={isLoading}
              />

              {status === "running" ? (
                <IconButton
                  icon={<StopIcon />}
                  onClick={() => onPauseServer(server.id)}
                  title="Pause Server"
                  disabled={isLoading}
                />
              ) : (
                <IconButton
                  icon={<PlayIcon />}
                  onClick={() => onResumeServer(server.id)}
                  title="Resume Server"
                  disabled={isLoading}
                />
              )}

              {isCustom && (
                <>
                  <IconButton
                    icon={<EditIcon />}
                    onClick={() => onEditServer(server.id)}
                    title="Edit Server"
                    disabled={isLoading}
                  />
                  <IconButton
                    icon={<DeleteIcon />}
                    onClick={() => onDeleteServer(server.id)}
                    title="Delete Server"
                    disabled={isLoading}
                  />
                </>
              )}

              {onViewGithub && "github" in server && (
                <IconButton
                  icon={<GithubIcon />}
                  onClick={() => onViewGithub(server.id)}
                  title="View on GitHub"
                  disabled={isLoading}
                />
              )}
            </div>
          </div>

          <div className={styles["server-description"]}>
            {server.description}
          </div>

          {server.tags && server.tags.length > 0 && (
            <div className={styles["server-tags"]}>
              {server.tags.map((tag, index) => (
                <span key={index} className={styles["tag"]}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </ListItem>
    );
  };

  if (servers.length === 0) {
    return (
      <div className={styles["empty-state"]}>
        <p>
          No servers found. Try adjusting your search or add a custom server.
        </p>
      </div>
    );
  }

  return (
    <div className={styles["server-grid"]}>
      <List>{servers.map(renderServerItem)}</List>
    </div>
  );
}
