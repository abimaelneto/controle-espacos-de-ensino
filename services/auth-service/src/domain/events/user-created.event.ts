import { IDomainEvent } from './domain-event.interface';
import { Email } from '../value-objects/email.vo';
import { Role } from '../value-objects/role.vo';

export class UserCreatedEvent implements IDomainEvent {
  readonly eventType = 'UserCreated';
  readonly aggregateId: string;
  readonly occurredAt: Date;
  readonly topic = 'user.events';
  readonly payload: {
    userId: string;
    email: string;
    role: string;
  };

  constructor(userId: string, email: Email, role: Role) {
    this.aggregateId = userId;
    this.occurredAt = new Date();
    this.payload = {
      userId,
      email: email.toString(),
      role: role.getValue(),
    };
  }
}

