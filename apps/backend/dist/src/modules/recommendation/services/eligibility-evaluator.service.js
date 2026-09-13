"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EligibilityEvaluatorService = void 0;
const common_1 = require("@nestjs/common");
const recommendation_entity_1 = require("../../../domain/welfare/recommendation.entity");
const crypto_1 = require("crypto");
let EligibilityEvaluatorService = class EligibilityEvaluatorService {
    evaluateEligibility(citizen, scheme) {
        const detailed = this.evaluateDetailedEligibility(citizen, scheme);
        return detailed.recommendation;
    }
    evaluateDetailedEligibility(citizen, scheme) {
        const rules = scheme.eligibilityRules || [];
        const criteriaMet = [];
        const missingCriteria = [];
        const missingProfileFields = [];
        const failedRules = [];
        const passedRules = [];
        let statePassed = true;
        if (!scheme.isCentralScheme && scheme.state) {
            const citizenState = (citizen.address?.state || '').trim().toUpperCase();
            const schemeState = scheme.state.trim().toUpperCase();
            if (!citizenState || citizenState === 'NATIONAL' || citizenState === 'DEFAULT') {
                missingProfileFields.push('State / Domicile Residence');
                missingCriteria.push(`State of residence required: Scheme is restricted to residents of ${scheme.state}`);
                statePassed = false;
            }
            else if (citizenState === schemeState || schemeState === 'ALL' || schemeState === 'NATIONAL') {
                criteriaMet.push(`Resident of ${scheme.state}`);
                passedRules.push(`Resident of ${scheme.state}`);
            }
            else {
                failedRules.push(`State mismatch: Scheme is restricted to ${scheme.state} (Your registered state: ${citizen.address?.state})`);
                missingCriteria.push(`Scheme is restricted to residents of ${scheme.state} (Your state: ${citizen.address?.state})`);
                statePassed = false;
            }
        }
        for (const rule of rules) {
            const val = this.getCitizenAttributeValue(citizen, rule.attributeKey);
            if (val === null || val === undefined || val === '') {
                const fieldName = rule.description || rule.attributeKey;
                missingProfileFields.push(fieldName);
                missingCriteria.push(`Missing profile data: ${fieldName}`);
                continue;
            }
            const isMet = this.evaluateSingleRule(citizen, rule);
            if (isMet) {
                const desc = rule.description || `${rule.attributeKey} ${rule.operator} ${rule.targetValue}`;
                criteriaMet.push(desc);
                passedRules.push(desc);
            }
            else {
                const failureDesc = rule.description
                    ? `Does not satisfy: ${rule.description} (Current value: ${val})`
                    : `Fails requirement: ${rule.attributeKey} (Your value: ${val}, required: ${rule.operator} ${rule.targetValue})`;
                failedRules.push(failureDesc);
                missingCriteria.push(failureDesc);
            }
        }
        const totalRules = rules.length + (!scheme.isCentralScheme && scheme.state ? 1 : 0);
        const metCount = criteriaMet.length;
        const matchPercentage = totalRules > 0 ? Math.round((metCount / totalRules) * 100) : 100;
        let eligibilityStatus;
        let statusReason;
        if (missingProfileFields.length > 0) {
            eligibilityStatus = 'INCOMPLETE_PROFILE';
            statusReason = `Profile incomplete: Missing ${missingProfileFields.join(', ')}`;
        }
        else if (failedRules.length > 0) {
            eligibilityStatus = 'NOT_ELIGIBLE';
            statusReason = `Ineligible: ${failedRules[0]}`;
        }
        else {
            eligibilityStatus = 'ELIGIBLE';
            statusReason = 'All eligibility criteria verified and satisfied';
        }
        const isEligible = eligibilityStatus === 'ELIGIBLE';
        const recommendation = new recommendation_entity_1.SchemeRecommendationEntity({
            id: (0, crypto_1.randomUUID)(),
            citizenProfileId: citizen.id,
            schemeId: scheme.id,
            matchPercentage: isEligible ? 100 : Math.min(matchPercentage, 99),
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
        };
    }
    evaluateSingleRule(citizen, rule) {
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
                return list.includes(String(val).toUpperCase().trim());
            }
            default:
                return false;
        }
    }
    getCitizenAttributeValue(citizen, key) {
        switch (key) {
            case 'age':
                return citizen.age !== undefined && citizen.age !== null ? citizen.age : null;
            case 'gender':
                return citizen.gender || null;
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
            default:
                return null;
        }
    }
};
exports.EligibilityEvaluatorService = EligibilityEvaluatorService;
exports.EligibilityEvaluatorService = EligibilityEvaluatorService = __decorate([
    (0, common_1.Injectable)()
], EligibilityEvaluatorService);
//# sourceMappingURL=eligibility-evaluator.service.js.map