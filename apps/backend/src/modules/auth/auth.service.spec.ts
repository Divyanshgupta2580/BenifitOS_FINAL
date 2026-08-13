import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRole } from '../../domain/user/user.entity';

describe('AuthService Specification', () => {
  let service: AuthService;
  let mockUserRepo: any;
  let mockJwtService: any;
  let mockRedisService: any;

  beforeEach(async () => {
    mockUserRepo = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn((user) => Promise.resolve(user)),
    };

    const mockCitizenRepo = {
      save: jest.fn((c) => Promise.resolve(c)),
      findByUserId: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mocked_jwt_token'),
      verify: jest.fn(),
    };

    mockRedisService = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue('OK'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: 'IUserRepository', useValue: mockUserRepo },
        { provide: 'ICitizenRepository', useValue: mockCitizenRepo },
        { provide: JwtService, useValue: mockJwtService },
        { provide: 'RedisService', useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should reject registration if email already exists', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ id: 'existing-id', email: 'test@example.com' });

      await expect(
        service.register({
          name: 'Citizen User',
          age: 28,
          category: 'GENERAL' as any,
          profession: 'EMPLOYED' as any,
          annualIncome: 350000,
          state: 'Uttar Pradesh',
          email: 'test@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('logout', () => {
    it('should blacklist refresh token in Redis upon logout', async () => {
      await service.logout('refresh_token_sample');
      expect(mockRedisService.set).toHaveBeenCalledWith('bl_refresh_token_sample', 'true', expect.any(Number));
    });
  });
});
