"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
let RedisService = RedisService_1 = class RedisService {
    logger = new common_1.Logger(RedisService_1.name);
    client = null;
    pubClient = null;
    subClient = null;
    isConnected = false;
    inMemoryStore = new Map();
    async onModuleInit() {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        this.logger.log(`Connecting to Redis at ${redisUrl}...`);
        this.client = new ioredis_1.default(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 });
        this.pubClient = new ioredis_1.default(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 });
        this.subClient = new ioredis_1.default(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 });
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
        }
        catch (err) {
            this.isConnected = false;
            this.logger.warn(`Redis connection unavailable (operating on memory security store): ${err.message}`);
        }
    }
    async onModuleDestroy() {
        if (this.client)
            await this.client.quit();
        if (this.pubClient)
            await this.pubClient.quit();
        if (this.subClient)
            await this.subClient.quit();
    }
    isHealthy() {
        return this.isConnected;
    }
    isDistributedMode() {
        return process.env.SECURITY_STATE_MODE === 'distributed' || process.env.NODE_ENV === 'production';
    }
    async get(key) {
        if (this.isConnected && this.client) {
            try {
                const val = await this.client.get(key);
                if (val !== null)
                    return val;
            }
            catch (err) {
                if (this.isDistributedMode()) {
                    throw new common_1.ServiceUnavailableException('Distributed security state (Redis) is unavailable.');
                }
            }
        }
        else if (this.isDistributedMode()) {
            throw new common_1.ServiceUnavailableException('Distributed security state (Redis) is unavailable. Cannot retrieve security state.');
        }
        const mem = this.inMemoryStore.get(key);
        if (!mem)
            return null;
        if (mem.expiresAt && Date.now() > mem.expiresAt) {
            this.inMemoryStore.delete(key);
            return null;
        }
        return mem.value;
    }
    async set(key, value, ttlSeconds) {
        if (this.isDistributedMode() && !this.isConnected) {
            throw new common_1.ServiceUnavailableException('Distributed security state (Redis) is unavailable. Cannot persist security state.');
        }
        const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
        this.inMemoryStore.set(key, { value, expiresAt });
        if (this.isConnected && this.client) {
            try {
                if (ttlSeconds) {
                    await this.client.set(key, value, 'EX', ttlSeconds);
                }
                else {
                    await this.client.set(key, value);
                }
            }
            catch (err) {
                if (this.isDistributedMode()) {
                    throw new common_1.ServiceUnavailableException('Distributed security write failed to Redis cluster.');
                }
                this.logger.warn(`Redis write-through failed, retained in local memory store: ${err.message}`);
            }
        }
    }
    async del(key) {
        if (this.isDistributedMode() && !this.isConnected) {
            throw new common_1.ServiceUnavailableException('Distributed security state (Redis) is unavailable.');
        }
        this.inMemoryStore.delete(key);
        if (this.isConnected && this.client) {
            try {
                await this.client.del(key);
            }
            catch (err) {
                if (this.isDistributedMode()) {
                    throw new common_1.ServiceUnavailableException('Distributed security delete failed in Redis cluster.');
                }
                this.logger.warn(`Redis del failed for key ${key}: ${err.message}`);
            }
        }
    }
    async publish(channel, message) {
        if (this.isConnected && this.pubClient) {
            try {
                await this.pubClient.publish(channel, message);
            }
            catch (err) {
                this.logger.warn(`Redis publish failed for channel ${channel}: ${err.message}`);
            }
        }
    }
    async subscribe(channel, callback) {
        if (this.isConnected && this.subClient) {
            try {
                await this.subClient.subscribe(channel);
                this.subClient.on('message', (chan, msg) => {
                    if (chan === channel)
                        callback(msg);
                });
            }
            catch (err) {
                this.logger.warn(`Redis subscribe failed for channel ${channel}: ${err.message}`);
            }
        }
    }
    async acquireLock(lockKey, ttlSeconds = 15) {
        const lockToken = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
        const expiresAt = Date.now() + ttlSeconds * 1000;
        if (this.isConnected && this.client) {
            try {
                const res = await this.client.set(lockKey, lockToken, 'EX', ttlSeconds, 'NX');
                if (res === 'OK') {
                    return lockToken;
                }
                return null;
            }
            catch (err) {
                if (this.isDistributedMode()) {
                    throw new common_1.ServiceUnavailableException('Distributed lock service (Redis) unavailable.');
                }
                this.logger.warn(`Redis acquireLock failed for ${lockKey}, falling back to local memory: ${err.message}`);
            }
        }
        const existing = this.inMemoryStore.get(lockKey);
        if (existing && (!existing.expiresAt || Date.now() < existing.expiresAt)) {
            return null;
        }
        this.inMemoryStore.set(lockKey, { value: lockToken, expiresAt });
        return lockToken;
    }
    async releaseLock(lockKey, lockToken) {
        if (this.isConnected && this.client) {
            try {
                const luaScript = `
          if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
          else
            return 0
          end
        `;
                const result = await this.client.eval(luaScript, 1, lockKey, lockToken);
                return result === 1;
            }
            catch (err) {
                if (this.isDistributedMode()) {
                    throw new common_1.ServiceUnavailableException('Distributed lock release failed.');
                }
                this.logger.warn(`Redis releaseLock failed for ${lockKey}: ${err.message}`);
            }
        }
        const existing = this.inMemoryStore.get(lockKey);
        if (existing && existing.value === lockToken) {
            this.inMemoryStore.delete(lockKey);
            return true;
        }
        return false;
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)()
], RedisService);
//# sourceMappingURL=redis.service.js.map