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
var OutboxRelayWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboxRelayWorker = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/database/prisma.service");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
let OutboxRelayWorker = OutboxRelayWorker_1 = class OutboxRelayWorker {
    prisma;
    redis;
    logger = new common_1.Logger(OutboxRelayWorker_1.name);
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
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
        }
        catch (err) {
            this.logger.error(`OutboxRelayWorker error: ${err.message}`);
        }
    }
};
exports.OutboxRelayWorker = OutboxRelayWorker;
exports.OutboxRelayWorker = OutboxRelayWorker = OutboxRelayWorker_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], OutboxRelayWorker);
//# sourceMappingURL=outbox-relay.processor.js.map