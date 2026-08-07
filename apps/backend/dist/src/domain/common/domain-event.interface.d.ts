export interface IDomainEvent {
    readonly eventId: string;
    readonly eventType: string;
    readonly aggregateType: string;
    readonly aggregateId: string;
    readonly occurredOn: Date;
    readonly payload: Record<string, any>;
}
