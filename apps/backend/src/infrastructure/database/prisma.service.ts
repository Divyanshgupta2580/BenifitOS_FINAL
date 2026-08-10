import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly prisma: PrismaClient;
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    this.prisma = new PrismaClient();
  }

  async onModuleInit() {
    this.logger.log('Connecting to PostgreSQL database via Prisma...');
    await this.prisma.$connect();
    this.logger.log('Database connection established successfully.');
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting database client...');
    await this.prisma.$disconnect();
  }

  // Expose only the required raw query method for health checks
  async queryRaw(strings: TemplateStringsArray, ...values: any[]): Promise<any> {
    // Using $queryRaw with tag function syntax
    return this.prisma.$queryRaw(strings, ...values);
  }

  // Provide a getter for underlying client if absolutely needed (typed narrowly)
  get client() {
    return this.prisma;
  }
}
