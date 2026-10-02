"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WelfareSchemeEntity = exports.ApplicationMode = exports.BenefitType = exports.SchemeSourceType = exports.SchemeVerificationStatus = exports.DOCUMENT_TYPE_DISPLAY_NAMES = exports.DocumentType = exports.SchemeCategory = void 0;
const domain_entity_base_1 = require("../common/domain-entity.base");
var SchemeCategory;
(function (SchemeCategory) {
    SchemeCategory["AGRICULTURE"] = "AGRICULTURE";
    SchemeCategory["EDUCATION"] = "EDUCATION";
    SchemeCategory["HEALTHCARE"] = "HEALTHCARE";
    SchemeCategory["HOUSING"] = "HOUSING";
    SchemeCategory["FINANCIAL_INCLUSION"] = "FINANCIAL_INCLUSION";
    SchemeCategory["WOMEN_CHILD_DEVELOPMENT"] = "WOMEN_CHILD_DEVELOPMENT";
    SchemeCategory["SOCIAL_SECURITY"] = "SOCIAL_SECURITY";
    SchemeCategory["SKILL_DEVELOPMENT"] = "SKILL_DEVELOPMENT";
    SchemeCategory["EMPLOYMENT"] = "EMPLOYMENT";
    SchemeCategory["PENSION"] = "PENSION";
})(SchemeCategory || (exports.SchemeCategory = SchemeCategory = {}));
var DocumentType;
(function (DocumentType) {
    DocumentType["BIRTH_CERTIFICATE"] = "BIRTH_CERTIFICATE";
    DocumentType["EDUCATIONAL_CERTIFICATE"] = "EDUCATIONAL_CERTIFICATE";
    DocumentType["DISABILITY_CERTIFICATE"] = "DISABILITY_CERTIFICATE";
    DocumentType["CASTE_CERTIFICATE"] = "CASTE_CERTIFICATE";
    DocumentType["AADHAAR"] = "AADHAAR";
    DocumentType["DRIVING_LICENSE"] = "DRIVING_LICENSE";
    DocumentType["VOTER_ID"] = "VOTER_ID";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
exports.DOCUMENT_TYPE_DISPLAY_NAMES = {
    [DocumentType.BIRTH_CERTIFICATE]: 'Birth Certificate',
    [DocumentType.EDUCATIONAL_CERTIFICATE]: 'Educational Certificate/Marksheet',
    [DocumentType.DISABILITY_CERTIFICATE]: 'Disability Certificate',
    [DocumentType.CASTE_CERTIFICATE]: 'Caste Certificate',
    [DocumentType.AADHAAR]: 'Aadhaar Card',
    [DocumentType.DRIVING_LICENSE]: 'Driving Licence',
    [DocumentType.VOTER_ID]: 'Voter ID',
};
var SchemeVerificationStatus;
(function (SchemeVerificationStatus) {
    SchemeVerificationStatus["VERIFIED"] = "VERIFIED";
    SchemeVerificationStatus["NEEDS_REVIEW"] = "NEEDS_REVIEW";
    SchemeVerificationStatus["OUTDATED"] = "OUTDATED";
    SchemeVerificationStatus["UNVERIFIED"] = "UNVERIFIED";
})(SchemeVerificationStatus || (exports.SchemeVerificationStatus = SchemeVerificationStatus = {}));
var SchemeSourceType;
(function (SchemeSourceType) {
    SchemeSourceType["CENTRAL_PORTAL"] = "CENTRAL_PORTAL";
    SchemeSourceType["MINISTRY_PORTAL"] = "MINISTRY_PORTAL";
    SchemeSourceType["STATE_PORTAL"] = "STATE_PORTAL";
    SchemeSourceType["MYSCHEME"] = "MYSCHEME";
    SchemeSourceType["NATIONAL_PORTAL"] = "NATIONAL_PORTAL";
    SchemeSourceType["OFFICIAL_PORTAL"] = "OFFICIAL_PORTAL";
})(SchemeSourceType || (exports.SchemeSourceType = SchemeSourceType = {}));
var BenefitType;
(function (BenefitType) {
    BenefitType["DIRECT_BENEFIT_TRANSFER"] = "DIRECT_BENEFIT_TRANSFER";
    BenefitType["HOUSING_GRANT"] = "HOUSING_GRANT";
    BenefitType["SCHOLARSHIP"] = "SCHOLARSHIP";
    BenefitType["HEALTH_COVER"] = "HEALTH_COVER";
    BenefitType["SUBSIDIZED_LOAN"] = "SUBSIDIZED_LOAN";
    BenefitType["MONTHLY_PENSION"] = "MONTHLY_PENSION";
    BenefitType["SUBSIDY"] = "SUBSIDY";
    BenefitType["OTHER"] = "OTHER";
})(BenefitType || (exports.BenefitType = BenefitType = {}));
var ApplicationMode;
(function (ApplicationMode) {
    ApplicationMode["ONLINE"] = "ONLINE";
    ApplicationMode["OFFLINE"] = "OFFLINE";
    ApplicationMode["HYBRID"] = "HYBRID";
})(ApplicationMode || (exports.ApplicationMode = ApplicationMode = {}));
class WelfareSchemeEntity extends domain_entity_base_1.BaseDomainEntity {
    _code;
    _title;
    _description;
    _category;
    _department;
    _state;
    _isCentralScheme;
    _financialBenefit;
    _isActive;
    _applicationDeadline;
    _eligibilityRules;
    _requiredDocuments;
    _sourceUrl;
    _sourceName;
    _sourceType;
    _lastVerifiedAt;
    _verificationStatus;
    _benefitType;
    _applicationUrl;
    _applicationMode;
    _applicationProcedure;
    constructor(props) {
        super(props.id, props.createdAt, props.updatedAt);
        this._code = props.code;
        this._title = props.title;
        this._description = props.description;
        this._category = props.category;
        this._department = props.department;
        this._state = props.state;
        this._isCentralScheme = props.isCentralScheme;
        this._financialBenefit = props.financialBenefit;
        this._isActive = props.isActive;
        this._applicationDeadline = props.applicationDeadline;
        this._eligibilityRules = props.eligibilityRules || [];
        this._requiredDocuments = props.requiredDocuments || [];
        this._sourceUrl = props.sourceUrl;
        this._sourceName = props.sourceName;
        this._sourceType = props.sourceType;
        this._lastVerifiedAt = props.lastVerifiedAt;
        this._verificationStatus = props.verificationStatus || SchemeVerificationStatus.VERIFIED;
        this._benefitType = props.benefitType;
        this._applicationUrl = props.applicationUrl;
        this._applicationMode = props.applicationMode;
        this._applicationProcedure = props.applicationProcedure;
    }
    get code() { return this._code; }
    get title() { return this._title; }
    get description() { return this._description; }
    get category() { return this._category; }
    get department() { return this._department; }
    get state() { return this._state; }
    get isCentralScheme() { return this._isCentralScheme; }
    get financialBenefit() { return this._financialBenefit; }
    get isActive() { return this._isActive; }
    get applicationDeadline() { return this._applicationDeadline; }
    get eligibilityRules() { return this._eligibilityRules; }
    get requiredDocuments() { return this._requiredDocuments; }
    get sourceUrl() { return this._sourceUrl; }
    get sourceName() { return this._sourceName; }
    get sourceType() { return this._sourceType; }
    get lastVerifiedAt() { return this._lastVerifiedAt; }
    get verificationStatus() { return this._verificationStatus; }
    get benefitType() { return this._benefitType; }
    get applicationUrl() { return this._applicationUrl; }
    get applicationMode() { return this._applicationMode; }
    get applicationProcedure() { return this._applicationProcedure; }
}
exports.WelfareSchemeEntity = WelfareSchemeEntity;
//# sourceMappingURL=scheme.entity.js.map