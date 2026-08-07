import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationRepositoryImpl } from '../../infrastructure/database/repositories/notification.repository';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Module({
  controllers: [NotificationController],
  providers: [
    NotificationService,
    PrismaService,
    { provide: 'INotificationRepository', useClass: NotificationRepositoryImpl },
  ],
  exports: [NotificationService, 'INotificationRepository'],
})
export class NotificationModule {}
