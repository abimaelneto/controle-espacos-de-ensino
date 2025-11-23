import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Distributed Lock usando Redis
 * Implementa lock com TTL para prevenir deadlocks
 */
@Injectable()
export class RedisLockAdapter implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;
  private readonly defaultTtl: number = 30; // 30 segundos

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
   * Adquire um lock distribuído
   * @param key Chave do lock
   * @param ttl Time to live em segundos (padrão: 30s)
   * @returns Token do lock ou null se não conseguir adquirir
   */
  async acquireLock(key: string, ttl: number = this.defaultTtl): Promise<string | null> {
    const lockToken = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const lockKey = `lock:${key}`;

    // SET com NX (only if not exists) e EX (expire)
    const result = await this.redis.set(lockKey, lockToken, 'EX', ttl, 'NX');

    if (result === 'OK') {
      return lockToken;
    }

    return null;
  }

  /**
   * Libera um lock distribuído
   * @param key Chave do lock
   * @param token Token do lock
   */
  async releaseLock(key: string, token: string): Promise<void> {
    const lockKey = `lock:${key}`;

    // Lua script para garantir que só libera se o token corresponder
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    await this.redis.eval(script, 1, lockKey, token);
  }

  /**
   * Executa uma função com lock distribuído
   * @param key Chave do lock
   * @param fn Função a executar
   * @param ttl Time to live em segundos
   * @param retries Número de tentativas
   * @param retryDelay Delay entre tentativas em ms
   */
  async withLock<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number = this.defaultTtl,
    retries: number = 3,
    retryDelay: number = 100,
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      if (attempt > 0) {
        await this.sleep(retryDelay * attempt); // Exponential backoff
      }

      const lockToken = await this.acquireLock(key, ttl);

      if (!lockToken) {
        if (attempt === retries) {
          throw new Error(`Failed to acquire lock after ${retries} retries: ${key}`);
        }
        continue;
      }

      try {
        const result = await fn();
        await this.releaseLock(key, lockToken);
        return result;
      } catch (error) {
        await this.releaseLock(key, lockToken);
        lastError = error as Error;
        throw error;
      }
    }

    throw lastError || new Error(`Failed to execute with lock: ${key}`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

