import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './infrastructure/config/database.config';
import { AnalyticsController } from './presentation/http/controllers/analytics.controller';
import { GetRoomUsageStatsUseCase } from './application/use-cases/get-room-usage-stats.use-case';
import { MySQLMetricRepositoryAdapter } from './infrastructure/adapters/persistence/mysql/mysql-metric.repository.adapter';
import { MetricEntity } from './infrastructure/adapters/persistence/mysql/metric.entity';
import type { IMetricRepository } from './domain/ports/repositories/metric.repository.port';

const METRIC_REPOSITORY = 'METRIC_REPOSITORY';

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
  controllers: [AnalyticsController],
  providers: [
    {
      provide: METRIC_REPOSITORY,
      useClass: MySQLMetricRepositoryAdapter,
    },
    MySQLMetricRepositoryAdapter,
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

