import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './infrastructure/config/database.config';
import { AdaptersModule } from './infrastructure/providers/adapters.provider';
// TODO: Importar controllers, services, etc. quando criados

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    AdaptersModule,
    // TODO: Adicionar outros módulos quando criados
  ],
  // TODO: Adicionar controllers, providers, exports
})
export class AuthModule {}

