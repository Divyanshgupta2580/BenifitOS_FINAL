import { apiClient } from './api-client';

export interface OcrResultItem {
  id: string;
  documentId: string;
  rawText: string;
  confidenceScore: number;
  extractedData: Record<string, any>;
  processedAt: string;
}

export interface OcrResponse {
  result: OcrResultItem;
}

export const ocrApiService = {
  async processDocument(documentId: string): Promise<OcrResponse> {
    return await apiClient.post<any, OcrResponse>(`/ocr/process/${documentId}`, {});
  },

  async getOcrResult(documentId: string): Promise<OcrResponse> {
    return await apiClient.get<any, OcrResponse>(`/ocr/${documentId}`);
  },

  async confirmOcr(documentId: string, confirmedFields: Record<string, any>): Promise<{ message: string; documentId: string; confirmedData: any; verificationStatus: string }> {
    return await apiClient.post(`/ocr/confirm/${documentId}`, { confirmedFields });
  },
};
