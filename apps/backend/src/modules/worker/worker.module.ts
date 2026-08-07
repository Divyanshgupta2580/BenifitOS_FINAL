import { Module } from '@nestjs/common';
import { OutboxRelayWorker } from './outbox-relay.processor';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';

@Module({
  providers: [OutboxRelayWorker, PrismaService, RedisService],
  exports: [OutboxRelayWorker],
})
export class WorkerModule {}
