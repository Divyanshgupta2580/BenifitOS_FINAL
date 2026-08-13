"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCitizenProfileDto = void 0;
const class_validator_1 = require("class-validator");
const citizen_entity_1 = require("../../../domain/citizen/citizen.entity");
class UpdateCitizenProfileDto {
    firstName;
    lastName;
    dateOfBirth;
    gender;
    maritalStatus;
    socialCategory;
    employmentStatus;
    annualIncomeINR;
    disabilityType;
    disabilityPercent;
    isBplCardHolder;
    bplCardNumber;
    state;
    district;
    city;
    streetAddress;
    pincode;
    isRural;
    educationLevel;
    course;
    academicPercentage;
}
exports.UpdateCitizenProfileDto = UpdateCitizenProfileDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCitizenProfileDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCitizenProfileDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateCitizenProfileDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(citizen_entity_1.Gender),
    __metadata("design:type", String)
], UpdateCitizenProfileDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(citizen_entity_1.MaritalStatus),
    __metadata("design:type", String)
], UpdateCitizenProfileDto.prototype, "maritalStatus", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(citizen_entity_1.SocialCategory),
    __metadata("design:type", String)
], UpdateCitizenProfileDto.prototype, "socialCategory", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(citizen_entity_1.EmploymentStatus),
    __metadata("design:type", String)
], UpdateCitizenProfileDto.prototype, "employmentStatus", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateCitizenProfileDto.prototype, "annualIncomeINR", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(citizen_entity_1.DisabilityType),
    __metadata("design:type", String)
], UpdateCitizenProfileDto.prototype, "disabilityType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateCitizenProfileDto.prototype, "disabilityPercent", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateCitizenProfileDto.prototype, "isBplCardHolder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCitizenProfileDto.prototype, "bplCardNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCitizenProfileDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCitizenProfileDto.prototype, "district", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCitizenProfileDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCitizenProfileDto.prototype, "streetAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCitizenProfileDto.prototype, "pincode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateCitizenProfileDto.prototype, "isRural", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCitizenProfileDto.prototype, "educationLevel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCitizenProfileDto.prototype, "course", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateCitizenProfileDto.prototype, "academicPercentage", void 0);
//# sourceMappingURL=citizen.dto.js.map