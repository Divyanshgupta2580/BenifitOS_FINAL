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
exports.CitizenController = void 0;
const common_1 = require("@nestjs/common");
const citizen_service_1 = require("./citizen.service");
const citizen_dto_1 = require("./dto/citizen.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let CitizenController = class CitizenController {
    citizenService;
    constructor(citizenService) {
        this.citizenService = citizenService;
    }
    async getProfile(userId) {
        const profile = await this.citizenService.getProfileByUserId(userId);
        return {
            profile: {
                id: profile.id,
                userId: profile.userId,
                firstName: profile.firstName,
                lastName: profile.lastName,
                dateOfBirth: profile.dateOfBirth,
                age: profile.age,
                gender: profile.gender,
                maritalStatus: profile.maritalStatus,
                socialCategory: profile.socialCategory,
                employmentStatus: profile.employmentStatus,
                annualIncomeINR: profile.annualIncomeINR,
                disabilityType: profile.disabilityType,
                disabilityPercent: profile.disabilityPercent,
                isBplCardHolder: profile.isBplCardHolder,
                state: profile.address?.state || 'National',
                district: profile.address?.district || '',
                address: profile.address
                    ? {
                        streetAddress: profile.address.streetAddress,
                        city: profile.address.city,
                        district: profile.address.district,
                        state: profile.address.state,
                        pincode: profile.address.pincode,
                        isRural: profile.address.isRural,
                    }
                    : null,
                completionPercentage: profile.calculateProfileCompletionPercentage(),
            },
        };
    }
    async updateProfile(userId, dto) {
        const profile = await this.citizenService.updateProfile(userId, dto);
        return {
            message: 'Citizen profile updated successfully.',
            profile: {
                id: profile.id,
                userId: profile.userId,
                completionPercentage: profile.calculateProfileCompletionPercentage(),
            },
        };
    }
};
exports.CitizenController = CitizenController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CitizenController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, citizen_dto_1.UpdateCitizenProfileDto]),
    __metadata("design:returntype", Promise)
], CitizenController.prototype, "updateProfile", null);
exports.CitizenController = CitizenController = __decorate([
    (0, common_1.Controller)('citizens'),
    __metadata("design:paramtypes", [citizen_service_1.CitizenService])
], CitizenController);
//# sourceMappingURL=citizen.controller.js.map