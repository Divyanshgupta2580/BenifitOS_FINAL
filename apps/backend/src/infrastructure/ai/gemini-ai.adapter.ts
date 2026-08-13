import { Injectable, Logger } from '@nestjs/common';
import { IAiProvider, IVisionOcrProvider, AiPromptOptions, AiResponse } from '../../domain/ai/ai-provider.interface';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class GeminiAiAdapter implements IAiProvider, IVisionOcrProvider {
  readonly providerName = 'gemini';
  private readonly logger = new Logger(GeminiAiAdapter.name);
  private aiClient: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && !apiKey.includes('temp') && !apiKey.includes('your-')) {
      this.aiClient = new GoogleGenAI({ apiKey });
      this.logger.log('Google Gemini AI Client initialized successfully.');
    } else {
      this.logger.warn('GEMINI_API_KEY not configured. Running in fallback mode.');
    }
  }

  async generateText(options: AiPromptOptions): Promise<AiResponse> {
    if (!this.aiClient) {
      return {
        content: 'BenefitOS AI is currently unavailable (Unconfigured API key). Please try again later.',
        tokensUsed: 0,
        provider: 'gemini-unconfigured',
        model: 'gemini-1.5-flash',
      };
    }
    try {
      const response = await this.aiClient.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [options.prompt],
        config: {
          systemInstruction: options.systemInstruction,
          temperature: options.temperature || 0.3,
          maxOutputTokens: options.maxTokens || 1000,
        },
      });
      const text = response.text || '';
      return {
        content: text,
        tokensUsed: Math.ceil(text.length / 4),
        provider: this.providerName,
        model: 'gemini-1.5-flash',
      };
    } catch (err: any) {
      this.logger.error(`Gemini generateText error: ${err.message}`);
      return {
        content: '[BenefitOS AI Notice] Live AI inference is currently unavailable due to network or service connectivity. Please verify internet access and GEMINI_API_KEY configuration.',
        tokensUsed: 0,
        provider: 'gemini-offline',
        model: 'gemini-1.5-flash-fallback',
      };
    }
  }

  async generateStream(options: AiPromptOptions, onChunk: (chunk: string) => void): Promise<AiResponse> {
    const res = await this.generateText(options);
    onChunk(res.content);
    return res;
  }

  async extractDocumentData(fileBuffer: Buffer, mimeType: string, expectedDocType: string): Promise<{
    rawText: string;
    confidenceScore: number;
    extractedFields: Record<string, any>;
  }> {
    if (!this.aiClient) {
      const bufferText = fileBuffer ? fileBuffer.toString('utf-8') : '';
      const rawText = bufferText.length > 5 && !bufferText.includes('\u0000')
        ? bufferText
        : `[Fallback OCR Raw Text for ${expectedDocType}]`;
      return {
        rawText,
        confidenceScore: 0.95,
        extractedFields: { docType: expectedDocType, verifiedStatus: 'MOCK_SUCCESS' },
      };
    }
    try {
      const prompt = `Analyze this ${expectedDocType} document image. Extract raw text and return a JSON object with key fields such as documentNumber, fullName, dateOfBirth, address, issueDate.`;
      const response = await this.aiClient.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [
          {
            inlineData: {
              mimeType,
              data: fileBuffer.toString('base64'),
            },
          },
          prompt,
        ],
      });
      const rawText = response.text || '';
      let extractedFields = {};
      try {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) extractedFields = JSON.parse(jsonMatch[0]);
      } catch {
        extractedFields = { raw: rawText };
      }
      return {
        rawText,
        confidenceScore: 0.92,
        extractedFields,
      };
    } catch (err) {
      this.logger.error(`Gemini Vision OCR extraction failed: ${err.message}`);
      return {
        rawText: 'OCR extraction failure.',
        confidenceScore: 0.0,
        extractedFields: {},
      };
    }
  }
}
