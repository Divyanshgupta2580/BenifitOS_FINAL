"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DigiLockerIntegrationService_1, AadhaarIntegrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbtIntegrationService = exports.AadhaarIntegrationService = exports.DigiLockerIntegrationService = void 0;
const common_1 = require("@nestjs/common");
let DigiLockerIntegrationService = DigiLockerIntegrationService_1 = class DigiLockerIntegrationService {
    logger = new common_1.Logger(DigiLockerIntegrationService_1.name);
    async getAuthorizationUrl() {
        const clientId = process.env.DIGILOCKER_CLIENT_ID || 'mock_client';
        const redirectUri = encodeURIComponent(process.env.DIGILOCKER_REDIRECT_URI || 'http://localhost:4000/api/v1/integrations/digilocker/callback');
        return `https://api.digitallocker.gov.in/public/oauth2/1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=security_state`;
    }
    async handleOAuthCallback(code) {
        this.logger.log(`DigiLocker OAuth callback code received: ${code.substring(0, 5)}...`);
        return {
            accessToken: `digilocker_token_${Date.now()}`,
            userDocCount: 3,
        };
    }
};
exports.DigiLockerIntegrationService = DigiLockerIntegrationService;
exports.DigiLockerIntegrationService = DigiLockerIntegrationService = DigiLockerIntegrationService_1 = __decorate([
    (0, common_1.Injectable)()
], DigiLockerIntegrationService);
let AadhaarIntegrationService = AadhaarIntegrationService_1 = class AadhaarIntegrationService {
    logger = new common_1.Logger(AadhaarIntegrationService_1.name);
    async requestVerificationOtp(aadhaarNumber) {
        this.logger.log(`Aadhaar OTP requested for masked Aadhaar: XXXX-XXXX-${aadhaarNumber.slice(-4)}`);
        return {
            txnId: `txn_${Date.now()}`,
            message: 'OTP sent to Aadhaar registered mobile number.',
        };
    }
    async verifyOtp(txnId, otp) {
        this.logger.log(`Verifying Aadhaar OTP for transaction: ${txnId}`);
        return {
            isVerified: otp === '123456' || process.env.AADHAAR_MOCK_MODE === 'true',
            nameMatchScore: 0.98,
        };
    }
};
exports.AadhaarIntegrationService = AadhaarIntegrationService;
exports.AadhaarIntegrationService = AadhaarIntegrationService = AadhaarIntegrationService_1 = __decorate([
    (0, common_1.Injectable)()
], AadhaarIntegrationService);
let DbtIntegrationService = class DbtIntegrationService {
    async getDbtStatus(aadhaarHash) {
        return {
            dbtEnabled: true,
            bankName: 'State Bank of India',
            lastPaymentDate: new Date().toISOString(),
        };
    }
};
exports.DbtIntegrationService = DbtIntegrationService;
exports.DbtIntegrationService = DbtIntegrationService = __decorate([
    (0, common_1.Injectable)()
], DbtIntegrationService);
//# sourceMappingURL=integration.service.js.map