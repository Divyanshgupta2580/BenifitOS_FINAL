import { Injectable, Inject, NotFoundException, Optional } from '@nestjs/common';
import { ICitizenRepository } from '../../domain/citizen/citizen-repository.interface';
import { CitizenEntity } from '../../domain/citizen/citizen.entity';
import { UpdateCitizenProfileDto } from './dto/citizen.dto';
import { randomUUID } from 'crypto';
import { ISchemeRecommendationRepository } from '../../domain/welfare/welfare-repository.interface';
import { AiCacheService } from '../../infrastructure/ai/ai-cache.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationType, NotificationSeverity } from '../../domain/notification/notification-repository.interface';

@Injectable()
export class CitizenService {
  constructor(
    @Inject('ICitizenRepository') private readonly citizenRepo: ICitizenRepository,
    @Inject('ISchemeRecommendationRepository') private readonly recommendationRepo?: ISchemeRecommendationRepository,
    @Optional() private readonly aiCacheService?: AiCacheService,
    @Inject(NotificationService) @Optional() private readonly notificationService?: NotificationService,
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
          id: randomUUID(),
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
          type: NotificationType.PROFILE_INCOMPLETE,
          title: 'Profile Updated',
          body: 'Your citizen profile has been updated. Scheme eligibility criteria have been refreshed.',
          severity: NotificationSeverity.SUCCESS,
          deduplicateMinutes: 10,
        });
      } catch (err) {
        // silent fail
      }
    }

    return updated;
  }
}
