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
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaService = class PrismaService {
    static { PrismaService_1 = this; }
    prisma;
    logger = new common_1.Logger(PrismaService_1.name);
    static connectPromise = null;
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async onModuleInit() {
        if (!PrismaService_1.connectPromise) {
            this.logger.log('Connecting to PostgreSQL database via Prisma...');
            PrismaService_1.connectPromise = this.prisma.$connect().then(() => {
                this.logger.log('Database connection established successfully.');
            }).catch((err) => {
                this.logger.warn(`PostgreSQL connection failed during startup: ${err.message}. Connection will be retried on demand.`);
                PrismaService_1.connectPromise = null;
            });
        }
        try {
            await PrismaService_1.connectPromise;
        }
        catch {
        }
    }
    async onModuleDestroy() {
        await this.prisma.$disconnect();
    }
    async queryRaw(strings, ...values) {
        return this.prisma.$queryRaw(strings, ...values);
    }
    get client() {
        return this.prisma;
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map