import { IStorageProvider, UploadFileOptions, UploadFileResult } from '../../domain/storage/storage-provider.interface';
export declare class LocalStorageAdapter implements IStorageProvider {
    readonly providerName = "local";
    private readonly logger;
    private readonly uploadDir;
    constructor();
    uploadFile(options: UploadFileOptions): Promise<UploadFileResult>;
    downloadFile(storagePath: string): Promise<Buffer>;
    getPresignedUrl(storagePath: string): Promise<string>;
    deleteFile(storagePath: string): Promise<void>;
}
