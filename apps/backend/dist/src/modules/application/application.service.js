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
exports.ApplicationService = void 0;
const common_1 = require("@nestjs/common");
const application_entity_1 = require("../../domain/application/application.entity");
const crypto_1 = require("crypto");
let ApplicationService = class ApplicationService {
    applicationRepo;
    constructor(applicationRepo) {
        this.applicationRepo = applicationRepo;
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
    async submitApplication(id) {
        const app = await this.applicationRepo.findById(id);
        if (!app) {
            throw new common_1.NotFoundException(`Application with ID '${id}' not found.`);
        }
        app.submit();
        return await this.applicationRepo.update(app);
    }
    async getUserApplications(userId) {
        return await this.applicationRepo.findByUserId(userId);
    }
    async getApplicationById(id) {
        const app = await this.applicationRepo.findById(id);
        if (!app) {
            throw new common_1.NotFoundException(`Application with ID '${id}' not found.`);
        }
        return app;
    }
};
exports.ApplicationService = ApplicationService;
exports.ApplicationService = ApplicationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IApplicationRepository')),
    __metadata("design:paramtypes", [Object])
], ApplicationService);
//# sourceMappingURL=application.service.js.map