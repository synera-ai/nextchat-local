/**
 * Alerting Manager
 * Manages alerting for NextChat deployment
 */

import { EventEmitter } from 'events';
import {
  AlertingSystem,
  AlertRule,
  AlertChannel,
  AlertPolicy,
  EscalationPolicy,
  AlertSeverity,
  ChannelType
} from '../types';

export class AlertingManager extends EventEmitter implements AlertingSystem {
  public enabled: boolean = true;
  public alerts: AlertRule[] = [];
  public reporting: any = {};
  
  // Alerting system
  public rules: AlertRule[] = [];
  public channels: AlertChannel[] = [];
  public policies: AlertPolicy[] = [];
  public escalation: EscalationPolicy;

  // System state
  private initialized = false;
  private destroyed = false;
  private activeAlerts: Map<string, any> = new Map();
  private alertHistory: any[] = [];

  constructor() {
    super();
    
    // Initialize alerting system
    this.rules = this.createDefaultAlertRules();
    this.channels = this.createDefaultAlertChannels();
    this.policies = this.createDefaultAlertPolicies();
    this.escalation = this.createDefaultEscalationPolicy();
  }

  /**
   * Initialize the alerting manager
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      throw new Error('Alerting manager is already initialized');
    }

    if (this.destroyed) {
      throw new Error('Cannot initialize destroyed alerting manager');
    }

    try {
      // Set up event handlers
      this.setupEventHandlers();

      // Start alerting systems
      await this.startAlertingSystems();

      this.initialized = true;
      this.emit('alerting.manager.initialized', {
        timestamp: new Date(),
        rules: this.rules.length,
        channels: this.channels.length,
        policies: this.policies.length
      });

    } catch (error) {
      this.emit('alerting.manager.initialization.failed', {
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Destroy the alerting manager
   */
  async destroy(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    if (this.destroyed) {
      return;
    }

    try {
      // Stop alerting systems
      await this.stopAlertingSystems();

      this.destroyed = true;
      this.emit('alerting.manager.destroyed', {
        timestamp: new Date()
      });

    } catch (error) {
      this.emit('alerting.manager.destruction.failed', {
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Trigger an alert
   */
  async triggerAlert(alert: any): Promise<void> {
    this.validateInitialized();
    
    try {
      const alertId = this.generateAlertId();
      
      // Create alert record
      const alertRecord = {
        id: alertId,
        ruleId: alert.ruleId,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        source: alert.source,
        timestamp: new Date(),
        metadata: alert.metadata || {},
        status: 'active'
      };

      // Add to active alerts
      this.activeAlerts.set(alertId, alertRecord);

      // Add to history
      this.alertHistory.unshift(alertRecord);
      if (this.alertHistory.length > 1000) {
        this.alertHistory = this.alertHistory.slice(0, 1000);
      }

      // Find matching policy
      const policy = this.findMatchingPolicy(alertRecord);
      if (policy) {
        await this.executeAlertPolicy(alertRecord, policy);
      }

      this.emit('alert.triggered', {
        alert: alertRecord,
        timestamp: new Date()
      });

    } catch (error) {
      this.emit('alert.trigger.failed', {
        alert,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
      throw error;
    }
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string): Promise<void> {
    this.validateInitialized();
    
    try {
      const alert = this.activeAlerts.get(alertId);
      if (!alert) {
        throw new Error(`Alert ${alertId} not found or not active`);
      }

      // Update alert status
      alert.status = 'resolved';
      alert.resolvedAt = new Date();
      alert.duration = alert.resolvedAt.getTime() - alert.timestamp.getTime();

      // Remove from active alerts
      this.activeAlerts.delete(alertId);

      this.emit('alert.resolved', {
        alert,
        timestamp: new Date()
      });

    } catch (error) {
      this.emit('alert.resolve.failed', {
        alertId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
      throw error;
    }
  }

  /**
   * Get active alerts
   */
  async getActiveAlerts(): Promise<any[]> {
    this.validateInitialized();
    
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Get alert history
   */
  async getAlertHistory(limit?: number): Promise<any[]> {
    this.validateInitialized();
    
    const history = limit ? this.alertHistory.slice(0, limit) : this.alertHistory;
    return [...history];
  }

  /**
   * Add alert rule
   */
  async addAlertRule(rule: AlertRule): Promise<void> {
    this.validateInitialized();
    
    try {
      // Validate rule
      this.validateAlertRule(rule);

      // Add rule
      this.rules.push(rule);

      this.emit('alert.rule.added', {
        rule,
        timestamp: new Date()
      });

    } catch (error) {
      this.emit('alert.rule.add.failed', {
        rule,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
      throw error;
    }
  }

  /**
   * Remove alert rule
   */
  async removeAlertRule(ruleId: string): Promise<void> {
    this.validateInitialized();
    
    try {
      const index = this.rules.findIndex(rule => rule.id === ruleId);
      if (index === -1) {
        throw new Error(`Alert rule ${ruleId} not found`);
      }

      const rule = this.rules[index];
      this.rules.splice(index, 1);

      this.emit('alert.rule.removed', {
        rule,
        timestamp: new Date()
      });

    } catch (error) {
      this.emit('alert.rule.remove.failed', {
        ruleId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
      throw error;
    }
  }

  /**
   * Add alert channel
   */
  async addAlertChannel(channel: AlertChannel): Promise<void> {
    this.validateInitialized();
    
    try {
      // Validate channel
      this.validateAlertChannel(channel);

      // Add channel
      this.channels.push(channel);

      this.emit('alert.channel.added', {
        channel,
        timestamp: new Date()
      });

    } catch (error) {
      this.emit('alert.channel.add.failed', {
        channel,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
      throw error;
    }
  }

  /**
   * Remove alert channel
   */
  async removeAlertChannel(channelId: string): Promise<void> {
    this.validateInitialized();
    
    try {
      const index = this.channels.findIndex(channel => channel.id === channelId);
      if (index === -1) {
        throw new Error(`Alert channel ${channelId} not found`);
      }

      const channel = this.channels[index];
      this.channels.splice(index, 1);

      this.emit('alert.channel.removed', {
        channel,
        timestamp: new Date()
      });

    } catch (error) {
      this.emit('alert.channel.remove.failed', {
        channelId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
      throw error;
    }
  }

  /**
   * Test alert channel
   */
  async testAlertChannel(channelId: string): Promise<void> {
    this.validateInitialized();
    
    try {
      const channel = this.channels.find(c => c.id === channelId);
      if (!channel) {
        throw new Error(`Alert channel ${channelId} not found`);
      }

      // Send test alert
      const testAlert = {
        id: this.generateAlertId(),
        ruleId: 'test',
        severity: 'low' as AlertSeverity,
        title: 'Test Alert',
        message: 'This is a test alert to verify channel configuration',
        source: 'alerting-manager',
        timestamp: new Date(),
        metadata: { test: true },
        status: 'active'
      };

      await this.sendAlertToChannel(testAlert, channel);

      this.emit('alert.channel.tested', {
        channel,
        testAlert,
        timestamp: new Date()
      });

    } catch (error) {
      this.emit('alert.channel.test.failed', {
        channelId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
      throw error;
    }
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<any> {
    try {
      const checks = [
        {
          id: 'alerting-manager-health',
          name: 'Alerting Manager Health',
          status: this.initialized && !this.destroyed ? 'pass' : 'fail',
          message: this.initialized && !this.destroyed ? 'Alerting manager is healthy' : 'Alerting manager is not healthy',
          duration: 0,
          timestamp: new Date()
        },
        {
          id: 'alert-rules',
          name: 'Alert Rules',
          status: this.rules.length > 0 ? 'pass' : 'warning',
          message: `${this.rules.length} alert rules configured`,
          duration: 0,
          timestamp: new Date()
        },
        {
          id: 'alert-channels',
          name: 'Alert Channels',
          status: this.channels.length > 0 ? 'pass' : 'warning',
          message: `${this.channels.length} alert channels configured`,
          duration: 0,
          timestamp: new Date()
        },
        {
          id: 'active-alerts',
          name: 'Active Alerts',
          status: this.activeAlerts.size < 10 ? 'pass' : 'warning',
          message: `${this.activeAlerts.size} active alerts`,
          duration: 0,
          timestamp: new Date()
        }
      ];

      const overall = checks.every(check => check.status === 'pass') 
        ? 'healthy' 
        : checks.some(check => check.status === 'fail') 
          ? 'unhealthy' 
          : 'degraded';

      return {
        overall,
        services: [{
          serviceId: 'alerting-manager',
          status: overall,
          checks,
          lastCheck: new Date()
        }],
        checks,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        overall: 'unhealthy',
        services: [],
        checks: [{
          id: 'alerting-manager-health',
          name: 'Alerting Manager Health',
          status: 'fail',
          message: error instanceof Error ? error.message : 'Unknown error',
          duration: 0,
          timestamp: new Date()
        }],
        timestamp: new Date()
      };
    }
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Create default alert rules
   */
  private createDefaultAlertRules(): AlertRule[] {
    return [
      {
        id: 'high-error-rate',
        name: 'High Error Rate',
        condition: {
          field: 'error_rate',
          operator: 'greater_than',
          value: 0.05,
          duration: 300000 // 5 minutes
        },
        severity: 'high',
        threshold: 0.05,
        duration: 300000,
        actions: [
          {
            type: 'notification',
            configuration: { channels: ['email', 'slack'] },
            timeout: 30000,
            retries: 3
          }
        ]
      },
      {
        id: 'high-response-time',
        name: 'High Response Time',
        condition: {
          field: 'response_time',
          operator: 'greater_than',
          value: 1000,
          duration: 300000 // 5 minutes
        },
        severity: 'medium',
        threshold: 1000,
        duration: 300000,
        actions: [
          {
            type: 'notification',
            configuration: { channels: ['slack'] },
            timeout: 30000,
            retries: 3
          }
        ]
      },
      {
        id: 'low-disk-space',
        name: 'Low Disk Space',
        condition: {
          field: 'disk_usage',
          operator: 'greater_than',
          value: 90,
          duration: 600000 // 10 minutes
        },
        severity: 'high',
        threshold: 90,
        duration: 600000,
        actions: [
          {
            type: 'notification',
            configuration: { channels: ['email', 'slack'] },
            timeout: 30000,
            retries: 3
          }
        ]
      },
      {
        id: 'high-cpu-usage',
        name: 'High CPU Usage',
        condition: {
          field: 'cpu_usage',
          operator: 'greater_than',
          value: 80,
          duration: 300000 // 5 minutes
        },
        severity: 'medium',
        threshold: 80,
        duration: 300000,
        actions: [
          {
            type: 'notification',
            configuration: { channels: ['slack'] },
            timeout: 30000,
            retries: 3
          }
        ]
      }
    ];
  }

  /**
   * Create default alert channels
   */
  private createDefaultAlertChannels(): AlertChannel[] {
    return [
      {
        id: 'email',
        name: 'Email',
        type: 'email',
        configuration: {
          recipients: ['admin@example.com'],
          subject: 'Alert: {{alert.title}}',
          template: 'Alert: {{alert.title}}\n\n{{alert.message}}\n\nSeverity: {{alert.severity}}\nTime: {{alert.timestamp}}'
        },
        enabled: true
      },
      {
        id: 'slack',
        name: 'Slack',
        type: 'slack',
        configuration: {
          webhook: 'https://hooks.slack.com/services/...',
          channel: '#alerts',
          username: 'AlertBot',
          icon_emoji: ':warning:',
          template: '🚨 *{{alert.title}}*\n\n{{alert.message}}\n\n*Severity:* {{alert.severity}}\n*Time:* {{alert.timestamp}}'
        },
        enabled: true
      },
      {
        id: 'webhook',
        name: 'Webhook',
        type: 'webhook',
        configuration: {
          url: 'https://api.example.com/alerts',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ***'
          },
          template: {
            alert_id: '{{alert.id}}',
            title: '{{alert.title}}',
            message: '{{alert.message}}',
            severity: '{{alert.severity}}',
            timestamp: '{{alert.timestamp}}'
          }
        },
        enabled: false
      }
    ];
  }

  /**
   * Create default alert policies
   */
  private createDefaultAlertPolicies(): AlertPolicy[] {
    return [
      {
        id: 'default-policy',
        name: 'Default Policy',
        rules: ['high-error-rate', 'high-response-time', 'low-disk-space', 'high-cpu-usage'],
        channels: ['email', 'slack'],
        escalation: {
          id: 'default-escalation',
          name: 'Default Escalation',
          levels: [],
          timeout: 300,
          enabled: true
        },
        enabled: true
      },
      {
        id: 'critical-policy',
        name: 'Critical Policy',
        rules: ['high-error-rate', 'low-disk-space'],
        channels: ['email', 'slack', 'webhook'],
        escalation: {
          id: 'critical-escalation',
          name: 'Critical Escalation',
          levels: [],
          timeout: 300,
          enabled: true
        },
        enabled: true
      }
    ];
  }

  /**
   * Create default escalation policy
   */
  private createDefaultEscalationPolicy(): EscalationPolicy {
    return {
      id: 'default-escalation',
      name: 'Default Escalation',
      levels: [
        {
          level: 1,
          timeout: 300000, // 5 minutes
          channels: ['slack'],
          conditions: []
        },
        {
          level: 2,
          timeout: 600000, // 10 minutes
          channels: ['email', 'slack'],
          conditions: []
        },
        {
          level: 3,
          timeout: 900000, // 15 minutes
          channels: ['email', 'slack', 'webhook'],
          conditions: []
        }
      ],
      timeout: 300,
      enabled: true
    };
  }

  /**
   * Set up event handlers
   */
  private setupEventHandlers(): void {
    // Set up alerting event handlers
    this.on('alert.triggered', (alert: any) => {
      this.emit('alerting.alert.triggered', {
        alert,
        timestamp: new Date()
      });
    });

    this.on('alert.resolved', (alert: any) => {
      this.emit('alerting.alert.resolved', {
        alert,
        timestamp: new Date()
      });
    });
  }

  /**
   * Start alerting systems
   */
  private async startAlertingSystems(): Promise<void> {
    // Start alerting systems
    // In a real implementation, this would start actual alerting systems
    this.emit('alerting.systems.started', {
      timestamp: new Date()
    });
  }

  /**
   * Stop alerting systems
   */
  private async stopAlertingSystems(): Promise<void> {
    // Stop alerting systems
    // In a real implementation, this would stop actual alerting systems
    this.emit('alerting.systems.stopped', {
      timestamp: new Date()
    });
  }

  /**
   * Find matching policy
   */
  private findMatchingPolicy(alert: any): AlertPolicy | undefined {
    return this.policies.find(policy => 
      policy.enabled && policy.rules.includes(alert.ruleId)
    );
  }

  /**
   * Execute alert policy
   */
  private async executeAlertPolicy(alert: any, policy: AlertPolicy): Promise<void> {
    try {
      // Send alerts to channels
      for (const channelId of policy.channels) {
        const channel = this.channels.find(c => c.id === channelId);
        if (channel && channel.enabled) {
          await this.sendAlertToChannel(alert, channel);
        }
      }

      // Handle escalation if configured
      if (policy.escalation && policy.escalation.enabled) {
        await this.handleEscalation(alert, policy.escalation);
      }

    } catch (error) {
      this.emit('alert.policy.execution.failed', {
        alert,
        policy,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Send alert to channel
   */
  private async sendAlertToChannel(alert: any, channel: AlertChannel): Promise<void> {
    try {
      // In a real implementation, this would send actual alerts
      // For now, just emit an event
      this.emit('alert.sent', {
        alert,
        channel,
        timestamp: new Date()
      });

    } catch (error) {
      this.emit('alert.send.failed', {
        alert,
        channel,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Handle escalation
   */
  private async handleEscalation(alert: any, escalation: EscalationPolicy): Promise<void> {
    try {
      // In a real implementation, this would handle actual escalation
      // For now, just emit an event
      this.emit('alert.escalation.started', {
        alert,
        escalation,
        timestamp: new Date()
      });

    } catch (error) {
      this.emit('alert.escalation.failed', {
        alert,
        escalation,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Validate alert rule
   */
  private validateAlertRule(rule: AlertRule): void {
    if (!rule.id) {
      throw new Error('Alert rule ID is required');
    }
    if (!rule.name) {
      throw new Error('Alert rule name is required');
    }
    if (!rule.condition) {
      throw new Error('Alert rule condition is required');
    }
    if (!rule.severity) {
      throw new Error('Alert rule severity is required');
    }
  }

  /**
   * Validate alert channel
   */
  private validateAlertChannel(channel: AlertChannel): void {
    if (!channel.id) {
      throw new Error('Alert channel ID is required');
    }
    if (!channel.name) {
      throw new Error('Alert channel name is required');
    }
    if (!channel.type) {
      throw new Error('Alert channel type is required');
    }
    if (!channel.configuration) {
      throw new Error('Alert channel configuration is required');
    }
  }

  /**
   * Generate alert ID
   */
  private generateAlertId(): string {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate that system is initialized
   */
  private validateInitialized(): void {
    if (!this.initialized) {
      throw new Error('Alerting manager is not initialized');
    }
    
    if (this.destroyed) {
      throw new Error('Alerting manager has been destroyed');
    }
  }
}
