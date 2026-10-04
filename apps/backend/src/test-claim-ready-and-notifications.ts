/**
 * ============================================================================
 * BenefitOS — STRICT CLAIM-READY SCHEME ENGINE & NOTIFICATION SYSTEM SUITE
 * ============================================================================
 * Tests:
 * 1. Claim-ready evaluation: Statutory criteria verification & document list
 * 2. Deterministic authority: AI validator cannot override non-eligible status
 * 3. Gemini validation guardrails & structured contract compliance
 * 4. Complete Notification subsystem lifecycle (Create, Read, Mark Read, Delete, Deduplication)
 * 5. Notification IDOR Isolation (Cross-user access prevention)
 * 6. WebSocket event emission integration
 */

import { EligibilityEvaluatorService } from './modules/recommendation/services/eligibility-evaluator.service';
import { EligibilityAiValidatorService } from './modules/recommendation/services/eligibility-ai-validator.service';
import { NotificationService } from './modules/notification/notification.service';
import {
  NotificationType,
  NotificationSeverity,
  INotificationRepository,
  NotificationProps,
  ChannelType,
} from './domain/notification/notification-repository.interface';
import { CitizenEntity, Gender, MaritalStatus, SocialCategory, EmploymentStatus, DisabilityType } from './domain/citizen/citizen.entity';
import { WelfareSchemeEntity, SchemeCategory } from './domain/welfare/scheme.entity';
import { randomUUID } from 'crypto';

let passedAssertions = 0;
let totalAssertions = 0;

function assert(condition: boolean, testName: string) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  [PASS] ${testName}`);
  } else {
    console.error(`  [FAIL] ${testName}`);
    throw new Error(`Assertion failed: ${testName}`);
  }
}

// Helpers to create test entities
function createMockCitizen(overrides: Partial<any> = {}): CitizenEntity {
  const birthYear = overrides.age !== undefined ? new Date().getFullYear() - overrides.age : 1989; // ~35 years old
  return new CitizenEntity({
    id: overrides.id || `cit-${randomUUID().substring(0, 8)}`,
    userId: overrides.userId || `usr-${randomUUID().substring(0, 8)}`,
    firstName: overrides.firstName !== undefined ? overrides.firstName : 'Rajesh',
    lastName: overrides.lastName !== undefined ? overrides.lastName : 'Kumar',
    dateOfBirth: overrides.dateOfBirth !== undefined ? overrides.dateOfBirth : new Date(birthYear, 0, 1),
    gender: overrides.gender !== undefined ? overrides.gender : Gender.MALE,
    maritalStatus: overrides.maritalStatus !== undefined ? overrides.maritalStatus : MaritalStatus.MARRIED,
    socialCategory: overrides.socialCategory !== undefined ? overrides.socialCategory : SocialCategory.OBC,
    employmentStatus: overrides.employmentStatus !== undefined ? overrides.employmentStatus : EmploymentStatus.SELF_EMPLOYED,
    annualIncomeINR: overrides.annualIncomeINR !== undefined ? overrides.annualIncomeINR : 180000,
    disabilityType: overrides.disabilityType !== undefined ? overrides.disabilityType : DisabilityType.NONE,
    disabilityPercent: overrides.disabilityPercent !== undefined ? overrides.disabilityPercent : 0,
    isBplCardHolder: overrides.isBplCardHolder !== undefined ? overrides.isBplCardHolder : false,
    bplCardNumber: overrides.bplCardNumber || null,
    aadhaarHash: overrides.aadhaarHash !== undefined ? overrides.aadhaarHash : 'aadhaar_verified_hash_999',
    panHash: overrides.panHash !== undefined ? overrides.panHash : 'pan_verified_hash_999',
    address: overrides.address !== undefined ? overrides.address : {
      id: 'addr-01',
      streetAddress: '12 Vikas Marg',
      city: 'Varanasi',
      district: 'Varanasi',
      state: 'Uttar Pradesh',
      pincode: '221001',
      isRural: true,
    },
    landDetails: overrides.landDetails !== undefined ? overrides.landDetails : [
      { id: 'land-1', areaInAcres: 2.5, isAgricultural: true, ownershipType: 'OWNED' },
    ],
    householdMembers: overrides.householdMembers || [],
  });
}

function createMockScheme(overrides: Partial<any> = {}): WelfareSchemeEntity {
  return new WelfareSchemeEntity({
    id: overrides.id || 'sch-pm-kisan',
    code: overrides.code || 'PM-KISAN',
    title: overrides.title || 'PM Kisan Samman Nidhi',
    description: overrides.description || 'Income support for small and marginal landholding farmers',
    category: overrides.category || SchemeCategory.AGRICULTURE,
    department: overrides.department || 'Ministry of Agriculture and Farmers Welfare',
    financialBenefit: overrides.financialBenefit || 'Rs 6,000 per year in 3 installments',
    isCentralScheme: overrides.isCentralScheme !== undefined ? overrides.isCentralScheme : true,
    state: overrides.state || null,
    applicationProcedure: overrides.applicationProcedure || 'Online application with Aadhaar and Land records',
    requiredDocuments: overrides.requiredDocuments || [
      { documentType: 'AADHAAR_CARD', isMandatory: true, description: 'Aadhaar Card' },
      { documentType: 'LAND_OWNERSHIP_RECORD', isMandatory: true, description: 'Land Record' },
      { documentType: 'BANK_PASSBOOK', isMandatory: true, description: 'Bank Passbook' },
    ],
    isActive: overrides.isActive !== undefined ? overrides.isActive : true,
    eligibilityRules: overrides.eligibilityRules || [
      { attributeKey: 'age', operator: 'GREATER_EQUAL', targetValue: '18', isRequired: true, description: 'Minimum age 18' },
      { attributeKey: 'employmentStatus', operator: 'EQUALS', targetValue: 'SELF_EMPLOYED', isRequired: true, description: 'Farmer / Self-employed' },
      { attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '400000', isRequired: true, description: 'Annual income <= 4,00,000' },
      { attributeKey: 'isLandOwner', operator: 'EQUALS', targetValue: 'true', isRequired: true, description: 'Must own cultivable land' },
    ],
  });
}

async function runClaimReadyAndNotificationSuite() {
  console.log('\n========================================================================');
  console.log(' BENEFITOS — CLAIM-READY ENGINE & NOTIFICATION SUBSYSTEM TEST SUITE     ');
  console.log('========================================================================\n');

  const evaluator = new EligibilityEvaluatorService();

  // ---------------------------------------------------------------------------
  // 1. DETERMINISTIC STATUTORY EVALUATION FOR CLAIM-READY STATUS
  // ---------------------------------------------------------------------------
  console.log('------------------------------------------------------------------------');
  console.log('1. DETERMINISTIC STATUTORY EVALUATION FOR CLAIM-READY STATUS');
  console.log('------------------------------------------------------------------------');

  const farmer = createMockCitizen();
  const pmKisan = createMockScheme();

  const farmerEval = evaluator.evaluateDetailedEligibility(farmer, pmKisan);
  assert(farmerEval.eligibilityStatus === 'ELIGIBLE', 'Eligible farmer returns status ELIGIBLE');
  assert(farmerEval.recommendation.isEligible === true, 'Eligible farmer returns isEligible = true');
  assert(farmerEval.recommendation.matchPercentage === 100, 'Eligible farmer matchPercentage is 100%');
  assert(farmerEval.failedRules.length === 0, 'Eligible farmer has 0 failed rules');

  // Test failure on statutory criterion: Landless citizen
  const landlessFarmer = createMockCitizen({ landDetails: [] });
  const landlessEval = evaluator.evaluateDetailedEligibility(landlessFarmer, pmKisan);
  assert(landlessEval.eligibilityStatus === 'NOT_ELIGIBLE', 'Landless citizen is NOT_ELIGIBLE for PM-KISAN');
  assert(landlessEval.recommendation.isEligible === false, 'Landless citizen isEligible is strictly false');
  assert(landlessEval.failedRules.some(r => r.includes('cultivable land') || r.includes('isLandOwner')), 'Landless citizen failedRules records land failure');

  // Test failure on income: 9,00,000 > 4,00,000
  const affluentFarmer = createMockCitizen({ annualIncomeINR: 900000 });
  const affluentEval = evaluator.evaluateDetailedEligibility(affluentFarmer, pmKisan);
  assert(affluentEval.eligibilityStatus === 'NOT_ELIGIBLE', 'High income citizen is NOT_ELIGIBLE');
  assert(affluentEval.recommendation.isEligible === false, 'High income citizen isEligible is strictly false');

  // ---------------------------------------------------------------------------
  // 2. SECOND-LAYER AI VALIDATOR DETERMINISTIC SAFETY & HALLUCINATION DEFENSE
  // ---------------------------------------------------------------------------
  console.log('\n------------------------------------------------------------------------');
  console.log('2. SECOND-LAYER GEMINI VALIDATOR BOUNDARIES & SAFETY GUARDRAILS');
  console.log('------------------------------------------------------------------------');

  // Mock Gemini AI Adapter
  let aiAdapterCallCount = 0;
  const mockGeminiAdapter: any = {
    generateText: async (_options: any) => {
      aiAdapterCallCount++;
      return {
        content: JSON.stringify({
          decision: 'CLAIM_READY',
          confidence: 0.98,
          reason: 'All verified criteria (age, land ownership, income ceiling) are fully met. Only statutory document verification remains.',
          allNonDocumentCriteriaSatisfied: true,
          onlyDocumentsRemaining: true,
          requiredDocuments: ['Aadhaar Card', 'Land Record', 'Bank Passbook'],
          additionalAuditNotes: 'Audited statutory criteria for PM-KISAN.',
        }),
        tokensUsed: 120,
        provider: 'BenefitOS AI',
        model: 'gemini-3.5-flash-lite',
      };
    },
  };

  const mockAiCache: any = {
    getOrExecute: async (_options: any, fn: () => Promise<any>) => {
      const res = await fn();
      return { content: res.content, provider: res.provider || 'BenefitOS AI' };
    },
    generateCacheKey: () => 'test-cache-key',
  };

  const aiValidator = new EligibilityAiValidatorService(mockGeminiAdapter, mockAiCache);

  // Test 2.1: If deterministic status is NOT_ELIGIBLE, AI validator MUST NOT call Gemini and must return NOT_ELIGIBLE
  const invalidResult = await aiValidator.validateEligibility(landlessFarmer, pmKisan, landlessEval);
  assert(invalidResult.decision === 'NOT_ELIGIBLE', 'Deterministic NOT_ELIGIBLE cannot be turned into CLAIM_READY by AI');
  assert(invalidResult.allNonDocumentCriteriaSatisfied === false, 'allNonDocumentCriteriaSatisfied is false for non-eligible');
  assert(aiAdapterCallCount === 0, 'Gemini is skipped when deterministic check fails (Zero hallucination risk)');

  // Test 2.2: If deterministic check is ELIGIBLE, AI validator provides structured second opinion
  const validResult = await aiValidator.validateEligibility(farmer, pmKisan, farmerEval);
  assert(validResult.decision === 'CLAIM_READY', 'AI Validator confirms CLAIM_READY status for eligible farmer');
  assert(validResult.allNonDocumentCriteriaSatisfied === true, 'AI confirms allNonDocumentCriteriaSatisfied is true');
  assert(validResult.onlyDocumentsRemaining === true, 'AI confirms onlyDocumentsRemaining is true');
  assert(validResult.requiredDocuments.length === 3, 'AI confirms required document count matches DB schema');
  assert(aiAdapterCallCount === 1, 'Gemini called exactly once for eligible profile');

  // ---------------------------------------------------------------------------
  // 3. IN-MEMORY NOTIFICATION REPOSITORY & SERVICE LIFECYCLE
  // ---------------------------------------------------------------------------
  console.log('\n------------------------------------------------------------------------');
  console.log('3. NOTIFICATION SUBSYSTEM LIFECYCLE (CRUD, DEDUPLICATION, UNREAD COUNT)');
  console.log('------------------------------------------------------------------------');

  const notificationsStore = new Map<string, NotificationProps>();
  let emittedEvents: Array<{ userId: string; payload: any }> = [];

  const mockNotificationRepo: INotificationRepository = {
    save: async (n: NotificationProps) => {
      notificationsStore.set(n.id, n);
      return n;
    },
    findById: async (id: string) => notificationsStore.get(id) || null,
    findByUserId: async (userId: string, limit = 50, offset = 0) => {
      const all = Array.from(notificationsStore.values())
        .filter((n) => n.userId === userId && !n.dismissedAt)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return all.slice(offset, offset + limit);
    },
    findByDedupKey: async (userId: string, dedupKey: string) => {
      for (const n of notificationsStore.values()) {
        if (n.userId === userId && n.dedupKey === dedupKey) {
          return n;
        }
      }
      return null;
    },
    findRecentSimilar: async (userId: string, type: NotificationType, title: string, withinMinutes: number) => {
      const cutoff = new Date(Date.now() - withinMinutes * 60 * 1000);
      for (const n of notificationsStore.values()) {
        if (n.userId === userId && n.type === type && n.title === title && n.createdAt >= cutoff) {
          return n;
        }
      }
      return null;
    },
    countUnread: async (userId: string) => {
      return Array.from(notificationsStore.values()).filter((n) => n.userId === userId && !n.isRead && !n.dismissedAt).length;
    },
    markAsRead: async (id: string) => {
      const existing = notificationsStore.get(id);
      if (existing) {
        existing.isRead = true;
        notificationsStore.set(id, existing);
      }
    },
    markAllAsRead: async (userId: string) => {
      for (const n of notificationsStore.values()) {
        if (n.userId === userId && !n.isRead) {
          n.isRead = true;
        }
      }
    },
    dismissAll: async (userId: string) => {
      let count = 0;
      for (const n of notificationsStore.values()) {
        if (n.userId === userId && !n.dismissedAt) {
          n.dismissedAt = new Date();
          count++;
        }
      }
      return count;
    },
    delete: async (id: string) => {
      notificationsStore.delete(id);
    },
  };

  const mockRealtimeGateway: any = {
    emitNotification: (userId: string, payload: any) => {
      emittedEvents.push({ userId, payload });
    },
  };

  const notifService = new NotificationService(mockNotificationRepo, mockRealtimeGateway);

  const userA = 'usr-001';
  const userB = 'usr-002';

  // Test 3.1: Create notification for User A
  const n1 = await notifService.createNotification({
    userId: userA,
    type: NotificationType.SCHEME_ELIGIBILITY,
    title: "You're eligible for PM Kisan Samman Nidhi",
    body: 'You qualify for Rs 6,000/yr financial support based on your verified landholding records.',
    severity: NotificationSeverity.SUCCESS,
    metadata: { schemeId: 'sch-pm-kisan', status: 'CLAIM_READY', destination: '/schemes/sch-pm-kisan' },
  });

  assert(n1.id !== undefined, 'Notification created with generated ID');
  assert(n1.isRead === false, 'New notification isRead is false');
  assert(n1.type === NotificationType.SCHEME_ELIGIBILITY, 'Notification type matches SCHEME_ELIGIBILITY');
  assert(emittedEvents.length === 1, 'WebSocket event emitted for userA');
  assert(emittedEvents[0].userId === userA, 'WebSocket event targeted to userA room');
  assert(emittedEvents[0].payload.id === n1.id, 'WebSocket payload contains notification ID');

  // Test 3.2: Create second notification for User A
  const n2 = await notifService.createNotification({
    userId: userA,
    type: NotificationType.DOCUMENT_REQUIRED,
    title: 'Aadhaar Verification Pending',
    body: 'Upload your Aadhaar front and back images to claim welfare benefits.',
    severity: NotificationSeverity.WARNING,
    metadata: { destination: '/profile' },
  });

  // Test 3.3: Unread count for User A
  const unreadA = await notifService.getUnreadCount(userA);
  assert(unreadA === 2, 'User A unread count is 2');

  // Test 3.4: Mark single notification as read
  await notifService.markAsRead(userA, n1.id);
  const userANotifsAfterRead1 = await notifService.getUserNotifications(userA);
  const readN1 = userANotifsAfterRead1.find(n => n.id === n1.id);
  assert(readN1?.isRead === true, 'Notification N1 marked as read');
  const unreadAfterOneRead = await notifService.getUnreadCount(userA);
  assert(unreadAfterOneRead === 1, 'User A unread count reduced to 1 after marking N1 as read');

  // Test 3.5: Deduplication prevents identical spam within window
  const duplicateN = await notifService.createNotification({
    userId: userA,
    type: NotificationType.DOCUMENT_REQUIRED,
    title: 'Aadhaar Verification Pending',
    body: 'Duplicate message',
    deduplicateMinutes: 60,
  });
  assert(duplicateN.id === n2.id, 'Deduplication returned existing notification without creating new record');
  const userANotifs = await notifService.getUserNotifications(userA);
  assert(userANotifs.length === 2, 'Total notifications for user A remains 2');

  // Test 3.6: Mark all notifications as read
  await notifService.markAllAsRead(userA);
  const unreadFinal = await notifService.getUnreadCount(userA);
  assert(unreadFinal === 0, 'User A unread count is 0 after markAllAsRead');

  // ---------------------------------------------------------------------------
  // 4. IDOR / USER ISOLATION SECURITY VERIFICATION
  // ---------------------------------------------------------------------------
  console.log('\n------------------------------------------------------------------------');
  console.log('4. NOTIFICATION IDOR & USER ISOLATION SECURITY AUDIT');
  console.log('------------------------------------------------------------------------');

  // User B tries to mark User A's notification as read
  let idorReadBlocked = false;
  try {
    await notifService.markAsRead(userB, n2.id);
  } catch (err: any) {
    idorReadBlocked = err.message.includes('Forbidden') || err.message.includes('Access denied') || err.status === 403;
  }
  assert(idorReadBlocked, 'IDOR Prevention: User B cannot mark User A notification as read');

  // User B tries to delete User A's notification
  let idorDeleteBlocked = false;
  try {
    await notifService.deleteNotification(userB, n2.id);
  } catch (err: any) {
    idorDeleteBlocked = err.message.includes('Forbidden') || err.message.includes('Access denied') || err.status === 403;
  }
  assert(idorDeleteBlocked, 'IDOR Prevention: User B cannot delete User A notification');

  // User A can safely delete their own notification
  await notifService.deleteNotification(userA, n1.id);
  const notifsAfterDelete = await notifService.getUserNotifications(userA);
  assert(notifsAfterDelete.length === 1, 'User A successfully deleted notification N1');
  assert(notifsAfterDelete[0].id === n2.id, 'Remaining notification is N2');

  console.log('\n========================================================================');
  console.log(` ALL ${passedAssertions}/${totalAssertions} CLAIM-READY & NOTIFICATION ASSERTIONS PASSED! `);
  console.log('========================================================================\n');
}

runClaimReadyAndNotificationSuite().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
