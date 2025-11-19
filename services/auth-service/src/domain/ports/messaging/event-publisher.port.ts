import { IDomainEvent } from '../../events/domain-event.interface';

/**
 * Port: Interface para publicação de eventos de domínio
 * Implementado por adapters (Kafka, MSK, etc.)
 */
export interface IEventPublisher {
  publish(event: IDomainEvent): Promise<void>;
  publishMany(events: IDomainEvent[]): Promise<void>;
}

