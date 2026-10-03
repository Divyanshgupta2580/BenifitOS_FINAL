import { apiClient } from './api-client';

export type ServiceStatus = 'CONNECTED' | 'NOT_CONNECTED' | 'VERIFIED' | 'PENDING_VERIFICATION' | 'NOT_VERIFIED' | 'UNAVAILABLE';
export type ConnectionHealth = 'HEALTHY' | 'DEGRADED' | 'DISCONNECTED';

export interface GovernmentServiceItem {
  id: string;
  code: string;
  name: string;
  category: 'IDENTITY' | 'DOCUMENTS' | 'HEALTH' | 'AGRICULTURE' | 'LABOUR' | 'CIVIL';
  status: ServiceStatus;
  lastSynced?: string;
  health: ConnectionHealth;
  description: string;
  icon: string;
  officialPortalUrl?: string;
}

export const INITIAL_GOVERNMENT_SERVICES: GovernmentServiceItem[] = [
  {
    id: 'gov-1',
    code: 'AADHAAR',
    name: 'Aadhaar UIDAI Gateway',
    category: 'IDENTITY',
    status: 'NOT_CONNECTED',
    health: 'DISCONNECTED',
    description: 'Unique Identification Authority of India e-KYC identity gateway',
    icon: 'id-card',
    officialPortalUrl: 'https://myaadhaar.uidai.gov.in',
  },
  {
    id: 'gov-2',
    code: 'DIGILOCKER',
    name: 'DigiLocker National Vault',
    category: 'DOCUMENTS',
    status: 'NOT_CONNECTED',
    health: 'DISCONNECTED',
    description: 'Ministry of Electronics & IT Digital Document Repository gateway',
    icon: 'folder',
    officialPortalUrl: 'https://www.digilocker.gov.in',
  },
  {
    id: 'gov-3',
    code: 'ABHA',
    name: 'ABHA Ayushman Bharat Health Account',
    category: 'HEALTH',
    status: 'UNAVAILABLE',
    health: 'DISCONNECTED',
    description: 'National Health Authority Digital Health Identity ID (Integration pending external credentials)',
    icon: 'health',
    officialPortalUrl: 'https://abha.abdm.gov.in',
  },
  {
    id: 'gov-4',
    code: 'PM_KISAN',
    name: 'PM-KISAN Samman Nidhi Portal',
    category: 'AGRICULTURE',
    status: 'UNAVAILABLE',
    health: 'DISCONNECTED',
    description: 'Direct Benefit Transfer Agricultural Landholder Account portal',
    icon: 'agriculture',
    officialPortalUrl: 'https://pmkisan.gov.in',
  },
  {
    id: 'gov-5',
    code: 'E_SHRAM',
    name: 'e-Shram National Database',
    category: 'LABOUR',
    status: 'UNAVAILABLE',
    health: 'DISCONNECTED',
    description: 'Ministry of Labour Unorganised Workers Identification Portal',
    icon: 'labour',
    officialPortalUrl: 'https://eshram.gov.in',
  },
  {
    id: 'gov-6',
    code: 'UMANG',
    name: 'UMANG Unified Mobile App',
    category: 'IDENTITY',
    status: 'UNAVAILABLE',
    health: 'DISCONNECTED',
    description: 'Unified Mobile Application for New-age Governance Gateway',
    icon: 'mobile',
    officialPortalUrl: 'https://web.umang.gov.in',
  },
  {
    id: 'gov-7',
    code: 'PASSPORT',
    name: 'Passport Seva Kendra Portal',
    category: 'CIVIL',
    status: 'UNAVAILABLE',
    health: 'DISCONNECTED',
    description: 'Consular Passport & Visa Division Integration Portal',
    icon: 'passport',
    officialPortalUrl: 'https://passportindia.gov.in',
  },
  {
    id: 'gov-8',
    code: 'VOTER_ID',
    name: 'NVSP Voter ID ECI Portal',
    category: 'IDENTITY',
    status: 'UNAVAILABLE',
    health: 'DISCONNECTED',
    description: 'Election Commission of India EPIC Electoral Verification',
    icon: 'voter',
    officialPortalUrl: 'https://voters.eci.gov.in',
  },
  {
    id: 'gov-9',
    code: 'PAN',
    name: 'NSDL Income Tax PAN Portal',
    category: 'IDENTITY',
    status: 'UNAVAILABLE',
    health: 'DISCONNECTED',
    description: 'Permanent Account Number Tax Identity Verification',
    icon: 'card',
    officialPortalUrl: 'https://incometax.gov.in',
  },
  {
    id: 'gov-10',
    code: 'DRIVING_LICENCE',
    name: 'Parivahan Sarathi DL Registry',
    category: 'CIVIL',
    status: 'UNAVAILABLE',
    health: 'DISCONNECTED',
    description: 'Ministry of Road Transport & Highways DL Portal',
    icon: 'vehicle',
    officialPortalUrl: 'https://parivahan.gov.in/parivahan',
  },
  {
    id: 'gov-11',
    code: 'INCOME_CERT',
    name: 'State Revenue Income Registry',
    category: 'DOCUMENTS',
    status: 'UNAVAILABLE',
    health: 'DISCONNECTED',
    description: 'State E-District Revenue Income Certificate Portal',
    icon: 'document',
    officialPortalUrl: 'https://services.india.gov.in',
  },
  {
    id: 'gov-12',
    code: 'CASTE_CERT',
    name: 'State Caste & Tribe Registry',
    category: 'DOCUMENTS',
    status: 'UNAVAILABLE',
    health: 'DISCONNECTED',
    description: 'Social Welfare Caste Certificate Verification Gateway',
    icon: 'building',
    officialPortalUrl: 'https://services.india.gov.in',
  },
  {
    id: 'gov-13',
    code: 'DOMICILE_CERT',
    name: 'State Residence Domicile Registry',
    category: 'DOCUMENTS',
    status: 'UNAVAILABLE',
    health: 'DISCONNECTED',
    description: 'E-District Native Domicile & Residence Registry',
    icon: 'home',
    officialPortalUrl: 'https://services.india.gov.in',
  },
  {
    id: 'gov-14',
    code: 'BIRTH_CERT',
    name: 'Civil Registration Birth System',
    category: 'CIVIL',
    status: 'UNAVAILABLE',
    health: 'DISCONNECTED',
    description: 'Vital Statistics Birth Registration Certificate Registry',
    icon: 'child',
    officialPortalUrl: 'https://crsorgi.gov.in',
  },
  {
    id: 'gov-15',
    code: 'DEATH_CERT',
    name: 'Civil Registration Death System',
    category: 'CIVIL',
    status: 'UNAVAILABLE',
    health: 'DISCONNECTED',
    description: 'Vital Statistics Death Registration Certificate Portal',
    icon: 'registry',
    officialPortalUrl: 'https://crsorgi.gov.in',
  },
];

export const governmentApiService = {
  async getIntegrationStatus(): Promise<GovernmentServiceItem[]> {
    return INITIAL_GOVERNMENT_SERVICES;
  },

  async requestAadhaarOtp(aadhaarNumber: string): Promise<{ txnId: string; message: string }> {
    return await apiClient.post('/integrations/aadhaar/request-otp', { aadhaarNumber });
  },

  async verifyAadhaarOtp(txnId: string, otp: string): Promise<{ message: string; result: any }> {
    return await apiClient.post('/integrations/aadhaar/verify-otp', { txnId, otp });
  },

  async getDigiLockerAuthUrl(): Promise<{ redirectUrl: string }> {
    return await apiClient.get('/integrations/digilocker/authorize');
  },

  async syncService(serviceId: string): Promise<{ success: boolean; lastSynced: string }> {
    return {
      success: true,
      lastSynced: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
  },

  async disconnectService(serviceId: string): Promise<{ success: boolean }> {
    return { success: true };
  },
};
