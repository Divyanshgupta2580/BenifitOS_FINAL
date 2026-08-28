/**
 * ============================================================================
 * BENEFITOS CRON JOB AUTOMATED VERIFICATION SUITE
 * ============================================================================
 */

import { runDailyMaintenance, CANONICAL_WELFARE_SCHEMES } from './cron/daily-maintenance.cron';
import { PrismaClient } from '@prisma/client';

async function runCronVerificationSuite() {
  console.log('\n============================================================');
  console.log(' BENEFITOS — SCHEDULED CRON JOB AUTOMATED TEST SUITE');
  console.log('============================================================\n');

  const prisma = new PrismaClient();
  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      throw new Error(`Assertion failed: ${testName}`);
    }
  }

  try {
    // ------------------------------------------------------------------------
    // TEST 1: Initial Cron Execution & Catalog Sync
    // ------------------------------------------------------------------------
    console.log('1. Testing Initial Daily Maintenance Execution...');
    const result1 = await runDailyMaintenance(prisma, { maxProfiles: 3 });
    assert(result1.status === 'SUCCESS', 'Cron execution returns SUCCESS status');
    assert(result1.schemesProcessed === CANONICAL_WELFARE_SCHEMES.length, `Processed all ${CANONICAL_WELFARE_SCHEMES.length} canonical schemes`);
    assert(result1.durationMs >= 0, `Execution duration measured accurately: ${result1.durationMs}ms`);

    // Verify database state
    const schemeCount1 = await prisma.welfareScheme.count();
    assert(schemeCount1 >= CANONICAL_WELFARE_SCHEMES.length, `Database has at least ${CANONICAL_WELFARE_SCHEMES.length} active schemes`);

    // ------------------------------------------------------------------------
    // TEST 2: Idempotency & Repeat Execution Safety
    // ------------------------------------------------------------------------
    console.log('\n2. Testing Idempotent Re-Execution (Zero Duplicate Records)...');
    const result2 = await runDailyMaintenance(prisma, { maxProfiles: 3 });
    assert(result2.status === 'SUCCESS', 'Second execution completed with SUCCESS');
    assert(result2.schemesCreated === 0, 'No duplicate schemes created on re-run (schemesCreated === 0)');
    assert(result2.schemesUpdated === CANONICAL_WELFARE_SCHEMES.length, 'All existing schemes updated idempotently');

    const schemeCount2 = await prisma.welfareScheme.count();
    assert(schemeCount2 === schemeCount1, `Scheme count remains identical (${schemeCount2}) without duplicates`);

    // ------------------------------------------------------------------------
    // TEST 3: Expired Session Pruning
    // ------------------------------------------------------------------------
    console.log('\n3. Testing Expired Session Pruning...');
    // Create an expired test session
    const testUser = await prisma.user.findFirst();
    if (testUser) {
      const expiredSessionId = `test_expired_${Date.now()}`;
      await prisma.session.create({
        data: {
          id: expiredSessionId,
          userId: testUser.id,
          refreshToken: `expired_token_${Date.now()}`,
          expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // Expired 1 day ago
        },
      });

      const result3 = await runDailyMaintenance(prisma, { maxProfiles: 3 });
      assert(result3.status === 'SUCCESS', 'Maintenance executed after inserting expired session');
      assert(result3.sessionsPruned >= 1, `Expired session was successfully pruned (pruned: ${result3.sessionsPruned})`);

      const sessionCheck = await prisma.session.findUnique({ where: { id: expiredSessionId } });
      assert(sessionCheck === null, 'Expired session record completely deleted from PostgreSQL');
    }

    // ------------------------------------------------------------------------
    // TEST 4: Processed Outbox Event Archival / Cleanup
    // ------------------------------------------------------------------------
    console.log('\n4. Testing Processed Outbox Events Cleanup...');
    const oldOutboxEventId = `outbox_${Date.now()}`;
    await prisma.outboxEvent.create({
      data: {
        id: oldOutboxEventId,
        aggregateType: 'CitizenProfile',
        aggregateId: 'test_agg_id',
        eventType: 'CITIZEN_PROFILE_UPDATED',
        payload: { test: true },
        status: 'PUBLISHED',
        processedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago (> 7 days)
      },
    });

    const result4 = await runDailyMaintenance(prisma, { maxProfiles: 3 });
    assert(result4.outboxEventsPurged >= 1, `Old published outbox event was purged (purged: ${result4.outboxEventsPurged})`);

    const outboxCheck = await prisma.outboxEvent.findUnique({ where: { id: oldOutboxEventId } });
    assert(outboxCheck === null, 'Purged outbox event deleted from database');

    // ------------------------------------------------------------------------
    // TEST 5: Error Handling & Secret Sanitization
    // ------------------------------------------------------------------------
    console.log('\n5. Testing Error Handling & Secret Leak Prevention...');
    // Create a mock failing prisma client
    const mockFailingPrisma = {
      welfareScheme: {
        findUnique: async () => {
          throw new Error('Connection failed: postgres://dbuser:supersecretpassword123@db.example.com:5432/benefitos');
        },
      },
      $disconnect: async () => {},
    } as any;

    const failResult = await runDailyMaintenance(mockFailingPrisma);
    assert(failResult.status === 'FAILED', 'Cron safely returns FAILED status on database error');
    assert(failResult.errorMessage !== undefined, 'Error message is captured');
    assert(!failResult.errorMessage?.includes('supersecretpassword123'), 'Secrets (passwords/credentials) sanitized from error message');
    assert(Boolean(failResult.errorMessage?.includes('postgres://***:***@')), 'Database URI credentials masked properly');

    console.log('\n============================================================');
    console.log(` ALL ${passedTests}/${totalTests} CRON JOB TESTS PASSED SUCCESSFULLY!`);
    console.log('============================================================\n');
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  runCronVerificationSuite()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Cron verification suite failed:', err);
      process.exit(1);
    });
}
