import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CheckInModule } from './checkin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    CheckInModule,
  ],
})
export class AppModule {}

