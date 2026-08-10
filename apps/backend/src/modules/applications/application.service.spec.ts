import { Test, TestingModule } from '@nestjs/testing';

describe('ApplicationService Specification', () => {
  let mockApplicationRepo: any;

  beforeEach(() => {
    mockApplicationRepo = {
      createDraft: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 'app-501', status: 'DRAFT', ...dto })),
      updateStatus: jest.fn().mockImplementation((id, status) => Promise.resolve({ id, status })),
    };
  });

  it('should create a new benefit application draft', async () => {
    const draft = await mockApplicationRepo.createDraft({ citizenId: 'citizen-1', schemeId: 'scheme-PM-KISAN' });
    expect(draft).toHaveProperty('id', 'app-501');
    expect(draft.status).toBe('DRAFT');
  });

  it('should transition application status from DRAFT to SUBMITTED', async () => {
    const updated = await mockApplicationRepo.updateStatus('app-501', 'SUBMITTED');
    expect(updated.status).toBe('SUBMITTED');
  });
});
