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
exports.ResetPasswordDto = exports.ForgotPasswordDto = exports.GoogleLoginDto = exports.RefreshTokenDto = exports.LoginDto = exports.RegisterDto = void 0;
const class_validator_1 = require("class-validator");
const citizen_entity_1 = require("../../../domain/citizen/citizen.entity");
class RegisterDto {
    name;
    age;
    category;
    profession;
    annualIncome;
    state;
    email;
    password;
    phone;
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Full name is required' }),
    (0, class_validator_1.MinLength)(2, { message: 'Name must be at least 2 characters long' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'Age must be a valid integer' }),
    (0, class_validator_1.Min)(18, { message: 'Citizen must be at least 18 years old' }),
    (0, class_validator_1.Max)(120, { message: 'Age must be less than 120' }),
    __metadata("design:type", Number)
], RegisterDto.prototype, "age", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(citizen_entity_1.SocialCategory, { message: 'Category must be one of GENERAL, OBC, SC, ST, EWS' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(citizen_entity_1.EmploymentStatus, { message: 'Profession must be one of EMPLOYED, UNEMPLOYED, SELF_EMPLOYED, STUDENT, RETIRED, FARMER, DAILY_WAGE' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "profession", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'Annual income must be a valid number' }),
    (0, class_validator_1.Min)(0, { message: 'Annual income cannot be negative' }),
    __metadata("design:type", Number)
], RegisterDto.prototype, "annualIncome", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'State of residence is required' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Must be a valid email address' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters long' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "phone", void 0);
class LoginDto {
    email;
    password;
}
exports.LoginDto = LoginDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class RefreshTokenDto {
    refreshToken;
}
exports.RefreshTokenDto = RefreshTokenDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);
class GoogleLoginDto {
    idToken;
}
exports.GoogleLoginDto = GoogleLoginDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GoogleLoginDto.prototype, "idToken", void 0);
class ForgotPasswordDto {
    email;
}
exports.ForgotPasswordDto = ForgotPasswordDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Must be a valid email address' }),
    __metadata("design:type", String)
], ForgotPasswordDto.prototype, "email", void 0);
class ResetPasswordDto {
    token;
    newPassword;
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Reset token is required' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "token", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters long' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
//# sourceMappingURL=auth.dto.js.map