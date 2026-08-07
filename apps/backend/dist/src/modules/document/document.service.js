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
exports.DocumentService = void 0;
const common_1 = require("@nestjs/common");
const document_entity_1 = require("../../domain/document/document.entity");
const local_storage_adapter_1 = require("../../infrastructure/storage/local-storage.adapter");
const crypto_1 = require("crypto");
let DocumentService = class DocumentService {
    documentRepo;
    storageAdapter;
    constructor(documentRepo, storageAdapter) {
        this.documentRepo = documentRepo;
        this.storageAdapter = storageAdapter;
    }
    async uploadDocument(userId, documentType, file) {
        const uploadRes = await this.storageAdapter.uploadFile({
            fileName: file.originalname,
            fileBuffer: file.buffer,
            mimeType: file.mimetype,
        });
        const doc = new document_entity_1.DocumentEntity({
            id: (0, crypto_1.randomUUID)(),
            userId,
            documentType,
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            storagePath: uploadRes.storagePath,
            verificationStatus: document_entity_1.VerificationStatus.PENDING,
        });
        return await this.documentRepo.save(doc);
    }
    async getUserDocuments(userId) {
        return await this.documentRepo.findByUserId(userId);
    }
    async getDocumentById(id) {
        const doc = await this.documentRepo.findById(id);
        if (!doc) {
            throw new common_1.NotFoundException(`Document with ID '${id}' not found.`);
        }
        return doc;
    }
};
exports.DocumentService = DocumentService;
exports.DocumentService = DocumentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IDocumentRepository')),
    __metadata("design:paramtypes", [Object, local_storage_adapter_1.LocalStorageAdapter])
], DocumentService);
//# sourceMappingURL=document.service.js.map