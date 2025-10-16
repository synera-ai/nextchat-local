import { useContext } from "react";
import { PageConfigContext } from "../providers/PageConfigProvider";
import { PageContextValue } from "../config/pages";

/**
 * Hook to access page configuration context
 * @throws Error if used outside of PageConfigProvider
 * @returns Current page context value with configuration and state management
 */
export function usePageConfig(): PageContextValue {
  const context = useContext(PageConfigContext);

  if (!context) {
    throw new Error("usePageConfig must be used within a PageConfigProvider");
  }

  return context;
}
