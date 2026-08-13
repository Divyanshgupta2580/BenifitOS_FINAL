import { Injectable, OnModuleInit, OnModuleDestroy, Logger, ServiceUnavailableException } from '@nestjs/common';
import Redis from 'ioredis';

interface MemoryEntry {
  value: string;
  expiresAt?: number;
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private pubClient: Redis | null = null;
  private subClient: Redis | null = null;
  private isConnected = false;
  private inMemoryStore: Map<string, MemoryEntry> = new Map();

  async onModuleInit() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.logger.log(`Connecting to Redis at ${redisUrl}...`);
    this.client = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 });
    this.pubClient = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 });
    this.subClient = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 });

    this.client.on('error', (err) => {
      this.isConnected = false;
      this.logger.debug(`Redis client event: ${err.message}`);
    });
    this.client.on('connect', () => {
      this.isConnected = true;
    });

    try {
      await this.client.connect();
      await this.pubClient.connect();
      await this.subClient.connect();
      this.isConnected = true;
      this.logger.log('Redis connected successfully.');
    } catch (err) {
      this.isConnected = false;
      this.logger.warn(`Redis connection unavailable (operating on memory security store): ${err.message}`);
    }
  }

  async onModuleDestroy() {
    if (this.client) await this.client.quit();
    if (this.pubClient) await this.pubClient.quit();
    if (this.subClient) await this.subClient.quit();
  }

  public isHealthy(): boolean {
    return this.isConnected;
  }

  private isDistributedMode(): boolean {
    return process.env.SECURITY_STATE_MODE === 'distributed' || process.env.NODE_ENV === 'production';
  }

  public async get(key: string): Promise<string | null> {
    if (this.isConnected && this.client) {
      try {
        const val = await this.client.get(key);
        if (val !== null) return val;
      } catch (err: any) {
        if (this.isDistributedMode()) {
          throw new ServiceUnavailableException('Distributed security state (Redis) is unavailable.');
        }
      }
    } else if (this.isDistributedMode()) {
      throw new ServiceUnavailableException('Distributed security state (Redis) is unavailable. Cannot retrieve security state.');
    }

    const mem = this.inMemoryStore.get(key);
    if (!mem) return null;
    if (mem.expiresAt && Date.now() > mem.expiresAt) {
      this.inMemoryStore.delete(key);
      return null;
    }
    return mem.value;
  }

  public async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isDistributedMode() && !this.isConnected) {
      throw new ServiceUnavailableException('Distributed security state (Redis) is unavailable. Cannot persist security state.');
    }

    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.inMemoryStore.set(key, { value, expiresAt });

    if (this.isConnected && this.client) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
      } catch (err: any) {
        if (this.isDistributedMode()) {
          throw new ServiceUnavailableException('Distributed security write failed to Redis cluster.');
        }
        this.logger.warn(`Redis write-through failed, retained in local memory store: ${err.message}`);
      }
    }
  }

  public async del(key: string): Promise<void> {
    if (this.isDistributedMode() && !this.isConnected) {
      throw new ServiceUnavailableException('Distributed security state (Redis) is unavailable.');
    }

    this.inMemoryStore.delete(key);
    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
      } catch (err: any) {
        if (this.isDistributedMode()) {
          throw new ServiceUnavailableException('Distributed security delete failed in Redis cluster.');
        }
        this.logger.warn(`Redis del failed for key ${key}: ${err.message}`);
      }
    }
  }

  public async publish(channel: string, message: string): Promise<void> {
    if (this.isConnected && this.pubClient) {
      try {
        await this.pubClient.publish(channel, message);
      } catch (err) {
        this.logger.warn(`Redis publish failed for channel ${channel}: ${err.message}`);
      }
    }
  }

  public async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    if (this.isConnected && this.subClient) {
      try {
        await this.subClient.subscribe(channel);
        this.subClient.on('message', (chan, msg) => {
          if (chan === channel) callback(msg);
        });
      } catch (err) {
        this.logger.warn(`Redis subscribe failed for channel ${channel}: ${err.message}`);
      }
    }
  }
}
