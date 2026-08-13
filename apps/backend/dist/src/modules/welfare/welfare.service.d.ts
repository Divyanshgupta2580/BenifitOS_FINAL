import { OnModuleInit } from '@nestjs/common';
import { IWelfareSchemeRepository } from '../../domain/welfare/welfare-repository.interface';
import { WelfareSchemeEntity, SchemeCategory } from '../../domain/welfare/scheme.entity';
import { PrismaService } from '../../infrastructure/database/prisma.service';
export declare class WelfareSchemeService implements OnModuleInit {
    private readonly schemeRepo;
    private readonly prisma;
    private readonly logger;
    constructor(schemeRepo: IWelfareSchemeRepository, prisma: PrismaService);
    onModuleInit(): Promise<void>;
    getAllSchemes(category?: SchemeCategory, state?: string): Promise<WelfareSchemeEntity[]>;
    getSchemeById(id: string): Promise<WelfareSchemeEntity>;
}
