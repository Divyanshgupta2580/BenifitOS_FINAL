import { apiClient } from './api-client';

export interface AiChatDto {
  prompt: string;
  context?: Record<string, any>;
}

export interface AiChatResponse {
  reply: string;
  provider: string;
}

export interface ExplainRecommendationDto {
  schemeTitle: string;
  matchPercentage: number;
  criteriaMet: string[];
  missingCriteria: string[];
}

export interface ExplainRecommendationResponse {
  explanation: string;
}

export const aiApiService = {
  async sendChatMessage(dto: AiChatDto): Promise<AiChatResponse> {
    return await apiClient.post('/ai/chat', dto);
  },

  async explainRecommendation(dto: ExplainRecommendationDto): Promise<ExplainRecommendationResponse> {
    return await apiClient.post('/ai/explain-recommendation', dto);
  },
};
