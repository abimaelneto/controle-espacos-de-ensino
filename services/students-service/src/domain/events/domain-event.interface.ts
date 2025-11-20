export interface IDomainEvent {
  eventType: string;
  aggregateId: string;
  occurredAt: Date;
  payload: Record<string, any>;
  topic: string;
}

