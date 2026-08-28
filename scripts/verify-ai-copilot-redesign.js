/**
 * BENEFITOS AI CITIZEN COPILOT REDESIGN & PROVIDER ABSTRACTION VERIFICATION SUITE
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log(' BENEFITOS — AI COPILOT REDESIGN VERIFICATION');
console.log('====================================================\n');

// 1. Frontend Bundle & Code Inspection for Provider Leaks
console.log('1. Auditing Frontend Codebase for Leaked Provider Names...');

const frontendSrcDir = path.join(__dirname, '../apps/frontend/src');

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (/\.(tsx|ts|jsx|js|html)$/.test(file)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allFrontendFiles = getAllFiles(frontendSrcDir);
const forbiddenWords = ['gemini', 'google ai', 'google generative', 'gemini-1.5', 'gemini-2.5', 'gemini-3.6'];

let leakCount = 0;
for (const file of allFrontendFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  for (const word of forbiddenWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(content)) {
      // Allow google fonts link in index.html, nothing else
      if (file.endsWith('index.html') && word === 'google' && content.includes('fonts.googleapis.com')) {
        continue;
      }
      console.error(`  [FAIL] Leaked '${word}' in ${path.relative(process.cwd(), file)}`);
      leakCount++;
    }
  }
}

if (leakCount === 0) {
  console.log('  [PASS] Zero provider name leaks detected across all frontend components and screens.');
} else {
  console.error(`  [FAIL] Detected ${leakCount} provider name leaks in frontend.`);
  process.exit(1);
}

// 2. Auditing Structured AI Response Renderer
console.log('\n2. Verifying StructuredAiResponseRenderer Component...');
const rendererPath = path.join(__dirname, '../apps/frontend/src/components/ai/StructuredAiResponseRenderer.tsx');
assert(fs.existsSync(rendererPath), 'StructuredAiResponseRenderer.tsx must exist');

const rendererCode = fs.readFileSync(rendererPath, 'utf-8');
assert(rendererCode.includes('BenefitOS AI Citizen Copilot'), 'Must contain official BenefitOS AI branding');
assert(rendererCode.includes('National Welfare Intelligence Service'), 'Must contain official subtext');
assert(rendererCode.includes('Official Notice:'), 'Must contain official government disclaimer');
assert(rendererCode.includes('SchemeCardItem'), 'Must contain structured SchemeCardItem renderer');
assert(rendererCode.includes('Step-by-Step Official Application Procedure'), 'Must support application procedure steps');
console.log('  [PASS] StructuredAiResponseRenderer verified with scheme cards, step procedures, and government disclaimers.');

// 3. Auditing Backend AI Adapter Provider Neutrality
console.log('\n3. Verifying Backend AI Adapter & Service...');
const adapterPath = path.join(__dirname, '../apps/backend/src/infrastructure/ai/gemini-ai.adapter.ts');
const adapterCode = fs.readFileSync(adapterPath, 'utf-8');

assert(!adapterCode.includes('gemini-unconfigured'), 'Must not return gemini-unconfigured in client response');
assert(!adapterCode.includes('gemini-offline'), 'Must not return gemini-offline in client response');
assert(!adapterCode.includes('GEMINI_API_KEY configuration'), 'Must not leak GEMINI_API_KEY in error message content');
console.log('  [PASS] GeminiAiAdapter safely abstracts all client responses to BenefitOS AI.');

// 4. Auditing Backend AI Service Persona & System Prompt
console.log('\n4. Verifying Backend System Instruction Persona...');
const servicePath = path.join(__dirname, '../apps/backend/src/modules/ai/ai.service.ts');
const serviceCode = fs.readFileSync(servicePath, 'utf-8');

assert(serviceCode.includes('BenefitOS AI Citizen Copilot'), 'Must instruct model with BenefitOS AI Citizen Copilot identity');
assert(serviceCode.includes('STRICT ELIGIBILITY & EVIDENCE RULES:'), 'Must enforce evidence-based eligibility rules');
assert(serviceCode.includes('Final eligibility, benefit disbursement, and application approval are determined'), 'Must enforce official disclaimer in system prompt');
assert(serviceCode.includes('STRUCTURED RESPONSE FORMATTING:'), 'Must instruct structured section formatting');
console.log('  [PASS] Backend system prompt rigorously enforces government welfare assistance officer persona.');

// 5. Auditing Screen Integration
console.log('\n5. Verifying Screen Integration & Error Handling...');
const copilotScreenPath = path.join(__dirname, '../apps/frontend/src/screens/ai/AiCopilotScreen.tsx');
const copilotCode = fs.readFileSync(copilotScreenPath, 'utf-8');
assert(copilotCode.includes('StructuredAiResponseRenderer'), 'AiCopilotScreen must use StructuredAiResponseRenderer');
assert(copilotCode.includes('BenefitOS AI Citizen Copilot'), 'AiCopilotScreen loading state must use official branding');

const assistantScreenPath = path.join(__dirname, '../apps/frontend/src/screens/ai/AiAssistantScreen.tsx');
const assistantCode = fs.readFileSync(assistantScreenPath, 'utf-8');
assert(assistantCode.includes('StructuredAiResponseRenderer'), 'AiAssistantScreen must use StructuredAiResponseRenderer');

console.log('  [PASS] AiCopilotScreen and AiAssistantScreen successfully unified with StructuredAiResponseRenderer.');

console.log('\n====================================================');
console.log(' ALL AI COPILOT REDESIGN CHECKS PASSED (100%)');
console.log('====================================================');
