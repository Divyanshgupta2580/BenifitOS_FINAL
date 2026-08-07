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
var LocalStorageAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageAdapter = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
let LocalStorageAdapter = LocalStorageAdapter_1 = class LocalStorageAdapter {
    providerName = 'local';
    logger = new common_1.Logger(LocalStorageAdapter_1.name);
    uploadDir = path.join(process.cwd(), 'uploads');
    constructor() {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }
    async uploadFile(options) {
        const folder = options.folder || 'documents';
        const targetFolder = path.join(this.uploadDir, folder);
        if (!fs.existsSync(targetFolder)) {
            fs.mkdirSync(targetFolder, { recursive: true });
        }
        const storagePath = path.join(targetFolder, `${Date.now()}_${options.fileName}`);
        await fs.promises.writeFile(storagePath, options.fileBuffer);
        this.logger.log(`Uploaded file locally to ${storagePath}`);
        return {
            storagePath,
            publicUrl: `/uploads/${folder}/${path.basename(storagePath)}`,
            fileSize: options.fileBuffer.length,
        };
    }
    async downloadFile(storagePath) {
        return await fs.promises.readFile(storagePath);
    }
    async getPresignedUrl(storagePath) {
        return `file://${storagePath}`;
    }
    async deleteFile(storagePath) {
        if (fs.existsSync(storagePath)) {
            await fs.promises.unlink(storagePath);
        }
    }
};
exports.LocalStorageAdapter = LocalStorageAdapter;
exports.LocalStorageAdapter = LocalStorageAdapter = LocalStorageAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], LocalStorageAdapter);
//# sourceMappingURL=local-storage.adapter.js.map