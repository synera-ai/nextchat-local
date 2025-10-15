// MCP Import Modal Component
import { Modal } from "../ui-lib";
import styles from "../mcp-market.module.scss";

interface McpImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: () => void;
  importData: string;
  onImportDataChange: (data: string) => void;
}

export function McpImportModal({
  isOpen,
  onClose,
  onImport,
  importData,
  onImportDataChange,
}: McpImportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-mask">
      <Modal
        title="Import Custom Servers"
        onClose={onClose}
        actions={[
          <button key="cancel" onClick={onClose}>
            Cancel
          </button>,
          <button key="import" onClick={onImport}>
            Import
          </button>,
        ]}
      >
        <div className={styles["import-modal-content"]}>
          <p>Paste the JSON data from an exported custom servers file:</p>
          <textarea
            value={importData}
            onChange={(e) => onImportDataChange(e.target.value)}
            placeholder="Paste JSON data here..."
            rows={10}
            style={{ width: "100%", minHeight: "200px" }}
          />
          <div className={styles["import-help"]}>
            <p>
              <strong>Note:</strong> Server IDs must be unique. Existing servers
              with the same ID will be skipped.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
