// Plugin Updater
// This file handles plugin updates, version management, and dependency resolution

import { EventEmitter } from "events";
import { PluginInstance, PluginError } from "../core/types";

export class PluginUpdater extends EventEmitter {
  private updateQueue: UpdateTask[] = [];
  private processing = false;
  private updateCheckInterval?: NodeJS.Timeout;

  constructor() {
    super();
  }

  // Initialize the updater
  async initialize(): Promise<void> {
    // Start automatic update checking
    this.startUpdateChecking();
  }

  // Start automatic update checking
  private startUpdateChecking(): void {
    this.updateCheckInterval = setInterval(
      () => {
        this.checkForUpdates();
      },
      24 * 60 * 60 * 1000,
    ); // Check every 24 hours
  }

  // Stop automatic update checking
  private stopUpdateChecking(): void {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = undefined;
    }
  }

  // Check for updates for all plugins
  async checkForUpdates(): Promise<UpdateInfo[]> {
    try {
      const installedPlugins = await this.getInstalledPlugins();
      const updateInfos: UpdateInfo[] = [];

      for (const plugin of installedPlugins) {
        try {
          const updateInfo = await this.checkPluginUpdate(plugin);
          if (updateInfo.hasUpdate) {
            updateInfos.push(updateInfo);
          }
        } catch (error) {
          console.error(
            `Failed to check updates for plugin ${plugin.metadata.id}:`,
            error,
          );
        }
      }

      this.emit("updates:checked", updateInfos);
      return updateInfos;
    } catch (error) {
      this.emit("updates:check:failed", error);
      throw new PluginError(
        `Failed to check for updates: ${error}`,
        "system",
        "UPDATE_CHECK_ERROR",
        error,
      );
    }
  }

  // Check for updates for a specific plugin
  async checkPluginUpdate(plugin: PluginInstance): Promise<UpdateInfo> {
    try {
      // Get latest version from registry
      const latestVersion = await this.getLatestVersion(plugin.metadata.id);

      if (!latestVersion) {
        return {
          pluginId: plugin.metadata.id,
          currentVersion: plugin.metadata.version,
          latestVersion: plugin.metadata.version,
          hasUpdate: false,
          updateType: "none",
          changelog: "",
          releaseDate: new Date(),
          downloadSize: 0,
          dependencies: [],
        };
      }

      const hasUpdate =
        this.compareVersions(plugin.metadata.version, latestVersion.version) <
        0;
      const updateType = this.getUpdateType(
        plugin.metadata.version,
        latestVersion.version,
      );

      return {
        pluginId: plugin.metadata.id,
        currentVersion: plugin.metadata.version,
        latestVersion: latestVersion.version,
        hasUpdate,
        updateType,
        changelog: latestVersion.changelog || "",
        releaseDate: latestVersion.releaseDate || new Date(),
        downloadSize: latestVersion.downloadSize || 0,
        dependencies: latestVersion.dependencies || [],
      };
    } catch (error) {
      throw new PluginError(
        `Failed to check update for plugin ${plugin.metadata.id}: ${error}`,
        plugin.metadata.id,
        "UPDATE_CHECK_ERROR",
        error,
      );
    }
  }

  // Update plugin to latest version
  async updatePlugin(
    pluginId: string,
    options: UpdateOptions = {},
  ): Promise<UpdateResult> {
    try {
      const plugin = await this.getPlugin(pluginId);
      if (!plugin) {
        throw new PluginError(
          `Plugin ${pluginId} not found`,
          pluginId,
          "NOT_FOUND",
        );
      }

      // Check for updates
      const updateInfo = await this.checkPluginUpdate(plugin);
      if (!updateInfo.hasUpdate) {
        return {
          success: true,
          plugin,
          message: "Plugin is already up to date",
        };
      }

      // Create update task
      const task: UpdateTask = {
        id: `update-${pluginId}-${Date.now()}`,
        pluginId,
        fromVersion: plugin.metadata.version,
        toVersion: updateInfo.latestVersion,
        status: "pending",
        options,
        createdAt: new Date(),
      };

      // Add to queue
      this.updateQueue.push(task);

      // Process queue if not already processing
      if (!this.processing) {
        this.processUpdateQueue();
      }

      return {
        success: true,
        plugin,
        message: "Update queued successfully",
      };
    } catch (error) {
      if (error instanceof PluginError) {
        throw error;
      }
      throw new PluginError(
        `Failed to update plugin ${pluginId}: ${error}`,
        pluginId,
        "UPDATE_ERROR",
        error,
      );
    }
  }

  // Update all plugins
  async updateAllPlugins(options: UpdateOptions = {}): Promise<UpdateResult[]> {
    try {
      const updateInfos = await this.checkForUpdates();
      const results: UpdateResult[] = [];

      for (const updateInfo of updateInfos) {
        try {
          const result = await this.updatePlugin(updateInfo.pluginId, options);
          results.push(result);
        } catch (error) {
          results.push({
            success: false,
            plugin: null,
            error: `Failed to update plugin ${updateInfo.pluginId}: ${error}`,
          });
        }
      }

      return results;
    } catch (error) {
      throw new PluginError(
        `Failed to update all plugins: ${error}`,
        "system",
        "BULK_UPDATE_ERROR",
        error,
      );
    }
  }

  // Process update queue
  private async processUpdateQueue(): Promise<void> {
    if (this.processing || this.updateQueue.length === 0) {
      return;
    }

    this.processing = true;

    try {
      while (this.updateQueue.length > 0) {
        const task = this.updateQueue.shift();
        if (task) {
          await this.processUpdateTask(task);
        }
      }
    } finally {
      this.processing = false;
    }
  }

  // Process individual update task
  private async processUpdateTask(task: UpdateTask): Promise<void> {
    try {
      task.status = "processing";
      task.startedAt = new Date();

      this.emit("update:started", task);

      // Get plugin
      const plugin = await this.getPlugin(task.pluginId);
      if (!plugin) {
        throw new PluginError(
          `Plugin ${task.pluginId} not found`,
          task.pluginId,
          "NOT_FOUND",
        );
      }

      // Check dependencies
      await this.checkUpdateDependencies(task);

      // Download new version
      const downloadPath = await this.downloadUpdate(task);

      // Backup current version
      const backupPath = await this.backupPlugin(plugin);

      try {
        // Stop plugin
        await this.stopPlugin(plugin);

        // Install new version
        await this.installUpdate(task, downloadPath);

        // Start plugin
        await this.startPlugin(plugin);

        // Clean up
        await this.cleanup(downloadPath, backupPath);

        task.status = "completed";
        task.completedAt = new Date();

        this.emit("update:completed", task);
      } catch (error) {
        // Restore from backup
        await this.restorePlugin(backupPath, plugin);
        throw error;
      }
    } catch (error) {
      task.status = "failed";
      task.error = error instanceof Error ? error.message : String(error);
      task.completedAt = new Date();

      this.emit("update:failed", task, error);
    }
  }

  // Get latest version from registry
  private async getLatestVersion(
    pluginId: string,
  ): Promise<VersionInfo | null> {
    // In a real implementation, this would query the plugin registry
    // For now, we'll return mock data
    return {
      version: "1.1.0",
      changelog: "Bug fixes and performance improvements",
      releaseDate: new Date(),
      downloadSize: 1024 * 1024, // 1MB
      dependencies: [],
    };
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

  // Get update type
  private getUpdateType(
    currentVersion: string,
    latestVersion: string,
  ): UpdateType {
    const currentParts = currentVersion.split(".").map(Number);
    const latestParts = latestVersion.split(".").map(Number);

    if (latestParts[0] > currentParts[0]) return "major";
    if (latestParts[1] > currentParts[1]) return "minor";
    if (latestParts[2] > currentParts[2]) return "patch";

    return "none";
  }

  // Check update dependencies
  private async checkUpdateDependencies(task: UpdateTask): Promise<void> {
    // In a real implementation, this would check if all dependencies are satisfied
  }

  // Download update
  private async downloadUpdate(task: UpdateTask): Promise<string> {
    // In a real implementation, this would download the update
    return `/tmp/updates/${task.pluginId}-${task.toVersion}.zip`;
  }

  // Backup plugin
  private async backupPlugin(plugin: PluginInstance): Promise<string> {
    // In a real implementation, this would create a backup
    return `/tmp/backups/${plugin.metadata.id}-${Date.now()}`;
  }

  // Stop plugin
  private async stopPlugin(plugin: PluginInstance): Promise<void> {
    // In a real implementation, this would stop the plugin
  }

  // Install update
  private async installUpdate(
    task: UpdateTask,
    downloadPath: string,
  ): Promise<void> {
    // In a real implementation, this would install the update
  }

  // Start plugin
  private async startPlugin(plugin: PluginInstance): Promise<void> {
    // In a real implementation, this would start the plugin
  }

  // Clean up
  private async cleanup(...paths: string[]): Promise<void> {
    // In a real implementation, this would clean up temporary files
  }

  // Restore plugin from backup
  private async restorePlugin(
    backupPath: string,
    plugin: PluginInstance,
  ): Promise<void> {
    // In a real implementation, this would restore the plugin from backup
  }

  // Get installed plugins
  private async getInstalledPlugins(): Promise<PluginInstance[]> {
    // In a real implementation, this would get installed plugins from the registry
    return [];
  }

  // Get plugin
  private async getPlugin(pluginId: string): Promise<PluginInstance | null> {
    // In a real implementation, this would get the plugin from the registry
    return null;
  }

  // Get update queue status
  getQueueStatus(): {
    queueLength: number;
    processing: boolean;
    tasks: UpdateTask[];
  } {
    return {
      queueLength: this.updateQueue.length,
      processing: this.processing,
      tasks: [...this.updateQueue],
    };
  }

  // Get update statistics
  getStats(): {
    totalUpdates: number;
    successfulUpdates: number;
    failedUpdates: number;
    pendingUpdates: number;
  } {
    const total = this.updateQueue.length;
    const successful = this.updateQueue.filter(
      (t) => t.status === "completed",
    ).length;
    const failed = this.updateQueue.filter((t) => t.status === "failed").length;
    const pending = this.updateQueue.filter(
      (t) => t.status === "pending",
    ).length;

    return {
      totalUpdates: total,
      successfulUpdates: successful,
      failedUpdates: failed,
      pendingUpdates: pending,
    };
  }

  // Cleanup
  async destroy(): Promise<void> {
    this.stopUpdateChecking();
    this.updateQueue = [];
    this.processing = false;
  }
}

// Update info interface
export interface UpdateInfo {
  pluginId: string;
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  updateType: UpdateType;
  changelog: string;
  releaseDate: Date;
  downloadSize: number;
  dependencies: string[];
}

// Update type
export type UpdateType = "major" | "minor" | "patch" | "none";

// Update options interface
export interface UpdateOptions {
  force?: boolean;
  skipDependencies?: boolean;
  backup?: boolean;
  autoStart?: boolean;
}

// Update result interface
export interface UpdateResult {
  success: boolean;
  plugin: PluginInstance | null;
  message?: string;
  error?: string;
}

// Update task interface
interface UpdateTask {
  id: string;
  pluginId: string;
  fromVersion: string;
  toVersion: string;
  status: "pending" | "processing" | "completed" | "failed";
  options: UpdateOptions;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

// Version info interface
interface VersionInfo {
  version: string;
  changelog?: string;
  releaseDate?: Date;
  downloadSize?: number;
  dependencies?: string[];
}
