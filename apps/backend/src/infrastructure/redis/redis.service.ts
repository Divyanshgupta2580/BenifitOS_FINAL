import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;
  private pubClient: Redis;
  private subClient: Redis;

  async onModuleInit() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.logger.log(`Connecting to Redis at ${redisUrl}...`);
    this.client = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 3 });
    this.pubClient = new Redis(redisUrl, { lazyConnect: true });
    this.subClient = new Redis(redisUrl, { lazyConnect: true });

    try {
      await this.client.connect();
      await this.pubClient.connect();
      await this.subClient.connect();
      this.logger.log('Redis connected successfully.');
    } catch (err) {
      this.logger.warn(`Redis connection failed (running in fallback mock mode): ${err.message}`);
    }
  }

  async onModuleDestroy() {
    if (this.client) await this.client.quit();
    if (this.pubClient) await this.pubClient.quit();
    if (this.subClient) await this.subClient.quit();
  }

  public getClient(): Redis {
    return this.client;
  }

  public async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  public async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.client.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch (err) {
      this.logger.warn(`Redis set failed for key ${key}: ${err.message}`);
    }
  }

  public async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (err) {
      this.logger.warn(`Redis del failed for key ${key}: ${err.message}`);
    }
  }

  public async publish(channel: string, message: string): Promise<void> {
    try {
      await this.pubClient.publish(channel, message);
    } catch (err) {
      this.logger.warn(`Redis publish failed for channel ${channel}: ${err.message}`);
    }
  }

  public async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
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
