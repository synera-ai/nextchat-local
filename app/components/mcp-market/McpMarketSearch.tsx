import { Input } from "../ui-lib";
import styles from "../mcp-market.module.scss";

interface McpMarketSearchProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  placeholder?: string;
}

export function McpMarketSearch({
  searchText,
  onSearchChange,
  placeholder = "Search servers...",
}: McpMarketSearchProps) {
  return (
    <div className={styles["search-container"]}>
      <Input
        type="text"
        placeholder={placeholder}
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        className={styles["search-input"]}
      />
    </div>
  );
}
