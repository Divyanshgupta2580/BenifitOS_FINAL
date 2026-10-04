import { Module, forwardRef } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { ProactiveNotificationService } from './proactive-notification.service';
import { NotificationRepositoryImpl } from '../../infrastructure/database/repositories/notification.repository';
import { CitizenRepositoryImpl } from '../../infrastructure/database/repositories/citizen.repository';
import { WelfareSchemeRepositoryImpl } from '../../infrastructure/database/repositories/welfare.repository';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { RealtimeModule } from '../realtime/realtime.module';
import { RecommendationModule } from '../recommendation/recommendation.module';

@Module({
  imports: [
    forwardRef(() => RealtimeModule),
    forwardRef(() => RecommendationModule),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    ProactiveNotificationService,
    PrismaService,
    { provide: 'INotificationRepository', useClass: NotificationRepositoryImpl },
    { provide: 'ICitizenRepository', useClass: CitizenRepositoryImpl },
    { provide: 'IWelfareSchemeRepository', useClass: WelfareSchemeRepositoryImpl },
  ],
  exports: [
    NotificationService,
    ProactiveNotificationService,
    'INotificationRepository',
  ],
})
export class NotificationModule {}
