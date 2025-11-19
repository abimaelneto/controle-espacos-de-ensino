import { IDomainEvent } from './domain-event.interface';

export class UserDeactivatedEvent implements IDomainEvent {
  readonly eventType = 'UserDeactivated';
  readonly aggregateId: string;
  readonly occurredAt: Date;
  readonly topic = 'user.events';
  readonly payload: {
    userId: string;
  };

  constructor(userId: string) {
    this.aggregateId = userId;
    this.occurredAt = new Date();
    this.payload = {
      userId,
    };
  }
}

