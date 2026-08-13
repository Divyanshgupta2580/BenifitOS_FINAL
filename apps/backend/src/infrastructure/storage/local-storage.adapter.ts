import { Injectable, Logger } from '@nestjs/common';
import { IStorageProvider, UploadFileOptions, UploadFileResult } from '../../domain/storage/storage-provider.interface';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class LocalStorageAdapter implements IStorageProvider {
  readonly providerName = 'local';
  private readonly logger = new Logger(LocalStorageAdapter.name);
  private readonly uploadDir = path.resolve(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  public sanitizeFilename(rawName: string): string {
    if (!rawName) return `file_${Date.now()}`;
    const base = path.basename(rawName);
    const safeName = base.replace(/[\0\r\n\t]/g, '').replace(/[^a-zA-Z0-9._-]/g, '_');
    return safeName || `file_${Date.now()}`;
  }

  private validatePathSafety(targetPath: string): string {
    const resolvedPath = path.resolve(targetPath);
    if (!resolvedPath.startsWith(this.uploadDir)) {
      throw new Error('Access denied: Invalid storage path traversal attempt.');
    }
    return resolvedPath;
  }

  async uploadFile(options: UploadFileOptions): Promise<UploadFileResult> {
    const safeFolder = path.basename(options.folder || 'documents');
    const safeFileName = this.sanitizeFilename(options.fileName);
    const targetFolder = this.validatePathSafety(path.join(this.uploadDir, safeFolder));

    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const uniqueName = `${Date.now()}_${randomUUID().slice(0, 8)}_${safeFileName}`;
    const storagePath = this.validatePathSafety(path.join(targetFolder, uniqueName));

    await fs.promises.writeFile(storagePath, options.fileBuffer);
    this.logger.log(`Uploaded file safely to ${storagePath}`);

    return {
      storagePath,
      publicUrl: `/uploads/${safeFolder}/${path.basename(storagePath)}`,
      fileSize: options.fileBuffer.length,
    };
  }

  async downloadFile(storagePath: string): Promise<Buffer> {
    const safePath = this.validatePathSafety(storagePath);
    return await fs.promises.readFile(safePath);
  }

  async getPresignedUrl(storagePath: string): Promise<string> {
    const safePath = this.validatePathSafety(storagePath);
    return `file://${safePath}`;
  }

  async deleteFile(storagePath: string): Promise<void> {
    const safePath = this.validatePathSafety(storagePath);
    if (fs.existsSync(safePath)) {
      await fs.promises.unlink(safePath);
    }
  }
}
