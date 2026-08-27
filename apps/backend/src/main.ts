import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { validateEnv } from './config/env.config';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Enforce startup environment validation - fail fast on missing secrets
  validateEnv();

  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet());
  app.use(cookieParser());

  // Enable CORS with credentials support
  const isProduction = process.env.NODE_ENV === 'production';
  let allowedOrigins: (string | RegExp)[] = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'https://benifitos-final.onrender.com',
  ];

  if (process.env.CORS_ORIGIN) {
    allowedOrigins = process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);
  } else if (isProduction) {
    logger.warn('CORS_ORIGIN not configured in production mode. Defaulting to strict origin validation.');
    allowedOrigins = [];
  }

  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : false,
    credentials: true,
  });

  // Global prefix
  const prefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(prefix);

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable shutdown hooks
  app.enableShutdownHooks();

  const port = process.env.PORT || 4000;
  const host = process.env.HOST || '0.0.0.0';
  await app.listen(port, host);
  logger.log(`🚀 BenefitOS Backend Engine running on http://${host}:${port}/${prefix}`);
}

bootstrap();
