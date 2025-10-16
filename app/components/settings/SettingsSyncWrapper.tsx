import React, { useState } from "react";
import { SettingsSync } from "./SettingsSync";
import { useSyncStore } from "../../store/sync";

/**
 * Wrapper component for SettingsSync that provides the required props
 * This bridges the gap between the PageConfig system and the existing settings components
 */
export function SettingsSyncWrapper() {
  const syncStore = useSyncStore();
  const [showSyncConfigModal, setShowSyncConfigModal] = useState(false);

  return (
    <SettingsSync
      syncStore={syncStore}
      onConfigClick={() => setShowSyncConfigModal(true)}
    />
  );
}
