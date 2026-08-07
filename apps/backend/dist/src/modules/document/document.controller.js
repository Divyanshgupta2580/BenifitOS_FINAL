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
exports.DocumentController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const document_service_1 = require("./document.service");
const scheme_entity_1 = require("../../domain/welfare/scheme.entity");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let DocumentController = class DocumentController {
    documentService;
    constructor(documentService) {
        this.documentService = documentService;
    }
    async uploadDocument(userId, documentType, file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded.');
        }
        if (!documentType) {
            throw new common_1.BadRequestException('Document type is required.');
        }
        const doc = await this.documentService.uploadDocument(userId, documentType, file);
        return {
            message: 'Document uploaded successfully.',
            document: {
                id: doc.id,
                documentType: doc.documentType,
                fileName: doc.fileName,
                fileSize: doc.fileSize,
                verificationStatus: doc.verificationStatus,
            },
        };
    }
    async getDocuments(userId) {
        const documents = await this.documentService.getUserDocuments(userId);
        return {
            count: documents.length,
            documents: documents.map((d) => ({
                id: d.id,
                documentType: d.documentType,
                fileName: d.fileName,
                fileSize: d.fileSize,
                verificationStatus: d.verificationStatus,
                uploadedAt: d.createdAt,
            })),
        };
    }
    async getDocumentById(id) {
        const doc = await this.documentService.getDocumentById(id);
        return {
            document: {
                id: doc.id,
                documentType: doc.documentType,
                fileName: doc.fileName,
                fileSize: doc.fileSize,
                verificationStatus: doc.verificationStatus,
                ocrResult: doc.ocrResult,
            },
        };
    }
};
exports.DocumentController = DocumentController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Body)('documentType')),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "getDocuments", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "getDocumentById", null);
exports.DocumentController = DocumentController = __decorate([
    (0, common_1.Controller)('documents'),
    __metadata("design:paramtypes", [document_service_1.DocumentService])
], DocumentController);
//# sourceMappingURL=document.controller.js.map