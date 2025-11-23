import { Injectable, Logger } from '@nestjs/common';
import { IEventPublisher } from '../../../../domain/ports/messaging/event-publisher.port';
import { IDomainEvent } from '../../../../domain/events/domain-event.interface';

@Injectable()
export class NoopEventPublisherAdapter implements IEventPublisher {
  private readonly logger = new Logger(NoopEventPublisherAdapter.name);

  async publish(event: IDomainEvent): Promise<void> {
    this.logger.debug(`Skipping publish for event ${event.eventType}`);
  }

  async publishMany(events: IDomainEvent[]): Promise<void> {
    this.logger.debug(`Skipping publish for ${events.length} events`);
  }
}

