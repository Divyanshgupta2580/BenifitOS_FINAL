import { EligibilityEvaluatorService } from './services/eligibility-evaluator.service';
import { EligibilityAiValidatorService } from './services/eligibility-ai-validator.service';
import { ICitizenRepository } from '../../domain/citizen/citizen-repository.interface';
import { IWelfareSchemeRepository, ISchemeRecommendationRepository } from '../../domain/welfare/welfare-repository.interface';
import { SchemeRecommendationEntity } from '../../domain/welfare/recommendation.entity';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
export declare class RecommendationEngineService {
    private readonly evaluator;
    private readonly aiValidator;
    private readonly citizenRepo;
    private readonly schemeRepo;
    private readonly recommendationRepo;
    private readonly notificationService?;
    private readonly prisma?;
    private readonly logger;
    constructor(evaluator: EligibilityEvaluatorService, aiValidator: EligibilityAiValidatorService, citizenRepo: ICitizenRepository, schemeRepo: IWelfareSchemeRepository, recommendationRepo: ISchemeRecommendationRepository, notificationService?: NotificationService | undefined, prisma?: PrismaService | undefined);
    calculateRecommendationsForCitizen(userId: string): Promise<SchemeRecommendationEntity[]>;
    getRecommendations(userId: string): Promise<SchemeRecommendationEntity[]>;
    getEnrichedRecommendations(userId: string): Promise<any[]>;
}
