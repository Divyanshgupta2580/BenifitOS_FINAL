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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrPipelineService = void 0;
const common_1 = require("@nestjs/common");
const gemini_ai_adapter_1 = require("../../infrastructure/ai/gemini-ai.adapter");
const local_storage_adapter_1 = require("../../infrastructure/storage/local-storage.adapter");
const prisma_service_1 = require("../../infrastructure/database/prisma.service");
let OcrPipelineService = class OcrPipelineService {
    documentRepo;
    geminiAdapter;
    storageAdapter;
    prisma;
    constructor(documentRepo, geminiAdapter, storageAdapter, prisma) {
        this.documentRepo = documentRepo;
        this.geminiAdapter = geminiAdapter;
        this.storageAdapter = storageAdapter;
        this.prisma = prisma;
    }
    async processDocumentOcr(documentId) {
        const doc = await this.documentRepo.findById(documentId);
        if (!doc) {
            throw new common_1.NotFoundException(`Document with ID '${documentId}' not found.`);
        }
        const fileBuffer = await this.storageAdapter.downloadFile(doc.storagePath);
        const ocrResult = await this.geminiAdapter.extractDocumentData(fileBuffer, doc.mimeType, doc.documentType);
        await this.prisma.client.ocrResult.upsert({
            where: { documentId: doc.id },
            create: {
                documentId: doc.id,
                rawText: ocrResult.rawText,
                confidenceScore: ocrResult.confidenceScore,
                extractedData: ocrResult.extractedFields,
            },
            update: {
                rawText: ocrResult.rawText,
                confidenceScore: ocrResult.confidenceScore,
                extractedData: ocrResult.extractedFields,
            },
        });
        return {
            documentId: doc.id,
            confidenceScore: ocrResult.confidenceScore,
            extractedFields: ocrResult.extractedFields,
        };
    }
};
exports.OcrPipelineService = OcrPipelineService;
exports.OcrPipelineService = OcrPipelineService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IDocumentRepository')),
    __metadata("design:paramtypes", [Object, gemini_ai_adapter_1.GeminiAiAdapter,
        local_storage_adapter_1.LocalStorageAdapter,
        prisma_service_1.PrismaService])
], OcrPipelineService);
//# sourceMappingURL=ocr.service.js.map