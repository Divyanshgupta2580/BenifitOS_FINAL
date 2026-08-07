export declare class DigiLockerIntegrationService {
    private readonly logger;
    getAuthorizationUrl(): Promise<string>;
    handleOAuthCallback(code: string): Promise<{
        accessToken: string;
        userDocCount: number;
    }>;
}
export declare class AadhaarIntegrationService {
    private readonly logger;
    requestVerificationOtp(aadhaarNumber: string): Promise<{
        txnId: string;
        message: string;
    }>;
    verifyOtp(txnId: string, otp: string): Promise<{
        isVerified: boolean;
        nameMatchScore: number;
    }>;
}
export declare class DbtIntegrationService {
    getDbtStatus(aadhaarHash: string): Promise<{
        dbtEnabled: boolean;
        bankName: string;
        lastPaymentDate?: string;
    }>;
}
