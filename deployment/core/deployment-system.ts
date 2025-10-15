/**
 * Core Deployment System
 * Main orchestrator for the NextChat deployment system
 */

import { EventEmitter } from 'events';
import {
  DeploymentSystem,
  DeploymentEvent,
  DeploymentEventType,
  Environment,
  DeploymentConfig,
  DeploymentResult,
  RollbackResult,
  HealthStatus,
  MetricsData,
  DashboardData,
  DeploymentStatus
} from '../types';
import { CIPipelineManager } from '../ci/cipipeline-manager';
import { CDPipelineManager } from '../cd/cdpipeline-manager';
import { ProductionDeploymentManager } from '../production/production-deployment-manager';
import { ConfigurationManager } from '../configuration/configuration-manager';
import { SecretManager } from '../secrets/secret-manager';
import { MonitoringManager } from '../monitoring/monitoring-manager';
import { ObservabilityManager } from '../observability/observability-manager';
import { AlertingManager } from '../alerting/alerting-manager';
import { SecurityManager } from '../security/security-manager';
import { HardeningManager } from '../hardening/hardening-manager';
import { ComplianceManager } from '../compliance/compliance-manager';

export class NextChatDeploymentSystem extends EventEmitter implements DeploymentSystem {
  // Core components
  public ci: CIPipelineManager;
  public cd: CDPipelineManager;
  public production: ProductionDeploymentManager;
  
  // Environment and configuration
  public environments: Environment[] = [];
  public configuration: ConfigurationManager;
  public secrets: SecretManager;
  
  // Monitoring and observability
  public monitoring: MonitoringManager;
  public observability: ObservabilityManager;
  public alerting: AlertingManager;
  
  // Security and compliance
  public security: SecurityManager;
  public hardening: HardeningManager;
  public compliance: ComplianceManager;

  // System state
  private initialized = false;
  private destroyed = false;

  constructor() {
    super();
    
    // Initialize core components
    this.ci = new CIPipelineManager();
    this.cd = new CDPipelineManager();
    this.production = new ProductionDeploymentManager();
    
    // Initialize configuration and secrets
    this.configuration = new ConfigurationManager();
    this.secrets = new SecretManager();
    
    // Initialize monitoring and observability
    this.monitoring = new MonitoringManager();
    this.observability = new ObservabilityManager();
    this.alerting = new AlertingManager();
    
    // Initialize security and compliance
    this.security = new SecurityManager();
    this.hardening = new HardeningManager();
    this.compliance = new ComplianceManager();

    // Set up event forwarding
    this.setupEventForwarding();
  }

  /**
   * Initialize the deployment system
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      throw new Error('Deployment system is already initialized');
    }

    if (this.destroyed) {
      throw new Error('Cannot initialize destroyed deployment system');
    }

    try {
      // Initialize all components in parallel
      await Promise.all([
        this.ci.initialize(),
        this.cd.initialize(),
        this.production.initialize(),
        this.configuration.initialize(),
        this.secrets.initialize(),
        this.monitoring.initialize(),
        this.observability.initialize(),
        this.alerting.initialize(),
        this.security.initialize(),
        this.hardening.initialize(),
        this.compliance.initialize()
      ]);

      // Load environments
      await this.loadEnvironments();

      this.initialized = true;
      this.emit('deployment.system.initialized', {
        timestamp: new Date(),
        components: [
          'ci', 'cd', 'production', 'configuration', 'secrets',
          'monitoring', 'observability', 'alerting', 'security',
          'hardening', 'compliance'
        ]
      });

    } catch (error) {
      this.emit('deployment.system.initialization.failed', {
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Destroy the deployment system
   */
  async destroy(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    if (this.destroyed) {
      return;
    }

    try {
      // Destroy all components in parallel
      await Promise.all([
        this.ci.destroy(),
        this.cd.destroy(),
        this.production.destroy(),
        this.configuration.destroy(),
        this.secrets.destroy(),
        this.monitoring.destroy(),
        this.observability.destroy(),
        this.alerting.destroy(),
        this.security.destroy(),
        this.hardening.destroy(),
        this.compliance.destroy()
      ]);

      this.destroyed = true;
      this.emit('deployment.system.destroyed', {
        timestamp: new Date()
      });

    } catch (error) {
      this.emit('deployment.system.destruction.failed', {
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Deploy to an environment
   */
  async deploy(config: DeploymentConfig): Promise<DeploymentResult> {
    this.validateInitialized();
    
    const deploymentId = this.generateDeploymentId();
    
    try {
      this.emit('deployment.started', {
        id: deploymentId,
        config,
        timestamp: new Date()
      });

      // Validate deployment configuration
      const validation = await this.validateDeployment(config);
      if (!validation.valid) {
        throw new Error(`Deployment validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      // Get environment configuration
      const environment = this.getEnvironment(config.environment);
      if (!environment) {
        throw new Error(`Environment ${config.environment} not found`);
      }

      // Deploy using CD pipeline
      const result = await this.cd.deploy({
        ...config,
        deploymentId,
        environment: environment.id
      });

      this.emit('deployment.completed', {
        id: deploymentId,
        result,
        timestamp: new Date()
      });

      return result;

    } catch (error) {
      this.emit('deployment.failed', {
        id: deploymentId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
      throw error;
    }
  }

  /**
   * Rollback a deployment
   */
  async rollback(deploymentId: string): Promise<RollbackResult> {
    this.validateInitialized();
    
    try {
      this.emit('rollback.started', {
        deploymentId,
        timestamp: new Date()
      });

      const result = await this.cd.rollback(deploymentId);

      this.emit('rollback.completed', {
        deploymentId,
        result,
        timestamp: new Date()
      });

      return result;

    } catch (error) {
      this.emit('rollback.failed', {
        deploymentId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
      throw error;
    }
  }

  /**
   * Get system health status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    this.validateInitialized();
    
    try {
      const healthChecks = await Promise.all([
        this.ci.getHealthStatus(),
        this.cd.getHealthStatus(),
        this.production.getHealthStatus(),
        this.configuration.getHealthStatus(),
        this.secrets.getHealthStatus(),
        this.monitoring.getHealthStatus(),
        this.observability.getHealthStatus(),
        this.alerting.getHealthStatus(),
        this.security.getHealthStatus(),
        this.hardening.getHealthStatus(),
        this.compliance.getHealthStatus()
      ]);

      const overall = healthChecks.every(h => h.overall === 'healthy') 
        ? 'healthy' 
        : healthChecks.some(h => h.overall === 'unhealthy') 
          ? 'unhealthy' 
          : 'degraded';

      return {
        overall,
        services: healthChecks.flatMap(h => h.services),
        checks: healthChecks.flatMap(h => h.checks),
        timestamp: new Date()
      };

    } catch (error) {
      return {
        overall: 'unhealthy',
        services: [],
        checks: [{
          id: 'system-health-check',
          name: 'System Health Check',
          status: 'fail',
          message: error instanceof Error ? error.message : 'Unknown error',
          duration: 0,
          timestamp: new Date()
        }],
        timestamp: new Date()
      };
    }
  }

  /**
   * Get system metrics
   */
  async getMetrics(): Promise<MetricsData> {
    this.validateInitialized();
    
    try {
      const [systemMetrics, applicationMetrics, businessMetrics, customMetrics] = await Promise.all([
        this.monitoring.getSystemMetrics(),
        this.monitoring.getApplicationMetrics(),
        this.monitoring.getBusinessMetrics(),
        this.monitoring.getCustomMetrics()
      ]);

      return {
        timestamp: new Date(),
        system: systemMetrics,
        application: applicationMetrics,
        business: businessMetrics,
        custom: customMetrics
      };

    } catch (error) {
      throw new Error(`Failed to get metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get dashboard data
   */
  async getDashboardData(): Promise<DashboardData> {
    this.validateInitialized();
    
    try {
      const [overview, metrics, alerts, health, trends] = await Promise.all([
        this.getOverviewData(),
        this.getMetrics(),
        this.alerting.getActiveAlerts(),
        this.getHealthStatus(),
        this.observability.getTrends()
      ]);

      return {
        overview,
        metrics,
        alerts,
        health,
        trends
      };

    } catch (error) {
      throw new Error(`Failed to get dashboard data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate deployment configuration
   */
  async validateDeployment(config: DeploymentConfig): Promise<{ valid: boolean; errors: any[] }> {
    this.validateInitialized();
    
    try {
      const validation = await this.cd.validateDeployment(config);
      return validation;

    } catch (error) {
      return {
        valid: false,
        errors: [{
          code: 'validation-error',
          message: error instanceof Error ? error.message : 'Unknown validation error',
          field: 'system',
          severity: 'error'
        }]
      };
    }
  }

  /**
   * Get environment by ID
   */
  getEnvironment(environmentId: string): Environment | undefined {
    return this.environments.find(env => env.id === environmentId);
  }

  /**
   * Get all environments
   */
  getEnvironments(): Environment[] {
    return [...this.environments];
  }

  /**
   * Add environment
   */
  async addEnvironment(environment: Environment): Promise<void> {
    this.validateInitialized();
    
    const existingIndex = this.environments.findIndex(env => env.id === environment.id);
    if (existingIndex >= 0) {
      this.environments[existingIndex] = environment;
    } else {
      this.environments.push(environment);
    }

    this.emit('environment.added', {
      environment,
      timestamp: new Date()
    });
  }

  /**
   * Remove environment
   */
  async removeEnvironment(environmentId: string): Promise<void> {
    this.validateInitialized();
    
    const index = this.environments.findIndex(env => env.id === environmentId);
    if (index >= 0) {
      const environment = this.environments[index];
      this.environments.splice(index, 1);
      
      this.emit('environment.removed', {
        environment,
        timestamp: new Date()
      });
    }
  }

  /**
   * Get system status
   */
  getSystemStatus(): {
    initialized: boolean;
    destroyed: boolean;
    environments: number;
    components: string[];
  } {
    return {
      initialized: this.initialized,
      destroyed: this.destroyed,
      environments: this.environments.length,
      components: [
        'ci', 'cd', 'production', 'configuration', 'secrets',
        'monitoring', 'observability', 'alerting', 'security',
        'hardening', 'compliance'
      ]
    };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Set up event forwarding from components
   */
  private setupEventForwarding(): void {
    const components = [
      this.ci, this.cd, this.production, this.configuration, this.secrets,
      this.monitoring, this.observability, this.alerting, this.security,
      this.hardening, this.compliance
    ];

    components.forEach(component => {
      if (component && typeof component.on === 'function') {
        component.on('*', (event: string, ...args: any[]) => {
          this.emit(`component.${event}`, ...args);
        });
      }
    });
  }

  /**
   * Load environments from configuration
   */
  private async loadEnvironments(): Promise<void> {
    try {
      const environments = await this.configuration.getEnvironments();
      this.environments = environments;
      
      this.emit('environments.loaded', {
        count: environments.length,
        environments: environments.map(env => ({ id: env.id, name: env.name, type: env.type })),
        timestamp: new Date()
      });

    } catch (error) {
      this.emit('environments.load.failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
      // Don't throw - system can work without pre-configured environments
    }
  }

  /**
   * Generate unique deployment ID
   */
  private generateDeploymentId(): string {
    return `deploy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get overview data for dashboard
   */
  private async getOverviewData(): Promise<any> {
    try {
      const [health, metrics] = await Promise.all([
        this.getHealthStatus(),
        this.getMetrics()
      ]);

      return {
        status: health.overall,
        uptime: this.calculateUptime(),
        responseTime: metrics.application.performance.responseTime.avg,
        errorRate: metrics.application.errors.rate,
        throughput: metrics.application.requests.rate,
        activeUsers: metrics.application.users.active
      };

    } catch (error) {
      return {
        status: 'unknown',
        uptime: 0,
        responseTime: 0,
        errorRate: 0,
        throughput: 0,
        activeUsers: 0
      };
    }
  }

  /**
   * Calculate system uptime
   */
  private calculateUptime(): number {
    // This would typically be calculated from actual uptime data
    // For now, return a placeholder
    return 99.9;
  }

  /**
   * Validate that system is initialized
   */
  private validateInitialized(): void {
    if (!this.initialized) {
      throw new Error('Deployment system is not initialized');
    }
    
    if (this.destroyed) {
      throw new Error('Deployment system has been destroyed');
    }
  }
}
