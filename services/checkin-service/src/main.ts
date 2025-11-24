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

  // Global prefix (excluir metrics do prefixo)
  app.setGlobalPrefix('api/v1', {
    exclude: ['/metrics'],
  });

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5174',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Check-in Service API')
    .setDescription('API para registro de entrada e saída de alunos')
    .setVersion('1.0')
    .addTag('checkin')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Prometheus metrics
  register.setDefaultLabels({ service: 'checkin-service' });

  const port = process.env.PORT || 3003;
  await app.listen(port);
  console.log(`🚀 Check-in Service running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
  console.log(`📊 Metrics: http://localhost:${port}/metrics`);
}

bootstrap();

