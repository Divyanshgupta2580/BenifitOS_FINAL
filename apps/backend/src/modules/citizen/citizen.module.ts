import { Module } from '@nestjs/common';
import { CitizenController } from './citizen.controller';
import { CitizenService } from './citizen.service';
import { CitizenRepositoryImpl } from '../../infrastructure/database/repositories/citizen.repository';
import { PrismaService } from '../../infrastructure/database/prisma.service';

import { SchemeRecommendationRepositoryImpl } from '../../infrastructure/database/repositories/welfare.repository';

@Module({
  controllers: [CitizenController],
  providers: [
    CitizenService,
    PrismaService,
    {
      provide: 'ICitizenRepository',
      useClass: CitizenRepositoryImpl,
    },
    {
      provide: 'ISchemeRecommendationRepository',
      useClass: SchemeRecommendationRepositoryImpl,
    },
  ],
  exports: [CitizenService, 'ICitizenRepository'],
})
export class CitizenModule {}
