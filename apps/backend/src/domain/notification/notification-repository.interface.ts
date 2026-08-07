export enum ChannelType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
  IN_APP = 'IN_APP',
  WEBSOCKET = 'WEBSOCKET',
}

export interface NotificationProps {
  id: string;
  userId: string;
  title: string;
  body: string;
  channel: ChannelType;
  isRead: boolean;
  metadata?: Record<string, any> | null;
  createdAt: Date;
}

export interface INotificationRepository {
  findById(id: string): Promise<NotificationProps | null>;
  findByUserId(userId: string): Promise<NotificationProps[]>;
  save(notification: NotificationProps): Promise<NotificationProps>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
}
