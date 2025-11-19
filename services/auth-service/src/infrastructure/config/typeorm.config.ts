import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { UserEntity } from '../adapters/persistence/mysql/user.entity';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'mysql',
  host: configService.get<string>('DATABASE_HOST', 'localhost'),
  port: configService.get<number>('DATABASE_PORT', 3306),
  username: configService.get<string>('DATABASE_USER', 'app_user'),
  password: configService.get<string>('DATABASE_PASSWORD', 'app_password'),
  database: configService.get<string>('DATABASE_NAME', 'identity'),
  entities: [UserEntity],
  migrations: [__dirname + '/../migrations/*.ts'],
  synchronize: false,
  logging: true,
});

