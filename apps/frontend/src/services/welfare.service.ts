import { apiClient } from './api-client';

export interface EligibilityCriterion {
  id: string;
  attributeKey: string;
  operator: string;
  targetValue: string;
  isRequired: boolean;
  description: string;
}

export interface RequiredDocumentItem {
  id: string;
  documentType: string;
  isMandatory: boolean;
  description: string;
}

export interface WelfareSchemeDetail {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  department: string;
  state?: string;
  isCentralScheme: boolean;
  financialBenefit: number;
  isActive: boolean;
  applicationDeadline?: string;
  eligibilityRules?: EligibilityCriterion[];
  requiredDocuments?: RequiredDocumentItem[];
}

export interface SchemesQueryResponse {
  schemes: WelfareSchemeDetail[];
  total: number;
  page: number;
  limit: number;
}

export const welfareApiService = {
  async getSchemes(params?: { category?: string; search?: string; page?: number; limit?: number }): Promise<SchemesQueryResponse> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const url = `/schemes${query.toString() ? `?${query.toString()}` : ''}`;
    return await apiClient.get(url);
  },

  async getSchemeById(id: string): Promise<{ scheme: WelfareSchemeDetail }> {
    return await apiClient.get(`/schemes/${id}`);
  },
};
