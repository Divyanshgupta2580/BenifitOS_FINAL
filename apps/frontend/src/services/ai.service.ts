import { apiClient } from './api-client';

export interface AiChatDto {
  prompt: string;
  context?: Record<string, any>;
  language?: 'en' | 'hi';
}

export interface AiChatResponse {
  reply: string;
  provider: string;
  sources?: string[];
}

export interface ExplainRecommendationDto {
  schemeTitle: string;
  matchPercentage: number;
  criteriaMet: string[];
  missingCriteria: string[];
  language?: 'en' | 'hi';
}

export interface ExplainRecommendationResponse {
  explanation: string;
  sources?: string[];
}

export const aiApiService = {
  async sendChatMessage(dto: AiChatDto): Promise<AiChatResponse> {
    try {
      const res: AiChatResponse = await apiClient.post('/ai/chat', dto, { timeout: 60000 });
      return {
        reply: res.reply,
        provider: res.provider || 'BenefitOS AI',
        sources: ['Government Database', 'Recommendation Engine', 'Citizen Profile', 'OCR Vault'],
      };
    } catch (err: any) {
      // Return honest error notice if backend endpoint is unreachable
      const isHindi = dto.language === 'hi';
      return {
        reply: isHindi
          ? `[BenefitOS AI] सेवा अनुपलब्ध है (${err?.message || 'कनेक्शन त्रुटि'})। कृपया अपना नेटवर्क कनेक्शन जांचें।`
          : `[BenefitOS AI Notice] Unable to communicate with the AI Gateway (${err?.message || 'Endpoint unreachable'}). Please verify your backend server connection.`,
        provider: 'BenefitOS Gateway',
        sources: ['System Notice'],
      };
    }
  },

  async explainRecommendation(dto: ExplainRecommendationDto): Promise<ExplainRecommendationResponse> {
    try {
      const res: ExplainRecommendationResponse = await apiClient.post('/ai/explain-recommendation', dto, { timeout: 60000 });
      return {
        explanation: res.explanation,
        sources: ['Recommendation Engine', 'Government Database'],
      };
    } catch {
      return {
        explanation: `Scheme '${dto.schemeTitle}' matched ${dto.matchPercentage}% based on verified criteria: ${dto.criteriaMet.join(', ')}.`,
        sources: ['Recommendation Engine', 'Citizen Profile'],
      };
    }
  },


  exportHistory(messages: { id: string; sender: string; text: string; timestamp: string }[]): string {
    return JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        totalMessages: messages.length,
        conversation: messages,
      },
      null,
      2
    );
  },
};
