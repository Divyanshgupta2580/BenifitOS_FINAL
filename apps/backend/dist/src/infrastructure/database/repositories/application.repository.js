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
exports.ApplicationRepositoryImpl = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const application_entity_1 = require("../../../domain/application/application.entity");
let ApplicationRepositoryImpl = class ApplicationRepositoryImpl {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapToEntity(data) {
        return new application_entity_1.ApplicationEntity({
            id: data.id,
            applicationNo: data.applicationNo,
            userId: data.userId,
            schemeId: data.schemeId,
            status: data.status,
            formData: data.formData,
            remarks: data.remarks,
            documentIds: data.documents ? data.documents.map((d) => d.documentId) : [],
            history: data.history
                ? data.history.map((h) => ({
                    id: h.id,
                    applicationId: h.applicationId,
                    fromStatus: h.fromStatus,
                    toStatus: h.toStatus,
                    changedById: h.changedById,
                    note: h.note,
                    changedAt: h.changedAt,
                }))
                : [],
            submittedAt: data.submittedAt,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        });
    }
    async findById(id) {
        const record = await this.prisma.client.application.findUnique({
            where: { id },
            include: { documents: true, history: true },
        });
        return record ? this.mapToEntity(record) : null;
    }
    async findByApplicationNo(applicationNo) {
        const record = await this.prisma.client.application.findUnique({
            where: { applicationNo },
            include: { documents: true, history: true },
        });
        return record ? this.mapToEntity(record) : null;
    }
    async findByUserId(userId) {
        const records = await this.prisma.client.application.findMany({
            where: { userId },
            include: { documents: true, history: true },
        });
        return records.map((r) => this.mapToEntity(r));
    }
    async findBySchemeId(schemeId) {
        const records = await this.prisma.client.application.findMany({
            where: { schemeId },
            include: { documents: true, history: true },
        });
        return records.map((r) => this.mapToEntity(r));
    }
    async findByStatus(status) {
        const records = await this.prisma.client.application.findMany({
            where: { status },
            include: { documents: true, history: true },
        });
        return records.map((r) => this.mapToEntity(r));
    }
    async save(application) {
        const record = await this.prisma.client.application.create({
            data: {
                id: application.id,
                applicationNo: application.applicationNo,
                userId: application.userId,
                schemeId: application.schemeId,
                status: application.status,
                formData: application.formData,
                remarks: application.remarks,
                submittedAt: application.submittedAt,
            },
            include: { documents: true, history: true },
        });
        return this.mapToEntity(record);
    }
    async update(application) {
        const record = await this.prisma.client.application.update({
            where: { id: application.id },
            data: {
                status: application.status,
                formData: application.formData,
                remarks: application.remarks,
                submittedAt: application.submittedAt,
            },
            include: { documents: true, history: true },
        });
        return this.mapToEntity(record);
    }
};
exports.ApplicationRepositoryImpl = ApplicationRepositoryImpl;
exports.ApplicationRepositoryImpl = ApplicationRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApplicationRepositoryImpl);
//# sourceMappingURL=application.repository.js.map