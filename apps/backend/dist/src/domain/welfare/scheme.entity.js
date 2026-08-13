"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WelfareSchemeEntity = exports.DOCUMENT_TYPE_DISPLAY_NAMES = exports.DocumentType = exports.SchemeCategory = void 0;
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
}
exports.WelfareSchemeEntity = WelfareSchemeEntity;
//# sourceMappingURL=scheme.entity.js.map