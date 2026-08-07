import { BaseDomainEntity } from '../common/domain-entity.base';
import { DocumentType } from './scheme.entity';
export interface RecommendationProps {
    id: string;
    citizenProfileId: string;
    schemeId: string;
    matchPercentage: number;
    estimatedBenefit: number;
    isEligible: boolean;
    criteriaMet: string[];
    missingCriteria: string[];
    missingDocuments: DocumentType[];
    calculatedAt?: Date;
}
export declare class SchemeRecommendationEntity extends BaseDomainEntity<RecommendationProps> {
    private _citizenProfileId;
    private _schemeId;
    private _matchPercentage;
    private _estimatedBenefit;
    private _isEligible;
    private _criteriaMet;
    private _missingCriteria;
    private _missingDocuments;
    constructor(props: RecommendationProps);
    get citizenProfileId(): string;
    get schemeId(): string;
    get matchPercentage(): number;
    get estimatedBenefit(): number;
    get isEligible(): boolean;
    get criteriaMet(): string[];
    get missingCriteria(): string[];
    get missingDocuments(): DocumentType[];
}
