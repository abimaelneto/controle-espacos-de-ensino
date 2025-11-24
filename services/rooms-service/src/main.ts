import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { register } from 'prom-client';
import { RoomResponseInterceptor } from './presentation/http/interceptors/room-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Global prefix (excluir metrics do prefixo)
  app.setGlobalPrefix('api/v1', {
    exclude: ['/metrics'],
  });

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Response interceptor para transformar Room entities
  app.useGlobalInterceptors(new RoomResponseInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Permitir campos extras (serão ignorados)
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Rooms Service API')
    .setDescription('API para gerenciamento de salas de ensino')
    .setVersion('1.0')
    .addTag('rooms')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Prometheus metrics
  register.setDefaultLabels({ service: 'rooms-service' });

  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`🚀 Rooms Service running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
  console.log(`📊 Metrics: http://localhost:${port}/metrics`);
}

bootstrap();

