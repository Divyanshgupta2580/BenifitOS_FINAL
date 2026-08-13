import { DocumentClassificationService } from '../src/modules/document/document-classification.service';
import { DocumentService } from '../src/modules/document/document.service';
import { DocumentType } from '../src/domain/welfare/scheme.entity';

async function runTests() {
  console.log('====================================================');
  console.log('  BENEFITOS — DOCUMENT TYPE VALIDATION & TEST RUNNER');
  console.log('====================================================\n');

  const classifier = new DocumentClassificationService();

  const mockRepo = {
    save: (doc: any) => Promise.resolve(doc),
    findByUserAndType: () => Promise.resolve([]),
    delete: () => Promise.resolve(true),
    findById: () => Promise.resolve(null),
  };

  const mockStorage = {
    uploadFile: () => Promise.resolve({ storagePath: 'uploads/test.pdf' }),
  };

  const mockGemini = {
    extractDocumentData: (buffer: Buffer, mime: string, expectedDocType: string) => {
      const text = buffer ? buffer.toString('utf-8') : '';
      return Promise.resolve({
        rawText: text || `Mock text for ${expectedDocType}`,
        confidenceScore: 0.95,
        extractedFields: {},
      });
    },
  };

  const mockPrisma = {
    client: {
      ocrResult: {
        upsert: () => Promise.resolve({}),
      },
    },
  };

  const documentService = new DocumentService(
    mockRepo as any,
    mockStorage as any,
    classifier,
    mockGemini as any,
    mockPrisma as any,
  );

  const sampleTexts = {
    AADHAAR: 'Government of India Unique Identification Authority of India UIDAI Mera Aadhaar 1234 5678 9012',
    DRIVING_LICENSE: 'Union of India Driving Licence Transport Department DL No DL-1420110012345 Authorisation to drive Motor Vehicles',
    VOTER_ID: 'Election Commission of India Voter ID Elector Photo Identity Card EPIC No ABC1234567 Identity Card Elector',
    BIRTH_CERTIFICATE: 'Municipal Corporation Department of Health Birth Certificate Certificate of Birth Registration of Births Date of Birth 15/08/1995',
    EDUCATIONAL_CERTIFICATE: 'Board of Secondary Education Educational Certificate Marksheet Statement of Marks Passing Certificate Roll No 98765 Grade A Passed',
    DISABILITY_CERTIFICATE: 'Medical Board Disability Certificate Persons with Disabilities Medical Authority Percentage of Disability 50% Benchmark Disability',
    CASTE_CERTIFICATE: 'Government Tehsildar Sub-Divisional Officer Caste Certificate Community Certificate Scheduled Caste OBC Certificate Social Category',
  };

  const mockFile = (content: string, filename = 'document.pdf'): Express.Multer.File => ({
    fieldname: 'file',
    originalname: filename,
    encoding: '7bit',
    mimetype: 'application/pdf',
    buffer: Buffer.from(content),
    size: content.length,
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
  });

  let passCount = 0;
  let failCount = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failCount++;
    }
  }

  // 1. Required AADHAAR + actual Aadhaar -> ACCEPT
  const t1 = classifier.classifyDocumentContent(sampleTexts.AADHAAR, DocumentType.AADHAAR);
  assert(t1.status === 'ACCEPTED' && t1.detectedType === DocumentType.AADHAAR, '1. Required AADHAAR + actual Aadhaar -> ACCEPT');

  // 2. Required AADHAAR + actual Driving Licence -> REJECT
  const t2 = classifier.classifyDocumentContent(sampleTexts.DRIVING_LICENSE, DocumentType.AADHAAR);
  assert(t2.status === 'REJECTED' && t2.detectedType === DocumentType.DRIVING_LICENSE, '2. Required AADHAAR + actual Driving Licence -> REJECT');

  // 3. Required DRIVING_LICENSE + actual Aadhaar -> REJECT
  const t3 = classifier.classifyDocumentContent(sampleTexts.AADHAAR, DocumentType.DRIVING_LICENSE);
  assert(t3.status === 'REJECTED' && t3.detectedType === DocumentType.AADHAAR, '3. Required DRIVING_LICENSE + actual Aadhaar -> REJECT');

  // 4. Required VOTER_ID + actual Voter ID -> ACCEPT
  const t4 = classifier.classifyDocumentContent(sampleTexts.VOTER_ID, DocumentType.VOTER_ID);
  assert(t4.status === 'ACCEPTED' && t4.detectedType === DocumentType.VOTER_ID, '4. Required VOTER_ID + actual Voter ID -> ACCEPT');

  // 5. Required BIRTH_CERTIFICATE + actual Caste Certificate -> REJECT
  const t5 = classifier.classifyDocumentContent(sampleTexts.CASTE_CERTIFICATE, DocumentType.BIRTH_CERTIFICATE);
  assert(t5.status === 'REJECTED' && t5.detectedType === DocumentType.CASTE_CERTIFICATE, '5. Required BIRTH_CERTIFICATE + actual Caste Certificate -> REJECT');

  // 6. Required CASTE_CERTIFICATE + actual Disability Certificate -> REJECT
  const t6 = classifier.classifyDocumentContent(sampleTexts.DISABILITY_CERTIFICATE, DocumentType.CASTE_CERTIFICATE);
  assert(t6.status === 'REJECTED' && t6.detectedType === DocumentType.DISABILITY_CERTIFICATE, '6. Required CASTE_CERTIFICATE + actual Disability Certificate -> REJECT');

  // 7. Required EDUCATIONAL_CERTIFICATE + actual Aadhaar -> REJECT
  const t7 = classifier.classifyDocumentContent(sampleTexts.AADHAAR, DocumentType.EDUCATIONAL_CERTIFICATE);
  assert(t7.status === 'REJECTED' && t7.detectedType === DocumentType.AADHAAR, '7. Required EDUCATIONAL_CERTIFICATE + actual Aadhaar -> REJECT');

  // 8. Required DISABILITY_CERTIFICATE + actual Disability Certificate -> ACCEPT
  const t8 = classifier.classifyDocumentContent(sampleTexts.DISABILITY_CERTIFICATE, DocumentType.DISABILITY_CERTIFICATE);
  assert(t8.status === 'ACCEPTED' && t8.detectedType === DocumentType.DISABILITY_CERTIFICATE, '8. Required DISABILITY_CERTIFICATE + actual Disability Certificate -> ACCEPT');

  // 9. Filename says "aadhaar.pdf" but content is a driving licence -> MUST REJECT
  const t9 = classifier.classifyDocumentContent(sampleTexts.DRIVING_LICENSE, DocumentType.AADHAAR);
  assert(t9.status === 'REJECTED' && t9.detectedType === DocumentType.DRIVING_LICENSE, '9. Filename says "aadhaar.pdf" but content is driving licence -> MUST REJECT');

  // 10. User submits forged documentType field -> backend ignores claim and classifies actual document
  const t10 = classifier.classifyDocumentContent(sampleTexts.VOTER_ID, DocumentType.AADHAAR);
  assert(t10.status === 'REJECTED' && t10.detectedType === DocumentType.VOTER_ID, '10. User submits forged documentType field -> backend ignores claim & classifies content');

  // 11. Low-confidence classification -> MANUAL_REVIEW or REJECTED
  const t11 = classifier.classifyDocumentContent('Random unreadable content 999', DocumentType.AADHAAR);
  assert(t11.status === 'REJECTED' || t11.status === 'MANUAL_REVIEW', '11. Low-confidence classification -> MANUAL_REVIEW or REJECTED');

  // Storage Rule test: DocumentService upload prevents saving mismatched document
  let uploadMismatchedSaved = false;
  let uploadMatchedSaved = false;

  const mockSaveSpyRepo = {
    ...mockRepo,
    save: (doc: any) => {
      uploadMismatchedSaved = true;
      return Promise.resolve(doc);
    },
  };
  const testService = new DocumentService(
    mockSaveSpyRepo as any,
    mockStorage as any,
    classifier,
    mockGemini as any,
    mockPrisma as any,
  );

  try {
    await testService.uploadDocument('user-1', DocumentType.AADHAAR, mockFile(sampleTexts.DRIVING_LICENSE, 'aadhaar.pdf'));
  } catch (err) {
    // Expected exception on mismatch
  }
  assert(!uploadMismatchedSaved, 'Storage Rule: Mismatched upload attempt rejected without saving to database');

  mockSaveSpyRepo.save = (doc: any) => {
    uploadMatchedSaved = true;
    return Promise.resolve(doc);
  };
  try {
    await testService.uploadDocument('user-1', DocumentType.AADHAAR, mockFile(sampleTexts.AADHAAR, 'my_aadhaar.pdf'));
  } catch (err) {
    // Should not throw
  }
  assert(uploadMatchedSaved, 'Storage Rule: Matched upload accepted and persisted with correct document type');

  console.log('\n----------------------------------------------------');
  console.log(`SUMMARY: ${passCount} PASSED, ${failCount} FAILED out of ${passCount + failCount} tests.`);
  console.log('----------------------------------------------------');

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests();
