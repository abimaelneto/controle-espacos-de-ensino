import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

export const getDatabaseConfig = (
  config: ConfigService,
): TypeOrmModuleOptions => {
  const dbType = config.get<string>('DATABASE_TYPE', 'mysql');

  const baseConfig: TypeOrmModuleOptions = {
    type: 'mysql',
    host: config.get<string>('DATABASE_HOST'),
    port: config.get<number>('DATABASE_PORT'),
    username: config.get<string>('DATABASE_USER'),
    password: config.get<string>('DATABASE_PASSWORD'),
    database: config.get<string>('DATABASE_NAME'),
    entities: [
      join(__dirname, '/../adapters/persistence/**/*.entity.{ts,js}'),
    ],
    migrations: [join(__dirname, '/../migrations/*.{ts,js}')],
    migrationsRun: false,
    synchronize:
      config.get<string>('NODE_ENV') !== 'production' &&
      config.get<string>('RUN_MIGRATIONS') !== 'true',
    logging: config.get<string>('NODE_ENV') === 'development',
  };

  if (dbType === 'rds') {
    return {
      ...baseConfig,
      ssl: {
        rejectUnauthorized: false,
      },
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    };
  }

  return baseConfig;
};

