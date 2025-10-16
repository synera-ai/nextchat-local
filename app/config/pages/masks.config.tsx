import React from "react";
import { createPageConfig, createTab, createSection } from "./factory";

/**
 * Example configuration component for Masks Browse section
 */
function MasksBrowseSection() {
  return (
    <div style={{ padding: "20px", color: "var(--color-text-primary)" }}>
      <h3>Browse Masks</h3>
      <p>Manage and browse available masks</p>
    </div>
  );
}

/**
 * Example configuration component for Masks My Masks section
 */
function MasksMyMasksSection() {
  return (
    <div style={{ padding: "20px", color: "var(--color-text-primary)" }}>
      <h3>My Masks</h3>
      <p>Manage your personal masks</p>
    </div>
  );
}

/**
 * Example configuration component for Masks Search section
 */
function MasksSearchSection() {
  return (
    <div style={{ padding: "20px", color: "var(--color-text-primary)" }}>
      <h3>Search Masks</h3>
      <p>Search and discover masks</p>
    </div>
  );
}

/**
 * Masks page configuration example
 * Demonstrates reusability of page configuration system across different pages
 */
export const masksPageConfig = createPageConfig(
  "masks",
  "Masks",
  [
    createTab("browse", "Browse", [
      createSection("browse-section", "Browse Masks", MasksBrowseSection),
    ]),
    createTab("my-masks", "My Masks", [
      createSection("my-masks-section", "My Masks", MasksMyMasksSection),
    ]),
    createTab("search", "Search", [
      createSection("search-section", "Search Masks", MasksSearchSection),
    ]),
  ],
  {
    subtitle: "Manage and discover masks",
    layout: "multi",
    headerConfig: {
      showClose: true,
    },
  },
);
