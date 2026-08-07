"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentEntity = exports.VerificationStatus = void 0;
const domain_entity_base_1 = require("../common/domain-entity.base");
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["PENDING"] = "PENDING";
    VerificationStatus["PROCESSING"] = "PROCESSING";
    VerificationStatus["VERIFIED"] = "VERIFIED";
    VerificationStatus["REJECTED"] = "REJECTED";
    VerificationStatus["MANUAL_REVIEW"] = "MANUAL_REVIEW";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
class DocumentEntity extends domain_entity_base_1.BaseDomainEntity {
    _userId;
    _documentType;
    _fileName;
    _fileSize;
    _mimeType;
    _storagePath;
    _encryptionKeyRef;
    _verificationStatus;
    _ocrResult;
    constructor(props) {
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
    get userId() { return this._userId; }
    get documentType() { return this._documentType; }
    get fileName() { return this._fileName; }
    get fileSize() { return this._fileSize; }
    get mimeType() { return this._mimeType; }
    get storagePath() { return this._storagePath; }
    get encryptionKeyRef() { return this._encryptionKeyRef; }
    get verificationStatus() { return this._verificationStatus; }
    get ocrResult() { return this._ocrResult; }
    updateVerificationStatus(status) {
        this._verificationStatus = status;
        this._updatedAt = new Date();
    }
    setOcrResult(ocr) {
        this._ocrResult = ocr;
        this._verificationStatus = VerificationStatus.VERIFIED;
        this._updatedAt = new Date();
    }
}
exports.DocumentEntity = DocumentEntity;
//# sourceMappingURL=document.entity.js.map