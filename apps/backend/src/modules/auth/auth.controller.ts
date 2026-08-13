import { Controller, Post, Body, HttpCode, HttpStatus, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { Public } from '../../common/decorators/roles.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return await this.authService.resetPassword(dto);
  }

  private setRefreshCookie(res: Response, refreshToken: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/api/v1/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private clearRefreshCookie(res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/api/v1/auth',
    });
  }

  @Public()
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    this.setRefreshCookie(res, result.refreshToken);
    return {
      message: 'User registered successfully.',
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
      },
      tokens: {
        accessToken: result.accessToken,
      },
    };
  }

  @Public()
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    this.setRefreshCookie(res, result.refreshToken);
    return {
      message: 'Login successful.',
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
      },
      tokens: {
        accessToken: result.accessToken,
      },
    };
  }

  @Public()
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Body() dto: Partial<RefreshTokenDto>,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.['refresh_token'] || dto?.refreshToken;
    if (!token) {
      throw new UnauthorizedException('No refresh token provided.');
    }
    const tokens = await this.authService.refreshToken({ refreshToken: token });
    this.setRefreshCookie(res, tokens.refreshToken);
    return {
      message: 'Token refreshed successfully.',
      tokens: {
        accessToken: tokens.accessToken,
      },
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Body() dto: Partial<RefreshTokenDto>,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.['refresh_token'] || dto?.refreshToken;
    if (token) {
      await this.authService.logout(token);
    }
    this.clearRefreshCookie(res);
    return { message: 'Logged out successfully.' };
  }
}
