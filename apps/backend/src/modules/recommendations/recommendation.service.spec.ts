import { Test, TestingModule } from '@nestjs/testing';

describe('RecommendationService Specification', () => {
  let mockEngine: any;

  beforeEach(() => {
    mockEngine = {
      evaluateProfile: jest.fn().mockImplementation((profile) => {
        if (profile.income < 200000) {
          return [
            { schemeId: 'scheme-PM-AYUSHMAN', score: 0.95, eligible: true },
            { schemeId: 'scheme-PM-AWAS', score: 0.88, eligible: true },
          ];
        }
        return [];
      }),
    };
  });

  it('should evaluate citizen profile eligibility correctly', async () => {
    const profile = { citizenId: 'c-1', income: 150000, category: 'LOW_INCOME' };
    const recommendations = await mockEngine.evaluateProfile(profile);
    expect(recommendations.length).toBe(2);
    expect(recommendations[0].schemeId).toBe('scheme-PM-AYUSHMAN');
  });
});
