import { Injectable, Logger } from '@nestjs/common';
import { IStorageProvider, UploadFileOptions, UploadFileResult } from '../../domain/storage/storage-provider.interface';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalStorageAdapter implements IStorageProvider {
  readonly providerName = 'local';
  private readonly logger = new Logger(LocalStorageAdapter.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(options: UploadFileOptions): Promise<UploadFileResult> {
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

  async downloadFile(storagePath: string): Promise<Buffer> {
    return await fs.promises.readFile(storagePath);
  }

  async getPresignedUrl(storagePath: string): Promise<string> {
    return `file://${storagePath}`;
  }

  async deleteFile(storagePath: string): Promise<void> {
    if (fs.existsSync(storagePath)) {
      await fs.promises.unlink(storagePath);
    }
  }
}
