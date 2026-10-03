import { Module } from '@nestjs/common';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { ApplicationRepositoryImpl } from '../../infrastructure/database/repositories/application.repository';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [ApplicationController],
  providers: [
    ApplicationService,
    PrismaService,
    { provide: 'IApplicationRepository', useClass: ApplicationRepositoryImpl },
  ],
  exports: [ApplicationService, 'IApplicationRepository'],
})
export class ApplicationModule {}
