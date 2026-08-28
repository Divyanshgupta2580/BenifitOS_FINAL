import { useCitizenProfile } from './useCitizenProfile';
import { useDocuments } from './useDocuments';
import { useGovernmentServices } from './useGovernmentServices';

export interface VerificationStatus {
  isProfileVerified: boolean;
  profileCompletionPercentage: number;
  profileName: string;
  isAadhaarLinked: boolean;
  isDigiLockerSynced: boolean;
  isVaultLinked: boolean;
  documentCount: number;
  isDatabaseLinked: boolean;
  activeSources: string[];
}

export const useVerificationSources = (): VerificationStatus => {
  const { profile } = useCitizenProfile();
  const { documents } = useDocuments();
  const { services } = useGovernmentServices();

  const isProfileVerified = !!profile && (profile.completionPercentage > 0 || !!profile.firstName);
  const profileCompletionPercentage = profile?.completionPercentage || 0;
  const profileName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : '';

  // Only consider Aadhaar linked if service status is explicitly CONNECTED or VERIFIED
  const isAadhaarLinked = services.some(
    (s) => s.code === 'AADHAAR' && (s.status === 'CONNECTED' || s.status === 'VERIFIED')
  );

  // Only consider DigiLocker synced if service status is CONNECTED or VERIFIED and healthy
  const isDigiLockerSynced = services.some(
    (s) => s.code === 'DIGILOCKER' && (s.status === 'CONNECTED' || s.status === 'VERIFIED') && s.health === 'HEALTHY'
  );

  const isVaultLinked = documents && documents.length > 0;
  const documentCount = documents ? documents.length : 0;
  const isDatabaseLinked = true; // Always connected to BenefitOS Government Scheme Catalog

  const activeSources: string[] = ['Government Scheme Database'];
  if (isProfileVerified) activeSources.push('Verified Citizen Profile');
  if (isAadhaarLinked) activeSources.push('Aadhaar UIDAI');
  if (isDigiLockerSynced) activeSources.push('DigiLocker Synced');
  if (isVaultLinked) activeSources.push(`Document Vault (${documentCount})`);

  return {
    isProfileVerified,
    profileCompletionPercentage,
    profileName,
    isAadhaarLinked,
    isDigiLockerSynced,
    isVaultLinked,
    documentCount,
    isDatabaseLinked,
    activeSources,
  };
};
