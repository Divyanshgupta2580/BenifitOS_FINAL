import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsString, IsObject } from 'class-validator';

export class CreateDraftDto {
  @IsString()
  schemeId: string;

  @IsObject()
  formData: Record<string, any>;
}

@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post('draft')
  async createDraft(@CurrentUser('sub') userId: string, @Body() dto: CreateDraftDto) {
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

  @Post(':id/submit')
  async submitApplication(@Param('id') id: string) {
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

  @Get()
  async getApplications(@CurrentUser('sub') userId: string) {
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

  @Get(':id')
  async getApplicationById(@Param('id') id: string) {
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
}
