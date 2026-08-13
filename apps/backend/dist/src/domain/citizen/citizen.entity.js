"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CitizenEntity = exports.DisabilityType = exports.EmploymentStatus = exports.MaritalStatus = exports.SocialCategory = exports.Gender = void 0;
const domain_entity_base_1 = require("../common/domain-entity.base");
var Gender;
(function (Gender) {
    Gender["MALE"] = "MALE";
    Gender["FEMALE"] = "FEMALE";
    Gender["TRANSGENDER"] = "TRANSGENDER";
    Gender["OTHER"] = "OTHER";
})(Gender || (exports.Gender = Gender = {}));
var SocialCategory;
(function (SocialCategory) {
    SocialCategory["GENERAL"] = "GENERAL";
    SocialCategory["OBC"] = "OBC";
    SocialCategory["SC"] = "SC";
    SocialCategory["ST"] = "ST";
    SocialCategory["EWS"] = "EWS";
})(SocialCategory || (exports.SocialCategory = SocialCategory = {}));
var MaritalStatus;
(function (MaritalStatus) {
    MaritalStatus["SINGLE"] = "SINGLE";
    MaritalStatus["MARRIED"] = "MARRIED";
    MaritalStatus["DIVORCED"] = "DIVORCED";
    MaritalStatus["WIDOWED"] = "WIDOWED";
    MaritalStatus["SEPARATED"] = "SEPARATED";
})(MaritalStatus || (exports.MaritalStatus = MaritalStatus = {}));
var EmploymentStatus;
(function (EmploymentStatus) {
    EmploymentStatus["EMPLOYED"] = "EMPLOYED";
    EmploymentStatus["UNEMPLOYED"] = "UNEMPLOYED";
    EmploymentStatus["SELF_EMPLOYED"] = "SELF_EMPLOYED";
    EmploymentStatus["STUDENT"] = "STUDENT";
    EmploymentStatus["RETIRED"] = "RETIRED";
    EmploymentStatus["FARMER"] = "FARMER";
    EmploymentStatus["DAILY_WAGE"] = "DAILY_WAGE";
})(EmploymentStatus || (exports.EmploymentStatus = EmploymentStatus = {}));
var DisabilityType;
(function (DisabilityType) {
    DisabilityType["NONE"] = "NONE";
    DisabilityType["VISUAL"] = "VISUAL";
    DisabilityType["HEARING"] = "HEARING";
    DisabilityType["LOCOMOTOR"] = "LOCOMOTOR";
    DisabilityType["INTELLECTUAL"] = "INTELLECTUAL";
    DisabilityType["MULTIPLE"] = "MULTIPLE";
    DisabilityType["OTHER"] = "OTHER";
})(DisabilityType || (exports.DisabilityType = DisabilityType = {}));
class CitizenEntity extends domain_entity_base_1.BaseDomainEntity {
    _userId;
    _firstName;
    _lastName;
    _dateOfBirth;
    _gender;
    _maritalStatus;
    _socialCategory;
    _employmentStatus;
    _annualIncomeINR;
    _disabilityType;
    _disabilityPercent;
    _isBplCardHolder;
    _bplCardNumber;
    _aadhaarHash;
    _panHash;
    _address;
    _householdMembers;
    _landDetails;
    constructor(props) {
        super(props.id, props.createdAt, props.updatedAt);
        this._userId = props.userId;
        this._firstName = props.firstName;
        this._lastName = props.lastName;
        this._dateOfBirth = props.dateOfBirth;
        this._gender = props.gender;
        this._maritalStatus = props.maritalStatus;
        this._socialCategory = props.socialCategory;
        this._employmentStatus = props.employmentStatus;
        this._annualIncomeINR = props.annualIncomeINR;
        this._disabilityType = props.disabilityType;
        this._disabilityPercent = props.disabilityPercent;
        this._isBplCardHolder = props.isBplCardHolder;
        this._bplCardNumber = props.bplCardNumber;
        this._aadhaarHash = props.aadhaarHash;
        this._panHash = props.panHash;
        this._address = props.address;
        this._householdMembers = props.householdMembers || [];
        this._landDetails = props.landDetails || [];
    }
    get userId() { return this._userId; }
    get firstName() { return this._firstName; }
    get lastName() { return this._lastName; }
    get dateOfBirth() { return this._dateOfBirth; }
    get gender() { return this._gender; }
    get maritalStatus() { return this._maritalStatus; }
    get socialCategory() { return this._socialCategory; }
    get employmentStatus() { return this._employmentStatus; }
    get annualIncomeINR() { return this._annualIncomeINR; }
    get disabilityType() { return this._disabilityType; }
    get disabilityPercent() { return this._disabilityPercent; }
    get isBplCardHolder() { return this._isBplCardHolder; }
    get bplCardNumber() { return this._bplCardNumber; }
    get aadhaarHash() { return this._aadhaarHash; }
    get panHash() { return this._panHash; }
    get address() { return this._address; }
    get householdMembers() { return this._householdMembers; }
    get landDetails() { return this._landDetails; }
    get age() {
        const today = new Date();
        let age = today.getFullYear() - this._dateOfBirth.getFullYear();
        const m = today.getMonth() - this._dateOfBirth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < this._dateOfBirth.getDate())) {
            age--;
        }
        return age;
    }
    calculateProfileCompletionPercentage() {
        let score = 0;
        if (this._firstName && this._lastName)
            score += 20;
        if (this._dateOfBirth && this._gender)
            score += 20;
        if (this._socialCategory && this._employmentStatus)
            score += 20;
        if (this._address)
            score += 20;
        if (this._annualIncomeINR !== undefined)
            score += 20;
        return score;
    }
    updateDemographics(data) {
        if (data.firstName)
            this._firstName = data.firstName;
        if (data.lastName)
            this._lastName = data.lastName;
        if (data.dateOfBirth)
            this._dateOfBirth = data.dateOfBirth;
        if (data.gender)
            this._gender = data.gender;
        if (data.maritalStatus)
            this._maritalStatus = data.maritalStatus;
        if (data.socialCategory)
            this._socialCategory = data.socialCategory;
        if (data.employmentStatus)
            this._employmentStatus = data.employmentStatus;
        if (data.annualIncomeINR !== undefined)
            this._annualIncomeINR = data.annualIncomeINR;
        if (data.disabilityType)
            this._disabilityType = data.disabilityType;
        if (data.disabilityPercent !== undefined)
            this._disabilityPercent = data.disabilityPercent;
        if (data.isBplCardHolder !== undefined)
            this._isBplCardHolder = data.isBplCardHolder;
        if (data.bplCardNumber !== undefined)
            this._bplCardNumber = data.bplCardNumber;
        if (data.address) {
            this._address = {
                id: this._address?.id || data.address.id || 'addr-default',
                streetAddress: data.address.streetAddress ?? this._address?.streetAddress ?? 'Address',
                city: data.address.city ?? this._address?.city ?? 'City',
                district: data.address.district ?? this._address?.district ?? 'District',
                state: data.address.state ?? this._address?.state ?? 'National',
                pincode: data.address.pincode ?? this._address?.pincode ?? '110001',
                isRural: data.address.isRural ?? this._address?.isRural ?? false,
            };
        }
        this._updatedAt = new Date();
    }
}
exports.CitizenEntity = CitizenEntity;
//# sourceMappingURL=citizen.entity.js.map