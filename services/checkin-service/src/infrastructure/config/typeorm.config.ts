import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { AttendanceEntity } from '../adapters/persistence/mysql/attendance.entity';

config({ path: '.env.local' });
config();

export default new DataSource({
  type: 'mysql',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3308'),
  username: process.env.DATABASE_USER || 'app_user',
  password: process.env.DATABASE_PASSWORD || 'app_password',
  database: process.env.DATABASE_NAME || 'facilities',
  entities: [AttendanceEntity],
  migrations: [__dirname + '/../migrations/*.ts'],
  synchronize: false,
  logging: true,
});

