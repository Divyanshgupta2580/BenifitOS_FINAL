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
        const rules = scheme.eligibilityRules || [];
        const criteriaMet = [];
        const missingCriteria = [];
        for (const rule of rules) {
            const isMet = this.evaluateSingleRule(citizen, rule);
            if (isMet) {
                criteriaMet.push(rule.description || `${rule.attributeKey} ${rule.operator} ${rule.targetValue}`);
            }
            else {
                missingCriteria.push(rule.description || `Fails requirement: ${rule.attributeKey} ${rule.operator} ${rule.targetValue}`);
            }
        }
        const totalRules = rules.length;
        const metCount = criteriaMet.length;
        const matchPercentage = totalRules > 0 ? Math.round((metCount / totalRules) * 100) : 100;
        const isEligible = missingCriteria.length === 0;
        return new recommendation_entity_1.SchemeRecommendationEntity({
            id: (0, crypto_1.randomUUID)(),
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
    evaluateSingleRule(citizen, rule) {
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
    getCitizenAttributeValue(citizen, key) {
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
};
exports.EligibilityEvaluatorService = EligibilityEvaluatorService;
exports.EligibilityEvaluatorService = EligibilityEvaluatorService = __decorate([
    (0, common_1.Injectable)()
], EligibilityEvaluatorService);
//# sourceMappingURL=eligibility-evaluator.service.js.map