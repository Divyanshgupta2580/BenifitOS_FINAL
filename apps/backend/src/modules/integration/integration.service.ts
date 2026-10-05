import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

@Injectable()
export class DigiLockerIntegrationService {
  private readonly logger = new Logger(DigiLockerIntegrationService.name);

  async getAuthorizationUrl(): Promise<string> {
    const clientId = process.env.DIGILOCKER_CLIENT_ID;
    if (!clientId && process.env.NODE_ENV === 'production') {
      throw new ServiceUnavailableException('DigiLocker integration is not configured in this environment.');
    }
    const resolvedClientId = clientId || 'mock_client';
    const redirectUri = encodeURIComponent(
      process.env.DIGILOCKER_REDIRECT_URI || 'https://benifitos-final.onrender.com/api/v1/integrations/digilocker/callback',
    );
    return `https://api.digitallocker.gov.in/public/oauth2/1/authorize?response_type=code&client_id=${resolvedClientId}&redirect_uri=${redirectUri}&state=security_state`;
  }

  async handleOAuthCallback(code: string): Promise<{ accessToken: string; userDocCount: number }> {
    this.logger.log(`DigiLocker OAuth callback code received: ${code ? code.substring(0, 5) : 'none'}...`);
    if (process.env.NODE_ENV === 'production' && !process.env.DIGILOCKER_CLIENT_SECRET) {
      throw new ServiceUnavailableException('DigiLocker token exchange is not configured in this environment.');
    }
    return {
      accessToken: `digilocker_token_${Date.now()}`,
      userDocCount: 0,
    };
  }
}

@Injectable()
export class AadhaarIntegrationService {
  private readonly logger = new Logger(AadhaarIntegrationService.name);

  async requestVerificationOtp(aadhaarNumber: string): Promise<{ txnId: string; message: string }> {
    this.logger.log(`Aadhaar OTP requested for masked Aadhaar: XXXX-XXXX-${aadhaarNumber.slice(-4)}`);
    if (process.env.NODE_ENV === 'production' && !process.env.AADHAAR_GATEWAY_API_KEY) {
      throw new ServiceUnavailableException('Aadhaar verification gateway is not configured in this environment.');
    }
    return {
      txnId: `txn_${Date.now()}`,
      message: 'OTP sent to Aadhaar registered mobile number.',
    };
  }

  async verifyOtp(txnId: string, otp: string): Promise<{ isVerified: boolean; nameMatchScore: number }> {
    this.logger.log(`Verifying Aadhaar OTP for transaction: ${txnId}`);
    if (process.env.NODE_ENV === 'production') {
      const apiKey = process.env.AADHAAR_GATEWAY_API_KEY;
      if (!apiKey) {
        throw new ServiceUnavailableException('Aadhaar verification gateway is not configured in this environment.');
      }
      return { isVerified: false, nameMatchScore: 0.0 };
    }
    return {
      isVerified: process.env.AADHAAR_MOCK_MODE === 'true' || otp === '123456',
      nameMatchScore: 0.98,
    };
  }
}

@Injectable()
export class DbtIntegrationService {
  async getDbtStatus(aadhaarHash: string): Promise<{ dbtEnabled: boolean; bankName: string; lastPaymentDate?: string }> {
    if (process.env.NODE_ENV === 'production' && !process.env.DBT_GATEWAY_API_KEY) {
      throw new ServiceUnavailableException('Direct Benefit Transfer (DBT) verification gateway is not configured in this environment.');
    }
    return {
      dbtEnabled: false,
      bankName: 'Unlinked',
    };
  }
}
