import * as dotenv from 'dotenv';
dotenv.config();

import { randomUUID } from 'crypto';
import { AiService } from './modules/ai/ai.service';
import { AiCacheService } from './infrastructure/ai/ai-cache.service';
import { AiDataMinimizerService } from './infrastructure/ai/ai-data-minimizer.service';
import { AiSafetyService } from './infrastructure/ai/ai-safety.service';
import { GeminiAiAdapter } from './infrastructure/ai/gemini-ai.adapter';

console.log('================================================================');
console.log(' BENEFITOS — FOCUSED RUNTIME QUALITY & LANGUAGE VERIFICATION  ');
console.log('================================================================\n');

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runFocusedVerification() {
  const dbCacheStore = new Map<string, any>();
  const dbCitizenStore = new Map<string, any>();
  const dbSchemeStore = new Map<string, any>();

  const prismaMock: any = {
    client: {
      aiResponseCache: {
        findUnique: async ({ where: { cacheKey } }: any) => {
          const entry = dbCacheStore.get(cacheKey);
          if (entry && entry.status === 'ACTIVE' && entry.expiresAt > new Date()) {
            return entry;
          }
          return null;
        },
        upsert: async ({ where: { cacheKey }, create, update }: any) => {
          const existing = dbCacheStore.get(cacheKey);
          if (existing) {
            const updated = { ...existing, ...update, updatedAt: new Date() };
            dbCacheStore.set(cacheKey, updated);
            return updated;
          }
          const created = {
            id: 'cache-entry-' + randomUUID().substring(0, 8),
            ...create,
            createdAt: new Date(),
          };
          dbCacheStore.set(cacheKey, created);
          return created;
        },
        updateMany: async ({ where, data }: any) => {
          let count = 0;
          for (const [k, v] of dbCacheStore.entries()) {
            const matchUser = !where.userId || v.userId === where.userId;
            const matchScheme = !where.schemeId || v.schemeId === where.schemeId;
            const matchStatus = !where.status || v.status === where.status;
            if (matchUser && matchScheme && matchStatus) {
              dbCacheStore.set(k, { ...v, ...data });
              count++;
            }
          }
          return { count };
        },
      },
      citizenProfile: {
        findUnique: async ({ where: { userId } }: any) => {
          return dbCitizenStore.get(userId) || null;
        },
      },
      welfareScheme: {
        findUnique: async ({ where: { id } }: any) => {
          return dbSchemeStore.get(id) || null;
        },
        findFirst: async ({ where }: any) => {
          for (const s of dbSchemeStore.values()) {
            if (where?.title?.contains && s.title.toLowerCase().includes(where.title.contains.toLowerCase())) {
              return s;
            }
          }
          return null;
        },
      },
    },
  };

  const redisLockStore = new Map<string, { value: string; expiresAt: number }>();
  const redisService: any = {
    acquireLock: async (key: string, ttl: number = 10000): Promise<string | null> => {
      const now = Date.now();
      const current = redisLockStore.get(key);
      if (current && current.expiresAt > now) {
        return null;
      }
      const token = randomUUID();
      redisLockStore.set(key, { value: token, expiresAt: now + ttl });
      return token;
    },
    releaseLock: async (key: string, token: string): Promise<boolean> => {
      const current = redisLockStore.get(key);
      if (current && current.value === token) {
        redisLockStore.delete(key);
        return true;
      }
      return false;
    },
    getClient: () => null,
  };

  const aiSafety = new AiSafetyService();
  const aiDataMinimizer = new AiDataMinimizerService();
  const aiCache = new AiCacheService(prismaMock, redisService);
  const geminiAdapter = new GeminiAiAdapter();
  const aiService = new AiService(geminiAdapter, aiSafety, aiCache, aiDataMinimizer, prismaMock);

  // Setup Schemes
  const schemePMKisan = {
    id: 'scheme-pmkisan-001',
    code: 'PM-KISAN',
    title: 'PM Kisan Samman Nidhi',
    department: 'Ministry of Agriculture and Farmers Welfare',
    category: 'AGRICULTURE',
    description: 'Income support of 6000 INR per year in three equal installments to landholding farmer families.',
    updatedAt: new Date('2026-01-01'),
    requiredDocuments: [
      { id: 'doc-4', documentType: 'AADHAAR', isMandatory: true, description: 'Aadhaar Card' },
      { id: 'doc-5', documentType: 'LAND_OWNERSHIP_PROOF', isMandatory: true, description: 'Land Ownership Document (Khatoni)' },
      { id: 'doc-6', documentType: 'BANK_PASSBOOK', isMandatory: true, description: 'Bank Passbook linked with Aadhaar' },
    ],
    eligibilityRules: [
      { id: 'r-3', attributeKey: 'employmentStatus', operator: 'EQUALS', targetValue: 'FARMER', isRequired: true, description: 'Must be an active cultivator or farmer' },
      { id: 'r-4', attributeKey: 'isRural', operator: 'EQUALS', targetValue: 'true', isRequired: true, description: 'Rural farming household' },
    ],
  };

  const schemePMAY = {
    id: 'scheme-pmay-001',
    code: 'PMAY-GRAMIN',
    title: 'Pradhan Mantri Awas Yojana - Gramin',
    department: 'Ministry of Rural Development',
    category: 'HOUSING',
    description: 'Financial assistance for rural homeless and kutcha house households.',
    updatedAt: new Date('2026-01-01'),
    requiredDocuments: [
      { id: 'doc-1', documentType: 'AADHAAR', isMandatory: true, description: 'Aadhaar Card' },
      { id: 'doc-2', documentType: 'INCOME_CERTIFICATE', isMandatory: true, description: 'Income Certificate' },
      { id: 'doc-3', documentType: 'BANK_PASSBOOK', isMandatory: true, description: 'Bank Account Passbook' },
    ],
    eligibilityRules: [
      { id: 'r-1', attributeKey: 'isRural', operator: 'EQUALS', targetValue: 'true', isRequired: true, description: 'Must reside in a rural area' },
    ],
  };

  const schemeScholarship = {
    id: 'scheme-scholarship-001',
    code: 'UP-POST-MATRIC-SCHOLARSHIP',
    title: 'UP Post-Matric Scholarship',
    department: 'Social Welfare Department, Uttar Pradesh',
    category: 'EDUCATION',
    description: 'Post-matric financial scholarship for students studying in UP.',
    updatedAt: new Date('2026-01-01'),
    requiredDocuments: [
      { id: 'doc-7', documentType: 'CASTE_CERTIFICATE', isMandatory: true, description: 'Caste Certificate' },
    ],
    eligibilityRules: [
      { id: 'r-5', attributeKey: 'employmentStatus', operator: 'EQUALS', targetValue: 'STUDENT', isRequired: true, description: 'Enrolled in post-matric studies' },
    ],
  };

  dbSchemeStore.set(schemePMKisan.id, schemePMKisan);
  dbSchemeStore.set(schemePMAY.id, schemePMAY);
  dbSchemeStore.set(schemeScholarship.id, schemeScholarship);

  // Setup citizen: Farmer, Rural UP, Income 1.2 Lakh
  const testCitizenId = 'citizen-user-focused-001';
  const testCitizenProfile = {
    id: 'prof-focused-001',
    userId: testCitizenId,
    gender: 'MALE',
    maritalStatus: 'MARRIED',
    socialCategory: 'OBC',
    employmentStatus: 'FARMER',
    annualIncomeINR: 120000,
    address: {
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      isRural: true,
    },
    recommendations: [
      {
        id: 'rec-1',
        schemeId: schemePMKisan.id,
        scheme: schemePMKisan,
        isEligible: true,
        matchPercentage: 100,
        criteriaMet: ['Occupation matches Farmer', 'Resides in rural district Varanasi, UP', 'Income within limit'],
        missingCriteria: [],
      },
      {
        id: 'rec-2',
        schemeId: schemePMAY.id,
        scheme: schemePMAY,
        isEligible: true,
        matchPercentage: 95,
        criteriaMet: ['Rural residence verified'],
        missingCriteria: [],
      },
      {
        id: 'rec-3',
        schemeId: schemeScholarship.id,
        scheme: schemeScholarship,
        isEligible: false,
        matchPercentage: 40,
        criteriaMet: ['Domicile of Uttar Pradesh'],
        missingCriteria: ['Citizen employment status is FARMER, required STUDENT'],
      },
    ],
  };
  dbCitizenStore.set(testCitizenId, testCitizenProfile);

  const results: any[] = [];

  const runItem = async (label: string, prompt: string, context: any, lang: 'en' | 'hi') => {
    console.log(`[EXEC] ${label} (${lang.toUpperCase()}): "${prompt}"`);
    const start = Date.now();
    const res = await aiService.chat(prompt, context, testCitizenId, lang);
    const duration = Date.now() - start;
    const words = res.content.trim().split(/\s+/).filter(Boolean).length;
    const isFallback = res.content.includes('temporarily unable') || res.content.includes('offline');
    const item = {
      label,
      lang,
      prompt,
      durationMs: duration,
      wordCount: words,
      isCached: res.isCached || false,
      isFallback,
      content: res.content,
    };
    results.push(item);
    console.log(`  -> Duration: ${duration}ms | Words: ${words} | Cached: ${res.isCached} | Status: ${isFallback ? 'BLOCKED/FALLBACK' : 'LIVE RESPONSE'}`);
    console.log(`  -> Snippet: ${res.content.substring(0, 140).replace(/\n/g, ' ')}...\n`);
    await sleep(4000);
    return item;
  };

  // 1. "Am I eligible for PM-KISAN?"
  await runItem('Q1_ELIGIBLE_EN', 'Am I eligible for PM-KISAN?', { schemeId: schemePMKisan.id, schemeTitle: 'PM Kisan Samman Nidhi', useCase: 'eligibility-explanation' }, 'en');

  // 2. "Why am I eligible?"
  await runItem('Q2_WHY_ELIGIBLE_EN', 'Why am I eligible?', { schemeId: schemePMKisan.id, schemeTitle: 'PM Kisan Samman Nidhi', useCase: 'eligibility-explanation' }, 'en');

  // 3. "What documents do I need?"
  await runItem('Q3_DOCUMENTS_EN', 'What documents do I need?', { schemeId: schemePMKisan.id, schemeTitle: 'PM Kisan Samman Nidhi', useCase: 'documents' }, 'en');

  // 4. "What schemes can I apply for?"
  await runItem('Q4_SCHEMES_EN', 'What schemes can I apply for?', { useCase: 'eligible-schemes' }, 'en');

  // 5. "Has my application been submitted?"
  await runItem('Q5_APPLICATION_STATUS_EN', 'Has my application been submitted?', { schemeId: schemePMKisan.id }, 'en');

  // 6. Hindi Equivalents
  await runItem('Q1_ELIGIBLE_HI', 'क्या मैं PM-KISAN के लिए पात्र हूँ?', { schemeId: schemePMKisan.id, schemeTitle: 'PM Kisan Samman Nidhi', useCase: 'eligibility-explanation' }, 'hi');
  await runItem('Q2_WHY_ELIGIBLE_HI', 'मैं इस योजना के लिए पात्र क्यों हूँ?', { schemeId: schemePMKisan.id, schemeTitle: 'PM Kisan Samman Nidhi', useCase: 'eligibility-explanation' }, 'hi');
  await runItem('Q3_DOCUMENTS_HI', 'मुझे कौन से दस्तावेज़ चाहिए?', { schemeId: schemePMKisan.id, schemeTitle: 'PM Kisan Samman Nidhi', useCase: 'documents' }, 'hi');
  await runItem('Q4_SCHEMES_HI', 'मैं किन योजनाओं के लिए आवेदन कर सकता हूँ?', { useCase: 'eligible-schemes' }, 'hi');
  await runItem('Q5_APPLICATION_STATUS_HI', 'क्या मेरा आवेदन जमा हो गया है?', { schemeId: schemePMKisan.id }, 'hi');

  // 7. Language Switch Cycle (English -> Hindi -> English)
  console.log('--- TESTING LANGUAGE SWITCH CYCLE (EN -> HI -> EN) ---');
  const en1 = await runItem('CYCLE_1_EN', 'Am I eligible for PM-KISAN?', { schemeId: schemePMKisan.id, schemeTitle: 'PM Kisan Samman Nidhi' }, 'en');
  const hi1 = await runItem('CYCLE_2_HI', 'क्या मैं PM-KISAN के लिए पात्र हूँ?', { schemeId: schemePMKisan.id, schemeTitle: 'PM Kisan Samman Nidhi' }, 'hi');
  const en2 = await runItem('CYCLE_3_EN_CACHE', 'Am I eligible for PM-KISAN?', { schemeId: schemePMKisan.id, schemeTitle: 'PM Kisan Samman Nidhi' }, 'en');
  const hi2 = await runItem('CYCLE_4_HI_CACHE', 'क्या मैं PM-KISAN के लिए पात्र हूँ?', { schemeId: schemePMKisan.id, schemeTitle: 'PM Kisan Samman Nidhi' }, 'hi');

  console.log('================================================================');
  console.log(' FOCUSED RUNTIME VERIFICATION RESULTS');
  console.log('================================================================');
  console.log(JSON.stringify(results, null, 2));

  return results;
}

runFocusedVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
