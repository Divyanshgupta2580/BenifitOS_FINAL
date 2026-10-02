import { Injectable, Logger } from '@nestjs/common';
import { IAiProvider, IVisionOcrProvider, AiPromptOptions, AiResponse } from '../../domain/ai/ai-provider.interface';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class GeminiAiAdapter implements IAiProvider, IVisionOcrProvider {
  readonly providerName = 'gemini';
  private readonly logger = new Logger(GeminiAiAdapter.name);
  private aiClient: GoogleGenAI | null = null;
  private guidanceClient: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && !apiKey.includes('temp') && !apiKey.includes('your-')) {
      this.aiClient = new GoogleGenAI({ apiKey });
      this.logger.log('Google Gemini AI Client (Chatbot) initialized successfully.');
    } else {
      this.logger.warn('GEMINI_API_KEY not configured. Running in fallback mode.');
    }

    const guidanceApiKey = process.env.GEMINI_SCHEME_GUIDANCE_API_KEY || apiKey;
    if (guidanceApiKey && !guidanceApiKey.includes('temp') && !guidanceApiKey.includes('your-')) {
      this.guidanceClient = new GoogleGenAI({ apiKey: guidanceApiKey });
      this.logger.log('Google Gemini AI Scheme Guidance Client initialized with dedicated secondary API key.');
    }
  }

  private getModelName(): string {
    return process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  }

  async generateText(options: AiPromptOptions): Promise<AiResponse> {
    const model = this.getModelName();
    const primaryClient = this.aiClient;
    const secondaryClient = this.guidanceClient;

    if (!primaryClient && !secondaryClient) {
      return {
        content: 'AI Copilot is currently offline. Please verify service configuration and try again.',
        tokensUsed: 0,
        provider: 'AI Copilot',
        model: 'AI-Copilot',
      };
    }

    const config = {
      systemInstruction: options.systemInstruction,
      temperature: options.temperature || 0.3,
      maxOutputTokens: options.maxTokens || 8192,
      thinkingConfig: {
        thinkingBudget: 512,
      },
    };

    if (primaryClient) {
      try {
        const response = await primaryClient.models.generateContent({
          model,
          contents: [options.prompt],
          config,
        });
        const text = response.text || '';
        return {
          content: text,
          tokensUsed: Math.ceil(text.length / 4),
          provider: 'AI Copilot',
          model: 'AI-Copilot',
        };
      } catch (primaryErr: any) {
        this.logger.warn(`Primary Gemini client error: ${primaryErr.message}. Attempting secondary guidance client...`);
      }
    }

    if (secondaryClient && secondaryClient !== primaryClient) {
      try {
        const response = await secondaryClient.models.generateContent({
          model,
          contents: [options.prompt],
          config,
        });
        const text = response.text || '';
        return {
          content: text,
          tokensUsed: Math.ceil(text.length / 4),
          provider: 'AI Copilot',
          model: 'AI-Copilot',
        };
      } catch (secondaryErr: any) {
        this.logger.error(`Secondary Gemini client error: ${secondaryErr.message}`);
      }
    }

    return {
      content: 'AI Copilot is temporarily unable to process your request. Please verify your connection or try again shortly.',
      tokensUsed: 0,
      provider: 'AI Copilot',
      model: 'AI-Copilot',
    };
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
    const model = this.getModelName();
    if (!this.aiClient) {
      const bufferText = fileBuffer ? fileBuffer.toString('utf-8') : '';
      const isReadableText = bufferText.length > 5 && !bufferText.includes('\u0000');
      const rawText = isReadableText ? bufferText : '';
      return {
        rawText,
        confidenceScore: isReadableText ? 0.85 : 0.0,
        extractedFields: { docType: expectedDocType, providerStatus: isReadableText ? 'TEXT_STREAM_PARSED' : 'OFFLINE_UNCONFIGURED' },
      };
    }
    try {
      const prompt = `Analyze this ${expectedDocType} document image. Extract raw text and return a JSON object with key fields such as documentNumber, fullName, dateOfBirth, address, issueDate.`;
      const response = await this.aiClient.models.generateContent({
        model,
        contents: [
          {
            inlineData: {
              mimeType,
              data: fileBuffer.toString('base64'),
            },
          },
          prompt,
        ],
        config: {
          maxOutputTokens: 4096,
          thinkingConfig: {
            thinkingBudget: 512,
          },
        },
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
    } catch (err: any) {
      this.logger.error(`Gemini Vision OCR extraction failed: ${err.message}`);
      const bufferText = fileBuffer ? fileBuffer.toString('utf-8') : '';
      const isReadableText = bufferText.length > 5 && !bufferText.includes('\u0000');
      return {
        rawText: isReadableText ? bufferText : '',
        confidenceScore: isReadableText ? 0.85 : 0.0,
        extractedFields: {
          docType: expectedDocType,
          providerStatus: isReadableText ? 'TEXT_STREAM_FALLBACK' : 'OFFLINE_UNCONFIGURED',
          error: err.message,
        },
      };
    }
  }

  async generateSchemeInstructions(options: {
    schemeTitle: string;
    department?: string;
    category?: string;
    description?: string;
    eligibilityRules?: string[];
  }): Promise<string> {
    const client = this.guidanceClient || this.aiClient;
    const model = this.getModelName();
    const prompt = `Provide clear, authoritative, step-by-step instructions on how an Indian citizen can apply for the welfare scheme '${options.schemeTitle}' (${options.category || 'Welfare'}) offered by '${options.department || 'Government Welfare Department'}'.
Scheme Overview: ${options.description || 'Government welfare program for eligible citizens.'}
Eligibility Rules: ${options.eligibilityRules?.join('; ') || 'Standard welfare criteria.'}

Format your response in clean, formal Markdown with clear section headings and bullet points covering:
1. Prerequisites and Document Checklist (Required files and identification proofs)
2. Official Portal Registration and Account Setup (Registration on the government portal)
3. Application Form Details (Step-by-step field guidance)
4. Document Scanning and Upload Guidelines (Accepted formats and size requirements)
5. Final Submission and Acknowledgement Number (Safeguarding application reference ID)
6. Tracking Application Status and Benefit Disbursement (Verification and direct transfer tracking)

IMPORTANT: Do not use emojis, casual language, or marketing claims. Maintain a professional, neutral government portal tone.`;

    if (!client) {
      return `### Step-by-Step Application Guide for ${options.schemeTitle}

1. **Prerequisites and Document Checklist**: Prepare clear copies of your Aadhaar Card, Income Certificate, Domicile Certificate, and Bank Account Passbook.
2. **Official Portal Registration**: Access the official portal using the portal link. Complete registration and verify your mobile number.
3. **Application Form Details**: Enter your personal details, household income, state domicile, and active bank account details for direct benefit transfer.
4. **Upload Required Documents**: Upload scanned copies of required documents in PDF or JPEG format.
5. **Final Submission and Acknowledgement**: Submit your application and save your Application Reference Number for tracking.
6. **Track Status**: Monitor verification status and benefit disbursement timeline on the portal.`;
    }

    try {
      const response = await client.models.generateContent({
        model,
        contents: [prompt],
        config: {
          systemInstruction: 'You are an AI Copilot scheme application specialist. Provide complete, clear, step-by-step instructions without emojis.',
          temperature: 0.2,
          maxOutputTokens: 8192,
          thinkingConfig: {
            thinkingBudget: 512,
          },
        },
      });
      return response.text || '';
    } catch (err: any) {
      this.logger.error(`AI generateSchemeInstructions error: ${err.message}`);
      return `### Step-by-Step Application Guide for ${options.schemeTitle}

1. **Prerequisites and Document Checklist**: Verify Aadhaar, mobile number linked to bank account, and category or income certificate.
2. **Official Portal Registration**: Access the official portal and register with your credentials.
3. **Application Form Details**: Fill personal, income, and occupational details accurately.
4. **Upload Scanned Proofs**: Attach mandatory identity and income proofs.
5. **Final Submission and Acknowledgement**: Submit the form and store the Application Reference ID for tracking.`;
    }
  }
}
