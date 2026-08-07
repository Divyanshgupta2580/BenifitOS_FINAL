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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CitizenRepositoryImpl = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const citizen_entity_1 = require("../../../domain/citizen/citizen.entity");
let CitizenRepositoryImpl = class CitizenRepositoryImpl {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapToEntity(data) {
        return new citizen_entity_1.CitizenEntity({
            id: data.id,
            userId: data.userId,
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender,
            maritalStatus: data.maritalStatus,
            socialCategory: data.socialCategory,
            employmentStatus: data.employmentStatus,
            annualIncomeINR: data.annualIncomeINR,
            disabilityType: data.disabilityType,
            disabilityPercent: data.disabilityPercent,
            isBplCardHolder: data.isBplCardHolder,
            bplCardNumber: data.bplCardNumber,
            aadhaarHash: data.aadhaarHash,
            panHash: data.panHash,
            address: data.address ? {
                id: data.address.id,
                streetAddress: data.address.streetAddress,
                city: data.address.city,
                district: data.address.district,
                state: data.address.state,
                pincode: data.address.pincode,
                isRural: data.address.isRural,
            } : null,
            householdMembers: data.householdMembers ? data.householdMembers.map((m) => ({
                id: m.id,
                fullName: m.fullName,
                relation: m.relation,
                age: m.age,
                gender: m.gender,
                isDependent: m.isDependent,
                annualIncomeINR: m.annualIncomeINR,
            })) : [],
            landDetails: data.landDetails ? data.landDetails.map((l) => ({
                id: l.id,
                landSizeAcres: l.landSizeAcres,
                landType: l.landType,
                surveyNumber: l.surveyNumber,
                district: l.district,
                state: l.state,
            })) : [],
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        });
    }
    async findById(id) {
        const record = await this.prisma.citizenProfile.findUnique({
            where: { id },
            include: { address: true, householdMembers: true, landDetails: true },
        });
        return record ? this.mapToEntity(record) : null;
    }
    async findByUserId(userId) {
        const record = await this.prisma.citizenProfile.findUnique({
            where: { userId },
            include: { address: true, householdMembers: true, landDetails: true },
        });
        return record ? this.mapToEntity(record) : null;
    }
    async findByAadhaarHash(aadhaarHash) {
        const record = await this.prisma.citizenProfile.findUnique({
            where: { aadhaarHash },
            include: { address: true, householdMembers: true, landDetails: true },
        });
        return record ? this.mapToEntity(record) : null;
    }
    async save(citizen) {
        const record = await this.prisma.citizenProfile.create({
            data: {
                id: citizen.id,
                userId: citizen.userId,
                firstName: citizen.firstName,
                lastName: citizen.lastName,
                dateOfBirth: citizen.dateOfBirth,
                gender: citizen.gender,
                maritalStatus: citizen.maritalStatus,
                socialCategory: citizen.socialCategory,
                employmentStatus: citizen.employmentStatus,
                annualIncomeINR: citizen.annualIncomeINR,
                disabilityType: citizen.disabilityType,
                disabilityPercent: citizen.disabilityPercent,
                isBplCardHolder: citizen.isBplCardHolder,
                bplCardNumber: citizen.bplCardNumber,
                aadhaarHash: citizen.aadhaarHash,
                panHash: citizen.panHash,
            },
            include: { address: true, householdMembers: true, landDetails: true },
        });
        return this.mapToEntity(record);
    }
    async update(citizen) {
        const record = await this.prisma.citizenProfile.update({
            where: { id: citizen.id },
            data: {
                firstName: citizen.firstName,
                lastName: citizen.lastName,
                dateOfBirth: citizen.dateOfBirth,
                gender: citizen.gender,
                maritalStatus: citizen.maritalStatus,
                socialCategory: citizen.socialCategory,
                employmentStatus: citizen.employmentStatus,
                annualIncomeINR: citizen.annualIncomeINR,
                disabilityType: citizen.disabilityType,
                disabilityPercent: citizen.disabilityPercent,
                isBplCardHolder: citizen.isBplCardHolder,
                bplCardNumber: citizen.bplCardNumber,
            },
            include: { address: true, householdMembers: true, landDetails: true },
        });
        return this.mapToEntity(record);
    }
    async delete(id) {
        await this.prisma.citizenProfile.delete({ where: { id } });
    }
};
exports.CitizenRepositoryImpl = CitizenRepositoryImpl;
exports.CitizenRepositoryImpl = CitizenRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CitizenRepositoryImpl);
//# sourceMappingURL=citizen.repository.js.map