import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Adapter para gerenciar idempotency keys
 * Previne processamento duplicado de requisições
 */
@Injectable()
export class IdempotencyAdapter implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;
  private readonly defaultTtl: number = 3600; // 1 hora

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
   * Gera uma chave de idempotência única
   */
  generateKey(prefix: string, ...parts: string[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  /**
   * Verifica se uma requisição já foi processada
   * @param key Chave de idempotência
   * @returns Resultado anterior ou null se não existe
   */
  async get(key: string): Promise<string | null> {
    return this.redis.get(`idempotency:${key}`);
  }

  /**
   * Armazena resultado de uma requisição processada
   * @param key Chave de idempotência
   * @param value Valor a armazenar
   * @param ttl Time to live em segundos
   */
  async set(key: string, value: string, ttl: number = this.defaultTtl): Promise<void> {
    await this.redis.setex(`idempotency:${key}`, ttl, value);
  }

  /**
   * Verifica e armazena (atomicamente)
   * @param key Chave de idempotência
   * @param value Valor a armazenar
   * @param ttl Time to live em segundos
   * @returns true se foi armazenado (não existia), false se já existia
   */
  async setIfNotExists(
    key: string,
    value: string,
    ttl: number = this.defaultTtl,
  ): Promise<boolean> {
    const result = await this.redis.set(`idempotency:${key}`, value, 'EX', ttl, 'NX');
    return result === 'OK';
  }
}

