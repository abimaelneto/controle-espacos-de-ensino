import { Injectable, Logger } from '@nestjs/common';
import { IEventConsumer } from '../../../../domain/ports/messaging/event-consumer.port';
import { IDomainEvent } from '../../../../domain/events/domain-event.interface';

@Injectable()
export class NoopEventConsumerAdapter implements IEventConsumer {
  private readonly logger = new Logger(NoopEventConsumerAdapter.name);

  async subscribe(
    topic: string,
    handler: (event: IDomainEvent) => Promise<void>,
  ): Promise<void> {
    this.logger.debug(`Skipping subscribe for topic ${topic}`);
  }

  async start(): Promise<void> {
    this.logger.debug('NoopEventConsumerAdapter started (no-op)');
  }

  async stop(): Promise<void> {
    this.logger.debug('NoopEventConsumerAdapter stopped (no-op)');
  }
}

