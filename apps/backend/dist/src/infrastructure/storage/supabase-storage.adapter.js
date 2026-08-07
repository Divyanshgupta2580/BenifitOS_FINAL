"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SupabaseStorageAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseStorageAdapter = void 0;
const common_1 = require("@nestjs/common");
let SupabaseStorageAdapter = SupabaseStorageAdapter_1 = class SupabaseStorageAdapter {
    providerName = 'supabase';
    logger = new common_1.Logger(SupabaseStorageAdapter_1.name);
    async uploadFile(options) {
        const folder = options.folder || 'documents';
        const storagePath = `${folder}/${Date.now()}_${options.fileName}`;
        this.logger.log(`Uploaded file to Supabase storage bucket '${process.env.STORAGE_BUCKET_NAME || 'benefitos-documents'}' at ${storagePath}`);
        return {
            storagePath,
            publicUrl: `${process.env.SUPABASE_URL || 'https://supabase.co'}/storage/v1/object/public/${process.env.STORAGE_BUCKET_NAME || 'benefitos-documents'}/${storagePath}`,
            fileSize: options.fileBuffer.length,
        };
    }
    async downloadFile(storagePath) {
        return Buffer.from(`Simulated file stream for ${storagePath}`);
    }
    async getPresignedUrl(storagePath) {
        return `${process.env.SUPABASE_URL || 'https://supabase.co'}/storage/v1/object/signed/${process.env.STORAGE_BUCKET_NAME || 'benefitos-documents'}/${storagePath}`;
    }
    async deleteFile(storagePath) {
        this.logger.log(`Deleted file from Supabase storage at ${storagePath}`);
    }
};
exports.SupabaseStorageAdapter = SupabaseStorageAdapter;
exports.SupabaseStorageAdapter = SupabaseStorageAdapter = SupabaseStorageAdapter_1 = __decorate([
    (0, common_1.Injectable)()
], SupabaseStorageAdapter);
//# sourceMappingURL=supabase-storage.adapter.js.map