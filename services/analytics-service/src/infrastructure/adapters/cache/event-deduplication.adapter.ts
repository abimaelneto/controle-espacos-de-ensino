import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { IDomainEvent } from '../../../domain/events/domain-event.interface';

/**
 * Adapter para deduplicação de eventos
 * Previne processamento duplicado de eventos Kafka
 */
@Injectable()
export class EventDeduplicationAdapter
  implements OnModuleInit, OnModuleDestroy
{
  private redis: Redis;
  private readonly defaultTtl: number = 86400; // 24 horas

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);

    this.redis = new Redis({
      host,
      port,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });
  }

  async onModuleInit() {
    // Redis já está conectado na criação
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  /**
   * Gera uma chave única para o evento
   */
  private generateEventKey(event: IDomainEvent): string {
    // Usa aggregateId + eventType + timestamp para identificar eventos únicos
    const timestamp = Math.floor(event.occurredAt.getTime() / 1000); // Segundos
    return `event:${event.aggregateId}:${event.eventType}:${timestamp}`;
  }

  /**
   * Verifica se um evento já foi processado
   * @param event Evento a verificar
   * @returns true se já foi processado, false caso contrário
   */
  async isDuplicate(event: IDomainEvent): Promise<boolean> {
    try {
      const key = this.generateEventKey(event);
      const exists = await this.redis.exists(key);
      return exists === 1;
    } catch (error) {
      // Se Redis falhar, assume que não é duplicado (fail-open)
      console.warn('Event deduplication check failed, allowing event:', error);
      return false;
    }
  }

  /**
   * Marca um evento como processado
   * @param event Evento processado
   */
  async markAsProcessed(event: IDomainEvent): Promise<void> {
    try {
      const key = this.generateEventKey(event);
      await this.redis.setex(key, this.defaultTtl, '1');
    } catch (error) {
      // Log mas não falha se Redis estiver indisponível
      console.warn('Failed to mark event as processed:', error);
    }
  }

  /**
   * Verifica e marca como processado atomicamente
   * @param event Evento a verificar
   * @returns true se foi processado pela primeira vez, false se já foi processado
   */
  async checkAndMark(event: IDomainEvent): Promise<boolean> {
    try {
      const key = this.generateEventKey(event);
      const result = await this.redis.set(key, '1', 'EX', this.defaultTtl, 'NX');
      return result === 'OK';
    } catch (error) {
      // Se Redis falhar, assume que não é duplicado (fail-open)
      console.warn('Event deduplication check failed, allowing event:', error);
      return true;
    }
  }
}

