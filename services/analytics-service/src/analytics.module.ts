import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './infrastructure/config/database.config';
import { AnalyticsController } from './presentation/http/controllers/analytics.controller';
import { MetricsController } from './presentation/http/controllers/metrics.controller';
import { GetRoomUsageStatsUseCase } from './application/use-cases/get-room-usage-stats.use-case';
import { MySQLMetricRepositoryAdapter } from './infrastructure/adapters/persistence/mysql/mysql-metric.repository.adapter';
import { MetricEntity } from './infrastructure/adapters/persistence/mysql/metric.entity';
import { KafkaEventConsumerAdapter } from './infrastructure/adapters/messaging/kafka/kafka-event-consumer.adapter';
import { AttendanceEventsConsumer } from './infrastructure/consumers/attendance-events.consumer';
import { AttendanceEventHandlerService } from './application/services/attendance-event-handler.service';
import type { IMetricRepository } from './domain/ports/repositories/metric.repository.port';
import type { IEventConsumer } from './domain/ports/messaging/event-consumer.port';

const METRIC_REPOSITORY = 'METRIC_REPOSITORY';
const EVENT_CONSUMER = 'EVENT_CONSUMER';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([MetricEntity]),
  ],
  controllers: [AnalyticsController, MetricsController],
  providers: [
    {
      provide: METRIC_REPOSITORY,
      useClass: MySQLMetricRepositoryAdapter,
    },
    MySQLMetricRepositoryAdapter,
    {
      provide: EVENT_CONSUMER,
      useClass: KafkaEventConsumerAdapter,
    },
    KafkaEventConsumerAdapter,
    AttendanceEventHandlerService,
    AttendanceEventsConsumer,
    {
      provide: GetRoomUsageStatsUseCase,
      useFactory: (repository: IMetricRepository) => {
        return new GetRoomUsageStatsUseCase(repository);
      },
      inject: [METRIC_REPOSITORY],
    },
  ],
  exports: [METRIC_REPOSITORY],
})
export class AnalyticsModule {}

