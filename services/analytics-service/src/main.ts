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
    .setTitle('Analytics Service API')
    .setDescription('API para análises e relatórios de uso de espaços')
    .setVersion('1.0')
    .addTag('analytics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Prometheus metrics
  register.setDefaultLabels({ service: 'analytics-service' });

  const port = process.env.PORT || 3004;
  await app.listen(port);
  console.log(`🚀 Analytics Service running on: http://localhost:${port}`);
  console.log(`📊 Metrics: http://localhost:${port}/metrics`);
}

bootstrap();

