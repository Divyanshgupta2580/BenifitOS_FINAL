import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ICitizenRepository } from '../../domain/citizen/citizen-repository.interface';
import { CitizenEntity } from '../../domain/citizen/citizen.entity';
import { UpdateCitizenProfileDto } from './dto/citizen.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class CitizenService {
  constructor(
    @Inject('ICitizenRepository') private readonly citizenRepo: ICitizenRepository,
  ) {}

  async getProfileByUserId(userId: string): Promise<CitizenEntity> {
    const profile = await this.citizenRepo.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException(`Citizen profile not found for user '${userId}'.`);
    }
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateCitizenProfileDto): Promise<CitizenEntity> {
    let profile = await this.citizenRepo.findByUserId(userId);
    const dob = new Date(dto.dateOfBirth);

    if (!profile) {
      profile = new CitizenEntity({
        id: randomUUID(),
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
      return await this.citizenRepo.save(profile);
    }

    profile.updateDemographics({
      ...dto,
      dateOfBirth: dob,
    });
    return await this.citizenRepo.update(profile);
  }
}
