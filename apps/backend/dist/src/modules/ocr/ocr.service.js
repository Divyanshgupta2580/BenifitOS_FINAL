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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var OcrPipelineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrPipelineService = void 0;
const common_1 = require("@nestjs/common");
const gemini_ai_adapter_1 = require("../../infrastructure/ai/gemini-ai.adapter");
const local_storage_adapter_1 = require("../../infrastructure/storage/local-storage.adapter");
const prisma_service_1 = require("../../infrastructure/database/prisma.service");
const document_classification_service_1 = require("../document/document-classification.service");
const document_entity_1 = require("../../domain/document/document.entity");
let OcrPipelineService = OcrPipelineService_1 = class OcrPipelineService {
    documentRepo;
    geminiAdapter;
    storageAdapter;
    classificationService;
    prisma;
    logger = new common_1.Logger(OcrPipelineService_1.name);
    constructor(documentRepo, geminiAdapter, storageAdapter, classificationService, prisma) {
        this.documentRepo = documentRepo;
        this.geminiAdapter = geminiAdapter;
        this.storageAdapter = storageAdapter;
        this.classificationService = classificationService;
        this.prisma = prisma;
    }
    async processDocumentOcr(userId, documentId) {
        const doc = await this.documentRepo.findById(documentId);
        if (!doc || doc.userId !== userId) {
            throw new common_1.NotFoundException(`Document with ID '${documentId}' not found or access denied.`);
        }
        const fileBuffer = await this.storageAdapter.downloadFile(doc.storagePath);
        const ocrResult = await this.geminiAdapter.extractDocumentData(fileBuffer, doc.mimeType, doc.documentType);
        const classification = this.classificationService.classifyDocumentContent(ocrResult.rawText || fileBuffer.toString('utf-8'), doc.documentType);
        const extractedFields = {
            ...(classification.extractedFields || {}),
            ...(ocrResult.extractedFields || {}),
            ocrStatus: 'OCR_COMPLETED',
            detectedType: classification.detectedType,
            confidence: classification.confidence,
        };
        await this.prisma.client.ocrResult.upsert({
            where: { documentId: doc.id },
            create: {
                documentId: doc.id,
                rawText: ocrResult.rawText,
                confidenceScore: classification.confidence || ocrResult.confidenceScore,
                extractedData: extractedFields,
            },
            update: {
                rawText: ocrResult.rawText,
                confidenceScore: classification.confidence || ocrResult.confidenceScore,
                extractedData: extractedFields,
            },
        });
        this.logger.log(`OCR processing completed for document ${documentId}`);
        return {
            documentId: doc.id,
            confidenceScore: classification.confidence || ocrResult.confidenceScore,
            extractedFields,
            ocrStatus: 'OCR_COMPLETED',
        };
    }
    async getOcrResult(userId, documentId) {
        const doc = await this.documentRepo.findById(documentId);
        if (!doc || doc.userId !== userId) {
            throw new common_1.NotFoundException(`Document with ID '${documentId}' not found or access denied.`);
        }
        const ocr = await this.prisma.client.ocrResult.findUnique({
            where: { documentId },
        });
        if (!ocr) {
            throw new common_1.NotFoundException(`No OCR result found for document '${documentId}'.`);
        }
        return {
            id: ocr.id,
            documentId: ocr.documentId,
            rawText: ocr.rawText,
            confidenceScore: ocr.confidenceScore,
            extractedData: ocr.extractedData,
            processedAt: ocr.processedAt ? ocr.processedAt.toISOString() : new Date().toISOString(),
        };
    }
    async confirmOcrResult(userId, documentId, confirmedFields) {
        const doc = await this.documentRepo.findById(documentId);
        if (!doc || doc.userId !== userId) {
            throw new common_1.NotFoundException(`Document with ID '${documentId}' not found or access denied.`);
        }
        const ocr = await this.prisma.client.ocrResult.findUnique({
            where: { documentId },
        });
        const existingData = ocr?.extractedData || {};
        const updatedData = {
            ...existingData,
            userConfirmedFields: confirmedFields,
            ocrStatus: 'CONFIRMED',
            userConfirmed: true,
            confirmedAt: new Date().toISOString(),
        };
        if (ocr) {
            await this.prisma.client.ocrResult.update({
                where: { documentId },
                data: { extractedData: updatedData },
            });
        }
        doc.updateVerificationStatus(document_entity_1.VerificationStatus.PENDING);
        await this.documentRepo.update(doc);
        return {
            message: 'OCR extracted fields confirmed by citizen. Awaiting official verification.',
            documentId,
            confirmedData: updatedData,
            verificationStatus: 'PENDING_VERIFICATION',
        };
    }
};
exports.OcrPipelineService = OcrPipelineService;
exports.OcrPipelineService = OcrPipelineService = OcrPipelineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IDocumentRepository')),
    __metadata("design:paramtypes", [Object, gemini_ai_adapter_1.GeminiAiAdapter,
        local_storage_adapter_1.LocalStorageAdapter,
        document_classification_service_1.DocumentClassificationService,
        prisma_service_1.PrismaService])
], OcrPipelineService);
//# sourceMappingURL=ocr.service.js.map