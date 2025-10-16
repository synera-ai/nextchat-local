import { List, ListItem, showConfirm } from "../ui-lib";
import { IconButton } from "../button";
import FireIcon from "../../icons/fire.svg";
import Locale from "../../locales";

export interface SettingsDangerProps {
  chatStore: any;
  appConfig: any;
}

export function SettingsDanger(props: SettingsDangerProps) {
  const { chatStore, appConfig } = props;

  return (
    <List>
      <ListItem
        title={Locale.Settings.Danger.Reset.Title}
        subTitle={Locale.Settings.Danger.Reset.SubTitle}
      >
        <IconButton
          aria={Locale.Settings.Danger.Reset.Title}
          text={Locale.Settings.Danger.Reset.Action}
          onClick={async () => {
            if (await showConfirm(Locale.Settings.Danger.Reset.Confirm)) {
              appConfig.reset();
            }
          }}
          type="danger"
          icon={<FireIcon />}
        />
      </ListItem>

      <ListItem
        title={Locale.Settings.Danger.Clear.Title}
        subTitle={Locale.Settings.Danger.Clear.SubTitle}
      >
        <IconButton
          aria={Locale.Settings.Danger.Clear.Title}
          text={Locale.Settings.Danger.Clear.Action}
          onClick={async () => {
            if (await showConfirm(Locale.Settings.Danger.Clear.Confirm)) {
              chatStore.clearAllData();
            }
          }}
          type="danger"
          icon={<FireIcon />}
        />
      </ListItem>
    </List>
  );
}
