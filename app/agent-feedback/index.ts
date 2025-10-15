// AI Agent Visual Feedback System
// Main entry point for the AI agent visual feedback system

// Export types
export * from "./types";

// Export core system
export { CoreVisualFeedbackSystem } from "./core/visual-feedback-system";

// Export status indicator components
export { AgentStatus } from "./status-indicators/AgentStatus";
export { ConnectionStatus } from "./status-indicators/ConnectionStatus";
export { LoadingStatus } from "./status-indicators/LoadingStatus";

// Export progress visualization components
export { TaskProgress } from "./progress-visualization/TaskProgress";

// Export activity feed components
export { ActivityFeed } from "./activity-feed/ActivityFeed";
export { ActivityItem } from "./activity-feed/ActivityItem";

// Export agent management components
export { AgentControl } from "./agent-management/AgentControl";

// Create default visual feedback system instance
import { CoreVisualFeedbackSystem } from "./core/visual-feedback-system";

let defaultVisualFeedbackSystem: CoreVisualFeedbackSystem | null = null;

export function getVisualFeedbackSystem(): CoreVisualFeedbackSystem {
  if (!defaultVisualFeedbackSystem) {
    defaultVisualFeedbackSystem = new CoreVisualFeedbackSystem();
  }
  return defaultVisualFeedbackSystem;
}

export async function initializeVisualFeedbackSystem(): Promise<CoreVisualFeedbackSystem> {
  const system = getVisualFeedbackSystem();
  await system.initialize();
  return system;
}

export async function destroyVisualFeedbackSystem(): Promise<void> {
  if (defaultVisualFeedbackSystem) {
    await defaultVisualFeedbackSystem.destroy();
    defaultVisualFeedbackSystem = null;
  }
}
