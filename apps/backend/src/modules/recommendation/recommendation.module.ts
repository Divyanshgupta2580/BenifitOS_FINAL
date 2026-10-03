import { Module } from '@nestjs/common';
import { RecommendationController } from './recommendation.controller';
import { RecommendationEngineService } from './recommendation.service';
import { EligibilityEvaluatorService } from './services/eligibility-evaluator.service';
import { EligibilityAiValidatorService } from './services/eligibility-ai-validator.service';
import { CitizenRepositoryImpl } from '../../infrastructure/database/repositories/citizen.repository';
import { WelfareSchemeRepositoryImpl, SchemeRecommendationRepositoryImpl } from '../../infrastructure/database/repositories/welfare.repository';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { AiModule } from '../ai/ai.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [AiModule, NotificationModule],
  controllers: [RecommendationController],
  providers: [
    RecommendationEngineService,
    EligibilityEvaluatorService,
    EligibilityAiValidatorService,
    PrismaService,
    { provide: 'ICitizenRepository', useClass: CitizenRepositoryImpl },
    { provide: 'IWelfareSchemeRepository', useClass: WelfareSchemeRepositoryImpl },
    { provide: 'ISchemeRecommendationRepository', useClass: SchemeRecommendationRepositoryImpl },
  ],
  exports: [RecommendationEngineService, EligibilityEvaluatorService, EligibilityAiValidatorService],
})
export class RecommendationModule {}

