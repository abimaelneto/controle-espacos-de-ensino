import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { getDatabaseConfig } from './database.config';

// Carregar .env.local primeiro
config({ path: '.env.local' });
config();

const configService = new ConfigService();
const dbConfig = getDatabaseConfig(configService) as any;

// Converter TypeOrmModuleOptions para DataSourceOptions
const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  entities: [__dirname + '/../adapters/persistence/**/*.entity.ts'],
  migrations: [__dirname + '/../migrations/*.ts'],
  synchronize: dbConfig.synchronize,
  logging: dbConfig.logging,
};

export default new DataSource(dataSourceOptions);
