import { createPageConfig, createTab, createSection } from "./factory";
import { MasksListWrapper } from "../../components/mask/MasksListWrapper";

/**
 * Masks page configuration
 * Defines the tab structure and content components for the Masks page
 * Uses the MasksListWrapper to provide proper props to the masks list UI
 *
 * NOTE: The onEditMask callback needs to be passed from the page component
 * through section props to handle modal state management at the page level
 */
export const masksPageConfig = createPageConfig(
  "masks",
  "Masks",
  [
    createTab("browse", "Browse", [
      createSection("browse-section", "Browse Masks", MasksListWrapper),
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
