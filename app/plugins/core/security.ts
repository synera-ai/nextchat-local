// Plugin Security Manager
// This file handles plugin security, validation, and sandboxing

import { EventEmitter } from "events";
import { PluginMetadata, PluginError } from "./types";

export class PluginSecurityManager extends EventEmitter {
  private initialized = false;
  private securityPolicies: Map<string, SecurityPolicy> = new Map();
  private pluginPermissions: Map<string, string[]> = new Map();

  constructor() {
    super();
    this.initializeDefaultPolicies();
  }

  // Initialize the security manager
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
  }

  // Initialize default security policies
  private initializeDefaultPolicies(): void {
    // Default security policy
    const defaultPolicy: SecurityPolicy = {
      allowFileSystemAccess: false,
      allowNetworkAccess: false,
      allowProcessSpawn: false,
      allowEnvironmentAccess: false,
      allowedDomains: [],
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
      maxExecutionTime: 30000, // 30 seconds
      allowedAPIs: ["console", "setTimeout", "setInterval"],
      sandboxMode: true,
    };

    this.securityPolicies.set("default", defaultPolicy);
  }

  // Validate plugin
  async validatePlugin(metadata: PluginMetadata): Promise<void> {
    if (!this.initialized) {
      throw new PluginError(
        "Security manager not initialized",
        "system",
        "NOT_INITIALIZED",
      );
    }

    try {
      // Validate plugin metadata
      await this.validateMetadata(metadata);

      // Check for security vulnerabilities
      await this.checkSecurityVulnerabilities(metadata);

      // Validate plugin signature (if applicable)
      await this.validateSignature(metadata);

      // Set default permissions
      this.setDefaultPermissions(metadata.id, metadata);
    } catch (error) {
      if (error instanceof PluginError) {
        throw error;
      }
      throw new PluginError(
        `Plugin validation failed for ${metadata.id}: ${error}`,
        metadata.id,
        "VALIDATION_ERROR",
        error,
      );
    }
  }

  // Validate plugin metadata
  private async validateMetadata(metadata: PluginMetadata): Promise<void> {
    // Check required fields
    const requiredFields = ["id", "name", "version", "author", "license"];
    for (const field of requiredFields) {
      if (!metadata[field as keyof PluginMetadata]) {
        throw new PluginError(
          `Missing required field: ${field}`,
          metadata.id,
          "INVALID_METADATA",
        );
      }
    }

    // Validate version format
    if (!this.isValidVersion(metadata.version)) {
      throw new PluginError(
        `Invalid version format: ${metadata.version}`,
        metadata.id,
        "INVALID_VERSION",
      );
    }

    // Validate license
    if (!this.isValidLicense(metadata.license)) {
      throw new PluginError(
        `Invalid or unsupported license: ${metadata.license}`,
        metadata.id,
        "INVALID_LICENSE",
      );
    }

    // Validate capabilities
    if (metadata.capabilities) {
      await this.validateCapabilities(metadata.id, metadata.capabilities);
    }
  }

  // Check for security vulnerabilities
  private async checkSecurityVulnerabilities(
    metadata: PluginMetadata,
  ): Promise<void> {
    // Check for suspicious patterns in metadata
    const suspiciousPatterns = [
      /eval\s*\(/i,
      /Function\s*\(/i,
      /setTimeout\s*\(\s*["']/i,
      /setInterval\s*\(\s*["']/i,
      /document\.write/i,
      /innerHTML\s*=/i,
    ];

    const metadataString = JSON.stringify(metadata);
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(metadataString)) {
        throw new PluginError(
          `Suspicious pattern detected in plugin metadata`,
          metadata.id,
          "SECURITY_VIOLATION",
        );
      }
    }

    // Check for known malicious packages
    if (metadata.dependencies) {
      for (const depName of Object.keys(metadata.dependencies)) {
        if (this.isKnownMaliciousPackage(depName)) {
          throw new PluginError(
            `Known malicious package detected: ${depName}`,
            metadata.id,
            "MALICIOUS_PACKAGE",
          );
        }
      }
    }
  }

  // Validate plugin signature
  private async validateSignature(metadata: PluginMetadata): Promise<void> {
    // In a real implementation, this would validate cryptographic signatures
    // For now, we'll just check if the plugin is verified
    if (!metadata.verified) {
      console.warn(`Plugin ${metadata.id} is not verified`);
    }
  }

  // Validate plugin capabilities
  private async validateCapabilities(
    pluginId: string,
    capabilities: any,
  ): Promise<void> {
    // Validate tools
    if (capabilities.tools) {
      for (const tool of capabilities.tools) {
        if (!tool.name || !tool.description) {
          throw new PluginError(
            `Invalid tool definition: missing name or description`,
            pluginId,
            "INVALID_CAPABILITY",
          );
        }
      }
    }

    // Validate resources
    if (capabilities.resources) {
      for (const resource of capabilities.resources) {
        if (!resource.name || !resource.type || !resource.uri) {
          throw new PluginError(
            `Invalid resource definition: missing required fields`,
            pluginId,
            "INVALID_CAPABILITY",
          );
        }
      }
    }

    // Validate actions
    if (capabilities.actions) {
      for (const action of capabilities.actions) {
        if (!action.name || !action.description) {
          throw new PluginError(
            `Invalid action definition: missing name or description`,
            pluginId,
            "INVALID_CAPABILITY",
          );
        }
      }
    }
  }

  // Set default permissions for plugin
  private setDefaultPermissions(
    pluginId: string,
    metadata: PluginMetadata,
  ): void {
    const permissions: string[] = [];

    // Add permissions based on capabilities
    if (metadata.capabilities) {
      if (metadata.capabilities.tools) {
        permissions.push(
          ...metadata.capabilities.tools.map((t) => `tool:${t.name}`),
        );
      }
      if (metadata.capabilities.actions) {
        permissions.push(
          ...metadata.capabilities.actions.map((a) => `action:${a.name}`),
        );
      }
      if (metadata.capabilities.resources) {
        permissions.push(
          ...metadata.capabilities.resources.map((r) => `resource:${r.name}`),
        );
      }
    }

    this.pluginPermissions.set(pluginId, permissions);
  }

  // Check if plugin has permission
  hasPermission(pluginId: string, permission: string): boolean {
    const permissions = this.pluginPermissions.get(pluginId) || [];
    return permissions.includes(permission) || permissions.includes("*");
  }

  // Grant permission to plugin
  grantPermission(pluginId: string, permission: string): void {
    const permissions = this.pluginPermissions.get(pluginId) || [];
    if (!permissions.includes(permission)) {
      permissions.push(permission);
      this.pluginPermissions.set(pluginId, permissions);
    }
  }

  // Revoke permission from plugin
  revokePermission(pluginId: string, permission: string): void {
    const permissions = this.pluginPermissions.get(pluginId) || [];
    const index = permissions.indexOf(permission);
    if (index > -1) {
      permissions.splice(index, 1);
      this.pluginPermissions.set(pluginId, permissions);
    }
  }

  // Get plugin permissions
  getPermissions(pluginId: string): string[] {
    return this.pluginPermissions.get(pluginId) || [];
  }

  // Set security policy for plugin
  setSecurityPolicy(pluginId: string, policy: SecurityPolicy): void {
    this.securityPolicies.set(pluginId, policy);
  }

  // Get security policy for plugin
  getSecurityPolicy(pluginId: string): SecurityPolicy {
    return (
      this.securityPolicies.get(pluginId) ||
      this.securityPolicies.get("default")!
    );
  }

  // Validate version format
  private isValidVersion(version: string): boolean {
    const versionRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
    return versionRegex.test(version);
  }

  // Validate license
  private isValidLicense(license: string): boolean {
    const validLicenses = [
      "MIT",
      "Apache-2.0",
      "BSD-3-Clause",
      "BSD-2-Clause",
      "ISC",
      "GPL-3.0",
      "GPL-2.0",
      "LGPL-3.0",
      "LGPL-2.1",
      "MPL-2.0",
      "Unlicense",
      "CC0-1.0",
      "CC-BY-4.0",
      "CC-BY-SA-4.0",
    ];
    return validLicenses.includes(license);
  }

  // Check if package is known malicious
  private isKnownMaliciousPackage(packageName: string): boolean {
    // In a real implementation, this would check against a database of known malicious packages
    const knownMalicious = [
      "event-stream",
      "flatmap-stream",
      "eslint-scope",
      "getcookies",
    ];
    return knownMalicious.includes(packageName);
  }

  // Get security statistics
  getStats(): {
    totalPlugins: number;
    verifiedPlugins: number;
    pluginsWithRestrictions: number;
    securityViolations: number;
  } {
    const totalPlugins = this.pluginPermissions.size;
    let verifiedPlugins = 0;
    let pluginsWithRestrictions = 0;
    let securityViolations = 0;

    for (const [pluginId, permissions] of this.pluginPermissions.entries()) {
      if (permissions.length > 0) {
        pluginsWithRestrictions++;
      }
      // In a real implementation, we would track verification status and violations
    }

    return {
      totalPlugins,
      verifiedPlugins,
      pluginsWithRestrictions,
      securityViolations,
    };
  }

  // Cleanup
  async destroy(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    this.securityPolicies.clear();
    this.pluginPermissions.clear();
    this.initialized = false;
  }
}

// Security policy interface
export interface SecurityPolicy {
  allowFileSystemAccess: boolean;
  allowNetworkAccess: boolean;
  allowProcessSpawn: boolean;
  allowEnvironmentAccess: boolean;
  allowedDomains: string[];
  maxMemoryUsage: number;
  maxExecutionTime: number;
  allowedAPIs: string[];
  sandboxMode: boolean;
}
