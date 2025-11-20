import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';
import { IEventPublisher } from '../../../../domain/ports/messaging/event-publisher.port';
import { IDomainEvent } from '../../../../domain/events/domain-event.interface';

@Injectable()
export class KafkaEventPublisherAdapter
  implements IEventPublisher, OnModuleInit, OnModuleDestroy
{
  private producer: Producer;
  private kafka: Kafka;

  constructor(private readonly configService: ConfigService) {
    const brokers = this.configService
      .get<string>('KAFKA_BROKERS', 'localhost:9092')
      .split(',');

    this.kafka = new Kafka({
      clientId: 'rooms-service',
      brokers,
    });

    this.producer = this.kafka.producer();
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
          value: JSON.stringify({
            eventType: event.eventType,
            aggregateId: event.aggregateId,
            occurredAt: event.occurredAt.toISOString(),
            payload: event.payload,
          }),
        },
      ],
    });
  }

  async publishMany(events: IDomainEvent[]): Promise<void> {
    const messagesByTopic = new Map<string, any[]>();

    for (const event of events) {
      if (!messagesByTopic.has(event.topic)) {
        messagesByTopic.set(event.topic, []);
      }

      messagesByTopic.get(event.topic)!.push({
        key: event.aggregateId,
        value: JSON.stringify({
          eventType: event.eventType,
          aggregateId: event.aggregateId,
          occurredAt: event.occurredAt.toISOString(),
          payload: event.payload,
        }),
      });
    }

    const promises = Array.from(messagesByTopic.entries()).map(
      ([topic, messages]) =>
        this.producer.send({
          topic,
          messages,
        }),
    );

    await Promise.all(promises);
  }
}

