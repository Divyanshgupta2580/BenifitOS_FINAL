import { Test, TestingModule } from '@nestjs/testing';

describe('IntegrationGateway Contract Specification', () => {
  let mockAadhaarGateway: any;
  let mockDigiLockerGateway: any;

  beforeEach(() => {
    mockAadhaarGateway = {
      requestOtp: jest.fn().mockResolvedValue({ txnId: 'txn-999', status: 'OTP_SENT' }),
      verifyOtp: jest.fn().mockResolvedValue({ status: 'VERIFIED', kycData: { name: 'Citizen Name' } }),
    };

    mockDigiLockerGateway = {
      getAuthUrl: jest.fn().mockReturnValue('https://digilocker.gov.in/oauth/authorize?mock=true'),
    };
  });

  it('should process Aadhaar OTP request contract mock', async () => {
    const res = await mockAadhaarGateway.requestOtp('123456789012');
    expect(res.status).toBe('OTP_SENT');
  });

  it('should return valid DigiLocker authorization URL contract mock', () => {
    const url = mockDigiLockerGateway.getAuthUrl();
    expect(url).toContain('digilocker.gov.in');
  });
});
