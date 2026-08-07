export interface UploadFileOptions {
    fileName: string;
    fileBuffer: Buffer;
    mimeType: string;
    folder?: string;
}
export interface UploadFileResult {
    storagePath: string;
    publicUrl?: string;
    fileSize: number;
}
export interface IStorageProvider {
    readonly providerName: string;
    uploadFile(options: UploadFileOptions): Promise<UploadFileResult>;
    downloadFile(storagePath: string): Promise<Buffer>;
    getPresignedUrl(storagePath: string, expiresInSeconds?: number): Promise<string>;
    deleteFile(storagePath: string): Promise<void>;
}
