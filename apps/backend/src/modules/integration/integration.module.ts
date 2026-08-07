import { Module } from '@nestjs/common';
import { IntegrationController } from './integration.controller';
import { DigiLockerIntegrationService, AadhaarIntegrationService, DbtIntegrationService } from './integration.service';

@Module({
  controllers: [IntegrationController],
  providers: [DigiLockerIntegrationService, AadhaarIntegrationService, DbtIntegrationService],
  exports: [DigiLockerIntegrationService, AadhaarIntegrationService, DbtIntegrationService],
})
export class IntegrationModule {}
