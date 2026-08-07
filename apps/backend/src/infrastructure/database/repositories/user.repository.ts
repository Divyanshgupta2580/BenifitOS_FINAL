import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IUserRepository } from '../../../domain/user/user-repository.interface';
import { UserEntity, UserRole } from '../../../domain/user/user.entity';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(data: any): UserEntity {
    return new UserEntity({
      id: data.id,
      email: data.email,
      phone: data.phone,
      passwordHash: data.passwordHash,
      role: data.role as UserRole,
      isEmailVerified: data.isEmailVerified,
      isPhoneVerified: data.isPhoneVerified,
      mfaEnabled: data.mfaEnabled,
      mfaSecret: data.mfaSecret,
      googleId: data.googleId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      deletedAt: data.deletedAt,
    });
  }

  async findById(id: string): Promise<UserEntity | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? this.mapToEntity(record) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const record = await this.prisma.user.findUnique({ where: { email } });
    return record ? this.mapToEntity(record) : null;
  }

  async findByPhone(phone: string): Promise<UserEntity | null> {
    const record = await this.prisma.user.findUnique({ where: { phone } });
    return record ? this.mapToEntity(record) : null;
  }

  async findByGoogleId(googleId: string): Promise<UserEntity | null> {
    const record = await this.prisma.user.findUnique({ where: { googleId } });
    return record ? this.mapToEntity(record) : null;
  }

  async save(user: UserEntity): Promise<UserEntity> {
    const record = await this.prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        passwordHash: user.passwordHash,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        mfaEnabled: user.mfaEnabled,
        mfaSecret: user.mfaSecret,
        googleId: user.googleId,
      },
    });
    return this.mapToEntity(record);
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const record = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        phone: user.phone,
        passwordHash: user.passwordHash,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        mfaEnabled: user.mfaEnabled,
        mfaSecret: user.mfaSecret,
        deletedAt: user.deletedAt,
      },
    });
    return this.mapToEntity(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
