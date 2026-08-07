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
    client;
    pubClient;
    subClient;
    async onModuleInit() {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        this.logger.log(`Connecting to Redis at ${redisUrl}...`);
        this.client = new ioredis_1.default(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 3 });
        this.pubClient = new ioredis_1.default(redisUrl, { lazyConnect: true });
        this.subClient = new ioredis_1.default(redisUrl, { lazyConnect: true });
        try {
            await this.client.connect();
            await this.pubClient.connect();
            await this.subClient.connect();
            this.logger.log('Redis connected successfully.');
        }
        catch (err) {
            this.logger.warn(`Redis connection failed (running in fallback mock mode): ${err.message}`);
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
    getClient() {
        return this.client;
    }
    async get(key) {
        try {
            return await this.client.get(key);
        }
        catch {
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        try {
            if (ttlSeconds) {
                await this.client.set(key, value, 'EX', ttlSeconds);
            }
            else {
                await this.client.set(key, value);
            }
        }
        catch (err) {
            this.logger.warn(`Redis set failed for key ${key}: ${err.message}`);
        }
    }
    async del(key) {
        try {
            await this.client.del(key);
        }
        catch (err) {
            this.logger.warn(`Redis del failed for key ${key}: ${err.message}`);
        }
    }
    async publish(channel, message) {
        try {
            await this.pubClient.publish(channel, message);
        }
        catch (err) {
            this.logger.warn(`Redis publish failed for channel ${channel}: ${err.message}`);
        }
    }
    async subscribe(channel, callback) {
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
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)()
], RedisService);
//# sourceMappingURL=redis.service.js.map