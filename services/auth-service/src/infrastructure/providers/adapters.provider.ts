import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// TODO: Importar adapters quando criados
// import { MySQLUserRepositoryAdapter } from '../adapters/persistence/mysql/mysql-user.repository.adapter';
// import { RDSUserRepositoryAdapter } from '../adapters/persistence/rds/rds-user.repository.adapter';
// import { KafkaEventPublisherAdapter } from '../adapters/messaging/kafka/kafka-event-publisher.adapter';
// import { MSKEventPublisherAdapter } from '../adapters/messaging/msk/msk-event-publisher.adapter';
// import { RedisCacheServiceAdapter } from '../adapters/cache/redis/redis-cache-service.adapter';
// import { ElastiCacheServiceAdapter } from '../adapters/cache/elasticache/elasticache-cache-service.adapter';
// import { WinstonLoggerAdapter } from '../adapters/logger/winston/winston-logger.adapter';
// import { CloudWatchLoggerAdapter } from '../adapters/logger/cloudwatch/cloudwatch-logger.adapter';

@Module({
  providers: [
    // TODO: Implementar factory pattern para seleção de adapters
    // {
    //   provide: 'USER_REPOSITORY',
    //   useFactory: (config: ConfigService) => {
    //     const dbType = config.get<string>('DATABASE_TYPE', 'mysql');
    //     if (dbType === 'rds') {
    //       return new RDSUserRepositoryAdapter(...);
    //     }
    //     return new MySQLUserRepositoryAdapter(...);
    //   },
    //   inject: [ConfigService],
    // },
  ],
  exports: [],
})
export class AdaptersModule {}

