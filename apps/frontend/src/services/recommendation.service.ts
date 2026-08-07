import { apiClient } from './api-client';

export interface SchemeRecommendationItem {
  id: string;
  citizenProfileId: string;
  schemeId: string;
  title?: string;
  code?: string;
  category?: string;
  department?: string;
  matchPercentage: number;
  estimatedBenefit: number;
  isEligible: boolean;
  confidenceScore?: number;
  criteriaMet: string[];
  missingCriteria: string[];
  missingDocuments: string[];
  calculatedAt?: string;
  scheme?: {
    id: string;
    code: string;
    title: string;
    description: string;
    category: string;
    department: string;
    financialBenefit: number;
  };
}

export interface RecommendationsResponse {
  recommendations: SchemeRecommendationItem[];
}

export const recommendationApiService = {
  async getRecommendations(): Promise<RecommendationsResponse> {
    return await apiClient.get<any, RecommendationsResponse>('/recommendations');
  },

  async getRecommendationById(id: string): Promise<SchemeRecommendationItem | null> {
    const res = await apiClient.get<any, RecommendationsResponse>('/recommendations');
    const match = res.recommendations?.find((r: SchemeRecommendationItem) => r.id === id || r.schemeId === id);
    return match || null;
  },

  async compareRecommendations(ids: string[]): Promise<SchemeRecommendationItem[]> {
    const res = await apiClient.get<any, RecommendationsResponse>('/recommendations');
    return (res.recommendations || []).filter((r: SchemeRecommendationItem) => ids.includes(r.id) || ids.includes(r.schemeId));
  },
};
