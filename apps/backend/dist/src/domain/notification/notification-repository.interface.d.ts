export declare enum ChannelType {
    EMAIL = "EMAIL",
    SMS = "SMS",
    WHATSAPP = "WHATSAPP",
    IN_APP = "IN_APP",
    WEBSOCKET = "WEBSOCKET"
}
export declare enum NotificationType {
    SCHEME_ELIGIBILITY = "SCHEME_ELIGIBILITY",
    NEW_SCHEME_ELIGIBLE = "NEW_SCHEME_ELIGIBLE",
    BECAME_ELIGIBLE = "BECAME_ELIGIBLE",
    AGE_ELIGIBILITY_REACHED = "AGE_ELIGIBILITY_REACHED",
    DOCUMENT_REQUIRED = "DOCUMENT_REQUIRED",
    DOCUMENT_VERIFIED = "DOCUMENT_VERIFIED",
    DOCUMENT_REJECTED = "DOCUMENT_REJECTED",
    APPLICATION_READY = "APPLICATION_READY",
    APPLICATION_SUBMITTED = "APPLICATION_SUBMITTED",
    APPLICATION_STATUS_CHANGED = "APPLICATION_STATUS_CHANGED",
    PROFILE_INCOMPLETE = "PROFILE_INCOMPLETE",
    AI_GUIDANCE = "AI_GUIDANCE",
    SYSTEM = "SYSTEM"
}
export declare enum NotificationSeverity {
    INFO = "INFO",
    SUCCESS = "SUCCESS",
    WARNING = "WARNING",
    ERROR = "ERROR"
}
export interface NotificationProps {
    id: string;
    userId: string;
    type?: NotificationType;
    title: string;
    body: string;
    severity?: NotificationSeverity;
    channel: ChannelType;
    isRead: boolean;
    metadata?: Record<string, any> | null;
    dedupKey?: string | null;
    dismissedAt?: Date | null;
    createdAt: Date;
    updatedAt?: Date;
}
export interface INotificationRepository {
    findById(id: string): Promise<NotificationProps | null>;
    findByUserId(userId: string): Promise<NotificationProps[]>;
    countUnread(userId: string): Promise<number>;
    save(notification: NotificationProps): Promise<NotificationProps>;
    markAsRead(id: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    dismissAll(userId: string): Promise<number>;
    delete(id: string): Promise<void>;
    findByDedupKey(userId: string, dedupKey: string): Promise<NotificationProps | null>;
    findRecentSimilar(userId: string, type: NotificationType, title: string, withinMinutes: number): Promise<NotificationProps | null>;
}
