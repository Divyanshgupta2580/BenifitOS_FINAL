import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

export interface MinimizedCitizenProfile {
  age: number | string;
  gender: string;
  maritalStatus: string;
  socialCategory: string;
  employmentStatus: string;
  annualIncomeTier: string;
  state: string;
  district: string;
  isRural: boolean;
  disabilityStatus: string;
  isBplCardHolder: boolean;
  verifiedSchemesSummary?: string[];
}

@Injectable()
export class AiDataMinimizerService {
  /**
   * Minimizes citizen profile data, stripping all unnecessary PII, contact info,
   * authentication data, internal IDs, and raw hashes.
   */
  public minimizeCitizenProfile(rawProfile: any): MinimizedCitizenProfile | null {
    if (!rawProfile) return null;

    let age: number | string = 'Not specified';
    if (rawProfile.dateOfBirth) {
      const birthDate = new Date(rawProfile.dateOfBirth);
      if (!isNaN(birthDate.getTime())) {
        const diffMs = Date.now() - birthDate.getTime();
        age = Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
      }
    }

    const income = Number(rawProfile.annualIncomeINR) || 0;
    let annualIncomeTier = `INR ${income.toLocaleString('en-IN')} / year`;
    if (income <= 100000) annualIncomeTier = 'Under INR 1 Lakh / year';
    else if (income <= 250000) annualIncomeTier = 'INR 1 Lakh - 2.5 Lakhs / year';
    else if (income <= 500000) annualIncomeTier = 'INR 2.5 Lakhs - 5 Lakhs / year';
    else if (income <= 800000) annualIncomeTier = 'INR 5 Lakhs - 8 Lakhs / year';

    let disabilityStatus = 'None';
    if (rawProfile.disabilityType && rawProfile.disabilityType !== 'NONE') {
      disabilityStatus = `${rawProfile.disabilityType} (${rawProfile.disabilityPercent || 0}%)`;
    }

    const verifiedSchemesSummary: string[] = [];
    if (rawProfile.recommendations && Array.isArray(rawProfile.recommendations)) {
      for (const r of rawProfile.recommendations) {
        if (r.scheme) {
          verifiedSchemesSummary.push(
            `Scheme: ${r.scheme.title} | Status: ${r.isEligible ? 'Verified Eligible' : 'Requires Verification'} | Match: ${r.matchPercentage}%`,
          );
        }
      }
    }

    return {
      age,
      gender: rawProfile.gender || 'Not specified',
      maritalStatus: rawProfile.maritalStatus || 'Not specified',
      socialCategory: rawProfile.socialCategory || 'GENERAL',
      employmentStatus: rawProfile.employmentStatus || 'Not specified',
      annualIncomeTier,
      state: rawProfile.address?.state || 'Not specified',
      district: rawProfile.address?.district || rawProfile.address?.city || 'Not specified',
      isRural: Boolean(rawProfile.address?.isRural),
      disabilityStatus,
      isBplCardHolder: Boolean(rawProfile.isBplCardHolder),
      verifiedSchemesSummary: verifiedSchemesSummary.slice(0, 10),
    };
  }

  /**
   * Computes a deterministic SHA-256 fingerprint of the minimized profile
   * for accurate cache key generation without including raw user IDs.
   */
  public computeProfileHash(profile: MinimizedCitizenProfile | null): string {
    if (!profile) return 'anonymous_profile';
    const cleanObject = {
      age: profile.age,
      gender: profile.gender,
      socialCategory: profile.socialCategory,
      employmentStatus: profile.employmentStatus,
      annualIncomeTier: profile.annualIncomeTier,
      state: profile.state,
      district: profile.district,
      isRural: profile.isRural,
      disabilityStatus: profile.disabilityStatus,
      isBplCardHolder: profile.isBplCardHolder,
    };
    return createHash('sha256').update(JSON.stringify(cleanObject)).digest('hex').substring(0, 16);
  }

  /**
   * Formats minimized context string for system prompt injection.
   */
  public formatContextForPrompt(profile: MinimizedCitizenProfile | null): string {
    if (!profile) return '';

    return `
============================================================
VERIFIED CITIZEN ATTRIBUTES (Minimized Context):
============================================================
- Age: ${profile.age} years
- Gender: ${profile.gender}
- Social Category: ${profile.socialCategory}
- Employment Status: ${profile.employmentStatus}
- Annual Income Bracket: ${profile.annualIncomeTier}
- Domicile State / UT: ${profile.state}
- District / Area: ${profile.district} (Rural: ${profile.isRural ? 'Yes' : 'No'})
- Disability Category: ${profile.disabilityStatus}
- BPL Card Holder: ${profile.isBplCardHolder ? 'Yes' : 'No'}

${
  profile.verifiedSchemesSummary && profile.verifiedSchemesSummary.length > 0
    ? `PRE-EVALUATED SCHEME STATUS:\n${profile.verifiedSchemesSummary.join('\n')}`
    : ''
}
============================================================`;
  }
}
