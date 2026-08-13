import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator, HealthCheck, MemoryHealthIndicator, HealthCheckError } from '@nestjs/terminus';
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
        try {
          await this.prisma.queryRaw`SELECT 1`;
          return { database: { status: 'up' } };
        } catch (err: any) {
          throw new HealthCheckError('Database connection check failed', {
            database: { status: 'down', error: err.message },
          });
        }
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
  async readiness() {
    try {
      await this.prisma.queryRaw`SELECT 1`;
      return { status: 'READY', database: 'CONNECTED', timestamp: new Date().toISOString() };
    } catch (err: any) {
      return { status: 'NOT_READY', database: 'DISCONNECTED', timestamp: new Date().toISOString() };
    }
  }
}
