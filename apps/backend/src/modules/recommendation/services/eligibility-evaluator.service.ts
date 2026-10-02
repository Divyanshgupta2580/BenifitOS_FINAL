import { Injectable } from '@nestjs/common';
import { CitizenEntity } from '../../../domain/citizen/citizen.entity';
import { WelfareSchemeEntity, EligibilityRule, DocumentType } from '../../../domain/welfare/scheme.entity';
import { SchemeRecommendationEntity } from '../../../domain/welfare/recommendation.entity';
import { randomUUID } from 'crypto';

export type EligibilityStatus = 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'NEEDS_VERIFICATION' | 'INCOMPLETE_PROFILE';

export interface DetailedEvaluationResult {
  recommendation: SchemeRecommendationEntity;
  eligibilityStatus: EligibilityStatus;
  statusReason: string;
  missingProfileFields: string[];
  failedRules: string[];
  passedRules: string[];
  pendingVerificationRules?: string[];
}

@Injectable()
export class EligibilityEvaluatorService {
  public evaluateEligibility(citizen: CitizenEntity, scheme: WelfareSchemeEntity): SchemeRecommendationEntity {
    const detailed = this.evaluateDetailedEligibility(citizen, scheme);
    return detailed.recommendation;
  }

  public evaluateDetailedEligibility(citizen: CitizenEntity, scheme: WelfareSchemeEntity): DetailedEvaluationResult {
    const rules = scheme.eligibilityRules || [];
    const criteriaMet: string[] = [];
    const missingCriteria: string[] = [];
    const missingProfileFields: string[] = [];
    const failedRules: string[] = [];
    const passedRules: string[] = [];
    const pendingVerificationRules: string[] = [];

    // 1. State / Domicile validation
    let statePassed = true;
    if (!scheme.isCentralScheme && scheme.state) {
      const citizenState = (citizen.address?.state || '').trim().toUpperCase();
      const schemeState = scheme.state.trim().toUpperCase();
      if (!citizenState || citizenState === 'NATIONAL' || citizenState === 'DEFAULT') {
        missingProfileFields.push('State / Domicile Residence');
        missingCriteria.push(`State of residence required: Scheme is restricted to residents of ${scheme.state}`);
        statePassed = false;
      } else if (citizenState === schemeState || schemeState === 'ALL' || schemeState === 'NATIONAL') {
        criteriaMet.push(`Resident of ${scheme.state}`);
        passedRules.push(`Resident of ${scheme.state}`);
      } else {
        failedRules.push(`State mismatch: Scheme is restricted to ${scheme.state} (Your registered state: ${citizen.address?.state})`);
        missingCriteria.push(`Scheme is restricted to residents of ${scheme.state} (Your state: ${citizen.address?.state})`);
        statePassed = false;
      }
    }

    // 2. Rule by rule evaluation
    for (const rule of rules) {
      const isVerifRule = rule.attributeKey.toLowerCase().includes('verif') || 
                          rule.attributeKey.toLowerCase().includes('aadhaar') || 
                          rule.attributeKey.toLowerCase().includes('kyc');
      
      const val = this.getCitizenAttributeValue(citizen, rule.attributeKey);
      if (val === null || val === undefined || val === '') {
        const fieldName = rule.description || rule.attributeKey;
        if (isVerifRule) {
          pendingVerificationRules.push(`Pending verification: ${fieldName}`);
          missingCriteria.push(`Verification pending: ${fieldName}`);
        } else {
          missingProfileFields.push(fieldName);
          missingCriteria.push(`Missing profile data: ${fieldName}`);
        }
        continue;
      }

      const isMet = this.evaluateSingleRule(citizen, rule);
      if (isMet) {
        const desc = rule.description || `${rule.attributeKey} ${rule.operator} ${rule.targetValue}`;
        criteriaMet.push(desc);
        passedRules.push(desc);
      } else {
        if (isVerifRule) {
          const verifDesc = rule.description || `Required verification not completed: ${rule.attributeKey}`;
          pendingVerificationRules.push(verifDesc);
          missingCriteria.push(verifDesc);
        } else {
          const failureDesc = rule.description
            ? `Does not satisfy: ${rule.description} (Current value: ${val})`
            : `Fails requirement: ${rule.attributeKey} (Your value: ${val}, required: ${rule.operator} ${rule.targetValue})`;
          failedRules.push(failureDesc);
          missingCriteria.push(failureDesc);
        }
      }
    }

    const totalRules = rules.length + (!scheme.isCentralScheme && scheme.state ? 1 : 0);
    const metCount = criteriaMet.length;
    const matchPercentage = totalRules > 0 ? Math.round((metCount / totalRules) * 100) : 100;

    // Strict eligibility determination:
    // User is ONLY eligible if 100% of criteria are met and NO profile fields are missing or unverified
    let eligibilityStatus: EligibilityStatus;
    let statusReason: string;

    if (missingProfileFields.length > 0) {
      eligibilityStatus = 'INCOMPLETE_PROFILE';
      statusReason = `Profile incomplete: Missing ${missingProfileFields.join(', ')}`;
    } else if (failedRules.length > 0) {
      eligibilityStatus = 'NOT_ELIGIBLE';
      statusReason = `Ineligible: ${failedRules[0]}`;
    } else if (pendingVerificationRules.length > 0) {
      eligibilityStatus = 'NEEDS_VERIFICATION';
      statusReason = `Verification required: ${pendingVerificationRules[0]}`;
    } else {
      eligibilityStatus = 'ELIGIBLE';
      statusReason = 'All eligibility criteria verified and satisfied';
    }

    const isEligible = eligibilityStatus === 'ELIGIBLE';

    const recommendation = new SchemeRecommendationEntity({
      id: randomUUID(),
      citizenProfileId: citizen.id,
      schemeId: scheme.id,
      matchPercentage: isEligible ? 100 : Math.min(matchPercentage, 99), // Only 100% if strictly eligible
      estimatedBenefit: isEligible ? scheme.financialBenefit : 0,
      isEligible,
      criteriaMet,
      missingCriteria,
      missingDocuments: scheme.requiredDocuments || [],
      calculatedAt: new Date(),
    });

    return {
      recommendation,
      eligibilityStatus,
      statusReason,
      missingProfileFields,
      failedRules,
      passedRules,
      pendingVerificationRules,
    };
  }

  private evaluateSingleRule(citizen: CitizenEntity, rule: EligibilityRule): boolean {
    const val = this.getCitizenAttributeValue(citizen, rule.attributeKey);
    const target = rule.targetValue;

    if (val === null || val === undefined || val === '') {
      return false;
    }

    switch (rule.operator) {
      case 'EQUALS':
        return String(val).toUpperCase().trim() === String(target).toUpperCase().trim();
      case 'NOT_EQUALS':
        return String(val).toUpperCase().trim() !== String(target).toUpperCase().trim();
      case 'GREATER_THAN': {
        const numVal = Number(val);
        const numTarget = Number(target);
        if (isNaN(numVal) || isNaN(numTarget)) return false;
        return numVal > numTarget;
      }
      case 'LESS_THAN': {
        const numVal = Number(val);
        const numTarget = Number(target);
        if (isNaN(numVal) || isNaN(numTarget)) return false;
        return numVal < numTarget;
      }
      case 'GREATER_EQUAL': {
        const numVal = Number(val);
        const numTarget = Number(target);
        if (isNaN(numVal) || isNaN(numTarget)) return false;
        return numVal >= numTarget;
      }
      case 'LESS_EQUAL': {
        const numVal = Number(val);
        const numTarget = Number(target);
        if (isNaN(numVal) || isNaN(numTarget)) return false;
        return numVal <= numTarget;
      }
      case 'IN': {
        const list = target.split(',').map((s) => s.trim().toUpperCase());
        return list.includes(String(val).toUpperCase().trim());
      }
      default:
        return false;
    }
  }

  private getCitizenAttributeValue(citizen: CitizenEntity, key: string): any {
    switch (key) {
      case 'age':
        return citizen.age !== undefined && citizen.age !== null ? citizen.age : null;
      case 'gender':
        return citizen.gender || null;
      case 'maritalStatus':
        return citizen.maritalStatus || null;
      case 'annualIncomeINR':
        return citizen.annualIncomeINR !== undefined && citizen.annualIncomeINR !== null ? citizen.annualIncomeINR : null;
      case 'socialCategory':
        return citizen.socialCategory || null;
      case 'employmentStatus':
        return citizen.employmentStatus || null;
      case 'disabilityType':
        return citizen.disabilityType || null;
      case 'disabilityPercent':
        return citizen.disabilityPercent !== undefined && citizen.disabilityPercent !== null ? citizen.disabilityPercent : null;
      case 'isBplCardHolder':
        return citizen.isBplCardHolder !== undefined && citizen.isBplCardHolder !== null ? citizen.isBplCardHolder : null;
      case 'state':
        return citizen.address?.state || null;
      case 'district':
        return citizen.address?.district || null;
      case 'isRural':
        return citizen.address?.isRural !== undefined ? citizen.address.isRural : null;
      case 'hasLand':
        return (citizen.landDetails && citizen.landDetails.length > 0) ? 'true' : 'false';
      case 'landSizeAcres': {
        const total = (citizen.landDetails || []).reduce((acc, l) => acc + (l.landSizeAcres || 0), 0);
        return total;
      }
      case 'isAadhaarVerified':
      case 'isAadhaarLinked':
        return citizen.aadhaarHash ? 'true' : 'false';
      case 'isPanVerified':
      case 'isPanLinked':
        return citizen.panHash ? 'true' : 'false';
      case 'verificationStatus':
        return citizen.aadhaarHash ? 'VERIFIED' : 'PENDING';
      default:
        return null;
    }
  }
}
