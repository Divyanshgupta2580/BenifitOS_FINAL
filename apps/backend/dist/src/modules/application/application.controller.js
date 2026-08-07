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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationController = exports.CreateDraftDto = void 0;
const common_1 = require("@nestjs/common");
const application_service_1 = require("./application.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const class_validator_1 = require("class-validator");
class CreateDraftDto {
    schemeId;
    formData;
}
exports.CreateDraftDto = CreateDraftDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDraftDto.prototype, "schemeId", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateDraftDto.prototype, "formData", void 0);
let ApplicationController = class ApplicationController {
    applicationService;
    constructor(applicationService) {
        this.applicationService = applicationService;
    }
    async createDraft(userId, dto) {
        const app = await this.applicationService.createDraft(userId, dto.schemeId, dto.formData);
        return {
            message: 'Application draft saved successfully.',
            application: {
                id: app.id,
                applicationNo: app.applicationNo,
                schemeId: app.schemeId,
                status: app.status,
            },
        };
    }
    async submitApplication(id) {
        const app = await this.applicationService.submitApplication(id);
        return {
            message: 'Application submitted successfully.',
            application: {
                id: app.id,
                applicationNo: app.applicationNo,
                status: app.status,
                submittedAt: app.submittedAt,
            },
        };
    }
    async getApplications(userId) {
        const apps = await this.applicationService.getUserApplications(userId);
        return {
            count: apps.length,
            applications: apps.map((a) => ({
                id: a.id,
                applicationNo: a.applicationNo,
                schemeId: a.schemeId,
                status: a.status,
                submittedAt: a.submittedAt,
                createdAt: a.createdAt,
            })),
        };
    }
    async getApplicationById(id) {
        const app = await this.applicationService.getApplicationById(id);
        return {
            application: {
                id: app.id,
                applicationNo: app.applicationNo,
                schemeId: app.schemeId,
                status: app.status,
                formData: app.formData,
                history: app.history,
                submittedAt: app.submittedAt,
            },
        };
    }
};
exports.ApplicationController = ApplicationController;
__decorate([
    (0, common_1.Post)('draft'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateDraftDto]),
    __metadata("design:returntype", Promise)
], ApplicationController.prototype, "createDraft", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApplicationController.prototype, "submitApplication", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApplicationController.prototype, "getApplications", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApplicationController.prototype, "getApplicationById", null);
exports.ApplicationController = ApplicationController = __decorate([
    (0, common_1.Controller)('applications'),
    __metadata("design:paramtypes", [application_service_1.ApplicationService])
], ApplicationController);
//# sourceMappingURL=application.controller.js.map