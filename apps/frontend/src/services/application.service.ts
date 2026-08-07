import { apiClient } from './api-client';

export interface ApplicationItem {
  id: string;
  applicationNumber: string;
  citizenProfileId: string;
  schemeId: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'DOCUMENT_VERIFICATION' | 'APPROVED' | 'REJECTED' | 'DISBURSED';
  formData: Record<string, any>;
  attachedDocumentIds: string[];
  submittedAt?: string;
  updatedAt: string;
  scheme?: {
    id: string;
    code: string;
    title: string;
    category: string;
    department: string;
    financialBenefit: number;
  };
  timelineEvents?: Array<{
    title: string;
    timestamp: string;
    status: string;
    notes?: string;
  }>;
  officerRemarks?: string;
  disbursementDetails?: {
    accountNumberMasked: string;
    ifscCode: string;
    transactionReference: string;
    disbursedAmountINR: number;
    disbursedAt: string;
  };
}

export interface ApplicationsResponse {
  applications: ApplicationItem[];
}

export const applicationApiService = {
  async getApplications(): Promise<ApplicationsResponse> {
    return await apiClient.get<any, ApplicationsResponse>('/applications');
  },

  async getApplicationById(id: string): Promise<{ application: ApplicationItem }> {
    return await apiClient.get<any, { application: ApplicationItem }>(`/applications/${id}`);
  },

  async createApplication(data: { schemeId: string; formData?: Record<string, any>; attachedDocumentIds?: string[] }): Promise<{ message: string; application: ApplicationItem }> {
    return await apiClient.post('/applications', data);
  },

  async updateApplication(id: string, data: { status?: string; formData?: Record<string, any>; attachedDocumentIds?: string[] }): Promise<{ message: string; application: ApplicationItem }> {
    return await apiClient.put(`/applications/${id}`, data);
  },
};
