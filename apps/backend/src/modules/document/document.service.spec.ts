import { DocumentService } from './document.service';
import { DocumentClassificationService } from './document-classification.service';
import { DocumentType } from '../../domain/welfare/scheme.entity';
import { BadRequestException } from '@nestjs/common';

describe('DocumentService Unit Tests', () => {
  let service: DocumentService;
  let mockRepo: any;
  let mockStorage: any;
  let mockClassifier: any;
  let mockGemini: any;
  let mockPrisma: any;

  beforeEach(() => {
    mockRepo = {
      save: jest.fn((doc) => Promise.resolve(doc)),
      findByUserAndType: jest.fn().mockResolvedValue([]),
      delete: jest.fn().mockResolvedValue(true),
      findById: jest.fn(),
    };

    mockStorage = {
      uploadFile: jest.fn().mockResolvedValue({ storagePath: 'uploads/test.pdf' }),
    };

    mockClassifier = new DocumentClassificationService();

    mockGemini = {
      extractDocumentData: jest.fn().mockImplementation((buffer, mime, expectedDocType) => {
        const text = buffer ? buffer.toString('utf-8') : '';
        return Promise.resolve({
          rawText: text || `Mock text for ${expectedDocType}`,
          confidenceScore: 0.95,
          extractedFields: {},
        });
      }),
    };

    mockPrisma = {
      client: {
        ocrResult: {
          upsert: jest.fn().mockResolvedValue({}),
        },
      },
    };

    service = new DocumentService(
      mockRepo,
      mockStorage,
      mockClassifier,
      mockGemini,
      mockPrisma,
    );
  });

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

  const aadhaarText = 'Government of India Unique Identification Authority of India UIDAI Mera Aadhaar 1234 5678 9012';
  const dlText = 'Union of India Driving Licence Transport Department DL No DL-1420110012345 Authorisation to drive Motor Vehicles';

  it('should ACCEPT and save document when requested and detected document types match', async () => {
    const file = mockFile(aadhaarText, 'my_aadhaar.pdf');
    const result = await service.uploadDocument('user-123', DocumentType.AADHAAR, file);

    expect(result.classification.status).toBe('ACCEPTED');
    expect(result.classification.detectedType).toBe(DocumentType.AADHAAR);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should REJECT and NOT save document when requested type is AADHAAR but file content is Driving Licence', async () => {
    const file = mockFile(dlText, 'aadhaar.pdf'); // Spoofed filename!

    await expect(
      service.uploadDocument('user-123', DocumentType.AADHAAR, file),
    ).rejects.toThrow(BadRequestException);

    // CRITICAL: Verify document was NOT persisted to repository
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should REJECT and NOT save document when requested type is DRIVING_LICENSE but file content is Aadhaar', async () => {
    const file = mockFile(aadhaarText, 'license.pdf');

    await expect(
      service.uploadDocument('user-123', DocumentType.DRIVING_LICENSE, file),
    ).rejects.toThrow(BadRequestException);

    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
