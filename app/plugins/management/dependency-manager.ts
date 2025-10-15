// Dependency Manager
// This file handles plugin dependencies, conflicts, and compatibility

import { EventEmitter } from "events";
import {
  PluginMetadata,
  PluginInstance,
  PluginDependencyError,
} from "../core/types";

export class DependencyManager extends EventEmitter {
  private dependencyGraph: Map<string, DependencyNode> = new Map();
  private conflictResolver: ConflictResolver;
  private compatibilityChecker: CompatibilityChecker;

  constructor() {
    super();
    this.conflictResolver = new ConflictResolver();
    this.compatibilityChecker = new CompatibilityChecker();
  }

  // Initialize the dependency manager
  async initialize(): Promise<void> {
    // Load existing dependency graph
    await this.loadDependencyGraph();
  }

  // Add plugin to dependency graph
  addPlugin(plugin: PluginInstance): void {
    const node: DependencyNode = {
      pluginId: plugin.metadata.id,
      version: plugin.metadata.version,
      dependencies: plugin.metadata.dependencies || {},
      peerDependencies: plugin.metadata.peerDependencies || {},
      dependents: new Set(),
      conflicts: new Set(),
      status: "active",
    };

    this.dependencyGraph.set(plugin.metadata.id, node);
    this.updateDependencyGraph();
  }

  // Remove plugin from dependency graph
  removePlugin(pluginId: string): void {
    const node = this.dependencyGraph.get(pluginId);
    if (!node) {
      return;
    }

    // Remove from dependents
    for (const dependent of node.dependents) {
      const dependentNode = this.dependencyGraph.get(dependent);
      if (dependentNode) {
        dependentNode.dependencies = Object.fromEntries(
          Object.entries(dependentNode.dependencies).filter(
            ([key]) => key !== pluginId,
          ),
        );
      }
    }

    this.dependencyGraph.delete(pluginId);
    this.updateDependencyGraph();
  }

  // Check if plugin can be installed
  async canInstallPlugin(
    metadata: PluginMetadata,
  ): Promise<DependencyCheckResult> {
    try {
      // Check dependencies
      const dependencyResult = await this.checkDependencies(metadata);
      if (!dependencyResult.satisfied) {
        return {
          canInstall: false,
          reason: "dependencies_not_satisfied",
          missingDependencies: dependencyResult.missing,
          conflicts: [],
          warnings: [],
        };
      }

      // Check conflicts
      const conflictResult = await this.checkConflicts(metadata);
      if (conflictResult.hasConflicts) {
        return {
          canInstall: false,
          reason: "conflicts_detected",
          missingDependencies: [],
          conflicts: conflictResult.conflicts,
          warnings: [],
        };
      }

      // Check compatibility
      const compatibilityResult = await this.checkCompatibility(metadata);
      if (!compatibilityResult.compatible) {
        return {
          canInstall: false,
          reason: "compatibility_issues",
          missingDependencies: [],
          conflicts: [],
          warnings: compatibilityResult.warnings,
        };
      }

      return {
        canInstall: true,
        reason: "ok",
        missingDependencies: [],
        conflicts: [],
        warnings: [],
      };
    } catch (error) {
      throw new PluginDependencyError(
        metadata.id,
        `Failed to check dependencies: ${error}`,
        error,
      );
    }
  }

  // Check plugin dependencies
  private async checkDependencies(
    metadata: PluginMetadata,
  ): Promise<DependencyCheck> {
    const missing: string[] = [];
    const satisfied: string[] = [];

    if (!metadata.dependencies) {
      return { satisfied: true, missing: [], satisfied: [] };
    }

    for (const [depName, depVersion] of Object.entries(metadata.dependencies)) {
      const installedVersion = await this.getInstalledVersion(depName);

      if (!installedVersion) {
        missing.push(`${depName}@${depVersion}`);
      } else if (this.satisfiesVersion(installedVersion, depVersion)) {
        satisfied.push(`${depName}@${installedVersion}`);
      } else {
        missing.push(
          `${depName}@${depVersion} (installed: ${installedVersion})`,
        );
      }
    }

    return {
      satisfied: missing.length === 0,
      missing,
      satisfied,
    };
  }

  // Check plugin conflicts
  private async checkConflicts(
    metadata: PluginMetadata,
  ): Promise<ConflictCheck> {
    const conflicts: Conflict[] = [];

    // Check for direct conflicts
    for (const [pluginId, node] of this.dependencyGraph.entries()) {
      if (node.conflicts.has(metadata.id)) {
        conflicts.push({
          type: "direct",
          plugin1: metadata.id,
          plugin2: pluginId,
          reason: "Direct conflict declared",
        });
      }
    }

    // Check for resource conflicts
    const resourceConflicts = await this.checkResourceConflicts(metadata);
    conflicts.push(...resourceConflicts);

    // Check for API conflicts
    const apiConflicts = await this.checkAPIConflicts(metadata);
    conflicts.push(...apiConflicts);

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
    };
  }

  // Check plugin compatibility
  private async checkCompatibility(
    metadata: PluginMetadata,
  ): Promise<CompatibilityCheck> {
    const warnings: string[] = [];

    // Check NextChat version compatibility
    if (metadata.minNextChatVersion) {
      const currentVersion = await this.getCurrentNextChatVersion();
      if (
        this.compareVersions(currentVersion, metadata.minNextChatVersion) < 0
      ) {
        warnings.push(
          `Plugin requires NextChat version ${metadata.minNextChatVersion} or higher`,
        );
      }
    }

    if (metadata.maxNextChatVersion) {
      const currentVersion = await this.getCurrentNextChatVersion();
      if (
        this.compareVersions(currentVersion, metadata.maxNextChatVersion) > 0
      ) {
        warnings.push(
          `Plugin requires NextChat version ${metadata.maxNextChatVersion} or lower`,
        );
      }
    }

    // Check peer dependencies
    if (metadata.peerDependencies) {
      for (const [peerDep, peerVersion] of Object.entries(
        metadata.peerDependencies,
      )) {
        const installedVersion = await this.getInstalledVersion(peerDep);
        if (!installedVersion) {
          warnings.push(
            `Peer dependency ${peerDep}@${peerVersion} is not installed`,
          );
        } else if (!this.satisfiesVersion(installedVersion, peerVersion)) {
          warnings.push(
            `Peer dependency ${peerDep} version mismatch (required: ${peerVersion}, installed: ${installedVersion})`,
          );
        }
      }
    }

    return {
      compatible: warnings.length === 0,
      warnings,
    };
  }

  // Resolve dependency conflicts
  async resolveConflicts(conflicts: Conflict[]): Promise<ConflictResolution[]> {
    const resolutions: ConflictResolution[] = [];

    for (const conflict of conflicts) {
      const resolution = await this.conflictResolver.resolve(conflict);
      resolutions.push(resolution);
    }

    return resolutions;
  }

  // Get dependency tree for plugin
  getDependencyTree(pluginId: string): DependencyTree {
    const node = this.dependencyGraph.get(pluginId);
    if (!node) {
      return { pluginId, dependencies: [], dependents: [] };
    }

    const dependencies = this.getDependencies(pluginId);
    const dependents = this.getDependents(pluginId);

    return {
      pluginId,
      dependencies,
      dependents,
    };
  }

  // Get all dependencies for plugin
  private getDependencies(pluginId: string): DependencyTree[] {
    const node = this.dependencyGraph.get(pluginId);
    if (!node) {
      return [];
    }

    const dependencies: DependencyTree[] = [];

    for (const [depName, depVersion] of Object.entries(node.dependencies)) {
      const depNode = this.dependencyGraph.get(depName);
      if (depNode) {
        dependencies.push({
          pluginId: depName,
          version: depNode.version,
          dependencies: this.getDependencies(depName),
          dependents: [],
        });
      }
    }

    return dependencies;
  }

  // Get all dependents for plugin
  private getDependents(pluginId: string): DependencyTree[] {
    const dependents: DependencyTree[] = [];

    for (const [id, node] of this.dependencyGraph.entries()) {
      if (node.dependencies[pluginId]) {
        dependents.push({
          pluginId: id,
          version: node.version,
          dependencies: [],
          dependents: this.getDependents(id),
        });
      }
    }

    return dependents;
  }

  // Update dependency graph
  private updateDependencyGraph(): void {
    // Update dependents for each plugin
    for (const [pluginId, node] of this.dependencyGraph.entries()) {
      node.dependents.clear();

      for (const [id, otherNode] of this.dependencyGraph.entries()) {
        if (otherNode.dependencies[pluginId]) {
          node.dependents.add(id);
        }
      }
    }
  }

  // Load dependency graph from storage
  private async loadDependencyGraph(): Promise<void> {
    // In a real implementation, this would load from persistent storage
  }

  // Get installed version of plugin
  private async getInstalledVersion(pluginId: string): Promise<string | null> {
    const node = this.dependencyGraph.get(pluginId);
    return node ? node.version : null;
  }

  // Check if version satisfies requirement
  private satisfiesVersion(
    installedVersion: string,
    requiredVersion: string,
  ): boolean {
    // In a real implementation, this would use proper semver comparison
    return installedVersion === requiredVersion;
  }

  // Compare version strings
  private compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split(".").map(Number);
    const v2Parts = version2.split(".").map(Number);

    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;

      if (v1Part < v2Part) return -1;
      if (v1Part > v2Part) return 1;
    }

    return 0;
  }

  // Get current NextChat version
  private async getCurrentNextChatVersion(): Promise<string> {
    // In a real implementation, this would get the actual NextChat version
    return "1.0.0";
  }

  // Check resource conflicts
  private async checkResourceConflicts(
    metadata: PluginMetadata,
  ): Promise<Conflict[]> {
    // In a real implementation, this would check for resource conflicts
    return [];
  }

  // Check API conflicts
  private async checkAPIConflicts(
    metadata: PluginMetadata,
  ): Promise<Conflict[]> {
    // In a real implementation, this would check for API conflicts
    return [];
  }

  // Get dependency statistics
  getStats(): {
    totalPlugins: number;
    totalDependencies: number;
    circularDependencies: number;
    conflicts: number;
  } {
    const totalPlugins = this.dependencyGraph.size;
    let totalDependencies = 0;
    let conflicts = 0;

    for (const node of this.dependencyGraph.values()) {
      totalDependencies += Object.keys(node.dependencies).length;
      conflicts += node.conflicts.size;
    }

    // Check for circular dependencies
    const circularDependencies = this.detectCircularDependencies();

    return {
      totalPlugins,
      totalDependencies,
      circularDependencies,
      conflicts,
    };
  }

  // Detect circular dependencies
  private detectCircularDependencies(): number {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    let circularCount = 0;

    const dfs = (pluginId: string): boolean => {
      if (recursionStack.has(pluginId)) {
        circularCount++;
        return true;
      }

      if (visited.has(pluginId)) {
        return false;
      }

      visited.add(pluginId);
      recursionStack.add(pluginId);

      const node = this.dependencyGraph.get(pluginId);
      if (node) {
        for (const depId of Object.keys(node.dependencies)) {
          if (dfs(depId)) {
            return true;
          }
        }
      }

      recursionStack.delete(pluginId);
      return false;
    };

    for (const pluginId of this.dependencyGraph.keys()) {
      if (!visited.has(pluginId)) {
        dfs(pluginId);
      }
    }

    return circularCount;
  }

  // Cleanup
  async destroy(): Promise<void> {
    this.dependencyGraph.clear();
  }
}

// Conflict resolver
class ConflictResolver {
  async resolve(conflict: Conflict): Promise<ConflictResolution> {
    // In a real implementation, this would resolve conflicts
    return {
      conflict,
      resolution: "manual",
      message: "Manual resolution required",
      actions: [],
    };
  }
}

// Compatibility checker
class CompatibilityChecker {
  async check(metadata: PluginMetadata): Promise<CompatibilityCheck> {
    // In a real implementation, this would check compatibility
    return {
      compatible: true,
      warnings: [],
    };
  }
}

// Dependency node interface
interface DependencyNode {
  pluginId: string;
  version: string;
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  dependents: Set<string>;
  conflicts: Set<string>;
  status: "active" | "inactive" | "error";
}

// Dependency check result interface
export interface DependencyCheckResult {
  canInstall: boolean;
  reason: string;
  missingDependencies: string[];
  conflicts: Conflict[];
  warnings: string[];
}

// Dependency check interface
interface DependencyCheck {
  satisfied: boolean;
  missing: string[];
  satisfied: string[];
}

// Conflict check interface
interface ConflictCheck {
  hasConflicts: boolean;
  conflicts: Conflict[];
}

// Compatibility check interface
interface CompatibilityCheck {
  compatible: boolean;
  warnings: string[];
}

// Conflict interface
export interface Conflict {
  type: "direct" | "resource" | "api" | "version";
  plugin1: string;
  plugin2: string;
  reason: string;
}

// Conflict resolution interface
export interface ConflictResolution {
  conflict: Conflict;
  resolution: "automatic" | "manual" | "unresolvable";
  message: string;
  actions: string[];
}

// Dependency tree interface
export interface DependencyTree {
  pluginId: string;
  version?: string;
  dependencies: DependencyTree[];
  dependents: DependencyTree[];
}
