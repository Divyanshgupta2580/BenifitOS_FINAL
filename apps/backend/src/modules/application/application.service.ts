import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IApplicationRepository } from '../../domain/application/application-repository.interface';
import { ApplicationEntity, ApplicationStatus } from '../../domain/application/application.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class ApplicationService {
  constructor(
    @Inject('IApplicationRepository') private readonly applicationRepo: IApplicationRepository,
  ) {}

  async createDraft(userId: string, schemeId: string, formData: Record<string, any>): Promise<ApplicationEntity> {
    const appNo = `APP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const app = new ApplicationEntity({
      id: randomUUID(),
      applicationNo: appNo,
      userId,
      schemeId,
      status: ApplicationStatus.DRAFT,
      formData,
    });
    return await this.applicationRepo.save(app);
  }

  async submitApplication(id: string): Promise<ApplicationEntity> {
    const app = await this.applicationRepo.findById(id);
    if (!app) {
      throw new NotFoundException(`Application with ID '${id}' not found.`);
    }
    app.submit();
    return await this.applicationRepo.update(app);
  }

  async getUserApplications(userId: string): Promise<ApplicationEntity[]> {
    return await this.applicationRepo.findByUserId(userId);
  }

  async getApplicationById(id: string): Promise<ApplicationEntity> {
    const app = await this.applicationRepo.findById(id);
    if (!app) {
      throw new NotFoundException(`Application with ID '${id}' not found.`);
    }
    return app;
  }
}
