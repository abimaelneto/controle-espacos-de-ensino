import { IDomainEvent } from '../../events/domain-event.interface';

/**
 * Port: Interface para publicação de eventos de domínio
 */
export interface IEventPublisher {
  publish(event: IDomainEvent): Promise<void>;
  publishMany(events: IDomainEvent[]): Promise<void>;
}

