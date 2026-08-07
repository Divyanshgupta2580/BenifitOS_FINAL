import { Module } from '@nestjs/common';
import { WelfareSchemeController } from './welfare.controller';
import { WelfareSchemeService } from './welfare.service';
import { WelfareSchemeRepositoryImpl } from '../../infrastructure/database/repositories/welfare.repository';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Module({
  controllers: [WelfareSchemeController],
  providers: [
    WelfareSchemeService,
    PrismaService,
    {
      provide: 'IWelfareSchemeRepository',
      useClass: WelfareSchemeRepositoryImpl,
    },
  ],
  exports: [WelfareSchemeService, 'IWelfareSchemeRepository'],
})
export class WelfareModule {}
