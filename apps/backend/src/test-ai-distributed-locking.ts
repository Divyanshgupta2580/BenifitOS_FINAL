import { strict as assert } from 'assert';
import { AiCacheService, CacheKeyOptions } from './infrastructure/ai/ai-cache.service';
import { RedisService } from './infrastructure/redis/redis.service';

console.log('====================================================');
console.log(' BENEFITOS — AI DISTRIBUTED REQUEST LOCKING SUITE');
console.log('====================================================\n');

async function runDistributedLockingTests() {
  // Shared mock database store simulating PostgreSQL
  const dbStore = new Map<string, any>();
  const mockPrisma: any = {
    client: {
      aiResponseCache: {
        findUnique: async ({ where: { cacheKey } }: any) => dbStore.get(cacheKey) || null,
        upsert: async ({ where: { cacheKey }, create, update }: any) => {
          const existing = dbStore.get(cacheKey);
          if (existing) {
            const updated = { ...existing, ...update };
            dbStore.set(cacheKey, updated);
            return updated;
          }
          const created = { id: 'cache-' + Math.random(), ...create };
          dbStore.set(cacheKey, created);
          return created;
        },
        updateMany: async ({ where, data }: any) => {
          let count = 0;
          for (const [k, v] of dbStore.entries()) {
            if ((!where.userId || v.userId === where.userId) && (!where.schemeId || v.schemeId === where.schemeId)) {
              dbStore.set(k, { ...v, ...data });
              count++;
            }
          }
          return { count };
        },
        update: async ({ where: { id }, data }: any) => {
          for (const [k, v] of dbStore.entries()) {
            if (v.id === id) {
              dbStore.set(k, { ...v, ...data });
              return dbStore.get(k);
            }
          }
        },
      },
    },
  };

  // Shared Redis cluster simulation
  const sharedRedisLockMap = new Map<string, { value: string; expiresAt?: number }>();
  const createMockRedisService = () => {
    const s = new RedisService();
    (s as any).inMemoryStore = sharedRedisLockMap;
    return s;
  };

  const sharedRedis = createMockRedisService();

  // Test 1: Two simultaneous identical requests on the same instance
  console.log('1. Testing two simultaneous identical requests on single instance...');
  const cacheServiceInstance1 = new AiCacheService(mockPrisma, sharedRedis);
  let aiCallCount = 0;
  const mockAiGenerator = async () => {
    aiCallCount++;
    await new Promise((r) => setTimeout(r, 60)); // simulate 60ms LLM call
    return { content: 'Detailed step-by-step guidance for PM-KISAN', provider: 'BenefitOS AI' };
  };

  const options1: CacheKeyOptions = {
    useCase: 'scheme-instructions',
    schemeId: 'pm-kisan',
    language: 'en',
    promptVersion: 'v2.0',
    minimizedProfileHash: 'profile_hash_1',
  };

  const [res1, res2] = await Promise.all([
    cacheServiceInstance1.getOrExecute(options1, mockAiGenerator),
    cacheServiceInstance1.getOrExecute(options1, mockAiGenerator),
  ]);

  assert.equal(aiCallCount, 1, 'Two simultaneous requests executed AI provider exactly ONCE');
  assert.equal(res1.content, res2.content, 'Both callers received identical completed guidance');
  console.log('  [PASS] Single instance duplicate request deduplication verified (1 AI call for 2 requests)');

  // Test 2: Requests handled across separate application instances (Simulating Horizontally Scaled Multi-Instance Backend)
  console.log('\n2. Testing cross-instance distributed locking & polling resolution...');
  const instanceA = new AiCacheService(mockPrisma, sharedRedis);
  const instanceB = new AiCacheService(mockPrisma, sharedRedis);
  const instanceC = new AiCacheService(mockPrisma, sharedRedis);

  let crossInstanceAiCalls = 0;
  const slowAiGenerator = async () => {
    crossInstanceAiCalls++;
    await new Promise((r) => setTimeout(r, 200)); // 200ms generation
    return { content: 'Ayushman Bharat PMJAY Step-by-Step Healthcare Instructions', provider: 'BenefitOS AI' };
  };

  const optionsAyushman: CacheKeyOptions = {
    useCase: 'scheme-instructions',
    schemeId: 'ayushman-pmjay',
    language: 'en',
    promptVersion: 'v2.0',
    minimizedProfileHash: 'profile_hash_ayushman',
  };

  const [resA, resB, resC] = await Promise.all([
    instanceA.getOrExecute(optionsAyushman, slowAiGenerator),
    instanceB.getOrExecute(optionsAyushman, slowAiGenerator),
    instanceC.getOrExecute(optionsAyushman, slowAiGenerator),
  ]);

  assert.equal(crossInstanceAiCalls, 1, 'Three separate backend instances coordinated: AI API called exactly ONCE');
  assert(resA.content.includes('Ayushman Bharat'), 'Instance A received complete guidance');
  assert(resB.content.includes('Ayushman Bharat'), 'Instance B resolved via distributed polling');
  assert(resC.content.includes('Ayushman Bharat'), 'Instance C resolved via distributed polling');
  console.log('  [PASS] Cross-instance distributed lock coordination verified (1 AI call across 3 instances)');

  // Test 3: Lock release after provider failure (Lock must not deadlock or poison cache)
  console.log('\n3. Testing lock release and cache safety after AI provider failure...');
  let failingCallCount = 0;
  const failingGenerator = async () => {
    failingCallCount++;
    throw new Error('AI Provider upstream quota exhausted');
  };

  const optionsFailing: CacheKeyOptions = {
    useCase: 'scheme-instructions',
    schemeId: 'failing-scheme',
    language: 'en',
    promptVersion: 'v2.0',
  };

  try {
    await instanceA.getOrExecute(optionsFailing, failingGenerator);
    assert.fail('Should have thrown error');
  } catch (err: any) {
    assert.equal(err.message, 'AI Provider upstream quota exhausted');
  }

  // Verify that the lock was cleanly released in finally block
  const lockKey = `lock:ai:${instanceA.generateCacheKey(optionsFailing)}`;
  const lockEntry = sharedRedisLockMap.get(lockKey);
  assert(!lockEntry, 'Distributed lock was safely released in finally block after error');

  // Verify that subsequent request can now acquire lock and retry
  let recoveryCallCount = 0;
  const recoveryGenerator = async () => {
    recoveryCallCount++;
    return { content: 'Recovered guidance content', provider: 'BenefitOS AI' };
  };

  const recoveredRes = await instanceB.getOrExecute(optionsFailing, recoveryGenerator);
  assert.equal(recoveredRes.content, 'Recovered guidance content', 'Subsequent request executed successfully');
  assert.equal(recoveryCallCount, 1, 'Recovery generator called');
  console.log('  [PASS] Lock release on failure verified; deadlocks and cache poisoning prevented');

  // Test 4: Lock expiration handling (Expired lock allows new acquirer)
  console.log('\n4. Testing lock expiration handling...');
  const lockKeyTest = 'lock:ai:test-expiry-key';
  const lockToken1 = await sharedRedis.acquireLock(lockKeyTest, 1); // 1-second TTL
  assert(lockToken1 !== null, 'Acquired lock 1');

  // Immediate second acquire should fail
  const lockToken2 = await sharedRedis.acquireLock(lockKeyTest, 1);
  assert.equal(lockToken2, null, 'Cannot acquire currently active lock');

  // Wait for lock to expire
  await new Promise((r) => setTimeout(r, 1100));

  // Acquire after expiration should succeed
  const lockToken3 = await sharedRedis.acquireLock(lockKeyTest, 1);
  assert(lockToken3 !== null, 'Acquired lock successfully after previous lock TTL expired');
  await sharedRedis.releaseLock(lockKeyTest, lockToken3);
  console.log('  [PASS] Lock expiration and reacquisition verified');

  console.log('\n====================================================');
  console.log(' ALL 4/4 DISTRIBUTED LOCKING TEST SUITES PASSED!     ');
  console.log('====================================================\n');
}

runDistributedLockingTests().catch((err) => {
  console.error('Distributed locking test failed:', err);
  process.exit(1);
});
