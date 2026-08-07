import { DigiLockerIntegrationService, AadhaarIntegrationService, DbtIntegrationService } from './integration.service';
export declare class RequestAadhaarOtpDto {
    aadhaarNumber: string;
}
export declare class VerifyAadhaarOtpDto {
    txnId: string;
    otp: string;
}
export declare class IntegrationController {
    private readonly digiLocker;
    private readonly aadhaar;
    private readonly dbt;
    constructor(digiLocker: DigiLockerIntegrationService, aadhaar: AadhaarIntegrationService, dbt: DbtIntegrationService);
    getDigiLockerAuthUrl(): Promise<{
        redirectUrl: string;
    }>;
    digiLockerCallback(code: string): Promise<{
        message: string;
        result: {
            accessToken: string;
            userDocCount: number;
        };
    }>;
    requestAadhaarOtp(dto: RequestAadhaarOtpDto): Promise<{
        txnId: string;
        message: string;
    }>;
    verifyAadhaarOtp(dto: VerifyAadhaarOtpDto): Promise<{
        message: string;
        result: {
            isVerified: boolean;
            nameMatchScore: number;
        };
    }>;
    getDbtStatus(aadhaarHash: string): Promise<{
        status: {
            dbtEnabled: boolean;
            bankName: string;
            lastPaymentDate?: string;
        };
    }>;
}
