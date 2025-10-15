import { Modal, showToast } from "../ui-lib";
import { ListToolsResponse } from "../../mcp/types";
import CloseIcon from "../../icons/close.svg";
import styles from "../mcp-market.module.scss";

interface McpMarketModalsProps {
  // Tools modal
  showToolsModal: boolean;
  tools: ListToolsResponse["tools"] | null;
  viewingServerId: string | undefined;
  onCloseToolsModal: () => void;

  // Import modal
  showImportModal: boolean;
  importData: string;
  onImportDataChange: (data: string) => void;
  onImportServers: () => void;
  onCloseImportModal: () => void;
  importLoading: boolean;
}

export function McpMarketModals({
  showToolsModal,
  tools,
  viewingServerId,
  onCloseToolsModal,
  showImportModal,
  importData,
  onImportDataChange,
  onImportServers,
  onCloseImportModal,
  importLoading,
}: McpMarketModalsProps) {
  const handleImportServers = async () => {
    try {
      await onImportServers();
      showToast("Servers imported successfully");
    } catch (error) {
      showToast("Failed to import servers", "error");
    }
  };

  return (
    <>
      {/* Tools Modal */}
      <Modal
        title={`Tools - ${viewingServerId}`}
        onClose={onCloseToolsModal}
        show={showToolsModal}
        actions={[
          {
            text: "Close",
            onClick: onCloseToolsModal,
            icon: <CloseIcon />,
          },
        ]}
      >
        <div className={styles["tools-modal-content"]}>
          {tools && tools.length > 0 ? (
            <div className={styles["tools-list"]}>
              {tools.map((tool, index) => (
                <div key={index} className={styles["tool-item"]}>
                  <div className={styles["tool-header"]}>
                    <h4>{tool.name}</h4>
                    <span className={styles["tool-description"]}>
                      {tool.description}
                    </span>
                  </div>

                  {tool.inputSchema && (
                    <div className={styles["tool-schema"]}>
                      <h5>Input Schema:</h5>
                      <pre className={styles["schema-code"]}>
                        {JSON.stringify(tool.inputSchema, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles["empty-tools"]}>
              <p>No tools available for this server.</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal
        title="Import Custom Servers"
        onClose={onCloseImportModal}
        show={showImportModal}
        actions={[
          {
            text: "Cancel",
            onClick: onCloseImportModal,
            icon: <CloseIcon />,
          },
          {
            text: importLoading ? "Importing..." : "Import",
            onClick: handleImportServers,
            disabled: !importData.trim() || importLoading,
          },
        ]}
      >
        <div className={styles["import-modal-content"]}>
          <p>Paste the exported server configuration JSON below:</p>
          <textarea
            value={importData}
            onChange={(e) => onImportDataChange(e.target.value)}
            placeholder="Paste server configuration JSON here..."
            className={styles["import-textarea"]}
            rows={10}
          />
        </div>
      </Modal>
    </>
  );
}
