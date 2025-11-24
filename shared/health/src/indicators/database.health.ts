import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const isHealthy = this.dataSource.isInitialized;
      
      if (!isHealthy) {
        throw new HealthCheckError('Database is not initialized', this.getStatus(key, false));
      }

      // Testa a conexão com uma query simples
      await this.dataSource.query('SELECT 1');
      
      return this.getStatus(key, true, {
        status: 'up',
        type: this.dataSource.options.type,
        database: this.dataSource.options.database,
      });
    } catch (error) {
      throw new HealthCheckError(
        'Database health check failed',
        this.getStatus(key, false, {
          message: error.message,
        }),
      );
    }
  }
}


