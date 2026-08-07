import { Module } from '@nestjs/common';
import { RecommendationController } from './recommendation.controller';
import { RecommendationEngineService } from './recommendation.service';
import { EligibilityEvaluatorService } from './services/eligibility-evaluator.service';
import { CitizenRepositoryImpl } from '../../infrastructure/database/repositories/citizen.repository';
import { WelfareSchemeRepositoryImpl, SchemeRecommendationRepositoryImpl } from '../../infrastructure/database/repositories/welfare.repository';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Module({
  controllers: [RecommendationController],
  providers: [
    RecommendationEngineService,
    EligibilityEvaluatorService,
    PrismaService,
    { provide: 'ICitizenRepository', useClass: CitizenRepositoryImpl },
    { provide: 'IWelfareSchemeRepository', useClass: WelfareSchemeRepositoryImpl },
    { provide: 'ISchemeRecommendationRepository', useClass: SchemeRecommendationRepositoryImpl },
  ],
  exports: [RecommendationEngineService],
})
export class RecommendationModule {}
