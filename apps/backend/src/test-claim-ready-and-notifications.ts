import { strict as assert } from 'assert';
import { randomUUID } from 'crypto';
import { EligibilityEvaluatorService } from './modules/recommendation/services/eligibility-evaluator.service';
import { EligibilityAiValidatorService } from './modules/recommendation/services/eligibility-ai-validator.service';
import { RecommendationEngineService } from './modules/recommendation/recommendation.service';
import { NotificationService } from './modules/notification/notification.service';
import {
  NotificationType,
  NotificationSeverity,
  NotificationProps,
  INotificationRepository,
} from './domain/notification/notification-repository.interface';
import { CitizenEntity, Gender, MaritalStatus, SocialCategory, EmploymentStatus, DisabilityType } from './domain/citizen/citizen.entity';
import { WelfareSchemeEntity, SchemeCategory, DocumentType } from './domain/welfare/scheme.entity';

async function runClaimReadyAndNotificationsSuite() {
  console.log('========================================================================');
  console.log(' BENEFITOS — CLAIM-READY ENGINE & NOTIFICATION SYSTEM AUDIT SUITE       ');
  console.log('========================================================================\n');

  let passCount = 0;
  let totalCount = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    totalCount++;
    return Promise.resolve()
      .then(fn)
      .then(() => {
        passCount++;
        console.log(`  [PASS] ${name}`);
      })
      .catch((err) => {
        console.error(`  [FAIL] ${name} — ${err.message}`);
        throw err;
      });
  }

  // -------------------------------------------------------------
  // PART 1: NOTIFICATION SYSTEM & IDOR ISOLATION TESTS
  // -------------------------------------------------------------
  console.log('------------------------------------------------------------------------');
  console.log('1. NOTIFICATION SYSTEM: CRUD, DEDUPLICATION & USER ISOLATION (IDOR)');
  console.log('------------------------------------------------------------------------');

  const notificationsMap = new Map<string, NotificationProps>();
  const emittedEvents: Array<{ userId: string; event: string; data: any }> = [];

  const mockNotificationRepo: INotificationRepository = {
    save: async (n: NotificationProps) => {
      notificationsMap.set(n.id, { ...n });
      return n;
    },
    findById: async (id: string) => notificationsMap.get(id) || null,
    findByUserId: async (userId: string) =>
      Array.from(notificationsMap.values())
        .filter((n) => n.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    countUnread: async (userId: string) =>
      Array.from(notificationsMap.values()).filter((n) => n.userId === userId && !n.isRead).length,
    markAsRead: async (id: string) => {
      const item = notificationsMap.get(id);
      if (item) item.isRead = true;
    },
    markAllAsRead: async (userId: string) => {
      notificationsMap.forEach((n) => {
        if (n.userId === userId) n.isRead = true;
      });
    },
    delete: async (id: string) => {
      notificationsMap.delete(id);
    },
    findRecentSimilar: async (userId, type, title, minutes) => {
      const cutoff = new Date(Date.now() - minutes * 60 * 1000);
      return (
        Array.from(notificationsMap.values()).find(
          (n) => n.userId === userId && n.type === type && n.title === title && n.createdAt >= cutoff,
        ) || null
      );
    },
  };

  const mockGateway: any = {
    emitNotification: (userId: string, data: any) => {
      emittedEvents.push({ userId, event: 'events.notification_received', data });
    },
  };

  const notificationService = new NotificationService(mockNotificationRepo, mockGateway);

  const citizenA = 'usr-citizen-a-uuid';
  const citizenB = 'usr-citizen-b-uuid';

  await test('Notification creation dispatches real-time WebSocket event', async () => {
    const notif = await notificationService.createNotification({
      userId: citizenA,
      type: NotificationType.SCHEME_ELIGIBILITY,
      title: "You're eligible for PM-KISAN",
      body: 'Upload land certificate to proceed.',
      severity: NotificationSeverity.SUCCESS,
      metadata: { schemeId: 'sch-pm-kisan' },
    });

    assert.equal(notif.userId, citizenA);
    assert.equal(notif.isRead, false);
    assert.equal(emittedEvents.length, 1);
    assert.equal(emittedEvents[0].userId, citizenA);
    assert.equal(emittedEvents[0].data.title, "You're eligible for PM-KISAN");
  });

  await test('Notification deduplication prevents alert spam', async () => {
    const notif1 = await notificationService.createNotification({
      userId: citizenA,
      type: NotificationType.DOCUMENT_REQUIRED,
      title: 'Aadhaar Required',
      body: 'Please upload your Aadhaar card.',
      deduplicateMinutes: 60,
    });

    const notif2 = await notificationService.createNotification({
      userId: citizenA,
      type: NotificationType.DOCUMENT_REQUIRED,
      title: 'Aadhaar Required',
      body: 'Please upload your Aadhaar card.',
      deduplicateMinutes: 60,
    });

    assert.equal(notif1.id, notif2.id);
    assert.equal(notificationsMap.size, 2);
  });

  await test('IDOR Protection: Citizen B cannot read or mark Citizen A notification', async () => {
    const notifsA = await notificationService.getUserNotifications(citizenA);
    assert(notifsA.length > 0);
    const targetNotifId = notifsA[0].id;

    try {
      await notificationService.markAsRead(citizenB, targetNotifId);
      assert.fail('Should have thrown ForbiddenException');
    } catch (err: any) {
      assert(err.message.includes('Access denied') || err.status === 403);
    }
  });

  await test('IDOR Protection: Citizen B cannot delete Citizen A notification', async () => {
    const notifsA = await notificationService.getUserNotifications(citizenA);
    const targetNotifId = notifsA[0].id;

    try {
      await notificationService.deleteNotification(citizenB, targetNotifId);
      assert.fail('Should have thrown ForbiddenException');
    } catch (err: any) {
      assert(err.message.includes('Access denied') || err.status === 403);
    }
    assert(notificationsMap.has(targetNotifId));
  });

  await test('Mark all as read updates only the target user', async () => {
    await notificationService.createNotification({
      userId: citizenB,
      type: NotificationType.SYSTEM,
      title: 'Citizen B System Notice',
      body: 'Notice',
    });

    assert.equal(await notificationService.getUnreadCount(citizenA), 2);
    assert.equal(await notificationService.getUnreadCount(citizenB), 1);

    await notificationService.markAllAsRead(citizenA);

    assert.equal(await notificationService.getUnreadCount(citizenA), 0);
    assert.equal(await notificationService.getUnreadCount(citizenB), 1);
  });

  // -------------------------------------------------------------
  // PART 2: STRICT CLAIM-READY RECOMMENDATION ENGINE & GEMINI AUDITOR
  // -------------------------------------------------------------
  console.log('\n------------------------------------------------------------------------');
  console.log('2. STRICT CLAIM-READY ENGINE & SECOND-LAYER GEMINI VALIDATOR');
  console.log('------------------------------------------------------------------------');

  const farmerCitizen = new CitizenEntity({
    id: 'cit-farmer-1',
    userId: 'usr-farmer-1',
    firstName: 'Suresh',
    lastName: 'Yadav',
    dateOfBirth: new Date(new Date().getFullYear() - 42, 0, 1),
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.MARRIED,
    socialCategory: SocialCategory.GENERAL,
    employmentStatus: EmploymentStatus.FARMER,
    annualIncomeINR: 180000,
    disabilityType: DisabilityType.NONE,
    disabilityPercent: 0,
    isBplCardHolder: false,
    address: {
      id: 'addr-farmer',
      streetAddress: 'Village Gauri',
      city: 'Barabanki',
      district: 'Barabanki',
      state: 'Uttar Pradesh',
      pincode: '225001',
      isRural: true,
    },
  });

  const affluentCitizen = new CitizenEntity({
    id: 'cit-affluent-1',
    userId: 'usr-affluent-1',
    firstName: 'Vikram',
    lastName: 'Mehta',
    dateOfBirth: new Date(new Date().getFullYear() - 35, 0, 1),
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.SINGLE,
    socialCategory: SocialCategory.GENERAL,
    employmentStatus: EmploymentStatus.EMPLOYED,
    annualIncomeINR: 2500000,
    disabilityType: DisabilityType.NONE,
    disabilityPercent: 0,
    isBplCardHolder: false,
    address: {
      id: 'addr-affluent',
      streetAddress: 'MG Road',
      city: 'Lucknow',
      district: 'Lucknow',
      state: 'Uttar Pradesh',
      pincode: '226001',
      isRural: false,
    },
  });

  const pmKisanScheme = new WelfareSchemeEntity({
    id: 'sch-pm-kisan-claim',
    code: 'PM-KISAN-CLAIM',
    title: 'PM Kisan Samman Nidhi',
    description: 'Income support of 6000/year for farmers.',
    category: SchemeCategory.AGRICULTURE,
    department: 'Ministry of Agriculture',
    financialBenefit: 6000,
    isCentralScheme: true,
    isActive: true,
    requiredDocuments: [DocumentType.AADHAAR, DocumentType.LAND_RECORD],
    eligibilityRules: [
      { id: 'r-1', attributeKey: 'employmentStatus', operator: 'EQUALS', targetValue: 'FARMER', isRequired: true, description: 'Must be small/marginal farmer' },
      { id: 'r-2', attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '400000', isRequired: true, description: 'Family income <= 4 LPA' },
    ],
  });

  const evaluatorService = new EligibilityEvaluatorService();

  const mockGeminiAdapter: any = {
    generateText: async (params: { prompt: string }) => {
      const p = params.prompt;
      if (p.includes('FARMER') || p.includes('Farmer')) {
        return {
          content: JSON.stringify({
            decision: 'CLAIM_READY',
            allNonDocumentCriteriaSatisfied: true,
            onlyDocumentsRemaining: true,
            confidence: 0.98,
            failedCriteria: [],
            unverifiedCriteria: [],
            requiredDocuments: ['Aadhaar Card', 'Land Record / RoR / Khasra-Khatauni'],
            reason: 'Citizen satisfies all statutory criteria. Only required documents remain.',
          }),
          provider: 'Gemini 2.5 Flash',
        };
      }
      return {
        content: JSON.stringify({
          decision: 'NOT_ELIGIBLE',
          allNonDocumentCriteriaSatisfied: false,
          onlyDocumentsRemaining: false,
          confidence: 0.99,
          failedCriteria: ['Income exceeds threshold'],
          unverifiedCriteria: [],
          requiredDocuments: [],
          reason: 'Income exceeds threshold.',
        }),
        provider: 'Gemini 2.5 Flash',
      };
    },
  };

  const mockAiCache: any = {
    getOrExecute: async (_opt: any, genFn: () => Promise<any>) => {
      const res = await genFn();
      return { content: res.content, provider: res.provider || 'BenefitOS AI', isCached: false };
    },
  };

  const aiValidatorService = new EligibilityAiValidatorService(mockGeminiAdapter, mockAiCache);

  const mockCitizenRepo: any = {
    findByUserId: async (uid: string) => (uid === farmerCitizen.userId ? farmerCitizen : affluentCitizen),
  };

  const mockSchemeRepo: any = {
    findAllActive: async () => [pmKisanScheme],
    findById: async (id: string) => (id === pmKisanScheme.id ? pmKisanScheme : null),
  };

  const persistedRecs = new Map<string, any[]>();
  const mockRecRepo: any = {
    findByCitizenId: async (citId: string) => persistedRecs.get(citId) || [],
    deleteForCitizen: async (citId: string) => persistedRecs.delete(citId),
    saveMany: async (recs: any[]) => {
      if (recs.length > 0) persistedRecs.set(recs[0].citizenProfileId, recs);
    },
  };

  const recommendationEngine = new RecommendationEngineService(
    evaluatorService,
    aiValidatorService,
    mockCitizenRepo,
    mockSchemeRepo,
    mockRecRepo,
    notificationService,
  );

  await test('Farmer citizen receives CLAIM_READY recommendation when all statutory criteria & Gemini pass', async () => {
    const recs = await recommendationEngine.calculateRecommendationsForCitizen(farmerCitizen.userId);
    assert.equal(recs.length, 1);
    const rec = recs[0];
    assert.equal(rec.status, 'CLAIM_READY');
    assert.equal(rec.isEligible, true);
    assert.equal(rec.matchPercentage, 100);
    assert.equal(rec.missingDocuments.length, 2);
    assert(rec.missingDocuments.includes(DocumentType.AADHAAR));
    assert(rec.missingDocuments.includes(DocumentType.LAND_RECORD));
    assert.equal(rec.aiValidation?.decision, 'CLAIM_READY');
    assert.equal(rec.aiValidation?.allNonDocumentCriteriaSatisfied, true);
    assert.equal(rec.aiValidation?.onlyDocumentsRemaining, true);
  });

  await test('Affluent citizen receives strictly NOT_ELIGIBLE (Deterministic Supremacy)', async () => {
    const recs = await recommendationEngine.calculateRecommendationsForCitizen(affluentCitizen.userId);
    assert.equal(recs.length, 1);
    const rec = recs[0];
    assert.equal(rec.status, 'NOT_ELIGIBLE');
    assert.equal(rec.isEligible, false);
    assert.equal(rec.aiValidation?.decision, 'NOT_ELIGIBLE');
    assert.equal(rec.aiValidation?.allNonDocumentCriteriaSatisfied, false);
  });

  await test('Enriched recommendations output CLAIM_READY status and proper document guidance', async () => {
    const enriched = await recommendationEngine.getEnrichedRecommendations(farmerCitizen.userId);
    assert.equal(enriched.length, 1);
    assert.equal(enriched[0].status, 'CLAIM_READY');
    assert.equal(enriched[0].isEligible, true);
    assert.equal(enriched[0].statusReason, "You're eligible — upload the required documents to continue.");
    assert.equal(enriched[0].missingDocuments.length, 2);
  });

  // -------------------------------------------------------------
  // PART 3: GEMINI OUTAGE & FAILURE SIMULATION TESTS
  // -------------------------------------------------------------
  console.log('\n------------------------------------------------------------------------');
  console.log('3. GEMINI OUTAGE & ERROR SIMULATION (Strict Non-Claim-Ready Fallback)');
  console.log('------------------------------------------------------------------------');

  const deterministicEvaluation = evaluatorService.evaluateDetailedEligibility(farmerCitizen, pmKisanScheme);
  assert.equal(deterministicEvaluation.eligibilityStatus, 'ELIGIBLE');

  await test('Outage 1: Gemini API Timeout -> Strictly REVIEW_REQUIRED (Never CLAIM_READY)', async () => {
    const timeoutAdapter: any = {
      generateText: async () => {
        throw new Error('Gemini upstream call timed out after 10000ms');
      },
    };
    const validator = new EligibilityAiValidatorService(timeoutAdapter, mockAiCache);
    const res = await validator.validateEligibility(farmerCitizen, pmKisanScheme, deterministicEvaluation);

    assert.equal(res.decision, 'REVIEW_REQUIRED');
    assert.equal(res.allNonDocumentCriteriaSatisfied, false);
    assert.equal(res.onlyDocumentsRemaining, false);
  });

  await test('Outage 2: Gemini HTTP 500 / 503 Server Error -> Strictly REVIEW_REQUIRED', async () => {
    const serverErrorAdapter: any = {
      generateText: async () => {
        throw new Error('HTTP 503 Service Unavailable: Model overloaded');
      },
    };
    const validator = new EligibilityAiValidatorService(serverErrorAdapter, mockAiCache);
    const res = await validator.validateEligibility(farmerCitizen, pmKisanScheme, deterministicEvaluation);

    assert.equal(res.decision, 'REVIEW_REQUIRED');
    assert.equal(res.allNonDocumentCriteriaSatisfied, false);
    assert.equal(res.onlyDocumentsRemaining, false);
  });

  await test('Outage 3: Gemini Invalid / Non-JSON Output -> Strictly REVIEW_REQUIRED', async () => {
    const badJsonAdapter: any = {
      generateText: async () => ({
        content: 'I cannot answer this request right now because of a syntax error.',
        provider: 'Gemini',
      }),
    };
    const validator = new EligibilityAiValidatorService(badJsonAdapter, mockAiCache);
    const res = await validator.validateEligibility(farmerCitizen, pmKisanScheme, deterministicEvaluation);

    assert.equal(res.decision, 'REVIEW_REQUIRED');
    assert.equal(res.allNonDocumentCriteriaSatisfied, false);
    assert.equal(res.onlyDocumentsRemaining, false);
  });

  await test('Outage 4: Gemini Missing API Key -> Strictly REVIEW_REQUIRED', async () => {
    const noKeyAdapter: any = {
      generateText: async () => {
        throw new Error('GEMINI_API_KEY environment variable is not configured');
      },
    };
    const validator = new EligibilityAiValidatorService(noKeyAdapter, mockAiCache);
    const res = await validator.validateEligibility(farmerCitizen, pmKisanScheme, deterministicEvaluation);

    assert.equal(res.decision, 'REVIEW_REQUIRED');
    assert.equal(res.allNonDocumentCriteriaSatisfied, false);
    assert.equal(res.onlyDocumentsRemaining, false);
  });

  console.log(`\n===============================================================`);
  console.log(` RESULT: ${passCount}/${totalCount} TESTS PASSED`);
  console.log(` STATUS: ALL CLAIM-READY, OUTAGE & NOTIFICATION INVARIANTS MET!`);
  console.log(`===============================================================\n`);
}

runClaimReadyAndNotificationsSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
