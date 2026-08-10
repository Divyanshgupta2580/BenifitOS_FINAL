import { HealthCheckService, HttpHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../../infrastructure/database/prisma.service';
export declare class HealthController {
    private health;
    private http;
    private memory;
    private prisma;
    constructor(health: HealthCheckService, http: HttpHealthIndicator, memory: MemoryHealthIndicator, prisma: PrismaService);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult<import("@nestjs/terminus").HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>> & import("@nestjs/terminus").HealthIndicatorResult<"memory_heap"> & {
        database: {
            status: "up";
        };
    }, Partial<import("@nestjs/terminus").HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>> & import("@nestjs/terminus").HealthIndicatorResult<"memory_heap"> & {
        database: {
            status: "up";
        };
    }> | undefined, Partial<import("@nestjs/terminus").HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>> & import("@nestjs/terminus").HealthIndicatorResult<"memory_heap"> & {
        database: {
            status: "up";
        };
    }> | undefined>>;
    liveness(): {
        status: string;
        timestamp: string;
    };
    readiness(): {
        status: string;
        timestamp: string;
    };
}
