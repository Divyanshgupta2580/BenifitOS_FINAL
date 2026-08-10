import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator, HealthCheck, MemoryHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { Public } from '../../common/decorators/roles.decorator';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private memory: MemoryHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  async check() {
    return this.health.check([
      async () => {
        await this.prisma.queryRaw`SELECT 1`;
        // If query succeeds, consider database healthy
        return { database: { status: 'up' } };
      },
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
    ]);
  }

  @Public()
  @Get('liveness')
  liveness() {
    return { status: 'UP', timestamp: new Date().toISOString() };
  }

  @Public()
  @Get('readiness')
  readiness() {
    return { status: 'READY', timestamp: new Date().toISOString() };
  }
}
