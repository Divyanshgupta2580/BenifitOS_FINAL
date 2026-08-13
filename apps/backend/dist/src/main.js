"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const env_config_1 = require("./config/env.config");
const helmet_1 = require("helmet");
const cookieParser = require("cookie-parser");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    (0, env_config_1.validateEnv)();
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)());
    app.use(cookieParser());
    const isProduction = process.env.NODE_ENV === 'production';
    let allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
    ];
    if (process.env.CORS_ORIGIN) {
        allowedOrigins = process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);
    }
    else if (isProduction) {
        logger.warn('CORS_ORIGIN not configured in production mode. Defaulting to strict origin validation.');
        allowedOrigins = [];
    }
    app.enableCors({
        origin: allowedOrigins.length > 0 ? allowedOrigins : false,
        credentials: true,
    });
    const prefix = process.env.API_PREFIX || 'api/v1';
    app.setGlobalPrefix(prefix);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.enableShutdownHooks();
    const port = process.env.PORT || 4000;
    await app.listen(port);
    logger.log(`🚀 BenefitOS Backend Engine running on http://localhost:${port}/${prefix}`);
}
bootstrap();
//# sourceMappingURL=main.js.map