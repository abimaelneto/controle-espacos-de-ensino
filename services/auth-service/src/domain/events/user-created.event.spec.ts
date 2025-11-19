import { UserCreatedEvent } from './user-created.event';
import { Email } from '../value-objects/email.vo';
import { Role } from '../value-objects/role.vo';

describe('UserCreatedEvent', () => {
  it('should create a user created event', () => {
    const userId = 'user-123';
    const email = new Email('test@example.com');
    const role = new Role('STUDENT');

    const event = new UserCreatedEvent(userId, email, role);

    expect(event).toBeDefined();
    expect(event.eventType).toBe('UserCreated');
    expect(event.aggregateId).toBe(userId);
    expect(event.occurredAt).toBeInstanceOf(Date);
    expect(event.topic).toBe('user.events');
    expect(event.payload).toEqual({
      userId,
      email: email.toString(),
      role: role.getValue(),
    });
  });

  it('should have occurredAt as current date', () => {
    const before = new Date();
    const event = new UserCreatedEvent(
      'user-123',
      new Email('test@example.com'),
      new Role('STUDENT'),
    );
    const after = new Date();

    expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});

