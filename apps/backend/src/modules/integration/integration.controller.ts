import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { DigiLockerIntegrationService, AadhaarIntegrationService, DbtIntegrationService } from './integration.service';
import { IsString, MinLength } from 'class-validator';
import { Public } from '../../common/decorators/roles.decorator';

export class RequestAadhaarOtpDto {
  @IsString()
  @MinLength(12)
  aadhaarNumber: string;
}

export class VerifyAadhaarOtpDto {
  @IsString()
  txnId: string;

  @IsString()
  @MinLength(6)
  otp: string;
}

@Controller('integrations')
export class IntegrationController {
  constructor(
    private readonly digiLocker: DigiLockerIntegrationService,
    private readonly aadhaar: AadhaarIntegrationService,
    private readonly dbt: DbtIntegrationService,
  ) {}

  @Get('digilocker/authorize')
  async getDigiLockerAuthUrl() {
    const url = await this.digiLocker.getAuthorizationUrl();
    return { redirectUrl: url };
  }

  @Public()
  @Post('digilocker/callback')
  async digiLockerCallback(@Body('code') code: string) {
    const res = await this.digiLocker.handleOAuthCallback(code);
    return { message: 'DigiLocker account linked successfully.', result: res };
  }

  @Post('aadhaar/request-otp')
  async requestAadhaarOtp(@Body() dto: RequestAadhaarOtpDto) {
    const res = await this.aadhaar.requestVerificationOtp(dto.aadhaarNumber);
    return res;
  }

  @Post('aadhaar/verify-otp')
  async verifyAadhaarOtp(@Body() dto: VerifyAadhaarOtpDto) {
    const res = await this.aadhaar.verifyOtp(dto.txnId, dto.otp);
    return { message: 'Aadhaar verification completed.', result: res };
  }

  @Get('dbt/status')
  async getDbtStatus(@Query('aadhaarHash') aadhaarHash: string) {
    const status = await this.dbt.getDbtStatus(aadhaarHash);
    return { status };
  }
}
