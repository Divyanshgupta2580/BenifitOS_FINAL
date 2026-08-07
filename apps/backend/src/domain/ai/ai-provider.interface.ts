export interface AiPromptOptions {
  prompt: string;
  systemInstruction?: string;
  contextData?: Record<string, any>;
  temperature?: number;
  maxTokens?: number;
}

export interface AiResponse {
  content: string;
  tokensUsed: number;
  provider: string;
  model: string;
}

export interface IAiProvider {
  readonly providerName: string;
  generateText(options: AiPromptOptions): Promise<AiResponse>;
  generateStream(options: AiPromptOptions, onChunk: (chunk: string) => void): Promise<AiResponse>;
}

export interface IVisionOcrProvider {
  readonly providerName: string;
  extractDocumentData(fileBuffer: Buffer, mimeType: string, expectedDocType: string): Promise<{
    rawText: string;
    confidenceScore: number;
    extractedFields: Record<string, any>;
  }>;
}

export interface ISpeechToTextProvider {
  readonly providerName: string;
  transcribeAudio(audioBuffer: Buffer, languageCode?: string): Promise<{
    transcript: string;
    detectedLanguage: string;
    confidence: number;
  }>;
}
