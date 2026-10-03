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
exports.CitizenService = void 0;
const common_1 = require("@nestjs/common");
const citizen_entity_1 = require("../../domain/citizen/citizen.entity");
const crypto_1 = require("crypto");
const ai_cache_service_1 = require("../../infrastructure/ai/ai-cache.service");
const notification_service_1 = require("../notification/notification.service");
const notification_repository_interface_1 = require("../../domain/notification/notification-repository.interface");
let CitizenService = class CitizenService {
    citizenRepo;
    recommendationRepo;
    aiCacheService;
    notificationService;
    constructor(citizenRepo, recommendationRepo, aiCacheService, notificationService) {
        this.citizenRepo = citizenRepo;
        this.recommendationRepo = recommendationRepo;
        this.aiCacheService = aiCacheService;
        this.notificationService = notificationService;
    }
    async getProfileByUserId(userId) {
        const profile = await this.citizenRepo.findByUserId(userId);
        if (!profile) {
            throw new common_1.NotFoundException(`Citizen profile not found for user '${userId}'.`);
        }
        return profile;
    }
    async updateProfile(userId, dto) {
        let profile = await this.citizenRepo.findByUserId(userId);
        const dob = new Date(dto.dateOfBirth);
        if (!profile) {
            profile = new citizen_entity_1.CitizenEntity({
                id: (0, crypto_1.randomUUID)(),
                userId,
                firstName: dto.firstName,
                lastName: dto.lastName,
                dateOfBirth: dob,
                gender: dto.gender,
                maritalStatus: dto.maritalStatus,
                socialCategory: dto.socialCategory,
                employmentStatus: dto.employmentStatus,
                annualIncomeINR: dto.annualIncomeINR,
                disabilityType: dto.disabilityType,
                disabilityPercent: dto.disabilityPercent,
                isBplCardHolder: dto.isBplCardHolder,
                bplCardNumber: dto.bplCardNumber,
            });
            const saved = await this.citizenRepo.save(profile);
            if (this.recommendationRepo) {
                await this.recommendationRepo.deleteForCitizen(saved.id);
            }
            if (this.aiCacheService) {
                await this.aiCacheService.invalidateForUser(userId);
            }
            return saved;
        }
        const addressProps = (dto.state || dto.district || dto.city || dto.streetAddress)
            ? {
                id: (0, crypto_1.randomUUID)(),
                streetAddress: dto.streetAddress || profile.address?.streetAddress || 'Default Address',
                city: dto.city || profile.address?.city || 'City',
                district: dto.district || profile.address?.district || 'District',
                state: dto.state || profile.address?.state || 'National',
                pincode: dto.pincode || profile.address?.pincode || '110001',
                isRural: dto.isRural !== undefined ? dto.isRural : profile.address?.isRural || false,
            }
            : undefined;
        profile.updateDemographics({
            ...dto,
            dateOfBirth: dob,
            address: addressProps,
        });
        const updated = await this.citizenRepo.update(profile);
        if (this.recommendationRepo) {
            await this.recommendationRepo.deleteForCitizen(updated.id);
        }
        if (this.aiCacheService) {
            await this.aiCacheService.invalidateForUser(userId);
        }
        if (this.notificationService) {
            try {
                await this.notificationService.createNotification({
                    userId,
                    type: notification_repository_interface_1.NotificationType.PROFILE_INCOMPLETE,
                    title: 'Profile Updated',
                    body: 'Your citizen profile has been updated. Scheme eligibility criteria have been refreshed.',
                    severity: notification_repository_interface_1.NotificationSeverity.SUCCESS,
                    deduplicateMinutes: 10,
                });
            }
            catch (err) {
            }
        }
        return updated;
    }
};
exports.CitizenService = CitizenService;
exports.CitizenService = CitizenService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('ICitizenRepository')),
    __param(1, (0, common_1.Inject)('ISchemeRecommendationRepository')),
    __param(2, (0, common_1.Optional)()),
    __param(3, (0, common_1.Inject)(notification_service_1.NotificationService)),
    __param(3, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [Object, Object, ai_cache_service_1.AiCacheService,
        notification_service_1.NotificationService])
], CitizenService);
//# sourceMappingURL=citizen.service.js.map