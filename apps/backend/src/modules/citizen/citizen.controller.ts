import { Controller, Get, Put, Body } from '@nestjs/common';
import { CitizenService } from './citizen.service';
import { UpdateCitizenProfileDto } from './dto/citizen.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('citizens')
export class CitizenController {
  constructor(private readonly citizenService: CitizenService) {}

  @Get('me')
  async getProfile(@CurrentUser('sub') userId: string) {
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
        completionPercentage: profile.calculateProfileCompletionPercentage(),
      },
    };
  }

  @Put('me')
  async updateProfile(@CurrentUser('sub') userId: string, @Body() dto: UpdateCitizenProfileDto) {
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
}
