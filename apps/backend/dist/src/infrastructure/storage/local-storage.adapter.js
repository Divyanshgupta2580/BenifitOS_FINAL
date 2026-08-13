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
const crypto_1 = require("crypto");
let LocalStorageAdapter = LocalStorageAdapter_1 = class LocalStorageAdapter {
    providerName = 'local';
    logger = new common_1.Logger(LocalStorageAdapter_1.name);
    uploadDir = path.resolve(process.cwd(), 'uploads');
    constructor() {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }
    sanitizeFilename(rawName) {
        if (!rawName)
            return `file_${Date.now()}`;
        const base = path.basename(rawName);
        const safeName = base.replace(/[\0\r\n\t]/g, '').replace(/[^a-zA-Z0-9._-]/g, '_');
        return safeName || `file_${Date.now()}`;
    }
    validatePathSafety(targetPath) {
        const resolvedPath = path.resolve(targetPath);
        if (!resolvedPath.startsWith(this.uploadDir)) {
            throw new Error('Access denied: Invalid storage path traversal attempt.');
        }
        return resolvedPath;
    }
    async uploadFile(options) {
        const safeFolder = path.basename(options.folder || 'documents');
        const safeFileName = this.sanitizeFilename(options.fileName);
        const targetFolder = this.validatePathSafety(path.join(this.uploadDir, safeFolder));
        if (!fs.existsSync(targetFolder)) {
            fs.mkdirSync(targetFolder, { recursive: true });
        }
        const uniqueName = `${Date.now()}_${(0, crypto_1.randomUUID)().slice(0, 8)}_${safeFileName}`;
        const storagePath = this.validatePathSafety(path.join(targetFolder, uniqueName));
        await fs.promises.writeFile(storagePath, options.fileBuffer);
        this.logger.log(`Uploaded file safely to ${storagePath}`);
        return {
            storagePath,
            publicUrl: `/uploads/${safeFolder}/${path.basename(storagePath)}`,
            fileSize: options.fileBuffer.length,
        };
    }
    async downloadFile(storagePath) {
        const safePath = this.validatePathSafety(storagePath);
        return await fs.promises.readFile(safePath);
    }
    async getPresignedUrl(storagePath) {
        const safePath = this.validatePathSafety(storagePath);
        return `file://${safePath}`;
    }
    async deleteFile(storagePath) {
        const safePath = this.validatePathSafety(storagePath);
        if (fs.existsSync(safePath)) {
            await fs.promises.unlink(safePath);
        }
    }
};
exports.LocalStorageAdapter = LocalStorageAdapter;
exports.LocalStorageAdapter = LocalStorageAdapter = LocalStorageAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], LocalStorageAdapter);
//# sourceMappingURL=local-storage.adapter.js.map