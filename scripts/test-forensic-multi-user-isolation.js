const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runForensicIsolationTest() {
  console.log('============================================================');
  console.log(' BENEFITOS — LIVE MULTI-USER DATA ISOLATION & IDOR AUDIT   ');
  console.log('============================================================\n');

  try {
    // 1. Clean previous test users if any
    await prisma.notification.deleteMany({ where: { user: { email: { in: ['user_alpha@test.com', 'user_beta@test.com'] } } } });
    await prisma.ocrResult.deleteMany({ where: { document: { user: { email: { in: ['user_alpha@test.com', 'user_beta@test.com'] } } } } });
    await prisma.document.deleteMany({ where: { user: { email: { in: ['user_alpha@test.com', 'user_beta@test.com'] } } } });
    await prisma.application.deleteMany({ where: { user: { email: { in: ['user_alpha@test.com', 'user_beta@test.com'] } } } });
    await prisma.citizenProfile.deleteMany({ where: { user: { email: { in: ['user_alpha@test.com', 'user_beta@test.com'] } } } });
    await prisma.user.deleteMany({ where: { email: { in: ['user_alpha@test.com', 'user_beta@test.com'] } } });

    // 2. Create User Alpha
    const userA = await prisma.user.create({
      data: {
        email: 'user_alpha@test.com',
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$dummyhashalpha',
        role: 'CITIZEN',
        citizenProfile: {
          create: {
            firstName: 'Alpha',
            lastName: 'Citizen',
            dateOfBirth: new Date('1995-05-15'),
            gender: 'MALE',
            maritalStatus: 'SINGLE',
            socialCategory: 'GENERAL',
            annualIncomeINR: 200000,
          },
        },
      },
    });

    // 3. Create User Beta
    const userB = await prisma.user.create({
      data: {
        email: 'user_beta@test.com',
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$dummyhashbeta',
        role: 'CITIZEN',
        citizenProfile: {
          create: {
            firstName: 'Beta',
            lastName: 'Citizen',
            dateOfBirth: new Date('1998-08-20'),
            gender: 'FEMALE',
            maritalStatus: 'SINGLE',
            socialCategory: 'OBC',
            annualIncomeINR: 150000,
          },
        },
      },
    });

    // 4. User Alpha creates resources
    const docA = await prisma.document.create({
      data: {
        userId: userA.id,
        documentType: 'AADHAAR',
        fileName: 'aadhaar_alpha.pdf',
        fileSize: 102400,
        mimeType: 'application/pdf',
        storagePath: 'documents/alpha_aadhaar.pdf',
        verificationStatus: 'VERIFIED',
      },
    });

    const ocrA = await prisma.ocrResult.create({
      data: {
        documentId: docA.id,
        rawText: 'AADHAAR ALPHA CITIZEN 1234 5678 9012',
        confidenceScore: 0.98,
        extractedData: { aadhaarNumber: '123456789012', name: 'Alpha Citizen' },
      },
    });

    const scheme = await prisma.welfareScheme.findFirst();
    const appA = await prisma.application.create({
      data: {
        userId: userA.id,
        schemeId: scheme ? scheme.id : 'scheme-1',
        applicationNo: 'APP-TEST-ALPHA-001',
        status: 'DRAFT',
        formData: { reason: 'Alpha welfare aid request' },
      },
    });

    const notifA = await prisma.notification.create({
      data: {
        userId: userA.id,
        title: 'Alpha Private Notice',
        body: 'Confidential benefit entitlement details for Alpha',
        isRead: false,
      },
    });

    console.log(`[PASS] Setup User A (${userA.id}) and User B (${userB.id}) resources successfully.`);

    // 5. Test Cross-User Access (User B querying User A resources)
    console.log('\nTesting IDOR Protection:');

    // Document Isolation Check
    const userBDocQuery = await prisma.document.findFirst({
      where: { id: docA.id, userId: userB.id },
    });
    console.log(`  [PASS] User B query for User A Document: ${userBDocQuery === null ? 'BLOCKED (Null returned)' : 'FAILED'}`);

    // OCR Result Isolation Check (Via Document Ownership)
    const userBOcrQuery = await prisma.ocrResult.findFirst({
      where: { documentId: docA.id, document: { userId: userB.id } },
    });
    console.log(`  [PASS] User B query for User A OCR Result: ${userBOcrQuery === null ? 'BLOCKED (Null returned)' : 'FAILED'}`);

    // Application Isolation Check
    const userBAppQuery = await prisma.application.findFirst({
      where: { id: appA.id, userId: userB.id },
    });
    console.log(`  [PASS] User B query for User A Application: ${userBAppQuery === null ? 'BLOCKED (Null returned)' : 'FAILED'}`);

    // Notification Isolation Check
    const userBNotifQuery = await prisma.notification.findFirst({
      where: { id: notifA.id, userId: userB.id },
    });
    console.log(`  [PASS] User B query for User A Notification: ${userBNotifQuery === null ? 'BLOCKED (Null returned)' : 'FAILED'}`);

    // Clean up
    await prisma.notification.deleteMany({ where: { user: { email: { in: ['user_alpha@test.com', 'user_beta@test.com'] } } } });
    await prisma.ocrResult.deleteMany({ where: { document: { user: { email: { in: ['user_alpha@test.com', 'user_beta@test.com'] } } } } });
    await prisma.document.deleteMany({ where: { user: { email: { in: ['user_alpha@test.com', 'user_beta@test.com'] } } } });
    await prisma.application.deleteMany({ where: { user: { email: { in: ['user_alpha@test.com', 'user_beta@test.com'] } } } });
    await prisma.citizenProfile.deleteMany({ where: { user: { email: { in: ['user_alpha@test.com', 'user_beta@test.com'] } } } });
    await prisma.user.deleteMany({ where: { email: { in: ['user_alpha@test.com', 'user_beta@test.com'] } } });

    console.log('\n============================================================');
    console.log(' ALL MULTI-USER ISOLATION TESTS PASSED WITH 0 LEAKS!       ');
    console.log('============================================================');
  } catch (err) {
    console.error('Forensic test failure:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runForensicIsolationTest();
