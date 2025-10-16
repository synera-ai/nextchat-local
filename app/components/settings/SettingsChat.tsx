import { List, ListItem } from "../ui-lib";
import Locale from "../../locales";

export interface SettingsChatProps {
  config: any;
  updateConfig: (update: (config: any) => void) => void;
}

export function SettingsChat(props: SettingsChatProps) {
  const { config, updateConfig } = props;

  return (
    <List>
      <ListItem
        title={Locale.Settings.AutoGenerateTitle.Title}
        subTitle={Locale.Settings.AutoGenerateTitle.SubTitle}
      >
        <input
          aria-label={Locale.Settings.AutoGenerateTitle.Title}
          type="checkbox"
          checked={config.enableAutoGenerateTitle}
          onChange={(e) =>
            updateConfig(
              (config) =>
                (config.enableAutoGenerateTitle = e.currentTarget.checked),
            )
          }
        />
      </ListItem>

      <ListItem
        title={Locale.Settings.SendPreviewBubble.Title}
        subTitle={Locale.Settings.SendPreviewBubble.SubTitle}
      >
        <input
          aria-label={Locale.Settings.SendPreviewBubble.Title}
          type="checkbox"
          checked={config.enableBubblePreview}
          onChange={(e) =>
            updateConfig(
              (config) =>
                (config.enableBubblePreview = e.currentTarget.checked),
            )
          }
        />
      </ListItem>

      <ListItem
        title="Markdown Code Block"
        subTitle="Display code blocks with syntax highlighting"
      >
        <input
          type="checkbox"
          checked={config.codeBlockMd}
          onChange={(e) =>
            updateConfig(
              (config) => (config.codeBlockMd = e.currentTarget.checked),
            )
          }
        />
      </ListItem>

      <ListItem
        title="Compress Messages"
        subTitle="Compress session messages to save context"
      >
        <input
          type="checkbox"
          checked={config.compressMessageLengthThreshold}
          onChange={(e) =>
            updateConfig(
              (config) =>
                (config.compressMessageLengthThreshold =
                  e.currentTarget.checked),
            )
          }
        />
      </ListItem>
    </List>
  );
}
