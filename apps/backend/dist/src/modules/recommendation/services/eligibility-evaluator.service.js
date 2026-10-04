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
        const pendingVerificationRules = [];
        const failedRuleObjects = [];
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
            const isVerifRule = rule.attributeKey.toLowerCase().includes('verif') ||
                rule.attributeKey.toLowerCase().includes('aadhaar') ||
                rule.attributeKey.toLowerCase().includes('kyc');
            const val = this.getCitizenAttributeValue(citizen, rule.attributeKey);
            if (val === null || val === undefined || val === '') {
                const fieldName = rule.description || rule.attributeKey;
                if (isVerifRule) {
                    pendingVerificationRules.push(`Pending verification: ${fieldName}`);
                    missingCriteria.push(`Verification pending: ${fieldName}`);
                }
                else {
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
            }
            else {
                if (isVerifRule) {
                    const verifDesc = rule.description || `Required verification not completed: ${rule.attributeKey}`;
                    pendingVerificationRules.push(verifDesc);
                    missingCriteria.push(verifDesc);
                }
                else {
                    const failureDesc = rule.description
                        ? `Does not satisfy: ${rule.description} (Current value: ${val})`
                        : `Fails requirement: ${rule.attributeKey} (Your value: ${val}, required: ${rule.operator} ${rule.targetValue})`;
                    failedRules.push(failureDesc);
                    missingCriteria.push(failureDesc);
                    failedRuleObjects.push({ rule, val });
                }
            }
        }
        const totalRules = rules.length + (!scheme.isCentralScheme && scheme.state ? 1 : 0);
        const metCount = criteriaMet.length;
        const matchPercentage = totalRules > 0 ? Math.round((metCount / totalRules) * 100) : 100;
        let eligibilityStatus = 'NOT_ELIGIBLE';
        let eligibilityTiming = 'NOT_APPLICABLE';
        let yearsUntilEligible = null;
        let statusReason = 'Ineligible';
        if (missingProfileFields.length > 0) {
            eligibilityStatus = 'INCOMPLETE_PROFILE';
            statusReason = `Profile incomplete: Missing ${missingProfileFields.join(', ')}`;
        }
        else if (pendingVerificationRules.length > 0 && failedRules.length === 0 && statePassed) {
            eligibilityStatus = 'NEEDS_VERIFICATION';
            statusReason = `Verification required: ${pendingVerificationRules[0]}`;
        }
        else if (failedRules.length === 0 && statePassed) {
            eligibilityStatus = 'ELIGIBLE';
            eligibilityTiming = 'NOW';
            yearsUntilEligible = 0;
            statusReason = 'All eligibility criteria verified and satisfied';
        }
        else {
            const isOnlyAgeMinFailure = statePassed &&
                pendingVerificationRules.length === 0 &&
                failedRuleObjects.length > 0 &&
                failedRuleObjects.every(item => item.rule.attributeKey.toLowerCase() === 'age' &&
                    (item.rule.operator === 'GREATER_EQUAL' || item.rule.operator === 'GREATER_THAN')) &&
                failedRules.length === failedRuleObjects.length;
            let evaluatedFuture = false;
            if (isOnlyAgeMinFailure) {
                const citizenAge = citizen.age;
                if (citizenAge !== undefined && citizenAge !== null && !isNaN(citizenAge)) {
                    let requiredMinAge = 0;
                    for (const item of failedRuleObjects) {
                        const target = Number(item.rule.targetValue);
                        const targetMin = item.rule.operator === 'GREATER_THAN' ? target + 1 : target;
                        if (targetMin > requiredMinAge) {
                            requiredMinAge = targetMin;
                        }
                    }
                    const diff = requiredMinAge - citizenAge;
                    if (diff >= 1 && diff <= 3) {
                        const futureAge = citizenAge + diff;
                        let maxAgeViolated = false;
                        for (const rule of rules) {
                            if (rule.attributeKey.toLowerCase() === 'age') {
                                const target = Number(rule.targetValue);
                                if (rule.operator === 'LESS_EQUAL' && futureAge > target)
                                    maxAgeViolated = true;
                                if (rule.operator === 'LESS_THAN' && futureAge >= target)
                                    maxAgeViolated = true;
                            }
                        }
                        if (!maxAgeViolated) {
                            evaluatedFuture = true;
                            eligibilityStatus = 'FUTURE_ELIGIBLE';
                            yearsUntilEligible = diff;
                            eligibilityTiming = diff === 1 ? 'IN_1_YEAR' : diff === 2 ? 'IN_2_YEARS' : 'IN_3_YEARS';
                            statusReason = `Eligible in ${diff} year${diff > 1 ? 's' : ''} upon reaching age ${requiredMinAge} (Current age: ${citizenAge})`;
                        }
                    }
                }
            }
            if (!evaluatedFuture) {
                eligibilityStatus = 'NOT_ELIGIBLE';
                eligibilityTiming = 'NOT_APPLICABLE';
                yearsUntilEligible = null;
                statusReason = `Ineligible: ${failedRules[0]}`;
            }
        }
        const isEligible = eligibilityStatus === 'ELIGIBLE';
        const recommendation = new recommendation_entity_1.SchemeRecommendationEntity({
            id: (0, crypto_1.randomUUID)(),
            citizenProfileId: citizen.id,
            schemeId: scheme.id,
            matchPercentage: isEligible ? 100 : (eligibilityStatus === 'FUTURE_ELIGIBLE' ? Math.min(matchPercentage, 90) : Math.min(matchPercentage, 99)),
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
            eligibilityTiming,
            yearsUntilEligible,
            statusReason,
            missingProfileFields,
            failedRules,
            passedRules,
            pendingVerificationRules,
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
            case 'GREATER_THAN': {
                const numVal = Number(val);
                const numTarget = Number(target);
                if (isNaN(numVal) || isNaN(numTarget))
                    return false;
                return numVal > numTarget;
            }
            case 'LESS_THAN': {
                const numVal = Number(val);
                const numTarget = Number(target);
                if (isNaN(numVal) || isNaN(numTarget))
                    return false;
                return numVal < numTarget;
            }
            case 'GREATER_EQUAL': {
                const numVal = Number(val);
                const numTarget = Number(target);
                if (isNaN(numVal) || isNaN(numTarget))
                    return false;
                return numVal >= numTarget;
            }
            case 'LESS_EQUAL': {
                const numVal = Number(val);
                const numTarget = Number(target);
                if (isNaN(numVal) || isNaN(numTarget))
                    return false;
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
    getCitizenAttributeValue(citizen, key) {
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
            case 'isLandOwner':
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
            case 'isSenior70PlusOrBpl': {
                if (citizen.age !== undefined && citizen.age !== null && citizen.age >= 70) {
                    return 'true';
                }
                if (citizen.isBplCardHolder !== undefined && citizen.isBplCardHolder !== null) {
                    return citizen.isBplCardHolder ? 'true' : 'false';
                }
                return null;
            }
            case 'isIncomeTaxPayer': {
                if (citizen.annualIncomeINR !== undefined && citizen.annualIncomeINR !== null) {
                    return citizen.annualIncomeINR > 700000 ? 'true' : 'false';
                }
                return null;
            }
            case 'hasPuccaHouse': {
                return null;
            }
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