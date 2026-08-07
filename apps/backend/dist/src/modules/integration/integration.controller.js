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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationController = exports.VerifyAadhaarOtpDto = exports.RequestAadhaarOtpDto = void 0;
const common_1 = require("@nestjs/common");
const integration_service_1 = require("./integration.service");
const class_validator_1 = require("class-validator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
class RequestAadhaarOtpDto {
    aadhaarNumber;
}
exports.RequestAadhaarOtpDto = RequestAadhaarOtpDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(12),
    __metadata("design:type", String)
], RequestAadhaarOtpDto.prototype, "aadhaarNumber", void 0);
class VerifyAadhaarOtpDto {
    txnId;
    otp;
}
exports.VerifyAadhaarOtpDto = VerifyAadhaarOtpDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyAadhaarOtpDto.prototype, "txnId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], VerifyAadhaarOtpDto.prototype, "otp", void 0);
let IntegrationController = class IntegrationController {
    digiLocker;
    aadhaar;
    dbt;
    constructor(digiLocker, aadhaar, dbt) {
        this.digiLocker = digiLocker;
        this.aadhaar = aadhaar;
        this.dbt = dbt;
    }
    async getDigiLockerAuthUrl() {
        const url = await this.digiLocker.getAuthorizationUrl();
        return { redirectUrl: url };
    }
    async digiLockerCallback(code) {
        const res = await this.digiLocker.handleOAuthCallback(code);
        return { message: 'DigiLocker account linked successfully.', result: res };
    }
    async requestAadhaarOtp(dto) {
        const res = await this.aadhaar.requestVerificationOtp(dto.aadhaarNumber);
        return res;
    }
    async verifyAadhaarOtp(dto) {
        const res = await this.aadhaar.verifyOtp(dto.txnId, dto.otp);
        return { message: 'Aadhaar verification completed.', result: res };
    }
    async getDbtStatus(aadhaarHash) {
        const status = await this.dbt.getDbtStatus(aadhaarHash);
        return { status };
    }
};
exports.IntegrationController = IntegrationController;
__decorate([
    (0, common_1.Get)('digilocker/authorize'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "getDigiLockerAuthUrl", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Post)('digilocker/callback'),
    __param(0, (0, common_1.Body)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "digiLockerCallback", null);
__decorate([
    (0, common_1.Post)('aadhaar/request-otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RequestAadhaarOtpDto]),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "requestAadhaarOtp", null);
__decorate([
    (0, common_1.Post)('aadhaar/verify-otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [VerifyAadhaarOtpDto]),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "verifyAadhaarOtp", null);
__decorate([
    (0, common_1.Get)('dbt/status'),
    __param(0, (0, common_1.Query)('aadhaarHash')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "getDbtStatus", null);
exports.IntegrationController = IntegrationController = __decorate([
    (0, common_1.Controller)('integrations'),
    __metadata("design:paramtypes", [integration_service_1.DigiLockerIntegrationService,
        integration_service_1.AadhaarIntegrationService,
        integration_service_1.DbtIntegrationService])
], IntegrationController);
//# sourceMappingURL=integration.controller.js.map