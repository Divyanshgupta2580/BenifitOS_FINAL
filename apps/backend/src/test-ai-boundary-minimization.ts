import { strict as assert } from 'assert';
import { AiService } from './modules/ai/ai.service';
import { AiDataMinimizerService } from './infrastructure/ai/ai-data-minimizer.service';
import { AiSafetyService } from './infrastructure/ai/ai-safety.service';
import { AiCacheService } from './infrastructure/ai/ai-cache.service';
import { RedisService } from './infrastructure/redis/redis.service';

console.log('====================================================');
console.log(' BENEFITOS — AI REQUEST BOUNDARY MINIMIZATION TEST  ');
console.log('====================================================\n');

async function runBoundaryMinimizationTests() {
  // Mock AI adapter capturing outgoing payloads at the boundary
  const capturedPayloads: Array<{
    prompt?: string;
    systemInstruction?: string;
    options?: any;
  }> = [];

  const mockGeminiAdapter: any = {
    generateText: async (options: any) => {
      capturedPayloads.push(options);
      return {
        content: 'Authoritative guidance response for eligible citizen',
        provider: 'BenefitOS AI',
        tokensUsed: 120,
      };
    },
    generateSchemeInstructions: async (options: any) => {
      capturedPayloads.push({ options });
      return 'Step 1: Verify eligibility... Step 2: Upload documents...';
    },
  };

  // Full sensitive mock raw profile containing secrets, PII, auth data, and internal IDs
  const rawSensitiveCitizenProfile = {
    id: 'internal-citizen-uuid-999-secret',
    userId: 'internal-user-uuid-111-secret',
    firstName: 'Aarav',
    lastName: 'Singhania',
    email: 'aarav.singhania.private@gov-test.in',
    phone: '+91 9876543210',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$dGVzdGhhc2g',
    mfaSecret: 'JBSWY3DPEHPK3PXP_SECRET_TOTP',
    dateOfBirth: new Date('1994-06-15'), // age 32
    gender: 'MALE',
    maritalStatus: 'MARRIED',
    socialCategory: 'OBC',
    employmentStatus: 'FARMER',
    annualIncomeINR: 180000,
    disabilityType: 'NONE',
    disabilityPercent: 0,
    isBplCardHolder: false,
    bplCardNumber: 'BPL-UP-2024-RAW-NUM-99',
    aadhaarHash: 'aadhaar_sha256_hash_secret_value_123',
    panHash: 'pan_sha256_hash_secret_value_456',
    address: {
      id: 'addr-uuid-777-secret',
      streetAddress: 'Flat 402, Royal Residency, Sector 62',
      city: 'Varanasi',
      district: 'Varanasi',
      state: 'Uttar Pradesh',
      pincode: '221001',
      isRural: true,
    },
    recommendations: [
      {
        isEligible: true,
        matchPercentage: 100,
        scheme: {
          title: 'PM-KISAN Samman Nidhi',
        },
      },
    ],
  };

  const mockPrisma: any = {
    client: {
      citizenProfile: {
        findUnique: async () => rawSensitiveCitizenProfile,
      },
      welfareScheme: {
        findUnique: async () => ({
          id: 'sch-pmkisan',
          code: 'PM-KISAN',
          title: 'Pradhan Mantri Kisan Samman Nidhi',
          department: 'Ministry of Agriculture',
          category: 'AGRICULTURE',
          description: 'Direct income support of Rs 6,000 per year',
          eligibilityRules: [{ attributeKey: 'employmentStatus', operator: 'EQUALS', targetValue: 'FARMER', description: 'Must be farmer' }],
          requiredDocuments: [{ documentType: 'AADHAAR', isMandatory: true }],
        }),
      },
      aiResponseCache: {
        findUnique: async () => null, // force execution through adapter boundary
        upsert: async () => {},
      },
    },
  };

  const minimizer = new AiDataMinimizerService();
  const safety = new AiSafetyService();
  const redis = new RedisService();
  const cache = new AiCacheService(mockPrisma, redis);
  const aiService = new AiService(mockGeminiAdapter, safety, cache, minimizer, mockPrisma);

  console.log('1. Executing AI Chat Request for citizen with sensitive profile...');
  await aiService.chat(
    'What agricultural welfare schemes can I apply for?',
    { clientTimestamp: '2026-09-13T10:00:00Z', internalSessionToken: 'jwt-session-token-secret' },
    'internal-user-uuid-111-secret',
    'en',
  );

  assert.equal(capturedPayloads.length, 1, 'AI adapter was invoked exactly once');
  const captured = capturedPayloads[0];
  const fullTextSentToAi = `${captured.prompt}\n${captured.systemInstruction}`;

  console.log('\n2. Inspecting Outgoing AI Boundary Payload for PII Leaks...');

  // Assertions proving exclusion of sensitive data:
  assert(!fullTextSentToAi.includes('Aarav'), 'PROVEN: First name "Aarav" is stripped');
  assert(!fullTextSentToAi.includes('Singhania'), 'PROVEN: Last name "Singhania" is stripped');
  assert(!fullTextSentToAi.includes('aarav.singhania'), 'PROVEN: Email address is stripped');
  assert(!fullTextSentToAi.includes('9876543210'), 'PROVEN: Phone number is stripped');
  assert(!fullTextSentToAi.includes('$argon2id'), 'PROVEN: Password hash is stripped');
  assert(!fullTextSentToAi.includes('JBSWY3DPEHPK3PXP'), 'PROVEN: MFA TOTP secret is stripped');
  assert(!fullTextSentToAi.includes('BPL-UP-2024-RAW-NUM-99'), 'PROVEN: Raw BPL Card number is stripped');
  assert(!fullTextSentToAi.includes('Flat 402, Royal Residency'), 'PROVEN: Full street address is stripped');
  assert(!fullTextSentToAi.includes('221001'), 'PROVEN: Exact pincode is stripped');
  assert(!fullTextSentToAi.includes('internal-citizen-uuid-999-secret'), 'PROVEN: Citizen database internal ID is stripped');
  assert(!fullTextSentToAi.includes('internal-user-uuid-111-secret'), 'PROVEN: User database internal ID is stripped');
  assert(!fullTextSentToAi.includes('addr-uuid-777-secret'), 'PROVEN: Address database internal ID is stripped');
  assert(!fullTextSentToAi.includes('aadhaar_sha256_hash'), 'PROVEN: Aadhaar hash is stripped');
  assert(!fullTextSentToAi.includes('pan_sha256_hash'), 'PROVEN: PAN hash is stripped');
  assert(!fullTextSentToAi.includes('jwt-session-token-secret'), 'PROVEN: Client context session tokens are redacted');

  console.log('  [PASS] All 15 sensitive fields rigorously verified absent from AI payload');

  console.log('\n3. Inspecting Retained Verified Attributes for Eligibility Reasoning...');
  assert(fullTextSentToAi.includes('FARMER'), 'PROVEN: Employment status "FARMER" retained');
  assert(fullTextSentToAi.includes('OBC'), 'PROVEN: Social category "OBC" retained');
  assert(fullTextSentToAi.includes('Uttar Pradesh'), 'PROVEN: State residence "Uttar Pradesh" retained');
  assert(fullTextSentToAi.includes('INR 1 Lakh - 2.5 Lakhs / year'), 'PROVEN: Quantized income bracket retained');
  assert(fullTextSentToAi.includes('PM-KISAN Samman Nidhi'), 'PROVEN: Pre-evaluated scheme recommendation context retained');

  console.log('  [PASS] Only sanitized demographic criteria and verified scheme context sent to AI');

  console.log('\n====================================================');
  console.log(' ALL DATA MINIMIZATION BOUNDARY TESTS PASSED!       ');
  console.log('====================================================\n');
}

runBoundaryMinimizationTests().catch((err) => {
  console.error('Boundary minimization test failed:', err);
  process.exit(1);
});
