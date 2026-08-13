import { AuthService } from './modules/auth/auth.service';
import { DocumentService } from './modules/document/document.service';
import { ApplicationService } from './modules/application/application.service';
import { NotificationService } from './modules/notification/notification.service';
import { OcrPipelineService } from './modules/ocr/ocr.service';
import { RealtimeGateway } from './modules/realtime/realtime.gateway';
import { UserRole } from './domain/user/user.entity';
import { DocumentType } from './domain/welfare/scheme.entity';
import { SocialCategory, EmploymentStatus } from './domain/citizen/citizen.entity';
import { DocumentClassificationService } from './modules/document/document-classification.service';
import { RedisService } from './infrastructure/redis/redis.service';
import { EmailService } from './infrastructure/email/email.service';
import { JwtService } from '@nestjs/jwt';
import { validateEnv } from './config/env.config';
import { randomUUID } from 'crypto';

interface MockDb {
  users: Map<string, any>;
  citizenProfiles: Map<string, any>;
  addresses: Map<string, any>;
  documents: Map<string, any>;
  applications: Map<string, any>;
  notifications: Map<string, any>;
  ocrResults: Map<string, any>;
}

export function createMockPrisma(db: MockDb): any {
  return {
    client: {
      user: {
        findUnique: async ({ where }: any) => {
          if (where.email) {
            for (const u of db.users.values()) {
              if (u.email === where.email) return u;
            }
          }
          if (where.id) return db.users.get(where.id) || null;
          return null;
        },
        create: async ({ data }: any) => {
          db.users.set(data.id, data);
          return data;
        },
        update: async ({ where, data }: any) => {
          const existing = db.users.get(where.id);
          const updated = { ...existing, ...data };
          db.users.set(where.id, updated);
          return updated;
        },
      },
      citizenProfile: {
        create: async ({ data }: any) => {
          db.citizenProfiles.set(data.id, data);
          return data;
        },
      },
      address: {
        create: async ({ data }: any) => {
          db.addresses.set(data.id, data);
          return data;
        },
      },
      document: {
        create: async ({ data }: any) => {
          db.documents.set(data.id, data);
          return data;
        },
        findUnique: async ({ where }: any) => db.documents.get(where.id) || null,
        findMany: async ({ where }: any) => {
          const list: any[] = [];
          for (const d of db.documents.values()) {
            if (where?.userId && d.userId !== where.userId) continue;
            list.push(d);
          }
          return list;
        },
        delete: async ({ where }: any) => {
          db.documents.delete(where.id);
        },
      },
      application: {
        create: async ({ data }: any) => {
          db.applications.set(data.id, data);
          return data;
        },
        findUnique: async ({ where }: any) => db.applications.get(where.id) || null,
        findMany: async ({ where }: any) => {
          const list: any[] = [];
          for (const a of db.applications.values()) {
            if (where?.userId && a.userId !== where.userId) continue;
            list.push(a);
          }
          return list;
        },
        update: async ({ where, data }: any) => {
          const existing = db.applications.get(where.id);
          const updated = { ...existing, ...data };
          db.applications.set(where.id, updated);
          return updated;
        },
      },
      notification: {
        create: async ({ data }: any) => {
          db.notifications.set(data.id, data);
          return data;
        },
        findUnique: async ({ where }: any) => db.notifications.get(where.id) || null,
        findMany: async ({ where }: any) => {
          const list: any[] = [];
          for (const n of db.notifications.values()) {
            if (where?.userId && n.userId !== where.userId) continue;
            list.push(n);
          }
          return list;
        },
        update: async ({ where, data }: any) => {
          const existing = db.notifications.get(where.id);
          const updated = { ...existing, ...data };
          db.notifications.set(where.id, updated);
          return updated;
        },
      },
      ocrResult: {
        upsert: async ({ create, update, where }: any) => {
          db.ocrResults.set(where.documentId, create);
          return create;
        },
      },
    },
  };
}

async function runSecurityAuditTests() {
  console.log('============================================================');
  console.log('BENEFITOS — COMPREHENSIVE SECURITY & IDOR REGRESSION SUITE');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // TEST 1: Registration Privilege Escalation Prevention
  // -------------------------------------------------------------
  console.log('1. Testing Registration Privilege Escalation Prevention...');
  const db: MockDb = {
    users: new Map(),
    citizenProfiles: new Map(),
    addresses: new Map(),
    documents: new Map(),
    applications: new Map(),
    notifications: new Map(),
    ocrResults: new Map(),
  };

  const prismaMock = createMockPrisma(db);
  const memStore = new Map<string, any>();
  const redisService: any = {
    get: async (k: string) => memStore.get(k) || null,
    set: async (k: string, v: string) => { memStore.set(k, v); },
    del: async (k: string) => { memStore.delete(k); },
    isHealthy: () => true,
  };
  const jwtService = new JwtService();

  const userRepo: any = {
    findByEmail: async (email: string) => prismaMock.client.user.findUnique({ where: { email } }),
    findById: async (id: string) => prismaMock.client.user.findUnique({ where: { id } }),
    save: async (u: any) => prismaMock.client.user.create({ data: u }),
    update: async (u: any) => prismaMock.client.user.update({ where: { id: u.id }, data: u }),
  };

  const citizenRepo: any = {
    save: async (c: any) => prismaMock.client.citizenProfile.create({ data: c }),
    saveAddress: async (a: any) => prismaMock.client.address.create({ data: a }),
  };

  const authService = new AuthService(userRepo, citizenRepo, jwtService, redisService);

  // Attempt privilege escalation with role = ADMIN
  const registrationPayload: any = {
    name: 'Malicious Attacker',
    age: 28,
    category: SocialCategory.GENERAL,
    profession: EmploymentStatus.EMPLOYED,
    annualIncome: 500000,
    state: 'Delhi',
    email: 'attacker@evil.com',
    password: 'Password123!',
    role: 'ADMIN', // Injected role attempt
  };

  const regRes = await authService.register(registrationPayload);
  assert(regRes.user.role === UserRole.CITIZEN, 'Registration strictly enforces UserRole.CITIZEN regardless of payload role injection');
  assert(regRes.user.role !== 'ADMIN' as any, 'Caller-supplied "ADMIN" role was safely ignored');

  // -------------------------------------------------------------
  // TEST 2: Environment Secret Startup Validation
  // -------------------------------------------------------------
  console.log('\n2. Testing Missing / Empty JWT Secret Validation...');
  const originalSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = '';
  let envValidationFailed = false;
  try {
    validateEnv();
  } catch {
    envValidationFailed = true;
  }
  process.env.JWT_SECRET = originalSecret;
  assert(envValidationFailed, 'validateEnv() fails fast if JWT_SECRET is empty/missing');

  // -------------------------------------------------------------
  // TEST 3: File Signature / Magic-Byte Validation
  // -------------------------------------------------------------
  console.log('\n3. Testing Magic-Byte File Signature Validation...');
  const inMemoryFiles = new Map<string, Buffer>();
  const storageAdapter: any = {
    uploadFile: async (opts: any) => {
      const storagePath = `uploads/documents/${Date.now()}_${opts.fileName}`;
      inMemoryFiles.set(storagePath, opts.fileBuffer);
      return {
        storagePath,
        publicUrl: `/${storagePath}`,
        fileSize: opts.fileBuffer.length,
      };
    },
    downloadFile: async (path: string) => inMemoryFiles.get(path) || Buffer.from(''),
    deleteFile: async (path: string) => { inMemoryFiles.delete(path); },
  };
  const classificationService = new DocumentClassificationService();
  const geminiAdapter: any = {
    providerName: 'gemini',
    extractDocumentData: async (fileBuffer: Buffer, mimeType: string, expectedDocType: string) => ({
      rawText: fileBuffer ? fileBuffer.toString('utf-8') : '',
      confidenceScore: 0.95,
      extractedFields: { docType: expectedDocType },
    }),
  };

  const docRepo: any = {
    save: async (d: any) => prismaMock.client.document.create({ data: d }),
    findById: async (id: string) => prismaMock.client.document.findUnique({ where: { id } }),
    findByUserId: async (uid: string) => prismaMock.client.document.findMany({ where: { userId: uid } }),
    findByUserAndType: async (uid: string, t: any) => prismaMock.client.document.findMany({ where: { userId: uid } }),
    delete: async (id: string) => prismaMock.client.document.delete({ where: { id } }),
  };

  const documentService = new DocumentService(
    docRepo,
    storageAdapter,
    classificationService,
    geminiAdapter,
    prismaMock,
  );

  // Executable file disguised as application/pdf
  const fakePdfBuffer = Buffer.from('MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff', 'binary');
  let signatureCheckFailed = false;
  try {
    documentService.validateFileSignature(fakePdfBuffer, 'application/pdf');
  } catch (err: any) {
    signatureCheckFailed = err.message.includes('signature mismatch');
  }
  assert(signatureCheckFailed, 'Rejected disguised executable (MZ header with application/pdf MIME)');

  // Legitimate PDF buffer (%PDF)
  const validPdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Title (Aadhaar Card)\n>>\nendobj\nGovernment of India Unique Identification Authority of India UIDAI 1234 5678 9012\n%%EOF');
  let validPdfAccepted = false;
  try {
    documentService.validateFileSignature(validPdfBuffer, 'application/pdf');
    validPdfAccepted = true;
  } catch {
    validPdfAccepted = false;
  }
  assert(validPdfAccepted, 'Accepted legitimate PDF (%PDF header)');

  // -------------------------------------------------------------
  // TEST 4: IDOR Protection on Documents (User A vs User B)
  // -------------------------------------------------------------
  console.log('\n4. Testing IDOR Protection on Documents (Cross-User Access)...');
  const userA_Id = 'user-a-1111';
  const userB_Id = 'user-b-2222';

  // Upload Document for User A
  const uploadResult = await documentService.uploadDocument(userA_Id, DocumentType.AADHAAR, {
    originalname: 'user_a_aadhaar.pdf',
    mimetype: 'application/pdf',
    size: validPdfBuffer.length,
    buffer: validPdfBuffer,
  } as any);

  const docA_Id = uploadResult.document!.id;
  assert(!!docA_Id, 'Document created successfully for User A');

  // User A reads their own document -> Succeeds
  let userAAccessOk = false;
  try {
    const doc = await documentService.getDocumentById(userA_Id, docA_Id);
    userAAccessOk = doc.id === docA_Id;
  } catch {
    userAAccessOk = false;
  }
  assert(userAAccessOk, 'User A can read User A document');

  // User B attempts to read User A's document -> Throws NotFound / Forbidden
  let userBBlocked = false;
  try {
    await documentService.getDocumentById(userB_Id, docA_Id);
  } catch (err: any) {
    userBBlocked = true;
  }
  assert(userBBlocked, 'User B is blocked from reading User A document (IDOR prevented)');

  // User B attempts to delete User A's document -> Blocked
  let userBDeleteBlocked = false;
  try {
    await documentService.deleteDocument(userB_Id, docA_Id);
  } catch (err: any) {
    userBDeleteBlocked = true;
  }
  assert(userBDeleteBlocked, 'User B is blocked from deleting User A document (IDOR prevented)');

  // -------------------------------------------------------------
  // TEST 5: IDOR Protection on OCR Pipeline
  // -------------------------------------------------------------
  console.log('\n5. Testing IDOR Protection on OCR Pipeline...');
  const ocrService = new OcrPipelineService(docRepo, geminiAdapter, storageAdapter, prismaMock);

  let userBOcrBlocked = false;
  try {
    await ocrService.processDocumentOcr(userB_Id, docA_Id);
  } catch {
    userBOcrBlocked = true;
  }
  assert(userBOcrBlocked, 'User B is blocked from running OCR on User A document (IDOR prevented)');

  // -------------------------------------------------------------
  // TEST 6: IDOR Protection on Applications
  // -------------------------------------------------------------
  console.log('\n6. Testing IDOR Protection on Applications...');
  const appRepo: any = {
    save: async (a: any) => prismaMock.client.application.create({ data: a }),
    findById: async (id: string) => prismaMock.client.application.findUnique({ where: { id } }),
    findByUserId: async (uid: string) => prismaMock.client.application.findMany({ where: { userId: uid } }),
    update: async (a: any) => prismaMock.client.application.update({ where: { id: a.id }, data: a }),
  };
  const appService = new ApplicationService(appRepo);

  const draftA = await appService.createDraft(userA_Id, 'scheme-up-scholarship', { income: 150000 });
  assert(!!draftA.id, 'User A created application draft');

  // User B attempts to read User A's application
  let userBAppReadBlocked = false;
  try {
    await appService.getApplicationById(userB_Id, draftA.id);
  } catch {
    userBAppReadBlocked = true;
  }
  assert(userBAppReadBlocked, 'User B is blocked from reading User A application draft (IDOR prevented)');

  // User B attempts to submit User A's application
  let userBAppSubmitBlocked = false;
  try {
    await appService.submitApplication(userB_Id, draftA.id);
  } catch {
    userBAppSubmitBlocked = true;
  }
  assert(userBAppSubmitBlocked, 'User B is blocked from submitting User A application (IDOR prevented)');

  // User B attempts to update User A's application
  let userBAppUpdateBlocked = false;
  try {
    await appService.updateApplication(userB_Id, draftA.id, { formData: { hacked: true } });
  } catch {
    userBAppUpdateBlocked = true;
  }
  assert(userBAppUpdateBlocked, 'User B is blocked from modifying User A application (IDOR prevented)');

  // -------------------------------------------------------------
  // TEST 7: IDOR Protection on Notifications
  // -------------------------------------------------------------
  console.log('\n7. Testing IDOR Protection on Notifications...');
  const notifRepo: any = {
    save: async (n: any) => prismaMock.client.notification.create({ data: n }),
    findById: async (id: string) => prismaMock.client.notification.findUnique({ where: { id } }),
    findByUserId: async (uid: string) => prismaMock.client.notification.findMany({ where: { userId: uid } }),
    markAsRead: async (id: string) => prismaMock.client.notification.update({ where: { id }, data: { isRead: true } }),
  };
  const notifService = new NotificationService(notifRepo);

  const notifA = await notifService.sendNotification(userA_Id, 'Application Update', 'Your application is under review');
  assert(notifA.isRead === false, 'Notification created for User A (unread)');

  // User B attempts to mark User A's notification as read -> Should not affect User A's notification
  await notifService.markAsRead(userB_Id, notifA.id);
  const notifCheck = await notifRepo.findById(notifA.id);
  assert(notifCheck.isRead === false, 'User B cannot mark User A notification as read (IDOR prevented)');

  // User A marks their own notification as read -> Succeeds
  await notifService.markAsRead(userA_Id, notifA.id);
  const notifCheckA = await notifRepo.findById(notifA.id);
  assert(notifCheckA.isRead === true, 'User A successfully marks own notification as read');

  // -------------------------------------------------------------
  // TEST 8: WebSocket Room Isolation & JWT Binding
  // -------------------------------------------------------------
  console.log('\n8. Testing WebSocket Room Isolation...');
  const realtimeGateway = new RealtimeGateway(jwtService);

  const mockSocketUserA: any = {
    id: 'socket-user-a',
    data: { user: { sub: userA_Id, role: 'CITIZEN' } },
    joinedRooms: new Set<string>(),
    join: function (room: string) { this.joinedRooms.add(room); },
  };

  // User A tries to subscribe to User B's room
  const subResult = realtimeGateway.handleUserSubscription({ userId: userB_Id }, mockSocketUserA as any);
  assert(subResult.status === 'ERROR', 'Citizen User A cannot join User B private room');
  assert(!mockSocketUserA.joinedRooms.has(`user:${userB_Id}`), 'Socket did not join unauthorized user room');

  // User A subscribes to own room
  const ownSubResult = realtimeGateway.handleUserSubscription({ userId: userA_Id }, mockSocketUserA as any);
  assert(ownSubResult.status === 'SUBSCRIBED', 'Citizen User A successfully joined own private room');

  // -------------------------------------------------------------
  // TEST 9: Redis Production Distributed Fail-Closed Security
  // -------------------------------------------------------------
  console.log('\n9. Testing Redis Distributed Fail-Closed Security...');
  const prodRedis = new RedisService();
  const origEnv = process.env.NODE_ENV;
  const origMode = process.env.SECURITY_STATE_MODE;

  // 1. Simulate distributed / production mode with disconnected Redis
  process.env.NODE_ENV = 'production';
  process.env.SECURITY_STATE_MODE = 'distributed';
  let failClosedThrew = false;
  try {
    await prodRedis.set('bl_test_token', 'true', 900);
  } catch (err: any) {
    failClosedThrew = true;
  }
  assert(failClosedThrew, 'Redis service strictly FAILS CLOSED in distributed/production mode if Redis is unavailable');

  // 2. Test local development fallback mode
  process.env.NODE_ENV = 'development';
  process.env.SECURITY_STATE_MODE = 'local';
  let localFallbackSucceeded = false;
  try {
    await prodRedis.set('bl_local_test_token', 'true', 900);
    const val = await prodRedis.get('bl_local_test_token');
    localFallbackSucceeded = (val === 'true');
  } catch (err: any) {
    localFallbackSucceeded = false;
  }
  assert(localFallbackSucceeded, 'Redis service successfully uses local in-memory fallback in development/test mode');

  process.env.NODE_ENV = origEnv;
  process.env.SECURITY_STATE_MODE = origMode;

  // -------------------------------------------------------------
  // TEST 10: Email Service Abstraction & Password Reset Privacy
  // -------------------------------------------------------------
  console.log('\n10. Testing Email Service & Password Reset Privacy...');
  const emailService = new EmailService();
  assert(typeof emailService.isConfigured() === 'boolean', 'EmailService truthfully reports configuration state');

  // Test that non-existent email returns identical generic response (no account enumeration)
  const unknownEmailRes = await authService.forgotPassword('nonexistent.user.xyz@unknown.org');
  const existingUserRes = await authService.forgotPassword('attacker@evil.com');
  assert(unknownEmailRes.message === existingUserRes.message, 'Password reset returns identical generic response for existing and non-existing accounts (anti-enumeration)');

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n============================================================');
  console.log(`SECURITY AUDIT TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityAuditTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
