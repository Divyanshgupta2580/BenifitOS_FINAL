import { BaseDomainEntity } from '../common/domain-entity.base';
import { DocumentType } from '../welfare/scheme.entity';
export declare enum VerificationStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    VERIFIED = "VERIFIED",
    REJECTED = "REJECTED",
    MANUAL_REVIEW = "MANUAL_REVIEW"
}
export interface OcrResultProps {
    id: string;
    documentId: string;
    rawText: string;
    confidenceScore: number;
    extractedData: Record<string, any>;
    processedAt: Date;
}
export interface DocumentProps {
    id: string;
    userId: string;
    documentType: DocumentType;
    fileName: string;
    fileSize: number;
    mimeType: string;
    storagePath: string;
    encryptionKeyRef?: string | null;
    verificationStatus: VerificationStatus;
    ocrResult?: OcrResultProps | null;
    uploadedAt?: Date;
    updatedAt?: Date;
}
export declare class DocumentEntity extends BaseDomainEntity<DocumentProps> {
    private _userId;
    private _documentType;
    private _fileName;
    private _fileSize;
    private _mimeType;
    private _storagePath;
    private _encryptionKeyRef?;
    private _verificationStatus;
    private _ocrResult?;
    constructor(props: DocumentProps);
    get userId(): string;
    get documentType(): DocumentType;
    get fileName(): string;
    get fileSize(): number;
    get mimeType(): string;
    get storagePath(): string;
    get encryptionKeyRef(): string | null | undefined;
    get verificationStatus(): VerificationStatus;
    get ocrResult(): OcrResultProps | null | undefined;
    updateVerificationStatus(status: VerificationStatus): void;
    setOcrResult(ocr: OcrResultProps): void;
}
