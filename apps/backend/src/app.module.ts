import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './modules/auth/auth.module';
import { CitizenModule } from './modules/citizen/citizen.module';
import { WelfareModule } from './modules/welfare/welfare.module';
import { RecommendationModule } from './modules/recommendation/recommendation.module';
import { DocumentModule } from './modules/document/document.module';
import { OcrModule } from './modules/ocr/ocr.module';
import { ApplicationModule } from './modules/application/application.module';
import { AiModule } from './modules/ai/ai.module';
import { NotificationModule } from './modules/notification/notification.module';
import { IntegrationModule } from './modules/integration/integration.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { WorkerModule } from './modules/worker/worker.module';
import { HealthModule } from './modules/health/health.module';

import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';

import { DatabaseModule } from './infrastructure/database/database.module';
import { EmailModule } from './infrastructure/email/email.module';

import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120,
      },
    ]),
    DatabaseModule,
    EmailModule,
    AuthModule,
    CitizenModule,
    WelfareModule,
    RecommendationModule,
    DocumentModule,
    OcrModule,
    ApplicationModule,
    AiModule,
    NotificationModule,
    IntegrationModule,
    RealtimeModule,
    WorkerModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
