import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly prisma: PrismaClient;
  private readonly logger = new Logger(PrismaService.name);
  private static connectPromise: Promise<void> | null = null;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async onModuleInit() {
    if (!PrismaService.connectPromise) {
      this.logger.log('Connecting to PostgreSQL database via Prisma...');
      PrismaService.connectPromise = this.prisma.$connect().then(() => {
        this.logger.log('Database connection established successfully.');
      }).catch((err) => {
        this.logger.warn(`PostgreSQL connection failed during startup: ${err.message}. Connection will be retried on demand.`);
        PrismaService.connectPromise = null;
      });
    }
    try {
      await PrismaService.connectPromise;
    } catch {
      // Allow NestJS bootstrap to complete
    }
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  // Expose only the required raw query method for health checks
  async queryRaw(strings: TemplateStringsArray, ...values: any[]): Promise<any> {
    return this.prisma.$queryRaw(strings, ...values);
  }

  // Provide a getter for underlying client
  get client() {
    return this.prisma;
  }
}
