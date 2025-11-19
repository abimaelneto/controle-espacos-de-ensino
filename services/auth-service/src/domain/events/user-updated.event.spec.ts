import { UserUpdatedEvent } from './user-updated.event';
import { Email } from '../value-objects/email.vo';
import { Role } from '../value-objects/role.vo';

describe('UserUpdatedEvent', () => {
  it('should create a user updated event', () => {
    const userId = 'user-123';
    const email = new Email('newemail@example.com');
    const role = new Role('ADMIN');

    const event = new UserUpdatedEvent(userId, email, role);

    expect(event).toBeDefined();
    expect(event.eventType).toBe('UserUpdated');
    expect(event.aggregateId).toBe(userId);
    expect(event.occurredAt).toBeInstanceOf(Date);
    expect(event.topic).toBe('user.events');
    expect(event.payload).toEqual({
      userId,
      email: email.toString(),
      role: role.getValue(),
    });
  });
});

