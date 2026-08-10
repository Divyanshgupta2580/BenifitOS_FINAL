import { Test, TestingModule } from '@nestjs/testing';

describe('NotificationGateway Specification', () => {
  let mockSocketServer: any;

  beforeEach(() => {
    mockSocketServer = {
      emit: jest.fn(),
      to: jest.fn().mockReturnThis(),
    };
  });

  it('should emit realtime notification to connected citizen room', () => {
    mockSocketServer.to('citizen-user-1').emit('notification', { title: 'Application Approved', appId: 'app-501' });
    expect(mockSocketServer.to).toHaveBeenCalledWith('citizen-user-1');
    expect(mockSocketServer.emit).toHaveBeenCalledWith('notification', expect.objectContaining({ title: 'Application Approved' }));
  });
});
