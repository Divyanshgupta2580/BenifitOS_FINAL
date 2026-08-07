import { apiClient } from './api-client';

export interface CitizenProfileResponse {
  profile: {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    age: number;
    gender: string;
    maritalStatus: string;
    socialCategory: string;
    employmentStatus: string;
    annualIncomeINR: number;
    disabilityType: string;
    disabilityPercent: number;
    isBplCardHolder: boolean;
    bplCardNumber?: string;
    completionPercentage: number;
    address?: {
      streetAddress: string;
      city: string;
      district: string;
      state: string;
      pincode: string;
      isRural: boolean;
    };
    householdMembers?: Array<{
      id: string;
      fullName: string;
      relation: string;
      age: number;
      gender: string;
      annualIncomeINR: number;
    }>;
    landDetails?: Array<{
      id: string;
      landSizeAcres: number;
      landType: string;
      surveyNumber?: string;
      district: string;
      state: string;
    }>;
  };
}

export interface UpdateDemographicsDto {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  socialCategory: string;
  employmentStatus: string;
  annualIncomeINR: number;
  disabilityType: string;
  disabilityPercent: number;
  isBplCardHolder: boolean;
  bplCardNumber?: string;
  address?: {
    streetAddress: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    isRural: boolean;
  };
  householdMembers?: Array<{
    id?: string;
    fullName: string;
    relation: string;
    age: number;
    gender: string;
    annualIncomeINR: number;
  }>;
  landDetails?: Array<{
    id?: string;
    landSizeAcres: number;
    landType: string;
    surveyNumber?: string;
    district: string;
    state: string;
  }>;
}

export const citizenApiService = {
  async getProfile(): Promise<CitizenProfileResponse> {
    return await apiClient.get('/citizens/me');
  },

  async updateProfile(dto: UpdateDemographicsDto): Promise<CitizenProfileResponse> {
    return await apiClient.put('/citizens/me', dto);
  },
};
