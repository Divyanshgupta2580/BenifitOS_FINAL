import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private client;
    private pubClient;
    private subClient;
    private isConnected;
    private inMemoryStore;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    isHealthy(): boolean;
    private isDistributedMode;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<void>;
    publish(channel: string, message: string): Promise<void>;
    subscribe(channel: string, callback: (message: string) => void): Promise<void>;
}
