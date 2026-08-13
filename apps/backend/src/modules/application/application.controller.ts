import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsString, IsObject, IsOptional, IsArray } from 'class-validator';

export class CreateDraftDto {
  @IsString()
  schemeId: string;

  @IsOptional()
  @IsObject()
  formData?: Record<string, any>;

  @IsOptional()
  @IsArray()
  attachedDocumentIds?: string[];
}

export class UpdateApplicationDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsObject()
  formData?: Record<string, any>;

  @IsOptional()
  @IsArray()
  attachedDocumentIds?: string[];
}

@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  async createApplication(@CurrentUser('sub') userId: string, @Body() dto: CreateDraftDto) {
    const app = await this.applicationService.createDraft(userId, dto.schemeId, dto.formData || {});
    return {
      message: 'Application created successfully.',
      application: {
        id: app.id,
        applicationNo: app.applicationNo,
        applicationNumber: app.applicationNo,
        schemeId: app.schemeId,
        status: app.status,
      },
    };
  }

  @Post('draft')
  async createDraft(@CurrentUser('sub') userId: string, @Body() dto: CreateDraftDto) {
    const app = await this.applicationService.createDraft(userId, dto.schemeId, dto.formData || {});
    return {
      message: 'Application draft saved successfully.',
      application: {
        id: app.id,
        applicationNo: app.applicationNo,
        applicationNumber: app.applicationNo,
        schemeId: app.schemeId,
        status: app.status,
      },
    };
  }

  @Put(':id')
  async updateApplication(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    const app = await this.applicationService.updateApplication(userId, id, {
      formData: dto.formData,
    });
    return {
      message: 'Application updated successfully.',
      application: {
        id: app.id,
        applicationNo: app.applicationNo,
        applicationNumber: app.applicationNo,
        status: app.status,
      },
    };
  }

  @Post(':id/submit')
  async submitApplication(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    const app = await this.applicationService.submitApplication(userId, id);
    return {
      message: 'Application submitted successfully.',
      application: {
        id: app.id,
        applicationNo: app.applicationNo,
        applicationNumber: app.applicationNo,
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
        applicationNumber: a.applicationNo,
        schemeId: a.schemeId,
        status: a.status,
        submittedAt: a.submittedAt,
        createdAt: a.createdAt,
      })),
    };
  }

  @Get(':id')
  async getApplicationById(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    const app = await this.applicationService.getApplicationById(userId, id);
    return {
      application: {
        id: app.id,
        applicationNo: app.applicationNo,
        applicationNumber: app.applicationNo,
        schemeId: app.schemeId,
        status: app.status,
        formData: app.formData,
        history: app.history,
        submittedAt: app.submittedAt,
      },
    };
  }
}
