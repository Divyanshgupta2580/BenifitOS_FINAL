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
var DocumentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const common_1 = require("@nestjs/common");
const document_entity_1 = require("../../domain/document/document.entity");
const scheme_entity_1 = require("../../domain/welfare/scheme.entity");
const local_storage_adapter_1 = require("../../infrastructure/storage/local-storage.adapter");
const document_classification_service_1 = require("./document-classification.service");
const gemini_ai_adapter_1 = require("../../infrastructure/ai/gemini-ai.adapter");
const prisma_service_1 = require("../../infrastructure/database/prisma.service");
const crypto_1 = require("crypto");
let DocumentService = DocumentService_1 = class DocumentService {
    documentRepo;
    storageAdapter;
    classificationService;
    geminiAdapter;
    prisma;
    logger = new common_1.Logger(DocumentService_1.name);
    constructor(documentRepo, storageAdapter, classificationService, geminiAdapter, prisma) {
        this.documentRepo = documentRepo;
        this.storageAdapter = storageAdapter;
        this.classificationService = classificationService;
        this.geminiAdapter = geminiAdapter;
        this.prisma = prisma;
    }
    async uploadDocument(userId, requiredDocumentType, file) {
        const validTypes = Object.values(scheme_entity_1.DocumentType);
        if (!validTypes.includes(requiredDocumentType)) {
            throw new common_1.BadRequestException(`Unsupported document type. Supported types: ${validTypes.join(', ')}`);
        }
        const fileBuffer = file.buffer || Buffer.from('');
        this.validateFileSignature(fileBuffer, file.mimetype);
        const ocrRes = await this.geminiAdapter.extractDocumentData(fileBuffer, file.mimetype, requiredDocumentType);
        const textContent = ocrRes.rawText || fileBuffer.toString('utf-8');
        const classification = this.classificationService.classifyDocumentContent(textContent, requiredDocumentType);
        if (classification.status === 'REJECTED' || classification.detectedType !== requiredDocumentType) {
            const requiredName = scheme_entity_1.DOCUMENT_TYPE_DISPLAY_NAMES[requiredDocumentType] || requiredDocumentType;
            const detectedName = classification.detectedType
                ? scheme_entity_1.DOCUMENT_TYPE_DISPLAY_NAMES[classification.detectedType] || classification.detectedType
                : 'Unrecognized Document';
            throw new common_1.BadRequestException({
                statusCode: 400,
                error: 'Bad Request',
                message: classification.reason || `Incorrect document. Required: ${requiredName}, Detected: ${detectedName}. Please upload your ${requiredName}.`,
                details: {
                    requiredDocumentType,
                    detectedDocumentType: classification.detectedType,
                    status: 'REJECTED',
                    reason: classification.reason,
                },
            });
        }
        if (classification.status === 'MANUAL_REVIEW') {
            throw new common_1.BadRequestException({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Uploaded document could not be verified with sufficient confidence. Please upload a clear document image.',
                details: {
                    requiredDocumentType,
                    detectedDocumentType: classification.detectedType,
                    status: 'MANUAL_REVIEW',
                },
            });
        }
        const existingDocs = await this.documentRepo.findByUserAndType(userId, requiredDocumentType);
        const uploadRes = await this.storageAdapter.uploadFile({
            fileName: file.originalname,
            fileBuffer: file.buffer,
            mimeType: file.mimetype,
        });
        const doc = new document_entity_1.DocumentEntity({
            id: (0, crypto_1.randomUUID)(),
            userId,
            documentType: classification.detectedType,
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            storagePath: uploadRes.storagePath,
            verificationStatus: document_entity_1.VerificationStatus.VERIFIED,
        });
        const savedDoc = await this.documentRepo.save(doc);
        await this.prisma.client.ocrResult.upsert({
            where: { documentId: savedDoc.id },
            create: {
                documentId: savedDoc.id,
                rawText: ocrRes.rawText,
                confidenceScore: classification.confidence,
                extractedData: classification.extractedFields || {},
            },
            update: {
                rawText: ocrRes.rawText,
                confidenceScore: classification.confidence,
                extractedData: classification.extractedFields || {},
            },
        });
        if (existingDocs && existingDocs.length > 0) {
            for (const oldDoc of existingDocs) {
                if (oldDoc.id !== savedDoc.id) {
                    try {
                        await this.documentRepo.delete(oldDoc.id);
                        if (oldDoc.storagePath) {
                            await this.storageAdapter.deleteFile(oldDoc.storagePath);
                        }
                    }
                    catch (delErr) {
                        this.logger.warn(`Failed to clean up replaced document ${oldDoc.id}: ${delErr.message}`);
                    }
                }
            }
        }
        return {
            document: savedDoc,
            classification: {
                detectedType: classification.detectedType,
                confidence: classification.confidence,
                status: 'ACCEPTED',
                displayName: scheme_entity_1.DOCUMENT_TYPE_DISPLAY_NAMES[classification.detectedType],
            },
        };
    }
    validateFileSignature(buffer, mimeType) {
        if (!buffer || buffer.length < 4) {
            throw new common_1.BadRequestException('File is empty or corrupted.');
        }
        const isPdf = buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
        const isJpg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
        const isPng = buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
        const isWebp = buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
        const normalizedMime = (mimeType || '').toLowerCase();
        let valid = false;
        if (normalizedMime.includes('pdf') && isPdf)
            valid = true;
        else if ((normalizedMime.includes('jpeg') || normalizedMime.includes('jpg')) && isJpg)
            valid = true;
        else if (normalizedMime.includes('png') && isPng)
            valid = true;
        else if (normalizedMime.includes('webp') && isWebp)
            valid = true;
        else if (!normalizedMime && (isPdf || isJpg || isPng || isWebp))
            valid = true;
        if (!valid) {
            throw new common_1.BadRequestException('File signature mismatch. The uploaded file content does not match a valid PDF, JPEG, PNG, or WEBP document signature.');
        }
    }
    async getUserDocuments(userId) {
        return await this.documentRepo.findByUserId(userId);
    }
    async getDocumentById(userId, id) {
        const doc = await this.documentRepo.findById(id);
        if (!doc || doc.userId !== userId) {
            throw new common_1.NotFoundException(`Document with ID '${id}' not found or access denied.`);
        }
        return doc;
    }
    async deleteDocument(userId, id) {
        const doc = await this.documentRepo.findById(id);
        if (!doc || doc.userId !== userId) {
            throw new common_1.NotFoundException(`Document with ID '${id}' not found or access denied.`);
        }
        if (doc.storagePath) {
            await this.storageAdapter.deleteFile(doc.storagePath);
        }
        await this.documentRepo.delete(id);
    }
};
exports.DocumentService = DocumentService;
exports.DocumentService = DocumentService = DocumentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IDocumentRepository')),
    __metadata("design:paramtypes", [Object, local_storage_adapter_1.LocalStorageAdapter,
        document_classification_service_1.DocumentClassificationService,
        gemini_ai_adapter_1.GeminiAiAdapter,
        prisma_service_1.PrismaService])
], DocumentService);
//# sourceMappingURL=document.service.js.map