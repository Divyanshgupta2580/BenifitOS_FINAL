import { IStorageProvider, UploadFileOptions, UploadFileResult } from '../../domain/storage/storage-provider.interface';
export declare class SupabaseStorageAdapter implements IStorageProvider {
    readonly providerName = "supabase";
    private readonly logger;
    uploadFile(options: UploadFileOptions): Promise<UploadFileResult>;
    downloadFile(storagePath: string): Promise<Buffer>;
    getPresignedUrl(storagePath: string): Promise<string>;
    deleteFile(storagePath: string): Promise<void>;
}
