/**
 * NextChat Deployment System
 * Main entry point for the comprehensive deployment system
 */

export { NextChatDeploymentSystem } from './core/deployment-system';
export { CIPipelineManager } from './ci/cipipeline-manager';
export { CDPipelineManager } from './cd/cdpipeline-manager';
export { ProductionDeploymentManager } from './production/production-deployment-manager';
export { ConfigurationManager } from './configuration/configuration-manager';
export { SecretManager } from './secrets/secret-manager';
export { MonitoringManager } from './monitoring/monitoring-manager';
export { ObservabilityManager } from './observability/observability-manager';
export { AlertingManager } from './alerting/alerting-manager';
export { SecurityManager } from './security/security-manager';
export { HardeningManager } from './hardening/hardening-manager';
export { ComplianceManager } from './compliance/compliance-manager';

// Export all types
export * from './types';

/**
 * Create and initialize the deployment system
 */
export async function createDeploymentSystem(): Promise<NextChatDeploymentSystem> {
  const deploymentSystem = new NextChatDeploymentSystem();
  await deploymentSystem.initialize();
  return deploymentSystem;
}

/**
 * Default deployment system instance
 */
let defaultDeploymentSystem: NextChatDeploymentSystem | null = null;

/**
 * Get or create the default deployment system
 */
export async function getDeploymentSystem(): Promise<NextChatDeploymentSystem> {
  if (!defaultDeploymentSystem) {
    defaultDeploymentSystem = await createDeploymentSystem();
  }
  return defaultDeploymentSystem;
}

/**
 * Destroy the default deployment system
 */
export async function destroyDeploymentSystem(): Promise<void> {
  if (defaultDeploymentSystem) {
    await defaultDeploymentSystem.destroy();
    defaultDeploymentSystem = null;
  }
}
