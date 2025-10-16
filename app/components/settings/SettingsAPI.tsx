import { List, ListItem } from "../ui-lib";
import { ModelConfigList } from "../model-config";

export interface SettingsAPIProps {
  config: any;
  updateConfig: (update: (config: any) => void) => void;
  accessStore: any;
}

export function SettingsAPI(props: SettingsAPIProps) {
  const { config, updateConfig, accessStore } = props;

  return (
    <List>
      <ListItem title="Model Configuration">
        <div style={{ width: "100%" }}>
          <ModelConfigList />
        </div>
      </ListItem>

      {accessStore?.enabledAccessControl() && (
        <ListItem
          title="Access Control"
          subTitle="Manage API access and permissions"
        >
          <input
            type="checkbox"
            checked={accessStore?.enabledAccessControl() ?? false}
            disabled
          />
        </ListItem>
      )}
    </List>
  );
}
