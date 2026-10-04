"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemeRecommendationEntity = void 0;
const domain_entity_base_1 = require("../common/domain-entity.base");
class SchemeRecommendationEntity extends domain_entity_base_1.BaseDomainEntity {
    _citizenProfileId;
    _schemeId;
    _matchPercentage;
    _estimatedBenefit;
    _isEligible;
    _status;
    _criteriaMet;
    _missingCriteria;
    _missingDocuments;
    _aiValidation;
    constructor(props) {
        super(props.id, props.calculatedAt);
        this._citizenProfileId = props.citizenProfileId;
        this._schemeId = props.schemeId;
        this._matchPercentage = props.matchPercentage;
        this._estimatedBenefit = props.estimatedBenefit;
        this._isEligible = props.isEligible;
        this._status = props.status || (props.isEligible ? 'CLAIM_READY' : 'NOT_ELIGIBLE');
        this._criteriaMet = props.criteriaMet || [];
        this._missingCriteria = props.missingCriteria || [];
        this._missingDocuments = props.missingDocuments || [];
        this._aiValidation = props.aiValidation || null;
    }
    get citizenProfileId() { return this._citizenProfileId; }
    get schemeId() { return this._schemeId; }
    get matchPercentage() { return this._matchPercentage; }
    get estimatedBenefit() { return this._estimatedBenefit; }
    get isEligible() { return this._isEligible; }
    get status() { return this._status; }
    get criteriaMet() { return this._criteriaMet; }
    get missingCriteria() { return this._missingCriteria; }
    get missingDocuments() { return this._missingDocuments; }
    get aiValidation() { return this._aiValidation; }
    get calculatedAt() { return this.createdAt; }
}
exports.SchemeRecommendationEntity = SchemeRecommendationEntity;
//# sourceMappingURL=recommendation.entity.js.map