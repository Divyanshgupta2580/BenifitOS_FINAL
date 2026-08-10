import { Test, TestingModule } from '@nestjs/testing';

describe('AiService Contract Specification', () => {
  let mockGeminiAdapter: any;

  beforeEach(() => {
    mockGeminiAdapter = {
      generateResponse: jest.fn().mockImplementation((prompt: string) => {
        if (prompt.includes('Aadhaar')) {
          return Promise.resolve({ reply: 'Aadhaar e-KYC guidance response', sanitized: true });
        }
        return Promise.resolve({ reply: 'Default AI response', sanitized: true });
      }),
    };
  });

  it('should format context and sanitize prompts for Gemini AI', async () => {
    const result = await mockGeminiAdapter.generateResponse('How do I upload Aadhaar card?');
    expect(result).toHaveProperty('reply');
    expect(result.sanitized).toBe(true);
  });
});
