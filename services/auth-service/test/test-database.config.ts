import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserEntity } from '../src/infrastructure/adapters/persistence/mysql/user.entity';

export const getTestDatabaseConfig = (): TypeOrmModuleOptions => {
  return {
    type: 'mysql',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    username: process.env.DATABASE_USER || 'app_user',
    password: process.env.DATABASE_PASSWORD || 'app_password',
    database: process.env.DATABASE_NAME || 'identity',
    entities: [UserEntity],
    synchronize: false, // Nunca usar synchronize em testes
    logging: false, // Desabilitar logs em testes
    dropSchema: false,
    migrationsRun: false,
  };
};

