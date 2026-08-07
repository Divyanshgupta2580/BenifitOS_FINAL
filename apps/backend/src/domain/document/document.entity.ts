import { BaseDomainEntity } from '../common/domain-entity.base';
import { DocumentType } from '../welfare/scheme.entity';

export enum VerificationStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  MANUAL_REVIEW = 'MANUAL_REVIEW',
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

export class DocumentEntity extends BaseDomainEntity<DocumentProps> {
  private _userId: string;
  private _documentType: DocumentType;
  private _fileName: string;
  private _fileSize: number;
  private _mimeType: string;
  private _storagePath: string;
  private _encryptionKeyRef?: string | null;
  private _verificationStatus: VerificationStatus;
  private _ocrResult?: OcrResultProps | null;

  constructor(props: DocumentProps) {
    super(props.id, props.uploadedAt, props.updatedAt);
    this._userId = props.userId;
    this._documentType = props.documentType;
    this._fileName = props.fileName;
    this._fileSize = props.fileSize;
    this._mimeType = props.mimeType;
    this._storagePath = props.storagePath;
    this._encryptionKeyRef = props.encryptionKeyRef;
    this._verificationStatus = props.verificationStatus;
    this._ocrResult = props.ocrResult;
  }

  public get userId(): string { return this._userId; }
  public get documentType(): DocumentType { return this._documentType; }
  public get fileName(): string { return this._fileName; }
  public get fileSize(): number { return this._fileSize; }
  public get mimeType(): string { return this._mimeType; }
  public get storagePath(): string { return this._storagePath; }
  public get encryptionKeyRef(): string | null | undefined { return this._encryptionKeyRef; }
  public get verificationStatus(): VerificationStatus { return this._verificationStatus; }
  public get ocrResult(): OcrResultProps | null | undefined { return this._ocrResult; }

  public updateVerificationStatus(status: VerificationStatus): void {
    this._verificationStatus = status;
    this._updatedAt = new Date();
  }

  public setOcrResult(ocr: OcrResultProps): void {
    this._ocrResult = ocr;
    this._verificationStatus = VerificationStatus.VERIFIED;
    this._updatedAt = new Date();
  }
}
