import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { register } from 'prom-client';
import { HttpExceptionFilter } from './presentation/http/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS - DEVE SER CONFIGURADO PRIMEIRO, ANTES DE QUALQUER MIDDLEWARE
  // Permitir ambos os frontends (admin e student)
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
    : ['http://localhost:5173', 'http://localhost:5174'];
  
  console.log('🔒 CORS configurado para origins:', allowedOrigins);
  
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Global prefix (excluir metrics do prefixo)
  app.setGlobalPrefix('api/v1', {
    exclude: ['/metrics'],
  });

  // Exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Permitir campos extras (serão ignorados)
      transform: true,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Students Service API')
    .setDescription('Students Management Service - Academic Context')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Prometheus metrics
  register.setDefaultLabels({ service: 'students-service' });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Students Service running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
  console.log(`📊 Metrics: http://localhost:${port}/metrics`);
}

bootstrap();

