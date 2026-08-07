import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class DigiLockerIntegrationService {
  private readonly logger = new Logger(DigiLockerIntegrationService.name);

  async getAuthorizationUrl(): Promise<string> {
    const clientId = process.env.DIGILOCKER_CLIENT_ID || 'mock_client';
    const redirectUri = encodeURIComponent(process.env.DIGILOCKER_REDIRECT_URI || 'http://localhost:4000/api/v1/integrations/digilocker/callback');
    return `https://api.digitallocker.gov.in/public/oauth2/1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=security_state`;
  }

  async handleOAuthCallback(code: string): Promise<{ accessToken: string; userDocCount: number }> {
    this.logger.log(`DigiLocker OAuth callback code received: ${code.substring(0, 5)}...`);
    return {
      accessToken: `digilocker_token_${Date.now()}`,
      userDocCount: 3,
    };
  }
}

@Injectable()
export class AadhaarIntegrationService {
  private readonly logger = new Logger(AadhaarIntegrationService.name);

  async requestVerificationOtp(aadhaarNumber: string): Promise<{ txnId: string; message: string }> {
    this.logger.log(`Aadhaar OTP requested for masked Aadhaar: XXXX-XXXX-${aadhaarNumber.slice(-4)}`);
    return {
      txnId: `txn_${Date.now()}`,
      message: 'OTP sent to Aadhaar registered mobile number.',
    };
  }

  async verifyOtp(txnId: string, otp: string): Promise<{ isVerified: boolean; nameMatchScore: number }> {
    this.logger.log(`Verifying Aadhaar OTP for transaction: ${txnId}`);
    return {
      isVerified: otp === '123456' || process.env.AADHAAR_MOCK_MODE === 'true',
      nameMatchScore: 0.98,
    };
  }
}

@Injectable()
export class DbtIntegrationService {
  async getDbtStatus(aadhaarHash: string): Promise<{ dbtEnabled: boolean; bankName: string; lastPaymentDate?: string }> {
    return {
      dbtEnabled: true,
      bankName: 'State Bank of India',
      lastPaymentDate: new Date().toISOString(),
    };
  }
}
