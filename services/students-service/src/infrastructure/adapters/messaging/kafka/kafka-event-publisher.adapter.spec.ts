import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { KafkaEventPublisherAdapter } from './kafka-event-publisher.adapter';
import { IDomainEvent } from '../../../../domain/events/domain-event.interface';
import { Kafka, Producer } from 'kafkajs';

jest.mock('kafkajs');

describe('KafkaEventPublisherAdapter', () => {
  let adapter: KafkaEventPublisherAdapter;
  let configService: jest.Mocked<ConfigService>;
  let mockProducer: jest.Mocked<Producer>;

  beforeEach(async () => {
    mockProducer = {
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
      send: jest.fn().mockResolvedValue(undefined),
    } as any;

    const MockKafka = Kafka as jest.MockedClass<typeof Kafka>;
    MockKafka.mockImplementation(() => ({
      producer: jest.fn().mockReturnValue(mockProducer),
    } as any));

    configService = {
      get: jest.fn().mockReturnValue('localhost:9092'),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KafkaEventPublisherAdapter,
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    adapter = module.get<KafkaEventPublisherAdapter>(
      KafkaEventPublisherAdapter,
    );
  });

  afterEach(async () => {
    if (adapter) {
      await adapter.onModuleDestroy().catch(() => {});
    }
  });

  describe('publish', () => {
    it('should publish event to Kafka', async () => {
      await adapter.onModuleInit();

      const event: IDomainEvent = {
        eventType: 'StudentCreated',
        aggregateId: 'student-123',
        occurredAt: new Date(),
        topic: 'student.events',
        payload: { studentId: 'student-123' },
      };

      await adapter.publish(event);

      expect(mockProducer.send).toHaveBeenCalledWith({
        topic: 'student.events',
        messages: [
          {
            key: 'student-123',
            value: expect.stringContaining('StudentCreated'),
          },
        ],
      });
    });
  });

  describe('publishMany', () => {
    it('should publish multiple events to Kafka', async () => {
      await adapter.onModuleInit();

      const events: IDomainEvent[] = [
        {
          eventType: 'StudentCreated',
          aggregateId: 'student-1',
          occurredAt: new Date(),
          topic: 'student.events',
          payload: {},
        },
        {
          eventType: 'StudentCreated',
          aggregateId: 'student-2',
          occurredAt: new Date(),
          topic: 'student.events',
          payload: {},
        },
      ];

      await adapter.publishMany(events);

      expect(mockProducer.send).toHaveBeenCalled();
    });
  });
});
