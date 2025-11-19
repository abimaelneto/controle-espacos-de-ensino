import { UserDeactivatedEvent } from './user-deactivated.event';

describe('UserDeactivatedEvent', () => {
  it('should create a user deactivated event', () => {
    const userId = 'user-123';

    const event = new UserDeactivatedEvent(userId);

    expect(event).toBeDefined();
    expect(event.eventType).toBe('UserDeactivated');
    expect(event.aggregateId).toBe(userId);
    expect(event.occurredAt).toBeInstanceOf(Date);
    expect(event.topic).toBe('user.events');
    expect(event.payload).toEqual({
      userId,
    });
  });
});

