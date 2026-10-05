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
        const clientId = process.env.DIGILOCKER_CLIENT_ID;
        if (!clientId && process.env.NODE_ENV === 'production') {
            throw new common_1.ServiceUnavailableException('DigiLocker integration is not configured in this environment.');
        }
        const resolvedClientId = clientId || 'mock_client';
        const redirectUri = encodeURIComponent(process.env.DIGILOCKER_REDIRECT_URI || 'https://benifitos-final.onrender.com/api/v1/integrations/digilocker/callback');
        return `https://api.digitallocker.gov.in/public/oauth2/1/authorize?response_type=code&client_id=${resolvedClientId}&redirect_uri=${redirectUri}&state=security_state`;
    }
    async handleOAuthCallback(code) {
        this.logger.log(`DigiLocker OAuth callback code received: ${code ? code.substring(0, 5) : 'none'}...`);
        if (process.env.NODE_ENV === 'production' && !process.env.DIGILOCKER_CLIENT_SECRET) {
            throw new common_1.ServiceUnavailableException('DigiLocker token exchange is not configured in this environment.');
        }
        return {
            accessToken: `digilocker_token_${Date.now()}`,
            userDocCount: 0,
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
        if (process.env.NODE_ENV === 'production' && !process.env.AADHAAR_GATEWAY_API_KEY) {
            throw new common_1.ServiceUnavailableException('Aadhaar verification gateway is not configured in this environment.');
        }
        return {
            txnId: `txn_${Date.now()}`,
            message: 'OTP sent to Aadhaar registered mobile number.',
        };
    }
    async verifyOtp(txnId, otp) {
        this.logger.log(`Verifying Aadhaar OTP for transaction: ${txnId}`);
        if (process.env.NODE_ENV === 'production') {
            const apiKey = process.env.AADHAAR_GATEWAY_API_KEY;
            if (!apiKey) {
                throw new common_1.ServiceUnavailableException('Aadhaar verification gateway is not configured in this environment.');
            }
            return { isVerified: false, nameMatchScore: 0.0 };
        }
        return {
            isVerified: process.env.AADHAAR_MOCK_MODE === 'true' || otp === '123456',
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
        if (process.env.NODE_ENV === 'production' && !process.env.DBT_GATEWAY_API_KEY) {
            throw new common_1.ServiceUnavailableException('Direct Benefit Transfer (DBT) verification gateway is not configured in this environment.');
        }
        return {
            dbtEnabled: false,
            bankName: 'Unlinked',
        };
    }
};
exports.DbtIntegrationService = DbtIntegrationService;
exports.DbtIntegrationService = DbtIntegrationService = __decorate([
    (0, common_1.Injectable)()
], DbtIntegrationService);
//# sourceMappingURL=integration.service.js.map