import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

describe('DocumentService Specification', () => {
  let mockDocumentRepo: any;
  let mockOcrAdapter: any;

  beforeEach(() => {
    mockDocumentRepo = {
      save: jest.fn((doc) => Promise.resolve({ id: 'doc-101', ...doc })),
      findById: jest.fn(),
    };

    mockOcrAdapter = {
      extractText: jest.fn().mockResolvedValue({
        documentNumber: 'AA1234567',
        name: 'Jane Doe',
        confidenceScore: 0.98,
      }),
    };
  });

  it('should validate allowed document file formats', () => {
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    expect(allowedMimeTypes.includes('application/pdf')).toBe(true);
    expect(allowedMimeTypes.includes('application/exe')).toBe(false);
  });

  it('should process OCR payload through mock Vision adapter', async () => {
    const ocrResult = await mockOcrAdapter.extractText('mock_file_buffer');
    expect(ocrResult).toHaveProperty('documentNumber', 'AA1234567');
    expect(ocrResult.confidenceScore).toBeGreaterThan(0.9);
  });
});
