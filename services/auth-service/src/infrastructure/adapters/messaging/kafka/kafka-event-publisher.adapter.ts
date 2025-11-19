import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { IEventPublisher } from '../../../../domain/ports/messaging/event-publisher.port';
import { IDomainEvent } from '../../../../domain/events/domain-event.interface';

@Injectable()
export class KafkaEventPublisherAdapter
  implements IEventPublisher, OnModuleInit, OnModuleDestroy
{
  private producer: Producer;

  constructor(private readonly brokers: string) {
    const kafka = new Kafka({
      clientId: 'auth-service',
      brokers: brokers.split(','),
    });
    this.producer = kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async publish(event: IDomainEvent): Promise<void> {
    await this.producer.send({
      topic: event.topic,
      messages: [
        {
          key: event.aggregateId,
          value: JSON.stringify(event.payload),
          headers: {
            eventType: event.eventType,
            occurredAt: event.occurredAt.toISOString(),
          },
        },
      ],
    });
  }

  async publishMany(events: IDomainEvent[]): Promise<void> {
    const messages = events.map((event) => ({
      topic: event.topic,
      messages: [
        {
          key: event.aggregateId,
          value: JSON.stringify(event.payload),
          headers: {
            eventType: event.eventType,
            occurredAt: event.occurredAt.toISOString(),
          },
        },
      ],
    }));

    for (const message of messages) {
      await this.producer.send(message);
    }
  }
}

