import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';

@Injectable()
export class OutboxRelayWorker implements OnModuleInit {
  private readonly logger = new Logger(OutboxRelayWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  onModuleInit() {
    this.logger.log('Initializing OutboxRelayWorker polling interval...');
    setInterval(() => this.processPendingOutboxEvents(), 5000);
  }

  async processPendingOutboxEvents() {
    try {
      const pendingEvents = await this.prisma.client.outboxEvent.findMany({
        where: { status: 'PENDING' },
        take: 20,
      });

      for (const event of pendingEvents) {
        this.logger.log(`Relaying outbox event: ${event.eventType} (${event.id})`);
        await this.redis.publish(`events:${event.aggregateType}`, JSON.stringify(event.payload));
        await this.prisma.client.outboxEvent.update({
          where: { id: event.id },
          data: { status: 'PUBLISHED', processedAt: new Date() },
        });
      }
    } catch (err) {
      this.logger.error(`OutboxRelayWorker error: ${err.message}`);
    }
  }
}
