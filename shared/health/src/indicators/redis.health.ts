import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import Redis from 'ioredis';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  private redis: Redis | null = null;

  constructor(private readonly configService: ConfigService) {
    super();
    
    try {
      const host = this.configService.get<string>('REDIS_HOST', 'localhost');
      const port = this.configService.get<number>('REDIS_PORT', 6379);
      
      this.redis = new Redis({
        host,
        port,
        retryStrategy: () => null, // Não retry no health check
        maxRetriesPerRequest: 1,
        lazyConnect: true,
      });
    } catch (error) {
      // Redis não disponível
      this.redis = null;
    }
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    if (!this.redis) {
      // Redis não está configurado, retorna healthy mas com status "disabled"
      return this.getStatus(key, true, {
        status: 'disabled',
        message: 'Redis is not configured',
      });
    }

    try {
      const result = await this.redis.ping();
      
      if (result !== 'PONG') {
        throw new Error('Redis ping failed');
      }

      const info = await this.redis.info('server');
      const versionMatch = info.match(/redis_version:([^\r\n]+)/);
      const version = versionMatch ? versionMatch[1] : 'unknown';

      return this.getStatus(key, true, {
        status: 'up',
        version,
      });
    } catch (error) {
      throw new HealthCheckError(
        'Redis health check failed',
        this.getStatus(key, false, {
          message: error.message,
        }),
      );
    }
  }
}


