import { Module, Global } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { DatabaseHealthIndicator } from './indicators/database.health';
import { KafkaHealthIndicator } from './indicators/kafka.health';
import { RedisHealthIndicator } from './indicators/redis.health';

@Global()
@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
  providers: [DatabaseHealthIndicator, KafkaHealthIndicator, RedisHealthIndicator],
  exports: [DatabaseHealthIndicator, KafkaHealthIndicator, RedisHealthIndicator],
})
export class HealthModule {}


