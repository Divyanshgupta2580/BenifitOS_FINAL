import { IWelfareSchemeRepository } from '../../domain/welfare/welfare-repository.interface';
import { WelfareSchemeEntity, SchemeCategory } from '../../domain/welfare/scheme.entity';
export declare class WelfareSchemeService {
    private readonly schemeRepo;
    constructor(schemeRepo: IWelfareSchemeRepository);
    getAllSchemes(category?: SchemeCategory, state?: string): Promise<WelfareSchemeEntity[]>;
    getSchemeById(id: string): Promise<WelfareSchemeEntity>;
}
