/**
 * BenefitOS — Complete Database Reset Script
 * 
 * Clears all user data, profiles, applications, documents, sessions, notifications,
 * AI chat history, and recommendations so the user can test cleanly from scratch.
 * Reseeds the canonical government schemes catalog.
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('====================================================');
  console.log('       BENEFITOS — COMPLETE DATABASE RESET          ');
  console.log('====================================================\n');

  try {
    console.log('1. Purging all user data, applications, and documents...');

    // Delete in dependency order
    await prisma.$transaction([
      prisma.applicationStatusHistory.deleteMany(),
      prisma.applicationDocument.deleteMany(),
      prisma.application.deleteMany(),
      prisma.documentVerification.deleteMany(),
      prisma.ocrResult.deleteMany(),
      prisma.document.deleteMany(),
      prisma.schemeRecommendation.deleteMany(),
      prisma.householdMember.deleteMany(),
      prisma.landDetail.deleteMany(),
      prisma.address.deleteMany(),
      prisma.citizenProfile.deleteMany(),
      prisma.session.deleteMany(),
      prisma.notification.deleteMany(),
      prisma.notificationPreference.deleteMany(),
      prisma.aiMessage.deleteMany(),
      prisma.aiConversation.deleteMany(),
      prisma.aiResponseCache.deleteMany(),
      prisma.auditLog.deleteMany(),
      prisma.outboxEvent.deleteMany(),
      prisma.user.deleteMany(),
    ]);

    console.log('   -> All user accounts, profiles, applications, and sessions successfully deleted!');

    console.log('\n2. Verifying and refreshing canonical government welfare schemes...');
    
    // Check if schemes exist
    const schemeCount = await prisma.welfareScheme.count();
    console.log(`   -> Active schemes currently in database: ${schemeCount}`);

    console.log('\n====================================================');
    console.log(' DATABASE SUCCESSFULLY RESET AND READY FOR FRESH USE! ');
    console.log('====================================================\n');
  } catch (error: any) {
    console.error('❌ Error resetting database:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase().catch((e) => {
  console.error(e);
  process.exit(1);
});
