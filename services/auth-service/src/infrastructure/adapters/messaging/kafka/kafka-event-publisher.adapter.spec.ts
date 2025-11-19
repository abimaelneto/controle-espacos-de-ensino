import { Test, TestingModule } from '@nestjs/testing';
import { KafkaEventPublisherAdapter } from './kafka-event-publisher.adapter';
import { UserCreatedEvent } from '../../../../domain/events/user-created.event';
import { Email } from '../../../../domain/value-objects/email.vo';
import { Role } from '../../../../domain/value-objects/role.vo';
import { Kafka } from 'kafkajs';

jest.mock('kafkajs');

describe('KafkaEventPublisherAdapter', () => {
  let adapter: KafkaEventPublisherAdapter;
  let mockProducer: any;

  beforeEach(async () => {
    mockProducer = {
      connect: jest.fn().mockResolvedValue(undefined),
      send: jest.fn().mockResolvedValue([]),
      disconnect: jest.fn().mockResolvedValue(undefined),
    };

    (Kafka as jest.MockedClass<typeof Kafka>).mockImplementation(() => ({
      producer: jest.fn().mockReturnValue(mockProducer),
    } as any));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: KafkaEventPublisherAdapter,
          useFactory: () => {
            const adapter = new KafkaEventPublisherAdapter('localhost:9092');
            return adapter;
          },
        },
      ],
    }).compile();

    adapter = module.get<KafkaEventPublisherAdapter>(
      KafkaEventPublisherAdapter,
    );
  });

  describe('publish', () => {
    it('should publish event to Kafka', async () => {
      const event = new UserCreatedEvent(
        'user-123',
        new Email('test@example.com'),
        new Role('STUDENT'),
      );

      await adapter.publish(event);

      expect(mockProducer.send).toHaveBeenCalledWith({
        topic: 'user.events',
        messages: [
          {
            key: 'user-123',
            value: JSON.stringify(event.payload),
            headers: {
              eventType: 'UserCreated',
              occurredAt: expect.any(String),
            },
          },
        ],
      });
    });
  });

  describe('publishMany', () => {
    it('should publish multiple events to Kafka', async () => {
      const event1 = new UserCreatedEvent(
        'user-1',
        new Email('test1@example.com'),
        new Role('STUDENT'),
      );
      const event2 = new UserCreatedEvent(
        'user-2',
        new Email('test2@example.com'),
        new Role('ADMIN'),
      );

      await adapter.publishMany([event1, event2]);

      expect(mockProducer.send).toHaveBeenCalledTimes(2);
    });
  });
});

