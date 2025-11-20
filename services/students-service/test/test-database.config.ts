import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { StudentEntity } from '../src/infrastructure/adapters/persistence/mysql/student.entity';

export const getTestDatabaseConfig = (): TypeOrmModuleOptions => {
  return {
    type: 'mysql',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    username: process.env.DATABASE_USER || 'app_user',
    password: process.env.DATABASE_PASSWORD || 'app_password',
    database: process.env.DATABASE_NAME || 'students_test',
    entities: [StudentEntity],
    synchronize: true, // Para testes, podemos usar synchronize
    dropSchema: true, // Limpar schema antes de cada execução
    logging: false,
  };
};

