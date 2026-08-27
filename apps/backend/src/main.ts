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
  const defaultAllowedOrigins = [
    'https://benifitos-final.onrender.com',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
  ];

  let allowedOrigins: (string | RegExp)[] = defaultAllowedOrigins;

  if (process.env.CORS_ORIGIN) {
    const configuredOrigins = process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);
    allowedOrigins = [...new Set([...configuredOrigins, ...defaultAllowedOrigins])];
  }

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow non-browser requests (e.g. curl, server-to-server, health probes)
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some((allowed) => {
        if (typeof allowed === 'string') {
          return (
            allowed.toLowerCase() === origin.toLowerCase() ||
            (origin.endsWith('.onrender.com') && origin.startsWith('https://'))
          );
        }
        return allowed.test(origin);
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        logger.warn(`Blocked CORS request from unauthorized origin: ${origin}`);
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
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
