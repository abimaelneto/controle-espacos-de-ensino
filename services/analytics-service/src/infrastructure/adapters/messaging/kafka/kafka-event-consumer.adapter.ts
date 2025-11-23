import { Injectable, OnModuleInit, OnModuleDestroy, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { IEventConsumer } from '../../../../domain/ports/messaging/event-consumer.port';
import { IDomainEvent } from '../../../../domain/events/domain-event.interface';
import { EventDeduplicationAdapter } from '../../cache/event-deduplication.adapter';

@Injectable()
export class KafkaEventConsumerAdapter
  implements IEventConsumer, OnModuleInit, OnModuleDestroy
{
  private consumer: Consumer;
  private kafka: Kafka;
  private handlers: Map<string, (event: IDomainEvent) => Promise<void>> =
    new Map();

  constructor(
    private readonly configService: ConfigService,
    @Optional() private readonly deduplicationAdapter?: EventDeduplicationAdapter,
  ) {
    const brokers = this.configService
      .get<string>('KAFKA_BROKERS', 'localhost:9092')
      .split(',');

    this.kafka = new Kafka({
      clientId: 'analytics-service',
      brokers,
    });

    this.consumer = this.kafka.consumer({
      groupId: 'analytics-service-group',
    });
  }

  async onModuleInit() {
    await this.consumer.connect();
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }

  async subscribe(
    topic: string,
    handler: (event: IDomainEvent) => Promise<void>,
  ): Promise<void> {
    this.handlers.set(topic, handler);

    await this.consumer.subscribe({ topic, fromBeginning: false });

    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        try {
          const message = payload.message;
          if (!message.value) {
            return;
          }

          const eventData = JSON.parse(message.value.toString());
          const event: IDomainEvent = {
            eventType: eventData.eventType,
            aggregateId: eventData.aggregateId,
            occurredAt: new Date(eventData.occurredAt),
            payload: eventData.payload,
            topic: payload.topic,
          };

          // Verificar deduplicação
          if (this.deduplicationAdapter) {
            const isNew = await this.deduplicationAdapter.checkAndMark(event);
            if (!isNew) {
              console.log(`Skipping duplicate event: ${event.eventType} for ${event.aggregateId}`);
              return;
            }
          }

          const handler = this.handlers.get(payload.topic);
          if (handler) {
            await handler(event);
          }
        } catch (error) {
          console.error('Error processing event:', error);
        }
      },
    });
  }

  async start(): Promise<void> {
    // Already started in onModuleInit
  }

  async stop(): Promise<void> {
    await this.consumer.disconnect();
  }
}

