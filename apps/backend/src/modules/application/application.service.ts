import { Injectable, Inject, Optional, NotFoundException, Logger } from '@nestjs/common';
import { IApplicationRepository } from '../../domain/application/application-repository.interface';
import { ApplicationEntity, ApplicationStatus } from '../../domain/application/application.entity';
import { randomUUID } from 'crypto';
import { NotificationService } from '../notification/notification.service';
import { NotificationType, NotificationSeverity } from '../../domain/notification/notification-repository.interface';

@Injectable()
export class ApplicationService {
  private readonly logger = new Logger(ApplicationService.name);

  constructor(
    @Inject('IApplicationRepository') private readonly applicationRepo: IApplicationRepository,
    @Inject(NotificationService) @Optional() private readonly notificationService?: NotificationService,
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

  async submitApplication(userId: string, id: string): Promise<ApplicationEntity> {
    const app = await this.applicationRepo.findById(id);
    if (!app || app.userId !== userId) {
      throw new NotFoundException(`Application with ID '${id}' not found or access denied.`);
    }
    app.submit();
    const updated = await this.applicationRepo.update(app);

    if (this.notificationService) {
      try {
        await this.notificationService.createNotification({
          userId,
          type: NotificationType.APPLICATION_SUBMITTED,
          title: 'Application Submitted',
          body: `Your application (${updated.applicationNo}) has been submitted successfully for verification.`,
          severity: NotificationSeverity.SUCCESS,
          metadata: { applicationId: updated.id, applicationNo: updated.applicationNo, schemeId: updated.schemeId },
        });
      } catch (err) {
        // silent
      }
    }

    return updated;
  }

  async updateApplication(
    userId: string,
    id: string,
    data: { status?: ApplicationStatus; formData?: Record<string, any> },
  ): Promise<ApplicationEntity> {
    const app = await this.applicationRepo.findById(id);
    if (!app || app.userId !== userId) {
      throw new NotFoundException(`Application with ID '${id}' not found or access denied.`);
    }
    const oldStatus = app.status;
    if (data.status) {
      app.transitionTo(data.status, userId);
    }
    if (data.formData) {
      app.updateFormData(data.formData);
    }
    const updated = await this.applicationRepo.update(app);

    if (this.notificationService && data.status && data.status !== oldStatus) {
      try {
        await this.notificationService.createNotification({
          userId,
          type: NotificationType.APPLICATION_STATUS_CHANGED,
          title: 'Application Status Updated',
          body: `Application ${updated.applicationNo} status changed to ${data.status.replace('_', ' ')}.`,
          severity: data.status === ApplicationStatus.APPROVED ? NotificationSeverity.SUCCESS : (data.status === ApplicationStatus.REJECTED ? NotificationSeverity.ERROR : NotificationSeverity.INFO),
          metadata: { applicationId: updated.id, applicationNo: updated.applicationNo, status: data.status },
        });
      } catch (err) {
        // silent
      }
    }

    return updated;
  }

  async getUserApplications(userId: string): Promise<ApplicationEntity[]> {
    return await this.applicationRepo.findByUserId(userId);
  }

  async getApplicationById(userId: string, id: string): Promise<ApplicationEntity> {
    const app = await this.applicationRepo.findById(id);
    if (!app || app.userId !== userId) {
      throw new NotFoundException(`Application with ID '${id}' not found or access denied.`);
    }
    return app;
  }
}
