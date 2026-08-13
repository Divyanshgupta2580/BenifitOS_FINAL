"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const terminus_1 = require("@nestjs/terminus");
const prisma_service_1 = require("../../infrastructure/database/prisma.service");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let HealthController = class HealthController {
    health;
    http;
    memory;
    prisma;
    constructor(health, http, memory, prisma) {
        this.health = health;
        this.http = http;
        this.memory = memory;
        this.prisma = prisma;
    }
    async check() {
        return this.health.check([
            async () => {
                try {
                    await this.prisma.queryRaw `SELECT 1`;
                    return { database: { status: 'up' } };
                }
                catch (err) {
                    throw new terminus_1.HealthCheckError('Database connection check failed', {
                        database: { status: 'down', error: err.message },
                    });
                }
            },
            () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
        ]);
    }
    liveness() {
        return { status: 'UP', timestamp: new Date().toISOString() };
    }
    async readiness() {
        try {
            await this.prisma.queryRaw `SELECT 1`;
            return { status: 'READY', database: 'CONNECTED', timestamp: new Date().toISOString() };
        }
        catch (err) {
            return { status: 'NOT_READY', database: 'DISCONNECTED', timestamp: new Date().toISOString() };
        }
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, terminus_1.HealthCheck)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "check", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Get)('liveness'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "liveness", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Get)('readiness'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "readiness", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [terminus_1.HealthCheckService,
        terminus_1.HttpHealthIndicator,
        terminus_1.MemoryHealthIndicator,
        prisma_service_1.PrismaService])
], HealthController);
//# sourceMappingURL=health.controller.js.map