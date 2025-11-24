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

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Analytics Service API')
    .setDescription('API para análises e relatórios de uso de espaços')
    .setVersion('1.0')
    .addTag('analytics')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Prometheus metrics
  register.setDefaultLabels({ service: 'analytics-service' });

  const port = process.env.PORT || 3004;
  await app.listen(port);
  console.log(`🚀 Analytics Service running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
  console.log(`📊 Metrics: http://localhost:${port}/metrics`);
}

bootstrap();

