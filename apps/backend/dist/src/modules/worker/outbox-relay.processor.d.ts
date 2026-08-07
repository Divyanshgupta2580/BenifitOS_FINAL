import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
export declare class OutboxRelayWorker implements OnModuleInit {
    private readonly prisma;
    private readonly redis;
    private readonly logger;
    constructor(prisma: PrismaService, redis: RedisService);
    onModuleInit(): void;
    processPendingOutboxEvents(): Promise<void>;
}
