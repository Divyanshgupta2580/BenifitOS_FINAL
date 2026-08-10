import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IApplicationRepository } from '../../../domain/application/application-repository.interface';
import { ApplicationEntity, ApplicationStatus } from '../../../domain/application/application.entity';

@Injectable()
export class ApplicationRepositoryImpl implements IApplicationRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(data: any): ApplicationEntity {
    return new ApplicationEntity({
      id: data.id,
      applicationNo: data.applicationNo,
      userId: data.userId,
      schemeId: data.schemeId,
      status: data.status as ApplicationStatus,
      formData: data.formData as Record<string, any>,
      remarks: data.remarks,
      documentIds: data.documents ? data.documents.map((d: any) => d.documentId) : [],
      history: data.history
        ? data.history.map((h: any) => ({
            id: h.id,
            applicationId: h.applicationId,
            fromStatus: h.fromStatus as ApplicationStatus,
            toStatus: h.toStatus as ApplicationStatus,
            changedById: h.changedById,
            note: h.note,
            changedAt: h.changedAt,
          }))
        : [],
      submittedAt: data.submittedAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async findById(id: string): Promise<ApplicationEntity | null> {
    const record = await this.prisma.client.application.findUnique({
      where: { id },
      include: { documents: true, history: true },
    });
    return record ? this.mapToEntity(record) : null;
  }

  async findByApplicationNo(applicationNo: string): Promise<ApplicationEntity | null> {
    const record = await this.prisma.client.application.findUnique({
      where: { applicationNo },
      include: { documents: true, history: true },
    });
    return record ? this.mapToEntity(record) : null;
  }

  async findByUserId(userId: string): Promise<ApplicationEntity[]> {
    const records = await this.prisma.client.application.findMany({
      where: { userId },
      include: { documents: true, history: true },
    });
    return records.map((r) => this.mapToEntity(r));
  }

  async findBySchemeId(schemeId: string): Promise<ApplicationEntity[]> {
    const records = await this.prisma.client.application.findMany({
      where: { schemeId },
      include: { documents: true, history: true },
    });
    return records.map((r) => this.mapToEntity(r));
  }

  async findByStatus(status: ApplicationStatus): Promise<ApplicationEntity[]> {
    const records = await this.prisma.client.application.findMany({
      where: { status },
      include: { documents: true, history: true },
    });
    return records.map((r) => this.mapToEntity(r));
  }

  async save(application: ApplicationEntity): Promise<ApplicationEntity> {
    const record = await this.prisma.client.application.create({
      data: {
        id: application.id,
        applicationNo: application.applicationNo,
        userId: application.userId,
        schemeId: application.schemeId,
        status: application.status,
        formData: application.formData,
        remarks: application.remarks,
        submittedAt: application.submittedAt,
      },
      include: { documents: true, history: true },
    });
    return this.mapToEntity(record);
  }

  async update(application: ApplicationEntity): Promise<ApplicationEntity> {
    const record = await this.prisma.client.application.update({
      where: { id: application.id },
      data: {
        status: application.status,
        formData: application.formData,
        remarks: application.remarks,
        submittedAt: application.submittedAt,
      },
      include: { documents: true, history: true },
    });
    return this.mapToEntity(record);
  }
}
