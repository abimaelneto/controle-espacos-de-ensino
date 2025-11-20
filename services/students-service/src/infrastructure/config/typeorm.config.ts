import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './database.config';

const configService = new ConfigService();

export default new DataSource({
  ...getDatabaseConfig(configService),
  type: 'mysql',
  entities: [__dirname + '/../adapters/persistence/**/*.entity.ts'],
  migrations: [__dirname + '/../migrations/*.ts'],
});
