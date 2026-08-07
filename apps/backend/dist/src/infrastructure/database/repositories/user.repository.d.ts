import { PrismaService } from '../prisma.service';
import { IUserRepository } from '../../../domain/user/user-repository.interface';
import { UserEntity } from '../../../domain/user/user.entity';
export declare class UserRepositoryImpl implements IUserRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private mapToEntity;
    findById(id: string): Promise<UserEntity | null>;
    findByEmail(email: string): Promise<UserEntity | null>;
    findByPhone(phone: string): Promise<UserEntity | null>;
    findByGoogleId(googleId: string): Promise<UserEntity | null>;
    save(user: UserEntity): Promise<UserEntity>;
    update(user: UserEntity): Promise<UserEntity>;
    delete(id: string): Promise<void>;
}
