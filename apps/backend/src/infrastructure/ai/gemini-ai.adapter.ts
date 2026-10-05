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

  private getModelCandidates(): string[] {
    const configured = process.env.GEMINI_MODEL;
    const candidates = [configured, 'gemini-3.5-flash-lite', 'gemini-3.8-flash'].filter(Boolean) as string[];
    return Array.from(new Set(candidates));
  }

  private getModelName(): string {
    return process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  }

  private configuredClients(): GoogleGenAI[] {
    return [this.aiClient, this.guidanceClient].filter(Boolean) as GoogleGenAI[];
  }

  private unavailable(message = 'Gemini is not configured or did not return a response.'): Error {
    return new Error(message);
  }

  async generateText(options: AiPromptOptions): Promise<AiResponse> {
    const clients = this.configuredClients();
    const models = this.getModelCandidates();

    if (clients.length === 0) {
      throw this.unavailable('Gemini is not configured.');
    }

    const config = {
      systemInstruction: options.systemInstruction,
      temperature: options.temperature || 0.3,
      maxOutputTokens: options.maxTokens || 8192,
      thinkingConfig: {
        thinkingBudget: 512,
      },
    };

    for (const client of clients) {
      for (const model of models) {
        try {
          const response = await client.models.generateContent({
            model,
            contents: [options.prompt],
            config,
          });
          const text = response.text || '';
          if (text) {
            return {
              content: text,
              tokensUsed: Math.ceil(text.length / 4),
              provider: 'AI Copilot',
              model,
            };
          }
        } catch (err: any) {
          this.logger.warn(`Gemini client model ${model} attempt failed: ${err.message}. Trying next candidate...`);
        }
      }
    }

    throw this.unavailable('Gemini did not return a usable text response.');
  }

  async generateStream(options: AiPromptOptions, onChunk: (chunk: string) => void): Promise<AiResponse> {
    const clients = this.configuredClients();
    if (clients.length === 0) throw this.unavailable('Gemini is not configured.');

    const config = {
      systemInstruction: options.systemInstruction,
      temperature: options.temperature ?? 0.3,
      maxOutputTokens: options.maxTokens ?? 8192,
      thinkingConfig: { thinkingBudget: 512 },
    };
    let lastError: unknown;
    for (const client of clients) {
      for (const model of this.getModelCandidates()) {
        try {
          const stream = await client.models.generateContentStream({ model, contents: [options.prompt], config });
          let content = '';
          for await (const chunk of stream) {
            const text = chunk.text || '';
            if (text) {
              content += text;
              onChunk(text);
            }
          }
          if (content) return { content, tokensUsed: Math.ceil(content.length / 4), provider: 'AI Copilot', model };
          lastError = new Error('Empty streaming response');
        } catch (error: any) {
          lastError = error;
          this.logger.warn(`Gemini stream model ${model} failed: ${error?.message || error}`);
        }
      }
    }
    throw this.unavailable(`Gemini streaming failed: ${(lastError as Error)?.message || 'unknown error'}`);
  }

  async generateJson<T extends Record<string, unknown>>(options: AiPromptOptions): Promise<T> {
    const result = await this.generateText({
      ...options,
      systemInstruction: `${options.systemInstruction || ''}\nReturn only one JSON object. Do not use Markdown fences or explanatory text.`,
    });
    try {
      const parsed = JSON.parse(result.content.trim());
      if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') throw new Error('Response was not an object');
      return parsed as T;
    } catch (error: any) {
      throw new Error(`Gemini returned malformed JSON: ${error.message}`);
    }
  }

  async extractDocumentData(fileBuffer: Buffer, mimeType: string, expectedDocType: string): Promise<{
    rawText: string;
    confidenceScore: number;
    extractedFields: Record<string, any>;
  }> {
    const model = this.getModelName();
    if (!this.aiClient) throw this.unavailable('Gemini OCR is not configured.');
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
      throw new Error(`Gemini OCR extraction failed: ${err.message}`);
    }
  }

  async generateSchemeInstructions(options: {
    schemeTitle: string;
    department?: string;
    category?: string;
    description?: string;
    eligibilityRules?: string[];
    language?: string;
  }): Promise<string> {
    const clients = [this.guidanceClient, this.aiClient].filter(Boolean) as GoogleGenAI[];
    const models = this.getModelCandidates();
    const isHindi = options.language === 'hi';

    const prompt = isHindi
      ? `कृपया भारतीय नागरिक के लिए कल्याणकारी योजना '${options.schemeTitle}' (${options.category || 'कल्याण'}) जो कि '${options.department || 'सरकारी कल्याण विभाग'}' द्वारा प्रदान की जाती है, के लिए आवेदन करने हेतु स्पष्ट, आधिकारिक और चरणबद्ध निर्देश (Step-by-Step Instructions) शुद्ध एवं स्पष्ट हिंदी (देवनागरी लिपि) में प्रदान करें।
योजना विवरण: ${options.description || 'पात्र नागरिकों के लिए सरकारी कल्याणकारी कार्यक्रम।'}
पात्रता नियम: ${options.eligibilityRules?.join('; ') || 'मानक कल्याणकारी मानदंड।'}

निम्नलिखित मुख्य शीर्षकों के साथ स्पष्ट मार्कडाउन (Markdown) प्रारूप में उत्तर दें:
1. आवश्यक शर्तें एवं दस्तावेज़ चेकलिस्ट (Prerequisites and Document Checklist)
2. आधिकारिक पोर्टल पंजीकरण एवं खाता निर्माण (Official Portal Registration)
3. आवेदन पत्र भरने के निर्देश (Application Form Details)
4. दस्तावेज़ स्कैन एवं अपलोड दिशानिर्देश (Document Upload Guidelines)
5. अंतिम सबमिशन एवं पावती संदर्भ संख्या (Final Submission and Reference Number)
6. आवेदन स्थिति एवं लाभ वितरण ट्रैकिंग (Status Tracking and DBT Disbursement)

महत्वपूर्ण: किसी भी इमोजी (emojis) का उपयोग न करें। पूरी तरह से सरल, स्वाभाविक और शुद्ध हिंदी (देवनागरी) में लिखें।`
      : `Provide clear, authoritative, step-by-step instructions on how an Indian citizen can apply for the welfare scheme '${options.schemeTitle}' (${options.category || 'Welfare'}) offered by '${options.department || 'Government Welfare Department'}'.
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

    if (clients.length === 0) throw this.unavailable('Gemini is not configured.');

    const config = {
      systemInstruction: isHindi
        ? 'You are an AI Copilot scheme application specialist. Provide complete, clear, step-by-step instructions in Hindi (Devanagari script) without emojis.'
        : 'You are an AI Copilot scheme application specialist. Provide complete, clear, step-by-step instructions without emojis.',
      temperature: 0.2,
      maxOutputTokens: 8192,
      thinkingConfig: {
        thinkingBudget: 512,
      },
    };

    for (const client of clients) {
      for (const model of models) {
        try {
          const response = await client.models.generateContent({
            model,
            contents: [prompt],
            config,
          });
          const text = response.text || '';
          if (text) {
            return text;
          }
        } catch (err: any) {
          this.logger.warn(`AI generateSchemeInstructions attempt failed on model ${model}: ${err.message}. Trying next candidate...`);
        }
      }
    }

    throw this.unavailable('Gemini did not return scheme instructions.');
  }
}
