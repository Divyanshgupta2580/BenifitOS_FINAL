import { BaseDomainEntity } from '../common/domain-entity.base';
import { DocumentType } from './scheme.entity';
export type EligibilityStatus = 'NOT_ELIGIBLE' | 'PARTIALLY_ELIGIBLE' | 'INSUFFICIENT_DATA' | 'CLAIM_READY' | 'DOCUMENTS_PENDING' | 'APPLICATION_READY' | 'REVIEW_REQUIRED';
export interface RecommendationProps {
    id: string;
    citizenProfileId: string;
    schemeId: string;
    matchPercentage: number;
    estimatedBenefit: number;
    isEligible: boolean;
    status?: EligibilityStatus;
    criteriaMet: string[];
    missingCriteria: string[];
    missingDocuments: DocumentType[];
    aiValidation?: Record<string, any> | null;
    calculatedAt?: Date;
}
export declare class SchemeRecommendationEntity extends BaseDomainEntity<RecommendationProps> {
    private _citizenProfileId;
    private _schemeId;
    private _matchPercentage;
    private _estimatedBenefit;
    private _isEligible;
    private _status;
    private _criteriaMet;
    private _missingCriteria;
    private _missingDocuments;
    private _aiValidation?;
    constructor(props: RecommendationProps);
    get citizenProfileId(): string;
    get schemeId(): string;
    get matchPercentage(): number;
    get estimatedBenefit(): number;
    get isEligible(): boolean;
    get status(): EligibilityStatus;
    get criteriaMet(): string[];
    get missingCriteria(): string[];
    get missingDocuments(): DocumentType[];
    get aiValidation(): Record<string, any> | null | undefined;
    get calculatedAt(): Date;
}
