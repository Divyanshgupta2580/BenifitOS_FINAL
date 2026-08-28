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
    const defaultAllowedOrigins = [
        'https://benifitos-final.onrender.com',
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
    ];
    let allowedOrigins = defaultAllowedOrigins;
    if (process.env.CORS_ORIGIN) {
        const configuredOrigins = process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);
        allowedOrigins = [...new Set([...configuredOrigins, ...defaultAllowedOrigins])];
    }
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            const isAllowed = allowedOrigins.some((allowed) => {
                if (typeof allowed === 'string') {
                    return (allowed.toLowerCase() === origin.toLowerCase() ||
                        (origin.endsWith('.onrender.com') && origin.startsWith('https://')));
                }
                return allowed.test(origin);
            });
            if (isAllowed) {
                callback(null, true);
            }
            else {
                logger.warn(`Blocked CORS request from unauthorized origin: ${origin}`);
                callback(new Error(`CORS blocked for origin: ${origin}`));
            }
        },
        credentials: true,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cookie'],
        exposedHeaders: ['Set-Cookie'],
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
    const host = process.env.HOST || '0.0.0.0';
    await app.listen(port, host);
    logger.log(`🚀 BenefitOS Backend Engine running on http://${host}:${port}/${prefix}`);
}
bootstrap();
//# sourceMappingURL=main.js.map