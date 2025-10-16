import React, { useState, useEffect } from "react";
import { SettingsGeneral } from "./SettingsGeneral";
import { useAppConfig, useUpdateStore } from "../../store";
import { getClientConfig } from "../../config/client";
import { RELEASE_URL, UPDATE_URL } from "../../constant";
import { semverCompare } from "../../utils";

/**
 * Wrapper component for SettingsGeneral that provides the required props
 * This bridges the gap between the PageConfig system and the existing settings components
 */
export function SettingsGeneralWrapper() {
  const config = useAppConfig();
  const updateConfig = config.update;
  const updateStore = useUpdateStore();

  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const currentVersion = updateStore.formatVersion(updateStore.version);
  const remoteId = updateStore.formatVersion(updateStore.remoteVersion);
  const hasNewVersion = semverCompare(currentVersion, remoteId) === -1;
  const updateUrl = getClientConfig()?.isApp ? RELEASE_URL : UPDATE_URL;

  function checkUpdate(force = false) {
    setCheckingUpdate(true);
    updateStore.getLatestVersion(force).then(() => {
      setCheckingUpdate(false);
    });

    console.log("[Update] local version ", updateStore.version);
    console.log("[Update] remote version ", updateStore.remoteVersion);
  }

  // Auto-check for updates on mount
  useEffect(() => {
    checkUpdate();
  }, []);

  return (
    <SettingsGeneral
      config={config}
      updateConfig={updateConfig}
      currentVersion={currentVersion}
      hasNewVersion={hasNewVersion}
      isCheckingUpdate={checkingUpdate}
      updateUrl={updateUrl}
      onCheckUpdate={() => checkUpdate(true)}
    />
  );
}
