import { List, ListItem } from "../ui-lib";
import { IconButton } from "../button";

export interface SettingsSyncProps {
  syncStore: any;
  onConfigClick?: () => void;
}

export function SettingsSync(props: SettingsSyncProps) {
  const { syncStore, onConfigClick } = props;

  return (
    <List>
      <ListItem
        title="Sync Status"
        subTitle={
          syncStore?.lastSync
            ? `Last synced: ${new Date(syncStore.lastSync).toLocaleString()}`
            : "Never synced"
        }
      >
        <div>
          {syncStore?.provider && (
            <span style={{ fontSize: "12px", color: "#666" }}>
              {syncStore.provider}
            </span>
          )}
        </div>
      </ListItem>

      <ListItem
        title="Sync Configuration"
        subTitle="Configure sync provider and settings"
      >
        <IconButton
          text="Configure"
          onClick={() => onConfigClick?.()}
          bordered
        />
      </ListItem>

      <ListItem
        title="Auto Sync"
        subTitle="Automatically sync settings and chats"
      >
        <input
          type="checkbox"
          checked={syncStore?.autoSync ?? true}
          onChange={(e) => {
            if (syncStore?.update) {
              syncStore.update((config: any) => {
                config.autoSync = e.currentTarget.checked;
              });
            }
          }}
        />
      </ListItem>

      <ListItem
        title="Proxy Settings"
        subTitle="Use proxy for sync connections"
      >
        <input
          type="checkbox"
          checked={syncStore?.useProxy ?? false}
          onChange={(e) => {
            if (syncStore?.update) {
              syncStore.update((config: any) => {
                config.useProxy = e.currentTarget.checked;
              });
            }
          }}
        />
      </ListItem>
    </List>
  );
}
