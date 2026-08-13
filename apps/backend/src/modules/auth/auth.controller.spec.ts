import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRole } from '../../domain/user/user.entity';

describe('AuthController Specification', () => {
  let controller: AuthController;
  let mockAuthService: any;
  let mockResponse: any;

  beforeEach(async () => {
    mockAuthService = {
      register: jest.fn().mockResolvedValue({ id: 'user-1', email: 'citizen@example.com', role: UserRole.CITIZEN }),
      login: jest.fn().mockResolvedValue({
        user: { id: 'user-1', email: 'citizen@example.com', role: UserRole.CITIZEN },
        accessToken: 'access_token_mock',
        refreshToken: 'refresh_token_mock',
      }),
      refreshToken: jest.fn().mockResolvedValue({
        user: { id: 'user-1', email: 'citizen@example.com', role: UserRole.CITIZEN },
        accessToken: 'new_access_token_mock',
        refreshToken: 'new_refresh_token_mock',
      }),
      logout: jest.fn().mockResolvedValue({ success: true }),
    };

    mockResponse = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      json: jest.fn((data) => data),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should register a new citizen successfully', async () => {
    const dto = {
      name: 'Citizen User',
      age: 28,
      category: 'GENERAL' as any,
      profession: 'EMPLOYED' as any,
      annualIncome: 350000,
      state: 'Uttar Pradesh',
      email: 'citizen@example.com',
      password: 'Password123!',
      role: UserRole.CITIZEN,
    };
    const result = await controller.register(dto, mockResponse);
    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    expect(result).toHaveProperty('user');
  });

  it('should handle login and set HttpOnly refresh cookie', async () => {
    const dto = { email: 'citizen@example.com', password: 'Password123!' };
    const result = await controller.login(dto, mockResponse);

    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      'refresh_token',
      'refresh_token_mock',
      expect.objectContaining({
        httpOnly: true,
        path: '/api/v1/auth',
      }),
    );
    expect(result).toHaveProperty('accessToken', 'access_token_mock');
  });
});
