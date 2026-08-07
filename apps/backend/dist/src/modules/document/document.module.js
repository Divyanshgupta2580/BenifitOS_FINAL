"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentModule = void 0;
const common_1 = require("@nestjs/common");
const document_controller_1 = require("./document.controller");
const document_service_1 = require("./document.service");
const document_repository_1 = require("../../infrastructure/database/repositories/document.repository");
const local_storage_adapter_1 = require("../../infrastructure/storage/local-storage.adapter");
const prisma_service_1 = require("../../infrastructure/database/prisma.service");
let DocumentModule = class DocumentModule {
};
exports.DocumentModule = DocumentModule;
exports.DocumentModule = DocumentModule = __decorate([
    (0, common_1.Module)({
        controllers: [document_controller_1.DocumentController],
        providers: [
            document_service_1.DocumentService,
            local_storage_adapter_1.LocalStorageAdapter,
            prisma_service_1.PrismaService,
            { provide: 'IDocumentRepository', useClass: document_repository_1.DocumentRepositoryImpl },
        ],
        exports: [document_service_1.DocumentService, local_storage_adapter_1.LocalStorageAdapter, 'IDocumentRepository'],
    })
], DocumentModule);
//# sourceMappingURL=document.module.js.map