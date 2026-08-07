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
exports.DocumentRepositoryImpl = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const document_entity_1 = require("../../../domain/document/document.entity");
let DocumentRepositoryImpl = class DocumentRepositoryImpl {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapToEntity(data) {
        return new document_entity_1.DocumentEntity({
            id: data.id,
            userId: data.userId,
            documentType: data.documentType,
            fileName: data.fileName,
            fileSize: data.fileSize,
            mimeType: data.mimeType,
            storagePath: data.storagePath,
            encryptionKeyRef: data.encryptionKeyRef,
            verificationStatus: data.verificationStatus,
            ocrResult: data.ocrResult ? {
                id: data.ocrResult.id,
                documentId: data.ocrResult.documentId,
                rawText: data.ocrResult.rawText,
                confidenceScore: data.ocrResult.confidenceScore,
                extractedData: data.ocrResult.extractedData,
                processedAt: data.ocrResult.processedAt,
            } : null,
            uploadedAt: data.uploadedAt,
            updatedAt: data.updatedAt,
        });
    }
    async findById(id) {
        const record = await this.prisma.document.findUnique({
            where: { id },
            include: { ocrResult: true },
        });
        return record ? this.mapToEntity(record) : null;
    }
    async findByUserId(userId) {
        const records = await this.prisma.document.findMany({
            where: { userId },
            include: { ocrResult: true },
        });
        return records.map((r) => this.mapToEntity(r));
    }
    async findByUserAndType(userId, documentType) {
        const records = await this.prisma.document.findMany({
            where: { userId, documentType },
            include: { ocrResult: true },
        });
        return records.map((r) => this.mapToEntity(r));
    }
    async save(document) {
        const record = await this.prisma.document.create({
            data: {
                id: document.id,
                userId: document.userId,
                documentType: document.documentType,
                fileName: document.fileName,
                fileSize: document.fileSize,
                mimeType: document.mimeType,
                storagePath: document.storagePath,
                encryptionKeyRef: document.encryptionKeyRef,
                verificationStatus: document.verificationStatus,
            },
            include: { ocrResult: true },
        });
        return this.mapToEntity(record);
    }
    async update(document) {
        const record = await this.prisma.document.update({
            where: { id: document.id },
            data: {
                verificationStatus: document.verificationStatus,
            },
            include: { ocrResult: true },
        });
        return this.mapToEntity(record);
    }
    async delete(id) {
        await this.prisma.document.delete({ where: { id } });
    }
};
exports.DocumentRepositoryImpl = DocumentRepositoryImpl;
exports.DocumentRepositoryImpl = DocumentRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentRepositoryImpl);
//# sourceMappingURL=document.repository.js.map