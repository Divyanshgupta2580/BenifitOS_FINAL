"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ApplicationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationService = void 0;
const common_1 = require("@nestjs/common");
const application_entity_1 = require("../../domain/application/application.entity");
const crypto_1 = require("crypto");
const notification_service_1 = require("../notification/notification.service");
const notification_repository_interface_1 = require("../../domain/notification/notification-repository.interface");
let ApplicationService = ApplicationService_1 = class ApplicationService {
    applicationRepo;
    notificationService;
    logger = new common_1.Logger(ApplicationService_1.name);
    constructor(applicationRepo, notificationService) {
        this.applicationRepo = applicationRepo;
        this.notificationService = notificationService;
    }
    async createDraft(userId, schemeId, formData) {
        const appNo = `APP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const app = new application_entity_1.ApplicationEntity({
            id: (0, crypto_1.randomUUID)(),
            applicationNo: appNo,
            userId,
            schemeId,
            status: application_entity_1.ApplicationStatus.DRAFT,
            formData,
        });
        return await this.applicationRepo.save(app);
    }
    async submitApplication(userId, id) {
        const app = await this.applicationRepo.findById(id);
        if (!app || app.userId !== userId) {
            throw new common_1.NotFoundException(`Application with ID '${id}' not found or access denied.`);
        }
        app.submit();
        const updated = await this.applicationRepo.update(app);
        if (this.notificationService) {
            try {
                await this.notificationService.createNotification({
                    userId,
                    type: notification_repository_interface_1.NotificationType.APPLICATION_SUBMITTED,
                    title: 'Application Submitted',
                    body: `Your application (${updated.applicationNo}) has been submitted successfully for verification.`,
                    severity: notification_repository_interface_1.NotificationSeverity.SUCCESS,
                    metadata: { applicationId: updated.id, applicationNo: updated.applicationNo, schemeId: updated.schemeId },
                });
            }
            catch (err) {
            }
        }
        return updated;
    }
    async updateApplication(userId, id, data) {
        const app = await this.applicationRepo.findById(id);
        if (!app || app.userId !== userId) {
            throw new common_1.NotFoundException(`Application with ID '${id}' not found or access denied.`);
        }
        const oldStatus = app.status;
        if (data.status) {
            app.transitionTo(data.status, userId);
        }
        if (data.formData) {
            app.updateFormData(data.formData);
        }
        const updated = await this.applicationRepo.update(app);
        if (this.notificationService && data.status && data.status !== oldStatus) {
            try {
                await this.notificationService.createNotification({
                    userId,
                    type: notification_repository_interface_1.NotificationType.APPLICATION_STATUS_CHANGED,
                    title: 'Application Status Updated',
                    body: `Application ${updated.applicationNo} status changed to ${data.status.replace('_', ' ')}.`,
                    severity: data.status === application_entity_1.ApplicationStatus.APPROVED ? notification_repository_interface_1.NotificationSeverity.SUCCESS : (data.status === application_entity_1.ApplicationStatus.REJECTED ? notification_repository_interface_1.NotificationSeverity.ERROR : notification_repository_interface_1.NotificationSeverity.INFO),
                    metadata: { applicationId: updated.id, applicationNo: updated.applicationNo, status: data.status },
                });
            }
            catch (err) {
            }
        }
        return updated;
    }
    async getUserApplications(userId) {
        return await this.applicationRepo.findByUserId(userId);
    }
    async getApplicationById(userId, id) {
        const app = await this.applicationRepo.findById(id);
        if (!app || app.userId !== userId) {
            throw new common_1.NotFoundException(`Application with ID '${id}' not found or access denied.`);
        }
        return app;
    }
};
exports.ApplicationService = ApplicationService;
exports.ApplicationService = ApplicationService = ApplicationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IApplicationRepository')),
    __param(1, (0, common_1.Inject)(notification_service_1.NotificationService)),
    __param(1, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [Object, notification_service_1.NotificationService])
], ApplicationService);
//# sourceMappingURL=application.service.js.map