import { Test, TestingModule } from '@nestjs/testing';
import { RealtimeGateway } from './realtime.gateway';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('RealtimeGateway', () => {
  let gateway: RealtimeGateway;
  let mockJwtService: any;

  beforeEach(async () => {
    mockJwtService = {
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RealtimeGateway,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    gateway = module.get<RealtimeGateway>(RealtimeGateway);
    gateway.server = {
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
    } as any;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should authenticate valid token and emit connection_ack', async () => {
      const mockClient: any = {
        id: 'client-123',
        handshake: {
          auth: { token: 'valid-jwt-token' },
          headers: {},
        },
        data: {},
        emit: jest.fn(),
        disconnect: jest.fn(),
      };

      mockJwtService.verify.mockReturnValue({ sub: 'user-123', role: 'CITIZEN' });

      await gateway.handleConnection(mockClient);

      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-jwt-token', expect.any(Object));
      expect(mockClient.data.user).toEqual({ sub: 'user-123', role: 'CITIZEN' });
      expect(mockClient.emit).toHaveBeenCalledWith('connection_ack', expect.objectContaining({
        status: 'CONNECTED',
        userId: 'user-123',
      }));
      expect(mockClient.disconnect).not.toHaveBeenCalled();
    });

    it('should reject connection when token is missing', async () => {
      const mockClient: any = {
        id: 'client-456',
        handshake: {
          auth: {},
          headers: {},
        },
        data: {},
        emit: jest.fn(),
        disconnect: jest.fn(),
      };

      await gateway.handleConnection(mockClient);

      expect(mockClient.emit).toHaveBeenCalledWith('error', expect.objectContaining({
        code: 'UNAUTHORIZED',
      }));
      expect(mockClient.disconnect).toHaveBeenCalledWith(true);
    });

    it('should reject connection when token is invalid or expired', async () => {
      const mockClient: any = {
        id: 'client-789',
        handshake: {
          auth: { token: 'expired-jwt-token' },
          headers: {},
        },
        data: {},
        emit: jest.fn(),
        disconnect: jest.fn(),
      };

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await gateway.handleConnection(mockClient);

      expect(mockClient.emit).toHaveBeenCalledWith('error', expect.objectContaining({
        code: 'UNAUTHORIZED',
      }));
      expect(mockClient.disconnect).toHaveBeenCalledWith(true);
    });
  });

  describe('handleUserSubscription', () => {
    it('should allow user to join their own room', () => {
      const mockClient: any = {
        id: 'client-123',
        data: {
          user: { sub: 'user-123', role: 'CITIZEN' },
        },
        join: jest.fn(),
      };

      const result = gateway.handleUserSubscription({ userId: 'user-123' }, mockClient);
      expect(mockClient.join).toHaveBeenCalledWith('user:user-123');
      expect(result).toEqual({ status: 'SUBSCRIBED', room: 'user:user-123' });
    });

    it('should forbid user from joining another user room', () => {
      const mockClient: any = {
        id: 'client-123',
        data: {
          user: { sub: 'user-123', role: 'CITIZEN' },
        },
        join: jest.fn(),
      };

      const result = gateway.handleUserSubscription({ userId: 'user-999' }, mockClient);
      expect(mockClient.join).not.toHaveBeenCalled();
      expect(result).toEqual({ status: 'ERROR', message: expect.any(String) });
    });
  });

  describe('event emission', () => {
    it('should emit OCR progress to user room', () => {
      gateway.emitOcrProgress('user-123', { stage: 'OCR_PROCESSING', progress: 50 });
      expect(gateway.server.to).toHaveBeenCalledWith('user:user-123');
    });

    it('should emit application status changed to user room', () => {
      gateway.emitApplicationStatus('user-123', { applicationId: 'app-1', status: 'SUBMITTED' });
      expect(gateway.server.to).toHaveBeenCalledWith('user:user-123');
    });

    it('should emit notification received to user room', () => {
      gateway.emitNotification('user-123', { title: 'Scheme Approved', body: 'Your application was approved.' });
      expect(gateway.server.to).toHaveBeenCalledWith('user:user-123');
    });
  });
});
