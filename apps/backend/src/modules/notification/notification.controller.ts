import { Controller, Get, Patch, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(@CurrentUser('sub') userId: string) {
    const notifications = await this.notificationService.getUserNotifications(userId);
    const unreadCount = await this.notificationService.getUnreadCount(userId);
    return {
      count: notifications.length,
      unreadCount,
      notifications,
    };
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser('sub') userId: string) {
    const unreadCount = await this.notificationService.getUnreadCount(userId);
    return { unreadCount };
  }

  @Patch('read-all')
  async markAllAsRead(@CurrentUser('sub') userId: string) {
    await this.notificationService.markAllAsRead(userId);
    return { message: 'All notifications marked as read.' };
  }

  @Patch(':id/read')
  async markAsRead(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    await this.notificationService.markAsRead(userId, id);
    return { message: 'Notification marked as read.' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNotification(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    await this.notificationService.deleteNotification(userId, id);
  }
}

