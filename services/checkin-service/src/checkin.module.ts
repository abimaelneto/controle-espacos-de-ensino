import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule, HttpService } from '@nestjs/axios';
import { getDatabaseConfig } from './infrastructure/config/database.config';
import { CheckInController } from './presentation/http/controllers/checkin.controller';
import { MetricsController } from './presentation/http/controllers/metrics.controller';
import { BusinessMetricsService } from './infrastructure/metrics/business-metrics.service';
import { PerformCheckInUseCase } from './application/use-cases/perform-checkin.use-case';
import { GetAttendanceHistoryUseCase } from './application/use-cases/get-attendance-history.use-case';
import { ResolveStudentIdUseCase } from './application/use-cases/resolve-student-id.use-case';
import { CheckInValidationService } from './domain/services/checkin-validation.service';
import { MySQLAttendanceRepositoryAdapter } from './infrastructure/adapters/persistence/mysql/mysql-attendance.repository.adapter';
import { AttendanceEntity } from './infrastructure/adapters/persistence/mysql/attendance.entity';
import { StudentsClientAdapter } from './infrastructure/adapters/http/students-client.adapter';
import { RoomsClientAdapter } from './infrastructure/adapters/http/rooms-client.adapter';
import { MockStudentsClientAdapter } from './infrastructure/adapters/http/mock/mock-students-client.adapter';
import { MockRoomsClientAdapter } from './infrastructure/adapters/http/mock/mock-rooms-client.adapter';
import { KafkaEventPublisherAdapter } from './infrastructure/adapters/messaging/kafka/kafka-event-publisher.adapter';
import { NoopEventPublisherAdapter } from './infrastructure/adapters/messaging/noop/noop-event-publisher.adapter';
import type { IAttendanceRepository } from './domain/ports/repositories/attendance.repository.port';
import type { IStudentsClient } from './domain/ports/http/students-client.port';
import type { IRoomsClient } from './domain/ports/http/rooms-client.port';
import type { IEventPublisher } from './domain/ports/messaging/event-publisher.port';

const ATTENDANCE_REPOSITORY = 'ATTENDANCE_REPOSITORY';
const STUDENTS_CLIENT = 'STUDENTS_CLIENT';
const ROOMS_CLIENT = 'ROOMS_CLIENT';
const EVENT_PUBLISHER = 'EVENT_PUBLISHER';

const isTrue = (value?: string | null) =>
  (value ?? '').toString().toLowerCase() === 'true';

const shouldUseMockClients = (config: ConfigService) =>
  isTrue(
    (process.env.CHECKIN_USE_FAKE_CLIENTS ??
      config.get<string>('CHECKIN_USE_FAKE_CLIENTS')) || 'false',
  );

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    HttpModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([AttendanceEntity]),
  ],
  controllers: [CheckInController, MetricsController],
  providers: [
    // Adapters
    {
      provide: ATTENDANCE_REPOSITORY,
      useClass: MySQLAttendanceRepositoryAdapter,
    },
    {
      provide: STUDENTS_CLIENT,
      useFactory: (
        httpService: HttpService,
        configService: ConfigService,
      ) => {
        if (shouldUseMockClients(configService)) {
          return new MockStudentsClientAdapter();
        }
        return new StudentsClientAdapter(httpService, configService);
      },
      inject: [HttpService, ConfigService],
    },
    {
      provide: ROOMS_CLIENT,
      useFactory: (
        httpService: HttpService,
        configService: ConfigService,
      ) => {
        if (shouldUseMockClients(configService)) {
          return new MockRoomsClientAdapter();
        }
        return new RoomsClientAdapter(httpService, configService);
      },
      inject: [HttpService, ConfigService],
    },
    {
      provide: EVENT_PUBLISHER,
      useFactory: (config: ConfigService) => {
        const disabled = isTrue(
          (process.env.KAFKA_DISABLED ??
            config.get<string>('KAFKA_DISABLED')) || 'false',
        );

        if (disabled) {
          return new NoopEventPublisherAdapter();
        }

        return new KafkaEventPublisherAdapter(config);
      },
      inject: [ConfigService],
    },
    MySQLAttendanceRepositoryAdapter,
    // Domain Services
    {
      provide: CheckInValidationService,
      useFactory: (
        repository: IAttendanceRepository,
        studentsClient: IStudentsClient,
        roomsClient: IRoomsClient,
      ) => {
        return new CheckInValidationService(
          repository,
          studentsClient,
          roomsClient,
        );
      },
      inject: [ATTENDANCE_REPOSITORY, STUDENTS_CLIENT, ROOMS_CLIENT],
    },
    // Use Cases
    {
      provide: ResolveStudentIdUseCase,
      useFactory: (studentsClient: IStudentsClient) => {
        return new ResolveStudentIdUseCase(studentsClient);
      },
      inject: [STUDENTS_CLIENT],
    },
    {
      provide: PerformCheckInUseCase,
      useFactory: (
        repository: IAttendanceRepository,
        validationService: CheckInValidationService,
        eventPublisher: IEventPublisher,
        resolveStudentIdUseCase: ResolveStudentIdUseCase,
        metrics: BusinessMetricsService,
      ) => {
        return new PerformCheckInUseCase(
          repository,
          validationService,
          eventPublisher,
          resolveStudentIdUseCase,
          metrics,
        );
      },
      inject: [ATTENDANCE_REPOSITORY, CheckInValidationService, EVENT_PUBLISHER, ResolveStudentIdUseCase, BusinessMetricsService],
    },
    {
      provide: GetAttendanceHistoryUseCase,
      useFactory: (repository: IAttendanceRepository) => {
        return new GetAttendanceHistoryUseCase(repository);
      },
      inject: [ATTENDANCE_REPOSITORY],
    },
    // Metrics
    BusinessMetricsService,
  ],
  exports: [ATTENDANCE_REPOSITORY, BusinessMetricsService],
})
export class CheckInModule {}

