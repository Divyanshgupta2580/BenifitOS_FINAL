"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModule = void 0;
const common_1 = require("@nestjs/common");
const notification_controller_1 = require("./notification.controller");
const notification_service_1 = require("./notification.service");
const proactive_notification_service_1 = require("./proactive-notification.service");
const notification_repository_1 = require("../../infrastructure/database/repositories/notification.repository");
const citizen_repository_1 = require("../../infrastructure/database/repositories/citizen.repository");
const welfare_repository_1 = require("../../infrastructure/database/repositories/welfare.repository");
const prisma_service_1 = require("../../infrastructure/database/prisma.service");
const realtime_module_1 = require("../realtime/realtime.module");
const recommendation_module_1 = require("../recommendation/recommendation.module");
let NotificationModule = class NotificationModule {
};
exports.NotificationModule = NotificationModule;
exports.NotificationModule = NotificationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            (0, common_1.forwardRef)(() => realtime_module_1.RealtimeModule),
            (0, common_1.forwardRef)(() => recommendation_module_1.RecommendationModule),
        ],
        controllers: [notification_controller_1.NotificationController],
        providers: [
            notification_service_1.NotificationService,
            proactive_notification_service_1.ProactiveNotificationService,
            prisma_service_1.PrismaService,
            { provide: 'INotificationRepository', useClass: notification_repository_1.NotificationRepositoryImpl },
            { provide: 'ICitizenRepository', useClass: citizen_repository_1.CitizenRepositoryImpl },
            { provide: 'IWelfareSchemeRepository', useClass: welfare_repository_1.WelfareSchemeRepositoryImpl },
        ],
        exports: [
            notification_service_1.NotificationService,
            proactive_notification_service_1.ProactiveNotificationService,
            'INotificationRepository',
        ],
    })
], NotificationModule);
//# sourceMappingURL=notification.module.js.map