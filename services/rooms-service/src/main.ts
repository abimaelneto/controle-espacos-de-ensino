import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { register } from 'prom-client';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Rooms Service API')
    .setDescription('API para gerenciamento de salas de ensino')
    .setVersion('1.0')
    .addTag('rooms')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Prometheus metrics
  register.setDefaultLabels({ service: 'rooms-service' });

  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`🚀 Rooms Service running on: http://localhost:${port}`);
  console.log(`📊 Metrics: http://localhost:${port}/metrics`);
}

bootstrap();

