import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { getDatabaseConfig } from './infrastructure/config/database.config';
import { JwtAuthGuard } from './presentation/http/guards/jwt-auth.guard';
import { RolesGuard } from './presentation/http/guards/roles.guard';
import { AnalyticsController } from './presentation/http/controllers/analytics.controller';
import { MetricsController } from './presentation/http/controllers/metrics.controller';
import { GetRoomUsageStatsUseCase } from './application/use-cases/get-room-usage-stats.use-case';
import { GetRoomUsageTimelineUseCase } from './application/use-cases/get-room-usage-timeline.use-case';
import { GetStudentStatsUseCase } from './application/use-cases/get-student-stats.use-case';
import { GetDashboardStatsUseCase } from './application/use-cases/get-dashboard-stats.use-case';
import { GetRealtimeRoomOccupancyUseCase } from './application/use-cases/get-realtime-room-occupancy.use-case';
import { MySQLMetricRepositoryAdapter } from './infrastructure/adapters/persistence/mysql/mysql-metric.repository.adapter';
import { MetricEntity } from './infrastructure/adapters/persistence/mysql/metric.entity';
import { KafkaEventConsumerAdapter } from './infrastructure/adapters/messaging/kafka/kafka-event-consumer.adapter';
import { NoopEventConsumerAdapter } from './infrastructure/adapters/messaging/noop/noop-event-consumer.adapter';
import { EventDeduplicationAdapter } from './infrastructure/adapters/cache/event-deduplication.adapter';
import { AttendanceEventsConsumer } from './infrastructure/consumers/attendance-events.consumer';
import { AttendanceEventHandlerService } from './application/services/attendance-event-handler.service';
import { BusinessMetricsService } from './infrastructure/metrics/business-metrics.service';
import { RealtimeEventsGateway } from './infrastructure/websocket/realtime-events.gateway';
import type { IMetricRepository } from './domain/ports/repositories/metric.repository.port';
import type { IEventConsumer } from './domain/ports/messaging/event-consumer.port';

const METRIC_REPOSITORY = 'METRIC_REPOSITORY';
const EVENT_CONSUMER = 'EVENT_CONSUMER';

const isTrue = (value?: string | null) =>
  (value ?? '').toString().toLowerCase() === 'true';

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
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '1h'),
        },
      }),
      inject: [ConfigService],
    }),
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
      useFactory: (config: ConfigService, deduplication?: EventDeduplicationAdapter) => {
        const disabled = isTrue(
          (process.env.KAFKA_DISABLED ??
            config.get<string>('KAFKA_DISABLED')) || 'false',
        );

        if (disabled) {
          return new NoopEventConsumerAdapter();
        }

        return new KafkaEventConsumerAdapter(config, deduplication);
      },
      inject: [ConfigService, EventDeduplicationAdapter],
    },
    {
      provide: KafkaEventConsumerAdapter,
      useFactory: (config: ConfigService, deduplication?: EventDeduplicationAdapter) => {
        const disabled = isTrue(
          (process.env.KAFKA_DISABLED ??
            config.get<string>('KAFKA_DISABLED')) || 'false',
        );

        if (disabled) {
          return new NoopEventConsumerAdapter();
        }

        return new KafkaEventConsumerAdapter(config, deduplication);
      },
      inject: [ConfigService, EventDeduplicationAdapter],
    },
    {
      provide: EventDeduplicationAdapter,
      useFactory: (config: ConfigService) => {
        try {
          return new EventDeduplicationAdapter(config);
        } catch (error) {
          console.warn('Redis not available, event deduplication disabled');
          return null;
        }
      },
      inject: [ConfigService],
    },
    BusinessMetricsService,
    RealtimeEventsGateway,
    // Guards
    JwtAuthGuard,
    RolesGuard,
    {
      provide: AttendanceEventHandlerService,
      useFactory: (
        metricRepository: IMetricRepository,
        businessMetrics?: BusinessMetricsService,
        realtimeGateway?: RealtimeEventsGateway,
      ) => {
        const handler = new AttendanceEventHandlerService(
          metricRepository,
          businessMetrics,
        );
        if (realtimeGateway) {
          handler.setRealtimeGateway(realtimeGateway);
        }
        return handler;
      },
      inject: [METRIC_REPOSITORY, BusinessMetricsService, RealtimeEventsGateway],
    },
    {
      provide: AttendanceEventsConsumer,
      useFactory: (
        eventConsumer: IEventConsumer,
        eventHandler: AttendanceEventHandlerService,
      ) => {
        return new AttendanceEventsConsumer(eventConsumer, eventHandler);
      },
      inject: [EVENT_CONSUMER, AttendanceEventHandlerService],
    },
    {
      provide: GetRoomUsageStatsUseCase,
      useFactory: (repository: IMetricRepository) => {
        return new GetRoomUsageStatsUseCase(repository);
      },
      inject: [METRIC_REPOSITORY],
    },
    {
      provide: GetDashboardStatsUseCase,
      useFactory: (repository: IMetricRepository) => {
        return new GetDashboardStatsUseCase(repository);
      },
      inject: [METRIC_REPOSITORY],
    },
    {
      provide: GetRoomUsageTimelineUseCase,
      useFactory: (repository: IMetricRepository) => {
        return new GetRoomUsageTimelineUseCase(repository);
      },
      inject: [METRIC_REPOSITORY],
    },
    {
      provide: GetStudentStatsUseCase,
      useFactory: (repository: IMetricRepository) => {
        return new GetStudentStatsUseCase(repository);
      },
      inject: [METRIC_REPOSITORY],
    },
    {
      provide: GetRealtimeRoomOccupancyUseCase,
      useFactory: (repository: IMetricRepository) => {
        return new GetRealtimeRoomOccupancyUseCase(repository);
      },
      inject: [METRIC_REPOSITORY],
    },
  ],
  exports: [METRIC_REPOSITORY],
})
export class AnalyticsModule {}

