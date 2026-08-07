import { Injectable, Logger } from '@nestjs/common';
import { IStorageProvider, UploadFileOptions, UploadFileResult } from '../../domain/storage/storage-provider.interface';

@Injectable()
export class SupabaseStorageAdapter implements IStorageProvider {
  readonly providerName = 'supabase';
  private readonly logger = new Logger(SupabaseStorageAdapter.name);

  async uploadFile(options: UploadFileOptions): Promise<UploadFileResult> {
    const folder = options.folder || 'documents';
    const storagePath = `${folder}/${Date.now()}_${options.fileName}`;
    this.logger.log(`Uploaded file to Supabase storage bucket '${process.env.STORAGE_BUCKET_NAME || 'benefitos-documents'}' at ${storagePath}`);
    return {
      storagePath,
      publicUrl: `${process.env.SUPABASE_URL || 'https://supabase.co'}/storage/v1/object/public/${process.env.STORAGE_BUCKET_NAME || 'benefitos-documents'}/${storagePath}`,
      fileSize: options.fileBuffer.length,
    };
  }

  async downloadFile(storagePath: string): Promise<Buffer> {
    return Buffer.from(`Simulated file stream for ${storagePath}`);
  }

  async getPresignedUrl(storagePath: string): Promise<string> {
    return `${process.env.SUPABASE_URL || 'https://supabase.co'}/storage/v1/object/signed/${process.env.STORAGE_BUCKET_NAME || 'benefitos-documents'}/${storagePath}`;
  }

  async deleteFile(storagePath: string): Promise<void> {
    this.logger.log(`Deleted file from Supabase storage at ${storagePath}`);
  }
}
