import { AiDataMinimizerService } from './infrastructure/ai/ai-data-minimizer.service';
import { AiCacheService } from './infrastructure/ai/ai-cache.service';
import { CitizenEntity, Gender, MaritalStatus, SocialCategory, EmploymentStatus, DisabilityType } from './domain/citizen/citizen.entity';

console.log('====================================================');
console.log('  BENEFITOS — AI DATA MINIMIZATION & CACHE TESTS   ');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    console.log(`PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`FAIL: ${testName} - ${detail || ''}`);
    throw new Error(`Test failed: ${testName}`);
  }
}

// 1. DATA MINIMIZATION AUDIT
const minimizer = new AiDataMinimizerService();

const rawCitizen = new CitizenEntity({
  id: 'cit-secret-uuid-99999',
  userId: 'usr-sensitive-account-id',
  firstName: 'Priya',
  lastName: 'Sharma',
  dateOfBirth: new Date(new Date().getFullYear() - 28, 5, 15),
  gender: Gender.FEMALE,
  maritalStatus: MaritalStatus.MARRIED,
  socialCategory: SocialCategory.OBC,
  employmentStatus: EmploymentStatus.STUDENT,
  annualIncomeINR: 240000,
  disabilityType: DisabilityType.NONE,
  disabilityPercent: 0,
  isBplCardHolder: false,
  bplCardNumber: 'BPL-SECRET-CARD-9911',
  address: {
    id: 'addr-secret-id',
    streetAddress: 'Flat 402, Royal Palms, Secret Street',
    city: 'Varanasi',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    pincode: '221001',
    isRural: false,
  },
});

const minimized = minimizer.minimizeCitizenProfile(rawCitizen);

console.log('Minimized Profile Payload:', JSON.stringify(minimized, null, 2));

assert(minimized !== null, 'Minimization: minimized object is produced');
if (!minimized) throw new Error('Minimized profile is null');

// Security Checks on Minimized Payload
assert(!('firstName' in (minimized as any)), 'Minimization: firstName is stripped');
assert(!('lastName' in (minimized as any)), 'Minimization: lastName is stripped');
assert(!('id' in (minimized as any)), 'Minimization: citizen internal ID is stripped');
assert(!('userId' in (minimized as any)), 'Minimization: userId is stripped');
assert(!('streetAddress' in (minimized as any)), 'Minimization: streetAddress is stripped');
assert(!('bplCardNumber' in (minimized as any)), 'Minimization: bplCardNumber raw value is stripped');
assert(!('password' in (minimized as any)), 'Minimization: password field is absent');
assert(!('token' in (minimized as any)), 'Minimization: token field is absent');

// Functional Checks on Minimized Payload
assert(minimized.age === 28, 'Minimization: age is correctly computed (28)');
assert(minimized.gender === 'FEMALE', 'Minimization: gender is retained for eligibility');
assert(minimized.employmentStatus === 'STUDENT', 'Minimization: occupation is retained for scheme rules');
assert(minimized.annualIncomeTier.includes('2.5 Lakhs'), 'Minimization: income categorized into privacy bracket');
assert(minimized.state === 'Uttar Pradesh', 'Minimization: state domicile is retained');

// Prompt Context Generation
const promptContext = minimizer.formatContextForPrompt(minimized);

console.log('\nSanitized Prompt Context:\n', promptContext);
assert(!promptContext.includes('Priya'), 'Prompt Context: does not contain citizen first name');
assert(!promptContext.includes('Sharma'), 'Prompt Context: does not contain citizen last name');
assert(!promptContext.includes('Royal Palms'), 'Prompt Context: does not contain street address');
assert(promptContext.includes('Uttar Pradesh'), 'Prompt Context: contains necessary state info');
assert(promptContext.includes('STUDENT'), 'Prompt Context: contains necessary occupation info');

// 2. CACHE KEY GENERATION TESTS
const mockPrisma: any = { client: { aiResponseCache: {} } };
const cacheService = new AiCacheService(mockPrisma);

const key1_en = cacheService.generateCacheKey({
  useCase: 'scheme-instructions',
  schemeId: 'sch-pm-kisan',
  minimizedProfileHash: 'hash_abc123',
  language: 'en',
  promptVersion: 'v1.0',
});

const key1_hi = cacheService.generateCacheKey({
  useCase: 'scheme-instructions',
  schemeId: 'sch-pm-kisan',
  minimizedProfileHash: 'hash_abc123',
  language: 'hi',
  promptVersion: 'v1.0',
});

const key2_diff_profile = cacheService.generateCacheKey({
  useCase: 'scheme-instructions',
  schemeId: 'sch-pm-kisan',
  minimizedProfileHash: 'hash_xyz789',
  language: 'en',
  promptVersion: 'v1.0',
});

assert(typeof key1_en === 'string' && key1_en.length === 64, 'Cache Key: Generates 64-char SHA-256 hash');
assert(key1_en !== key1_hi, 'Cache Key: English and Hindi requests generate distinct cache keys');
assert(key1_en !== key2_diff_profile, 'Cache Key: Different profile hashes generate distinct cache keys');

// Determinism test
const key1_en_repeat = cacheService.generateCacheKey({
  useCase: 'scheme-instructions',
  schemeId: 'sch-pm-kisan',
  minimizedProfileHash: 'hash_abc123',
  language: 'EN', // Case normalization test
  promptVersion: 'v1.0',
});
assert(key1_en === key1_en_repeat, 'Cache Key: Normalizes input and is 100% deterministic');

// 3. IN-FLIGHT REQUEST DEDUPLICATION TEST
async function runDeduplicationTest() {
  let executionCount = 0;

  const generator = async () => {
    executionCount++;
    await new Promise((resolve) => setTimeout(resolve, 50));
    return { content: 'Generated Official Response', provider: 'BenefitOS AI' };
  };

  // Mock getCachedResponse to return null
  cacheService.getCachedResponse = async () => null;
  // Mock upsert
  mockPrisma.client.aiResponseCache.upsert = async () => ({});

  // Launch 3 simultaneous parallel requests with identical cache key options
  const [r1, r2, r3] = await Promise.all([
    cacheService.getOrExecute({ useCase: 'chat', userId: 'u1', normalizedPrompt: 'Check PM Kisan' }, generator),
    cacheService.getOrExecute({ useCase: 'chat', userId: 'u1', normalizedPrompt: 'Check PM Kisan' }, generator),
    cacheService.getOrExecute({ useCase: 'chat', userId: 'u1', normalizedPrompt: 'Check PM Kisan' }, generator),
  ]);

  assert(executionCount === 1, 'Deduplication: 3 simultaneous identical clicks executed AI API exactly ONCE');
  assert(r1.content === 'Generated Official Response', 'Deduplication: Request 1 received response');
  assert(r2.content === 'Generated Official Response', 'Deduplication: Request 2 received response');
  assert(r3.content === 'Generated Official Response', 'Deduplication: Request 3 received response');
}

runDeduplicationTest().then(() => {
  console.log(`\n====================================================`);
  console.log(`   ALL ${passedTests}/${totalTests} AI CACHE & MINIMIZATION TESTS PASSED!   `);
  console.log(`====================================================\n`);
});
