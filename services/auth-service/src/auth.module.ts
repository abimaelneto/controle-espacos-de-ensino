import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { getDatabaseConfig } from './infrastructure/config/database.config';
import { AdaptersModule } from './infrastructure/providers/adapters.provider';
import { UserEntity } from './infrastructure/adapters/persistence/mysql/user.entity';
import { MySQLUserRepositoryAdapter } from './infrastructure/adapters/persistence/mysql/mysql-user.repository.adapter';
import { KafkaEventPublisherAdapter } from './infrastructure/adapters/messaging/kafka/kafka-event-publisher.adapter';
import { AuthenticationService } from './domain/services/authentication.service';
import { AuthenticateUserUseCase } from './application/use-cases/authenticate-user.use-case';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { JwtService } from './application/services/jwt.service';
import { AuthController } from './presentation/http/controllers/auth.controller';
import { IUserRepository } from './domain/ports/repositories/user.repository.port';
import { IEventPublisher } from './domain/ports/messaging/event-publisher.port';

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
    TypeOrmModule.forFeature([UserEntity]),
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
  controllers: [AuthController],
  providers: [
    // Adapters
    {
      provide: 'USER_REPOSITORY',
      useClass: MySQLUserRepositoryAdapter,
    },
    {
      provide: 'EVENT_PUBLISHER',
      useFactory: (config: ConfigService) => {
        return new KafkaEventPublisherAdapter(
          config.get<string>('KAFKA_BROKERS', 'localhost:9092'),
        );
      },
      inject: [ConfigService],
    },
    // Domain Services
    {
      provide: AuthenticationService,
      useFactory: (userRepository: IUserRepository) => {
        return new AuthenticationService(userRepository);
      },
      inject: ['USER_REPOSITORY'],
    },
    // Use Cases
    {
      provide: AuthenticateUserUseCase,
      useFactory: (authService: AuthenticationService) => {
        return new AuthenticateUserUseCase(authService);
      },
      inject: [AuthenticationService],
    },
    {
      provide: CreateUserUseCase,
      useFactory: (
        userRepository: IUserRepository,
        eventPublisher: IEventPublisher,
      ) => {
        return new CreateUserUseCase(userRepository, eventPublisher);
      },
      inject: ['USER_REPOSITORY', 'EVENT_PUBLISHER'],
    },
    // Application Services
    JwtService,
  ],
  exports: ['USER_REPOSITORY', 'EVENT_PUBLISHER'],
})
export class AuthModule {}

