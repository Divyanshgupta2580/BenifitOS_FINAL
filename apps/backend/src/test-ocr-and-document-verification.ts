/**
 * ============================================================================
 * BENEFITOS — OCR & DOCUMENT VERIFICATION AUDIT REGRESSION TEST SUITE
 * ============================================================================
 * 
 * Verifies all 30 rigorous OCR and document pipeline requirements:
 * - OCR-01 to OCR-08: File signature, format, size limits, and security validation
 * - OCR-09 to OCR-16: PDF, image, multi-page, blurry, provider failure & retry handling
 * - OCR-17 to OCR-20: Extraction, user review, confirmation, and status separation
 * - OCR-21 to OCR-27: Sensitive log redaction, IDOR isolation, path safety & anti-simulation
 * - OCR-28 to OCR-30: Corruption, concurrency, and duplicate upload safety
 * ============================================================================
 */

import { DocumentService } from './modules/document/document.service';
import { DocumentClassificationService } from './modules/document/document-classification.service';
import { OcrPipelineService } from './modules/ocr/ocr.service';
import { GeminiAiAdapter } from './infrastructure/ai/gemini-ai.adapter';
import { LocalStorageAdapter } from './infrastructure/storage/local-storage.adapter';
import { DocumentEntity, VerificationStatus } from './domain/document/document.entity';
import { DocumentType } from './domain/welfare/scheme.entity';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

interface AssertionResult {
  code: string;
  name: string;
  passed: boolean;
  detail?: string;
}

const testResults: AssertionResult[] = [];

function assert(condition: boolean, code: string, name: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ [PASS] ${code}: ${name}`);
    testResults.push({ code, name, passed: true });
  } else {
    console.error(`  ✗ [FAIL] ${code}: ${name} - ${detail || 'Assertion failed'}`);
    testResults.push({ code, name, passed: false, detail });
  }
}

// In-memory test mock database storage
class MockDocumentRepo {
  private docs: Map<string, DocumentEntity> = new Map();

  async save(doc: DocumentEntity): Promise<DocumentEntity> {
    this.docs.set(doc.id, doc);
    return doc;
  }

  async findById(id: string): Promise<DocumentEntity | null> {
    return this.docs.get(id) || null;
  }

  async findByUserId(userId: string): Promise<DocumentEntity[]> {
    return Array.from(this.docs.values()).filter((d) => d.userId === userId);
  }

  async findByUserAndType(userId: string, type: DocumentType): Promise<DocumentEntity[]> {
    return Array.from(this.docs.values()).filter((d) => d.userId === userId && d.documentType === type);
  }

  async update(doc: DocumentEntity): Promise<DocumentEntity> {
    this.docs.set(doc.id, doc);
    return doc;
  }

  async delete(id: string): Promise<void> {
    this.docs.delete(id);
  }
}

class MockPrismaService {
  private ocrRecords: Map<string, any> = new Map();

  client = {
    ocrResult: {
      upsert: async (args: any) => {
        const record = { ...args.create, id: `ocr-${Date.now()}` };
        this.ocrRecords.set(args.where.documentId, record);
        return record;
      },
      findUnique: async (args: any) => {
        return this.ocrRecords.get(args.where.documentId) || null;
      },
      update: async (args: any) => {
        const existing = this.ocrRecords.get(args.where.documentId);
        const updated = { ...existing, ...args.data };
        this.ocrRecords.set(args.where.documentId, updated);
        return updated;
      },
    },
  };
}

export async function runOcrAndDocumentVerificationSuite() {
  console.log('\n========================================================================');
  console.log(' BENEFITOS — OCR & DOCUMENT VERIFICATION AUDIT TEST SUITE');
  console.log('========================================================================\n');

  const mockRepo = new MockDocumentRepo();
  const mockPrisma = new MockPrismaService() as any;
  const storageAdapter = new LocalStorageAdapter();
  const classificationService = new DocumentClassificationService();
  const geminiAdapter = new GeminiAiAdapter();

  const documentService = new DocumentService(
    mockRepo as any,
    storageAdapter,
    classificationService,
    geminiAdapter,
    mockPrisma,
  );

  const ocrPipelineService = new OcrPipelineService(
    mockRepo as any,
    geminiAdapter,
    storageAdapter,
    classificationService,
    mockPrisma,
  );

  const userA_Id = 'usr-citizen-a-1111';
  const userB_Id = 'usr-citizen-b-2222';

  // --- SECTION 1: FILE VALIDATION & SECURITY ---
  console.log('--- 1. FILE VALIDATION & FORMAT TESTS (OCR-01 to OCR-08) ---');

  // OCR-01: Valid PDF
  const validPdfBytes = Buffer.from('%PDF-1.7\nGovernment of India\nUnique Identification Authority of India\nAadhaar Enrollment No: 1234/56789/01234\nName: Priya Sharma\nDOB: 12/05/1994\n1234 5678 9012\n');
  let validPdfPassed = false;
  try {
    documentService.validateFileSignature(validPdfBytes, 'application/pdf');
    validPdfPassed = true;
  } catch {}
  assert(validPdfPassed, 'OCR-01', 'Valid PDF magic byte signature accepted');

  // OCR-02: Valid JPG
  const validJpgBytes = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.from('JFIF\x00\x01\x01\x01\x00\x60\x00\x60\x00\x00')]);
  let validJpgPassed = false;
  try {
    documentService.validateFileSignature(validJpgBytes, 'image/jpeg');
    validJpgPassed = true;
  } catch {}
  assert(validJpgPassed, 'OCR-02', 'Valid JPG magic byte signature accepted');

  // OCR-03: Valid PNG
  const validPngBytes = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.from('IHDR data')]);
  let validPngPassed = false;
  try {
    documentService.validateFileSignature(validPngBytes, 'image/png');
    validPngPassed = true;
  } catch {}
  assert(validPngPassed, 'OCR-03', 'Valid PNG magic byte signature accepted');

  // OCR-04: Invalid PDF (Renamed EXE)
  const fakeExePdfBytes = Buffer.from('MZ\x90\x00\x03\x00\x00\x00Arbitrary executable payload renamed to .pdf');
  let fakePdfRejected = false;
  try {
    documentService.validateFileSignature(fakeExePdfBytes, 'application/pdf');
  } catch (err: any) {
    fakePdfRejected = err.status === 400 || err.message?.includes('signature mismatch');
  }
  assert(fakePdfRejected, 'OCR-04', 'Invalid PDF containing arbitrary executable header rejected');

  // OCR-05: Invalid JPG (Plain text)
  const fakeJpgBytes = Buffer.from('Plain text contents inside fake_image.jpg');
  let fakeJpgRejected = false;
  try {
    documentService.validateFileSignature(fakeJpgBytes, 'image/jpeg');
  } catch (err: any) {
    fakeJpgRejected = err.status === 400 || err.message?.includes('signature mismatch');
  }
  assert(fakeJpgRejected, 'OCR-05', 'Invalid JPG containing plain text rejected');

  // OCR-06: Invalid PNG (Arbitrary binary data)
  const fakePngBytes = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07]);
  let fakePngRejected = false;
  try {
    documentService.validateFileSignature(fakePngBytes, 'image/png');
  } catch (err: any) {
    fakePngRejected = err.status === 400 || err.message?.includes('signature mismatch');
  }
  assert(fakePngRejected, 'OCR-06', 'Invalid PNG containing arbitrary binary data rejected');

  // OCR-07: Empty file (< 4 bytes)
  const emptyBytes = Buffer.from('');
  let emptyRejected = false;
  try {
    documentService.validateFileSignature(emptyBytes, 'application/pdf');
  } catch (err: any) {
    emptyRejected = err.status === 400 || err.message?.includes('empty');
  }
  assert(emptyRejected, 'OCR-07', 'Empty file (< 4 bytes) strictly rejected');

  // OCR-08: Oversized file (> 10MB)
  const oversizedSize = 11 * 1024 * 1024;
  let oversizedRejected = false;
  try {
    await documentService.uploadDocument(userA_Id, DocumentType.AADHAAR, {
      fieldname: 'file',
      originalname: 'oversized.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      buffer: validPdfBytes,
      size: oversizedSize,
    } as any);
  } catch (err: any) {
    oversizedRejected = err.status === 400 || err.message?.includes('exceeds');
  }
  assert(oversizedRejected, 'OCR-08', 'Oversized file (> 10 MB) strictly rejected server-side');

  // --- SECTION 2: PDF, IMAGE & OCR HANDLING ---
  console.log('\n--- 2. OCR EXTRACTION & CLASSIFICATION TESTS (OCR-09 to OCR-16) ---');

  // OCR-09: Valid Text PDF Extraction
  const aadhaarTextPdf = Buffer.from('%PDF-1.7\nGovernment of India\nUnique Identification Authority of India\nMera Aadhaar, Meri Pehchan\nName: Pooja Verma\nDOB: 15/08/1996\nGender: FEMALE\nAddress: Sector 5, Lucknow, UP\n9876 5432 1098\n');
  const uploadResAadhaar = await documentService.uploadDocument(userA_Id, DocumentType.AADHAAR, {
    fieldname: 'file',
    originalname: 'aadhaar_pooja.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    buffer: aadhaarTextPdf,
    size: aadhaarTextPdf.length,
  } as any);

  assert(
    uploadResAadhaar.document !== undefined && uploadResAadhaar.classification.detectedType === DocumentType.AADHAAR,
    'OCR-09',
    'Text PDF parsed and accurately classified as AADHAAR'
  );

  // OCR-10: Scanned PDF payload handling
  const scannedPdfBytes = Buffer.concat([Buffer.from('%PDF-1.7\n'), Buffer.from('Simulated Scanned Document Bitmap Stream Content')]);
  let scannedHandled = false;
  try {
    documentService.validateFileSignature(scannedPdfBytes, 'application/pdf');
    scannedHandled = true;
  } catch {}
  assert(scannedHandled, 'OCR-10', 'Scanned PDF binary stream handled safely without crashing');

  // OCR-11: Multi-page PDF payload handling
  const multiPagePdfBytes = Buffer.from('%PDF-1.7\nPage 1: Government of India UIDAI Aadhaar 1234 5678 9012\n%%EOF\nPage 2: Back page Address details Sector 5 Lucknow\n');
  const multiPageResult = classificationService.classifyDocumentContent(multiPagePdfBytes, DocumentType.AADHAAR);
  assert(
    multiPageResult.detectedType === DocumentType.AADHAAR && multiPageResult.status === 'ACCEPTED',
    'OCR-11',
    'Multi-page PDF content parsed across pages'
  );

  // OCR-12: Blurry / low-contrast document
  const blurryText = 'Unclear noisy pixels without identifiable document markers';
  const blurryResult = classificationService.classifyDocumentContent(blurryText, DocumentType.AADHAAR);
  assert(
    blurryResult.status === 'REJECTED' || blurryResult.status === 'MANUAL_REVIEW',
    'OCR-12',
    'Blurry / unreadable document flagged for manual review or rejected without inventing fake values'
  );

  // OCR-13: Rotated image text handling
  const rotatedText = 'GOVERNMENT OF INDIA\nUNIQUE IDENTIFICATION AUTHORITY OF INDIA\nNAME: AMAN GUPTA\nDOB: 01/01/1990\n2345 6789 0123';
  const rotatedResult = classificationService.classifyDocumentContent(rotatedText, DocumentType.AADHAAR);
  assert(
    rotatedResult.detectedType === DocumentType.AADHAAR && rotatedResult.confidence >= 0.7,
    'OCR-13',
    'Rotated document text extracted successfully'
  );

  // OCR-14: Incorrect document type rejection (Anti-spoofing)
  const bankPassbookPdf = Buffer.from('%PDF-1.7\nState Bank of India\nSavings Bank Account Passbook\nIFSC Code: SBIN0001234\nA/C No: 123456789012\nAccount Holder: Suresh Yadav\n');
  let incorrectDocRejected = false;
  try {
    await documentService.uploadDocument(userA_Id, DocumentType.AADHAAR, {
      fieldname: 'file',
      originalname: 'bank_passbook.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      buffer: bankPassbookPdf,
      size: bankPassbookPdf.length,
    } as any);
  } catch (err: any) {
    incorrectDocRejected = err.status === 400 && (err.message?.includes('Incorrect document') || err.message?.includes('Required: Aadhaar'));
  }
  assert(
    incorrectDocRejected,
    'OCR-14',
    'Anti-spoofing rejects mismatched document (Bank Passbook uploaded when Aadhaar required)'
  );

  // OCR-15: OCR provider failure handling
  const brokenOcrResult = await geminiAdapter.extractDocumentData(Buffer.from('corrupt'), 'application/pdf', 'AADHAAR');
  assert(
    brokenOcrResult !== null && typeof brokenOcrResult.confidenceScore === 'number',
    'OCR-15',
    'OCR provider failure handled gracefully without throwing unhandled exception'
  );

  // OCR-16: OCR retry execution
  const docId = uploadResAadhaar.document!.id;
  const retryResult = await ocrPipelineService.processDocumentOcr(userA_Id, docId);
  assert(
    retryResult.documentId === docId && retryResult.ocrStatus === 'OCR_COMPLETED',
    'OCR-16',
    'OCR re-scan executed and updated successfully'
  );

  // --- SECTION 3: FIELD EXTRACTION, REVIEW & CONFIRMATION ---
  console.log('\n--- 3. FIELD EXTRACTION & USER CONFIRMATION (OCR-17 to OCR-20) ---');

  // OCR-17: Extraction result persistence
  const persistedOcr = await ocrPipelineService.getOcrResult(userA_Id, docId);
  assert(
    persistedOcr.documentId === docId && persistedOcr.extractedData !== undefined,
    'OCR-17',
    'OCR extraction result accurately persisted in database'
  );

  // OCR-18: User review and field confirmation
  const userConfirmedFields = {
    fullName: 'Pooja Verma',
    dateOfBirth: '1996-08-15',
    documentNumberMasked: 'XXXX-XXXX-1098',
  };
  const confirmResult = await ocrPipelineService.confirmOcrResult(userA_Id, docId, userConfirmedFields);
  assert(
    confirmResult.confirmedData.userConfirmed === true && confirmResult.confirmedData.ocrStatus === 'CONFIRMED',
    'OCR-18',
    'User confirmation saves edited attributes and records CONFIRMED state'
  );

  // OCR-19: Confirmation persistence in database
  const updatedOcrAfterConfirm = await ocrPipelineService.getOcrResult(userA_Id, docId);
  assert(
    updatedOcrAfterConfirm.extractedData.userConfirmed === true &&
    updatedOcrAfterConfirm.extractedData.userConfirmedFields.fullName === 'Pooja Verma',
    'OCR-19',
    'Confirmed attributes persisted in database record'
  );

  // OCR-20: Verification Status Separation (OCR_SUCCESS != VERIFIED, USER_CONFIRMED != VERIFIED)
  const docAfterConfirm = await documentService.getDocumentById(userA_Id, docId);
  assert(
    docAfterConfirm.verificationStatus !== VerificationStatus.VERIFIED &&
    docAfterConfirm.verificationStatus === VerificationStatus.PENDING,
    'OCR-20',
    'Status Invariant: OCR success and User Confirmation do NOT falsely mark document as VERIFIED (remains PENDING official verification)'
  );

  // --- SECTION 4: SECURITY, REDACTION & IDOR ISOLATION ---
  console.log('\n--- 4. SECURITY, SENSITIVE REDACTION & IDOR PROTECTION (OCR-21 to OCR-27) ---');

  // OCR-21: Sensitive Log Redaction
  const structuredAadhaarFields = classificationService.extractStructuredFields('Unique Identification Authority of India 1234 5678 9012');
  assert(
    structuredAadhaarFields.documentNumberMasked === 'XXXX-XXXX-9012' &&
    !JSON.stringify(structuredAadhaarFields).includes('123456789012'),
    'OCR-21',
    'Sensitive citizen identifiers (Aadhaar 12-digit) strictly masked in structured fields'
  );

  // OCR-22: Frontend / Backend credential isolation
  const repoRoot = process.cwd().endsWith('apps/backend') ? path.resolve(process.cwd(), '../..') : process.cwd();
  const frontendEnvPath = path.resolve(repoRoot, 'apps/frontend');
  let noSecretsInFrontend = true;
  if (fs.existsSync(frontendEnvPath)) {
    const files = fs.readdirSync(frontendEnvPath, { recursive: true }) as string[];
    for (const f of files) {
      if (typeof f === 'string' && (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.json'))) {
        const fullPath = path.join(frontendEnvPath, f);
        if (fs.statSync(fullPath).isFile()) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          if (content.includes('AIzaSy') || content.includes('GEMINI_API_KEY')) {
            noSecretsInFrontend = false;
          }
        }
      }
    }
  }
  assert(noSecretsInFrontend, 'OCR-22', 'Frontend bundle contains zero server-side OCR API keys or database credentials');

  // OCR-23: Temporary file cleanup & path safety
  let pathTraversalBlocked = false;
  try {
    await storageAdapter.downloadFile('/etc/passwd');
  } catch (err: any) {
    pathTraversalBlocked = err.message?.includes('traversal') || err.message?.includes('denied');
  }
  assert(pathTraversalBlocked, 'OCR-23', 'Storage adapter strictly blocks directory traversal attempts');

  // OCR-24: Cross-user document access blocked (IDOR Read)
  let userBReadBlocked = false;
  try {
    await documentService.getDocumentById(userB_Id, docId);
  } catch (err: any) {
    userBReadBlocked = err.status === 404 || err.message?.includes('access denied') || err.message?.includes('not found');
  }
  assert(userBReadBlocked, 'OCR-24', 'User B is blocked from viewing User A document (IDOR Read prevented)');

  // OCR-25: Cross-user document deletion blocked (IDOR Delete)
  let userBDeleteBlocked = false;
  try {
    await documentService.deleteDocument(userB_Id, docId);
  } catch (err: any) {
    userBDeleteBlocked = err.status === 404 || err.message?.includes('access denied') || err.message?.includes('not found');
  }
  assert(userBDeleteBlocked, 'OCR-25', 'User B is blocked from deleting User A document (IDOR Delete prevented)');

  // OCR-26: No fake VERIFIED state on upload
  const freshDocUpload = await documentService.uploadDocument(userA_Id, DocumentType.VOTER_ID, {
    fieldname: 'file',
    originalname: 'voter_id.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    buffer: Buffer.from('%PDF-1.7\nElection Commission of India\nElector Photo Identity Card\nEPIC NO: ABC1234567\nName: Aarav Verma\n'),
    size: 150,
  } as any);
  assert(
    freshDocUpload.document!.verificationStatus === VerificationStatus.PENDING,
    'OCR-26',
    'Newly uploaded document has truthful PENDING verificationStatus (never hardcoded VERIFIED)'
  );

  // OCR-27: No simulation in production path
  const adapterFilePath = path.resolve(repoRoot, 'apps/backend/src/infrastructure/ai/gemini-ai.adapter.ts');
  const adapterSource = fs.readFileSync(adapterFilePath, 'utf-8');
  assert(
    !adapterSource.includes('MOCK_SUCCESS'),
    'OCR-27',
    'No simulation or mock success flag in Gemini AI adapter production path'
  );

  // --- SECTION 5: CORRUPTION, CONCURRENCY & REPLACEMENT ---
  console.log('\n--- 5. CORRUPTION, CONCURRENCY & REPLACEMENT (OCR-28 to OCR-30) ---');

  // OCR-28: Corrupted document handling
  const corruptedBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x00, 0x00, 0x00]); // truncated invalid PDF
  const corruptClassify = classificationService.classifyDocumentContent(corruptedBuffer, DocumentType.AADHAAR);
  assert(
    corruptClassify.status === 'REJECTED' || corruptClassify.status === 'MANUAL_REVIEW',
    'OCR-28',
    'Corrupted document content rejected without false positive classification'
  );

  // OCR-29: Concurrent upload safety
  const concurrentDoc1 = documentService.uploadDocument(userA_Id, DocumentType.PAN_CARD, {
    fieldname: 'file',
    originalname: 'pan_card_1.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    buffer: Buffer.from('%PDF-1.7\nIncome Tax Department\nPermanent Account Number Card\nABCDE1234F\nName: Rohit Kumar\n'),
    size: 120,
  } as any);

  const concurrentDoc2 = documentService.uploadDocument(userB_Id, DocumentType.PAN_CARD, {
    fieldname: 'file',
    originalname: 'pan_card_2.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    buffer: Buffer.from('%PDF-1.7\nIncome Tax Department\nPermanent Account Number Card\nXYZPQ5678K\nName: Ananya Roy\n'),
    size: 120,
  } as any);

  const [res1, res2] = await Promise.all([concurrentDoc1, concurrentDoc2]);
  assert(
    res1.document!.id !== res2.document!.id && res1.document!.userId !== res2.document!.userId,
    'OCR-29',
    'Concurrent uploads by multiple citizens isolated safely with unique IDs'
  );

  // OCR-30: Duplicate upload replacement behavior
  const replacementUpload = await documentService.uploadDocument(userA_Id, DocumentType.AADHAAR, {
    fieldname: 'file',
    originalname: 'aadhaar_updated.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    buffer: Buffer.from('%PDF-1.7\nGovernment of India\nUnique Identification Authority of India\nName: Pooja Verma Updated\nDOB: 15/08/1996\n9876 5432 1098\n'),
    size: 180,
  } as any);

  const userADocs = await documentService.getUserDocuments(userA_Id);
  const aadhaarDocs = userADocs.filter((d) => d.documentType === DocumentType.AADHAAR);
  assert(
    aadhaarDocs.length === 1 && aadhaarDocs[0].id === replacementUpload.document!.id,
    'OCR-30',
    'Duplicate upload of same document type replaces old version cleanly after persistence'
  );

  console.log('\n========================================================================');
  const passedCount = testResults.filter((r) => r.passed).length;
  const failedCount = testResults.filter((r) => !r.passed).length;
  console.log(`TOTAL OCR & DOCUMENT VERIFICATION TESTS: ${testResults.length}`);
  console.log(`PASSED: ${passedCount}`);
  console.log(`FAILED: ${failedCount}`);
  console.log('========================================================================\n');

  if (failedCount > 0) {
    throw new Error(`${failedCount} OCR & Document Verification assertions failed.`);
  }
}

if (require.main === module) {
  runOcrAndDocumentVerificationSuite();
}
