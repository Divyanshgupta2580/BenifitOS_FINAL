import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IUserRepository } from '../../domain/user/user-repository.interface';
import { Inject } from '@nestjs/common';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userRepo.findById(payload.sub);
    if (!user || user.deletedAt) {
      throw new UnauthorizedException('User account not found or deactivated.');
    }
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
