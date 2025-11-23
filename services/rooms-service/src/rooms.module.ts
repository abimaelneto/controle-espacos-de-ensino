import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './infrastructure/config/database.config';
import { RoomsController } from './presentation/http/controllers/rooms.controller';
import { MetricsController } from './presentation/http/controllers/metrics.controller';
import { BusinessMetricsService } from './infrastructure/metrics/business-metrics.service';
import { CreateRoomUseCase } from './application/use-cases/create-room.use-case';
import { GetRoomUseCase } from './application/use-cases/get-room.use-case';
import { ListRoomsUseCase } from './application/use-cases/list-rooms.use-case';
import { UpdateRoomUseCase } from './application/use-cases/update-room.use-case';
import { DeleteRoomUseCase } from './application/use-cases/delete-room.use-case';
import { RoomValidationService } from './domain/services/room-validation.service';
import { MySQLRoomRepositoryAdapter } from './infrastructure/adapters/persistence/mysql/mysql-room.repository.adapter';
import { RoomEntity } from './infrastructure/adapters/persistence/mysql/room.entity';
import { KafkaEventPublisherAdapter } from './infrastructure/adapters/messaging/kafka/kafka-event-publisher.adapter';
import { NoopEventPublisherAdapter } from './infrastructure/adapters/messaging/noop/noop-event-publisher.adapter';
import type { IRoomRepository } from './domain/ports/repositories/room.repository.port';
import type { IEventPublisher } from './domain/ports/messaging/event-publisher.port';

const ROOM_REPOSITORY = 'ROOM_REPOSITORY';
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
    TypeOrmModule.forFeature([RoomEntity]),
  ],
  controllers: [RoomsController, MetricsController],
  providers: [
    // Adapters
    {
      provide: ROOM_REPOSITORY,
      useClass: MySQLRoomRepositoryAdapter,
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
    MySQLRoomRepositoryAdapter,
    KafkaEventPublisherAdapter,
    // Domain Services
    {
      provide: RoomValidationService,
      useFactory: (repository: IRoomRepository) => {
        return new RoomValidationService(repository);
      },
      inject: [ROOM_REPOSITORY],
    },
    // Use Cases
    {
      provide: CreateRoomUseCase,
      useFactory: (
        repository: IRoomRepository,
        publisher: IEventPublisher,
        validationService: RoomValidationService,
        metrics: BusinessMetricsService,
      ) => {
        return new CreateRoomUseCase(repository, publisher, validationService, metrics);
      },
      inject: [ROOM_REPOSITORY, EVENT_PUBLISHER, RoomValidationService, BusinessMetricsService],
    },
    {
      provide: GetRoomUseCase,
      useFactory: (repository: IRoomRepository) => {
        return new GetRoomUseCase(repository);
      },
      inject: [ROOM_REPOSITORY],
    },
    {
      provide: ListRoomsUseCase,
      useFactory: (repository: IRoomRepository) => {
        return new ListRoomsUseCase(repository);
      },
      inject: [ROOM_REPOSITORY],
    },
    {
      provide: UpdateRoomUseCase,
      useFactory: (repository: IRoomRepository) => {
        return new UpdateRoomUseCase(repository);
      },
      inject: [ROOM_REPOSITORY],
    },
    {
      provide: DeleteRoomUseCase,
      useFactory: (repository: IRoomRepository) => {
        return new DeleteRoomUseCase(repository);
      },
      inject: [ROOM_REPOSITORY],
    },
    // Metrics
    BusinessMetricsService,
  ],
  exports: [ROOM_REPOSITORY, EVENT_PUBLISHER, BusinessMetricsService],
})
export class RoomsModule {}

