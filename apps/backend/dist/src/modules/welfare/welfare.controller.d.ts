import { WelfareSchemeService } from './welfare.service';
import { SchemeCategory } from '../../domain/welfare/scheme.entity';
export declare class WelfareSchemeController {
    private readonly schemeService;
    constructor(schemeService: WelfareSchemeService);
    getSchemes(category?: SchemeCategory, state?: string): Promise<{
        count: number;
        schemes: {
            id: string;
            code: string;
            title: string;
            description: string;
            category: SchemeCategory;
            department: string;
            financialBenefit: number;
            isCentralScheme: boolean;
        }[];
    }>;
    getSchemeById(id: string): Promise<{
        scheme: {
            id: string;
            code: string;
            title: string;
            description: string;
            category: SchemeCategory;
            department: string;
            financialBenefit: number;
            eligibilityRules: import("../../domain/welfare/scheme.entity").EligibilityRule[];
            requiredDocuments: import("../../domain/welfare/scheme.entity").DocumentType[];
        };
    }>;
}
