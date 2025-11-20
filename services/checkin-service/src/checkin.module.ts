import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { getDatabaseConfig } from './infrastructure/config/database.config';
import { CheckInController } from './presentation/http/controllers/checkin.controller';
import { PerformCheckInUseCase } from './application/use-cases/perform-checkin.use-case';
import { GetAttendanceHistoryUseCase } from './application/use-cases/get-attendance-history.use-case';
import { ResolveStudentIdUseCase } from './application/use-cases/resolve-student-id.use-case';
import { CheckInValidationService } from './domain/services/checkin-validation.service';
import { MySQLAttendanceRepositoryAdapter } from './infrastructure/adapters/persistence/mysql/mysql-attendance.repository.adapter';
import { AttendanceEntity } from './infrastructure/adapters/persistence/mysql/attendance.entity';
import { StudentsClientAdapter } from './infrastructure/adapters/http/students-client.adapter';
import { RoomsClientAdapter } from './infrastructure/adapters/http/rooms-client.adapter';
import { KafkaEventPublisherAdapter } from './infrastructure/adapters/messaging/kafka/kafka-event-publisher.adapter';
import type { IAttendanceRepository } from './domain/ports/repositories/attendance.repository.port';
import type { IStudentsClient } from './domain/ports/http/students-client.port';
import type { IRoomsClient } from './domain/ports/http/rooms-client.port';
import type { IEventPublisher } from './domain/ports/messaging/event-publisher.port';

const ATTENDANCE_REPOSITORY = 'ATTENDANCE_REPOSITORY';
const STUDENTS_CLIENT = 'STUDENTS_CLIENT';
const ROOMS_CLIENT = 'ROOMS_CLIENT';
const EVENT_PUBLISHER = 'EVENT_PUBLISHER';

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
  controllers: [CheckInController],
  providers: [
    // Adapters
    {
      provide: ATTENDANCE_REPOSITORY,
      useClass: MySQLAttendanceRepositoryAdapter,
    },
    {
      provide: STUDENTS_CLIENT,
      useClass: StudentsClientAdapter,
    },
    {
      provide: ROOMS_CLIENT,
      useClass: RoomsClientAdapter,
    },
    {
      provide: EVENT_PUBLISHER,
      useClass: KafkaEventPublisherAdapter,
    },
    MySQLAttendanceRepositoryAdapter,
    StudentsClientAdapter,
    RoomsClientAdapter,
    KafkaEventPublisherAdapter,
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
      ) => {
        return new PerformCheckInUseCase(
          repository,
          validationService,
          eventPublisher,
          resolveStudentIdUseCase,
        );
      },
      inject: [ATTENDANCE_REPOSITORY, CheckInValidationService, EVENT_PUBLISHER, ResolveStudentIdUseCase],
    },
    {
      provide: GetAttendanceHistoryUseCase,
      useFactory: (repository: IAttendanceRepository) => {
        return new GetAttendanceHistoryUseCase(repository);
      },
      inject: [ATTENDANCE_REPOSITORY],
    },
  ],
  exports: [ATTENDANCE_REPOSITORY],
})
export class CheckInModule {}

