import { DocumentClassificationService } from './document-classification.service';
import { DocumentType } from '../../domain/welfare/scheme.entity';

describe('DocumentClassificationService', () => {
  let service: DocumentClassificationService;

  beforeEach(() => {
    service = new DocumentClassificationService();
  });

  const sampleTexts = {
    AADHAAR: 'Government of India Unique Identification Authority of India UIDAI Mera Aadhaar 1234 5678 9012',
    DRIVING_LICENSE: 'Union of India Driving Licence Transport Department DL No DL-1420110012345 Authorisation to drive Motor Vehicles',
    VOTER_ID: 'Election Commission of India Voter ID Elector Photo Identity Card EPIC No ABC1234567 Identity Card Elector',
    BIRTH_CERTIFICATE: 'Municipal Corporation Department of Health Birth Certificate Certificate of Birth Registration of Births Date of Birth 15/08/1995',
    EDUCATIONAL_CERTIFICATE: 'Board of Secondary Education Educational Certificate Marksheet Statement of Marks Passing Certificate Roll No 98765 Grade A Passed',
    DISABILITY_CERTIFICATE: 'Medical Board Disability Certificate Persons with Disabilities Medical Authority Percentage of Disability 50% Benchmark Disability',
    CASTE_CERTIFICATE: 'Government Tehsildar Sub-Divisional Officer Caste Certificate Community Certificate Scheduled Caste OBC Certificate Social Category',
  };

  it('1. Required AADHAAR + actual Aadhaar -> ACCEPT', () => {
    const res = service.classifyDocumentContent(sampleTexts.AADHAAR, DocumentType.AADHAAR);
    expect(res.status).toBe('ACCEPTED');
    expect(res.detectedType).toBe(DocumentType.AADHAAR);
  });

  it('2. Required AADHAAR + actual Driving Licence -> REJECT', () => {
    const res = service.classifyDocumentContent(sampleTexts.DRIVING_LICENSE, DocumentType.AADHAAR);
    expect(res.status).toBe('REJECTED');
    expect(res.detectedType).toBe(DocumentType.DRIVING_LICENSE);
  });

  it('3. Required DRIVING_LICENSE + actual Aadhaar -> REJECT', () => {
    const res = service.classifyDocumentContent(sampleTexts.AADHAAR, DocumentType.DRIVING_LICENSE);
    expect(res.status).toBe('REJECTED');
    expect(res.detectedType).toBe(DocumentType.AADHAAR);
  });

  it('4. Required VOTER_ID + actual Voter ID -> ACCEPT', () => {
    const res = service.classifyDocumentContent(sampleTexts.VOTER_ID, DocumentType.VOTER_ID);
    expect(res.status).toBe('ACCEPTED');
    expect(res.detectedType).toBe(DocumentType.VOTER_ID);
  });

  it('5. Required BIRTH_CERTIFICATE + actual Caste Certificate -> REJECT', () => {
    const res = service.classifyDocumentContent(sampleTexts.CASTE_CERTIFICATE, DocumentType.BIRTH_CERTIFICATE);
    expect(res.status).toBe('REJECTED');
    expect(res.detectedType).toBe(DocumentType.CASTE_CERTIFICATE);
  });

  it('6. Required CASTE_CERTIFICATE + actual Disability Certificate -> REJECT', () => {
    const res = service.classifyDocumentContent(sampleTexts.DISABILITY_CERTIFICATE, DocumentType.CASTE_CERTIFICATE);
    expect(res.status).toBe('REJECTED');
    expect(res.detectedType).toBe(DocumentType.DISABILITY_CERTIFICATE);
  });

  it('7. Required EDUCATIONAL_CERTIFICATE + actual Aadhaar -> REJECT', () => {
    const res = service.classifyDocumentContent(sampleTexts.AADHAAR, DocumentType.EDUCATIONAL_CERTIFICATE);
    expect(res.status).toBe('REJECTED');
    expect(res.detectedType).toBe(DocumentType.AADHAAR);
  });

  it('8. Required DISABILITY_CERTIFICATE + actual Disability Certificate -> ACCEPT', () => {
    const res = service.classifyDocumentContent(sampleTexts.DISABILITY_CERTIFICATE, DocumentType.DISABILITY_CERTIFICATE);
    expect(res.status).toBe('ACCEPTED');
    expect(res.detectedType).toBe(DocumentType.DISABILITY_CERTIFICATE);
  });

  it('9. Filename says "aadhaar.pdf" but content is a driving licence -> MUST REJECT', () => {
    // Content is driving licence text, filename is completely ignored by classifier
    const res = service.classifyDocumentContent(sampleTexts.DRIVING_LICENSE, DocumentType.AADHAAR);
    expect(res.status).toBe('REJECTED');
    expect(res.detectedType).toBe(DocumentType.DRIVING_LICENSE);
  });

  it('10. User submits forged documentType field -> backend ignores claim and classifies actual content', () => {
    const res = service.classifyDocumentContent(sampleTexts.VOTER_ID, DocumentType.AADHAAR);
    expect(res.status).toBe('REJECTED');
    expect(res.detectedType).toBe(DocumentType.VOTER_ID);
  });

  it('11. Low-confidence classification -> MANUAL_REVIEW or REJECTED', () => {
    const randomText = 'Some random unreadable text without any official keywords 12345';
    const res = service.classifyDocumentContent(randomText, DocumentType.AADHAAR);
    expect(res.status).toMatch(/REJECTED|MANUAL_REVIEW/);
  });
});
