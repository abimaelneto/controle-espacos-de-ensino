import { IDomainEvent } from '../../events/domain-event.interface';

/**
 * Port: Interface para consumo de eventos de domínio
 * Implementado por adapters (Kafka, MSK, etc.)
 */
export interface IEventConsumer {
  subscribe(topic: string, handler: (event: IDomainEvent) => Promise<void>): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
}

