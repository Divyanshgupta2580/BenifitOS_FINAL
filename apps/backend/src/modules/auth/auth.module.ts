import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UserRepositoryImpl } from '../../infrastructure/database/repositories/user.repository';
import { CitizenRepositoryImpl } from '../../infrastructure/database/repositories/citizen.repository';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { EmailService } from '../../infrastructure/email/email.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: (process.env.JWT_EXPIRATION || '15m') as any },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    PrismaService,
    RedisService,
    EmailService,
    {
      provide: 'IUserRepository',
      useClass: UserRepositoryImpl,
    },
    {
      provide: 'ICitizenRepository',
      useClass: CitizenRepositoryImpl,
    },
  ],
  exports: [AuthService, JwtStrategy, PassportModule, JwtModule, 'IUserRepository', 'ICitizenRepository'],
})
export class AuthModule {}
