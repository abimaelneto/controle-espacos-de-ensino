import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { Kafka } from 'kafkajs';

@Injectable()
export class KafkaHealthIndicator extends HealthIndicator {
  private kafka: Kafka | null = null;

  constructor(private readonly configService: ConfigService) {
    super();
    
    const kafkaDisabled = this.configService.get<string>('KAFKA_DISABLED', 'false').toLowerCase() === 'true';
    
    if (!kafkaDisabled) {
      const brokers = this.configService.get<string>('KAFKA_BROKERS', 'localhost:9092');
      this.kafka = new Kafka({
        clientId: 'health-check',
        brokers: brokers.split(','),
      });
    }
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    if (!this.kafka) {
      // Kafka está desabilitado, retorna healthy mas com status "disabled"
      return this.getStatus(key, true, {
        status: 'disabled',
        message: 'Kafka is disabled',
      });
    }

    try {
      const admin = this.kafka.admin();
      await admin.connect();
      
      // Lista os brokers para verificar conectividade
      const brokers = await admin.listBrokers();
      await admin.disconnect();

      return this.getStatus(key, true, {
        status: 'up',
        brokers: brokers.length,
      });
    } catch (error) {
      throw new HealthCheckError(
        'Kafka health check failed',
        this.getStatus(key, false, {
          message: error.message,
        }),
      );
    }
  }
}

