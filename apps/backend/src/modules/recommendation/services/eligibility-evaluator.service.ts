import { Injectable } from '@nestjs/common';
import { CitizenEntity } from '../../../domain/citizen/citizen.entity';
import { WelfareSchemeEntity, EligibilityRule, DocumentType } from '../../../domain/welfare/scheme.entity';
import { SchemeRecommendationEntity } from '../../../domain/welfare/recommendation.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class EligibilityEvaluatorService {
  public evaluateEligibility(citizen: CitizenEntity, scheme: WelfareSchemeEntity): SchemeRecommendationEntity {
    const rules = scheme.eligibilityRules || [];
    const criteriaMet: string[] = [];
    const missingCriteria: string[] = [];

    for (const rule of rules) {
      const isMet = this.evaluateSingleRule(citizen, rule);
      if (isMet) {
        criteriaMet.push(rule.description || `${rule.attributeKey} ${rule.operator} ${rule.targetValue}`);
      } else {
        missingCriteria.push(rule.description || `Fails requirement: ${rule.attributeKey} ${rule.operator} ${rule.targetValue}`);
      }
    }

    const totalRules = rules.length;
    const metCount = criteriaMet.length;
    const matchPercentage = totalRules > 0 ? Math.round((metCount / totalRules) * 100) : 100;
    const isEligible = missingCriteria.length === 0;

    return new SchemeRecommendationEntity({
      id: randomUUID(),
      citizenProfileId: citizen.id,
      schemeId: scheme.id,
      matchPercentage,
      estimatedBenefit: isEligible ? scheme.financialBenefit : 0,
      isEligible,
      criteriaMet,
      missingCriteria,
      missingDocuments: scheme.requiredDocuments || [],
      calculatedAt: new Date(),
    });
  }

  private evaluateSingleRule(citizen: CitizenEntity, rule: EligibilityRule): boolean {
    const val = this.getCitizenAttributeValue(citizen, rule.attributeKey);
    const target = rule.targetValue;

    switch (rule.operator) {
      case 'EQUALS':
        return String(val).toUpperCase() === String(target).toUpperCase();
      case 'NOT_EQUALS':
        return String(val).toUpperCase() !== String(target).toUpperCase();
      case 'GREATER_THAN':
        return Number(val) > Number(target);
      case 'LESS_THAN':
        return Number(val) < Number(target);
      case 'GREATER_EQUAL':
        return Number(val) >= Number(target);
      case 'LESS_EQUAL':
        return Number(val) <= Number(target);
      case 'IN': {
        const list = target.split(',').map((s) => s.trim().toUpperCase());
        return list.includes(String(val).toUpperCase());
      }
      default:
        return false;
    }
  }

  private getCitizenAttributeValue(citizen: CitizenEntity, key: string): any {
    switch (key) {
      case 'age': return citizen.age;
      case 'gender': return citizen.gender;
      case 'annualIncomeINR': return citizen.annualIncomeINR;
      case 'socialCategory': return citizen.socialCategory;
      case 'employmentStatus': return citizen.employmentStatus;
      case 'disabilityType': return citizen.disabilityType;
      case 'disabilityPercent': return citizen.disabilityPercent;
      case 'isBplCardHolder': return citizen.isBplCardHolder;
      case 'state': return citizen.address?.state || '';
      case 'district': return citizen.address?.district || '';
      case 'isRural': return citizen.address?.isRural || false;
      default: return null;
    }
  }
}
