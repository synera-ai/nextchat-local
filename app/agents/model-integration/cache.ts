import { EventEmitter } from "events";

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
  compressed?: boolean;
  encrypted?: boolean;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  evictionCount: number;
  compressionRatio: number;
  averageAccessTime: number;
}

export interface CacheOptions {
  ttl?: number;
  compress?: boolean;
  encrypt?: boolean;
  priority?: number;
}

export class ModelCache extends EventEmitter {
  private cache: Map<string, CacheEntry> = new Map();
  private accessOrder: string[] = [];
  private config: CacheConfig;
  private stats: CacheStats;
  private cleanupTimer?: NodeJS.Timeout;
  private compressionEnabled: boolean;
  private encryptionEnabled: boolean;

  constructor(config?: Partial<CacheConfig>) {
    super();
    this.config = {
      maxSize: 1000,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      cleanupInterval: 60 * 1000, // 1 minute
      compressionEnabled: true,
      encryptionEnabled: false,
      ...config,
    };

    this.stats = {
      totalEntries: 0,
      totalSize: 0,
      hitCount: 0,
      missCount: 0,
      hitRate: 0,
      evictionCount: 0,
      compressionRatio: 0,
      averageAccessTime: 0,
    };

    this.compressionEnabled = this.config.compressionEnabled;
    this.encryptionEnabled = this.config.encryptionEnabled;

    this.startCleanupTimer();
  }

  async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now();

    try {
      const entry = this.cache.get(key);

      if (!entry) {
        this.stats.missCount++;
        this.updateHitRate();
        this.emit("cacheMiss", { key });
        return null;
      }

      // Check if expired
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        this.removeFromAccessOrder(key);
        this.stats.missCount++;
        this.updateHitRate();
        this.emit("cacheExpired", { key, entry });
        return null;
      }

      // Update access tracking
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      this.updateAccessOrder(key);

      this.stats.hitCount++;
      this.updateHitRate();
      this.updateAverageAccessTime(Date.now() - startTime);

      this.emit("cacheHit", { key, entry });

      // Decrypt if needed
      let value = entry.value;
      if (entry.encrypted) {
        value = await this.decrypt(value);
      }

      // Decompress if needed
      if (entry.compressed) {
        value = await this.decompress(value);
      }

      return value as T;
    } catch (error) {
      this.emit("cacheError", { key, error });
      return null;
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      const startTime = Date.now();

      // Remove existing entry if it exists
      if (this.cache.has(key)) {
        await this.delete(key);
      }

      // Prepare value
      let processedValue = value;
      let compressed = false;
      let encrypted = false;

      // Compress if enabled and beneficial
      if (
        options?.compress !== false &&
        this.compressionEnabled &&
        this.shouldCompress(value)
      ) {
        processedValue = await this.compress(processedValue);
        compressed = true;
      }

      // Encrypt if enabled
      if (options?.encrypt !== false && this.encryptionEnabled) {
        processedValue = await this.encrypt(processedValue);
        encrypted = true;
      }

      // Calculate size
      const size = this.calculateSize(processedValue);

      // Check if we need to evict entries
      await this.ensureSpace(size);

      // Create cache entry
      const entry: CacheEntry<T> = {
        key,
        value: processedValue,
        timestamp: Date.now(),
        ttl: options?.ttl || this.config.defaultTTL,
        accessCount: 0,
        lastAccessed: Date.now(),
        size,
        compressed,
        encrypted,
      };

      // Store entry
      this.cache.set(key, entry);
      this.addToAccessOrder(key);

      // Update stats
      this.stats.totalEntries++;
      this.stats.totalSize += size;

      this.emit("cacheSet", {
        key,
        entry,
        processingTime: Date.now() - startTime,
      });
    } catch (error) {
      this.emit("cacheError", { key, error });
      throw error;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const entry = this.cache.get(key);
      if (!entry) {
        return false;
      }

      this.cache.delete(key);
      this.removeFromAccessOrder(key);

      // Update stats
      this.stats.totalEntries--;
      this.stats.totalSize -= entry.size;

      this.emit("cacheDelete", { key, entry });
      return true;
    } catch (error) {
      this.emit("cacheError", { key, error });
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      this.cache.clear();
      this.accessOrder = [];

      // Reset stats
      this.stats.totalEntries = 0;
      this.stats.totalSize = 0;
      this.stats.evictionCount = 0;

      this.emit("cacheClear");
    } catch (error) {
      this.emit("cacheError", { error });
      throw error;
    }
  }

  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      await this.delete(key);
      return false;
    }

    return true;
  }

  async keys(): Promise<string[]> {
    const validKeys: string[] = [];

    for (const [key, entry] of this.cache) {
      if (!this.isExpired(entry)) {
        validKeys.push(key);
      } else {
        await this.delete(key);
      }
    }

    return validKeys;
  }

  async size(): Promise<number> {
    return this.cache.size;
  }

  async getStats(): Promise<CacheStats> {
    return { ...this.stats };
  }

  async getEntry(key: string): Promise<CacheEntry | null> {
    const entry = this.cache.get(key);
    if (!entry || this.isExpired(entry)) {
      return null;
    }
    return { ...entry };
  }

  // Cache management methods
  async cleanup(): Promise<void> {
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache) {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      await this.delete(key);
    }

    this.emit("cacheCleanup", { expiredCount: expiredKeys.length });
  }

  async evictLRU(count: number = 1): Promise<void> {
    const keysToEvict = this.accessOrder.slice(0, count);

    for (const key of keysToEvict) {
      await this.delete(key);
      this.stats.evictionCount++;
    }

    this.emit("cacheEviction", { evictedKeys: keysToEvict });
  }

  async evictByPattern(pattern: RegExp): Promise<number> {
    const keysToEvict: string[] = [];

    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        keysToEvict.push(key);
      }
    }

    for (const key of keysToEvict) {
      await this.delete(key);
      this.stats.evictionCount++;
    }

    this.emit("cacheEviction", { evictedKeys: keysToEvict, pattern });
    return keysToEvict.length;
  }

  // Configuration methods
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (newConfig.cleanupInterval !== undefined) {
      this.restartCleanupTimer();
    }

    this.emit("configUpdated", { config: this.config });
  }

  enableCompression(): void {
    this.compressionEnabled = true;
    this.emit("compressionEnabled");
  }

  disableCompression(): void {
    this.compressionEnabled = false;
    this.emit("compressionDisabled");
  }

  enableEncryption(): void {
    this.encryptionEnabled = true;
    this.emit("encryptionEnabled");
  }

  disableEncryption(): void {
    this.encryptionEnabled = false;
    this.emit("encryptionDisabled");
  }

  // Private helper methods
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  private addToAccessOrder(key: string): void {
    this.accessOrder.push(key);
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  private updateHitRate(): void {
    const total = this.stats.hitCount + this.stats.missCount;
    this.stats.hitRate = total > 0 ? this.stats.hitCount / total : 0;
  }

  private updateAverageAccessTime(accessTime: number): void {
    const totalAccesses = this.stats.hitCount + this.stats.missCount;
    this.stats.averageAccessTime =
      (this.stats.averageAccessTime + accessTime) / 2;
  }

  private async ensureSpace(requiredSize: number): Promise<void> {
    while (
      this.cache.size >= this.config.maxSize ||
      this.stats.totalSize + requiredSize > this.config.maxSize * 1024 * 1024
    ) {
      // 1MB per entry max
      await this.evictLRU(1);
    }
  }

  private shouldCompress(value: any): boolean {
    const serialized = JSON.stringify(value);
    return serialized.length > 1024; // Only compress if larger than 1KB
  }

  private calculateSize(value: any): number {
    return JSON.stringify(value).length;
  }

  private async compress(value: any): Promise<any> {
    // Simple compression simulation
    // In a real implementation, you would use a compression library like zlib
    const serialized = JSON.stringify(value);
    return `compressed:${serialized}`;
  }

  private async decompress(value: any): Promise<any> {
    // Simple decompression simulation
    if (typeof value === "string" && value.startsWith("compressed:")) {
      return JSON.parse(value.substring(11));
    }
    return value;
  }

  private async encrypt(value: any): Promise<any> {
    // Simple encryption simulation
    // In a real implementation, you would use a proper encryption library
    const serialized = JSON.stringify(value);
    return `encrypted:${serialized}`;
  }

  private async decrypt(value: any): Promise<any> {
    // Simple decryption simulation
    if (typeof value === "string" && value.startsWith("encrypted:")) {
      return JSON.parse(value.substring(10));
    }
    return value;
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private restartCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.startCleanupTimer();
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.cache.clear();
    this.accessOrder = [];
    this.emit("cacheDestroyed");
  }
}
