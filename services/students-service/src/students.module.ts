import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { getDatabaseConfig } from './infrastructure/config/database.config';
import { StudentsController } from './presentation/http/controllers/students.controller';
import { MetricsController } from './presentation/http/controllers/metrics.controller';
import { BusinessMetricsService } from './infrastructure/metrics/business-metrics.service';
import { CreateStudentUseCase } from './application/use-cases/create-student.use-case';
import { GetStudentUseCase } from './application/use-cases/get-student.use-case';
import { ListStudentsUseCase } from './application/use-cases/list-students.use-case';
import { UpdateStudentUseCase } from './application/use-cases/update-student.use-case';
import { DeleteStudentUseCase } from './application/use-cases/delete-student.use-case';
import { FindStudentByCPFUseCase } from './application/use-cases/find-student-by-cpf.use-case';
import { FindStudentByMatriculaUseCase } from './application/use-cases/find-student-by-matricula.use-case';
import { StudentValidationService } from './domain/services/student-validation.service';
import { MySQLStudentRepositoryAdapter } from './infrastructure/adapters/persistence/mysql/mysql-student.repository.adapter';
import { StudentEntity } from './infrastructure/adapters/persistence/mysql/student.entity';
import { KafkaEventPublisherAdapter } from './infrastructure/adapters/messaging/kafka/kafka-event-publisher.adapter';
import { NoopEventPublisherAdapter } from './infrastructure/adapters/messaging/noop/noop-event-publisher.adapter';
import type { IStudentRepository } from './domain/ports/repositories/student.repository.port';
import type { IEventPublisher } from './domain/ports/messaging/event-publisher.port';
import { JwtAuthGuard } from './presentation/http/guards/jwt-auth.guard';
import { RolesGuard } from './presentation/http/guards/roles.guard';

const STUDENT_REPOSITORY = 'STUDENT_REPOSITORY';
const EVENT_PUBLISHER = 'EVENT_PUBLISHER';

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
    TypeOrmModule.forFeature([StudentEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      // @ts-expect-error - expiresIn accepts string in runtime, type definition is strict
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '1h'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [StudentsController, MetricsController],
  providers: [
    // Adapters
    {
      provide: STUDENT_REPOSITORY,
      useClass: MySQLStudentRepositoryAdapter,
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
    MySQLStudentRepositoryAdapter,
    KafkaEventPublisherAdapter,
    // Domain Services
    {
      provide: StudentValidationService,
      useFactory: (repository: IStudentRepository) => {
        return new StudentValidationService(repository);
      },
      inject: [STUDENT_REPOSITORY],
    },
    // Use Cases
    {
      provide: CreateStudentUseCase,
      useFactory: (
        repository: IStudentRepository,
        publisher: IEventPublisher,
        validationService: StudentValidationService,
        metrics: BusinessMetricsService,
      ) => {
        return new CreateStudentUseCase(
          repository,
          publisher,
          validationService,
          metrics,
        );
      },
      inject: [STUDENT_REPOSITORY, EVENT_PUBLISHER, StudentValidationService, BusinessMetricsService],
    },
    {
      provide: GetStudentUseCase,
      useFactory: (repository: IStudentRepository) => {
        return new GetStudentUseCase(repository);
      },
      inject: [STUDENT_REPOSITORY],
    },
    {
      provide: ListStudentsUseCase,
      useFactory: (repository: IStudentRepository) => {
        return new ListStudentsUseCase(repository);
      },
      inject: [STUDENT_REPOSITORY],
    },
    {
      provide: UpdateStudentUseCase,
      useFactory: (
        repository: IStudentRepository,
        validationService: StudentValidationService,
      ) => {
        return new UpdateStudentUseCase(repository, validationService);
      },
      inject: [STUDENT_REPOSITORY, StudentValidationService],
    },
    {
      provide: DeleteStudentUseCase,
      useFactory: (repository: IStudentRepository) => {
        return new DeleteStudentUseCase(repository);
      },
      inject: [STUDENT_REPOSITORY],
    },
    {
      provide: FindStudentByCPFUseCase,
      useFactory: (repository: IStudentRepository) => {
        return new FindStudentByCPFUseCase(repository);
      },
      inject: [STUDENT_REPOSITORY],
    },
    {
      provide: FindStudentByMatriculaUseCase,
      useFactory: (repository: IStudentRepository) => {
        return new FindStudentByMatriculaUseCase(repository);
      },
      inject: [STUDENT_REPOSITORY],
    },
    // Metrics
    BusinessMetricsService,
    // Guards
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [STUDENT_REPOSITORY, EVENT_PUBLISHER, BusinessMetricsService],
})
export class StudentsModule {}
