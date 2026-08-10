import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import { ICitizenRepository } from '../../../domain/citizen/citizen-repository.interface';
import { CitizenEntity, Gender, SocialCategory, MaritalStatus, EmploymentStatus, DisabilityType } from '../../../domain/citizen/citizen.entity';

@Injectable()
export class CitizenRepositoryImpl implements ICitizenRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(data: Prisma.CitizenProfileGetPayload<{ include: { address: true; householdMembers: true; landDetails: true } }>): CitizenEntity {
    return new CitizenEntity({
      id: data.id,
      userId: data.userId,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender as Gender,
      maritalStatus: data.maritalStatus as MaritalStatus,
      socialCategory: data.socialCategory as SocialCategory,
      employmentStatus: data.employmentStatus as EmploymentStatus,
      annualIncomeINR: data.annualIncomeINR,
      disabilityType: data.disabilityType as DisabilityType,
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
      householdMembers: data.householdMembers ? data.householdMembers.map((m: Prisma.HouseholdMemberGetPayload<{}>) => ({
        id: m.id,
        fullName: m.fullName,
        relation: m.relation,
        age: m.age,
        gender: m.gender as Gender,
        isDependent: m.isDependent,
        annualIncomeINR: m.annualIncomeINR,
      })) : [],
      landDetails: data.landDetails ? data.landDetails.map((l: Prisma.LandDetailGetPayload<{}>) => ({
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

  async findById(id: string): Promise<CitizenEntity | null> {
    const record = await this.prisma.client.citizenProfile.findUnique({
      where: { id },
      include: { address: true, householdMembers: true, landDetails: true },
    });
    return record ? this.mapToEntity(record) : null;
  }

  async findByUserId(userId: string): Promise<CitizenEntity | null> {
    const record = await this.prisma.client.citizenProfile.findUnique({
      where: { userId },
      include: { address: true, householdMembers: true, landDetails: true },
    });
    return record ? this.mapToEntity(record) : null;
  }

  async findByAadhaarHash(aadhaarHash: string): Promise<CitizenEntity | null> {
    const record = await this.prisma.client.citizenProfile.findUnique({
      where: { aadhaarHash },
      include: { address: true, householdMembers: true, landDetails: true },
    });
    return record ? this.mapToEntity(record) : null;
  }

  async save(citizen: CitizenEntity): Promise<CitizenEntity> {
    const record = await this.prisma.client.citizenProfile.create({
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

  async update(citizen: CitizenEntity): Promise<CitizenEntity> {
    const record = await this.prisma.client.citizenProfile.update({
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

  async delete(id: string): Promise<void> {
    await this.prisma.client.citizenProfile.delete({ where: { id } });
  }
}
