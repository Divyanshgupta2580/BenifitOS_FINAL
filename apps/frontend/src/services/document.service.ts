import { apiClient } from './api-client';

export interface DocumentItem {
  id: string;
  userId: string;
  documentType: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  verificationStatus: 'PENDING' | 'PROCESSING' | 'VERIFIED' | 'REJECTED' | 'MANUAL_REVIEW';
  uploadedAt: string;
  updatedAt?: string;
}

export interface DocumentsResponse {
  documents: DocumentItem[];
}

export const documentApiService = {
  async getDocuments(): Promise<DocumentsResponse> {
    return await apiClient.get<any, DocumentsResponse>('/documents');
  },

  async getDocumentById(id: string): Promise<{ document: DocumentItem }> {
    return await apiClient.get<any, { document: DocumentItem }>(`/documents/${id}`);
  },

  async uploadDocument(formData: FormData): Promise<{ message: string; document: DocumentItem }> {
    return await apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async deleteDocument(id: string): Promise<{ message: string }> {
    return await apiClient.delete(`/documents/${id}`);
  },
};
