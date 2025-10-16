import { useState } from "react";
import styles from "../settings.module.scss";
import { List, ListItem, Select, Popover } from "../ui-lib";
import { InputRange } from "../input-range";
import { IconButton } from "../button";
import { Avatar, AvatarPicker } from "../emoji";
import ResetIcon from "../../icons/reload.svg";

import Locale, {
  getLang,
  changeLang,
  AllLangs,
  ALL_LANG_OPTIONS,
} from "../../locales";
import { SubmitKey, Theme } from "../../store";

export interface SettingsGeneralProps {
  config: any;
  updateConfig: (update: (config: any) => void) => void;
  currentVersion?: string;
  hasNewVersion?: boolean;
  isCheckingUpdate?: boolean;
  updateUrl?: string;
  onCheckUpdate?: () => void;
}

export function SettingsGeneral(props: SettingsGeneralProps) {
  const {
    config,
    updateConfig,
    currentVersion,
    hasNewVersion,
    isCheckingUpdate,
    updateUrl,
    onCheckUpdate,
  } = props;

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  return (
    <List>
      <ListItem title={Locale.Settings.Avatar}>
        <Popover
          onClose={() => setShowEmojiPicker(false)}
          content={
            <AvatarPicker
              onEmojiClick={(avatar: string) => {
                updateConfig((config) => (config.avatar = avatar));
                setShowEmojiPicker(false);
              }}
            />
          }
          open={showEmojiPicker}
        >
          <div
            aria-label={Locale.Settings.Avatar}
            tabIndex={0}
            className={styles.avatar}
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
            }}
          >
            <Avatar avatar={config.avatar} />
          </div>
        </Popover>
      </ListItem>

      {currentVersion && (
        <ListItem
          title={Locale.Settings.Update.Version(currentVersion)}
          subTitle={
            isCheckingUpdate
              ? Locale.Settings.Update.IsChecking
              : hasNewVersion
              ? Locale.Settings.Update.FoundUpdate("new")
              : Locale.Settings.Update.IsLatest
          }
        >
          {isCheckingUpdate ? (
            <span>...</span>
          ) : hasNewVersion && updateUrl ? (
            <a href={updateUrl} target="_blank" rel="noopener noreferrer">
              {Locale.Settings.Update.GoToUpdate}
            </a>
          ) : (
            <IconButton
              icon={<ResetIcon />}
              text={Locale.Settings.Update.CheckUpdate}
              onClick={() => onCheckUpdate?.()}
            />
          )}
        </ListItem>
      )}

      <ListItem title={Locale.Settings.SendKey}>
        <Select
          aria-label={Locale.Settings.SendKey}
          value={config.submitKey}
          onChange={(e) => {
            updateConfig(
              (config) =>
                (config.submitKey = e.target.value as any as SubmitKey),
            );
          }}
        >
          {Object.values(SubmitKey).map((v) => (
            <option value={v} key={v}>
              {v}
            </option>
          ))}
        </Select>
      </ListItem>

      <ListItem title={Locale.Settings.Theme}>
        <Select
          aria-label={Locale.Settings.Theme}
          value={config.theme}
          onChange={(e) => {
            updateConfig(
              (config) => (config.theme = e.target.value as any as Theme),
            );
          }}
        >
          {Object.values(Theme).map((v) => (
            <option value={v} key={v}>
              {v}
            </option>
          ))}
        </Select>
      </ListItem>

      <ListItem title={Locale.Settings.Lang.Name}>
        <Select
          aria-label={Locale.Settings.Lang.Name}
          value={getLang()}
          onChange={(e) => {
            changeLang(e.target.value as any);
          }}
        >
          {AllLangs.map((lang) => (
            <option value={lang} key={lang}>
              {ALL_LANG_OPTIONS[lang]}
            </option>
          ))}
        </Select>
      </ListItem>

      <ListItem
        title={Locale.Settings.FontSize.Title}
        subTitle={Locale.Settings.FontSize.SubTitle}
      >
        <InputRange
          aria={Locale.Settings.FontSize.Title}
          title={`${config.fontSize ?? 14}px`}
          value={config.fontSize}
          min="12"
          max="40"
          step="1"
          onChange={(e) =>
            updateConfig(
              (config) =>
                (config.fontSize = Number.parseInt(e.currentTarget.value)),
            )
          }
        />
      </ListItem>

      <ListItem
        title={Locale.Settings.FontFamily.Title}
        subTitle={Locale.Settings.FontFamily.SubTitle}
      >
        <input
          aria-label={Locale.Settings.FontFamily.Title}
          type="text"
          value={config.fontFamily}
          placeholder={Locale.Settings.FontFamily.Placeholder}
          onChange={(e) =>
            updateConfig(
              (config) => (config.fontFamily = e.currentTarget.value),
            )
          }
        />
      </ListItem>
    </List>
  );
}
