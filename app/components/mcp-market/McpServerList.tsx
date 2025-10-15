// MCP Server List Component
import { ServerDefinition, ServerStatusResponse } from "../../mcp/types";
import { McpServerCard } from "./McpServerCard";
import styles from "../mcp-market.module.scss";

interface McpServerListProps {
  servers: ServerDefinition[];
  clientStatuses: Record<string, ServerStatusResponse>;
  isLoading: boolean;
  loadingStates: Record<string, string>;
  isServerAdded: (id: string) => boolean;
  onEditServer: (server: ServerDefinition) => void;
  onViewTools: (serverId: string) => void;
  onStatusChange: (serverId: string, action: "start" | "stop") => void;
}

export function McpServerList({
  servers,
  clientStatuses,
  isLoading,
  loadingStates,
  isServerAdded,
  onEditServer,
  onViewTools,
  onStatusChange,
}: McpServerListProps) {
  if (isLoading) {
    return (
      <div className={styles["loading-container"]}>
        <div className={styles["loading-text"]}>
          Loading preset server list...
        </div>
      </div>
    );
  }

  if (!Array.isArray(servers) || servers.length === 0) {
    return (
      <div className={styles["empty-container"]}>
        <div className={styles["empty-text"]}>No servers available</div>
      </div>
    );
  }

  // Sort servers by status priority
  const statusPriority: Record<string, number> = {
    active: 1,
    inactive: 2,
    error: 3,
  };

  const sortedServers = servers.sort((a, b) => {
    const aStatus = clientStatuses[a.id]?.status;
    const bStatus = clientStatuses[b.id]?.status;
    const aEffectiveStatus = aStatus || "unknown";
    const bEffectiveStatus = bStatus || "unknown";

    if (aEffectiveStatus !== bEffectiveStatus) {
      return (
        (statusPriority[aEffectiveStatus] ?? 6) -
        (statusPriority[bEffectiveStatus] ?? 6)
      );
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className={styles["server-list"]}>
      {sortedServers.map((server) => (
        <McpServerCard
          key={server.id}
          server={server}
          clientStatuses={clientStatuses}
          loadingStates={loadingStates}
          isServerAdded={isServerAdded}
          onEditServer={onEditServer}
          onViewTools={onViewTools}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
