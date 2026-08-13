import * as dotenv from 'dotenv';
dotenv.config();

import { AuthService } from './modules/auth/auth.service';
import { UserEntity, UserRole } from './domain/user/user.entity';
import { CitizenEntity, Gender, MaritalStatus, SocialCategory, EmploymentStatus, DisabilityType } from './domain/citizen/citizen.entity';
import { EligibilityEvaluatorService } from './modules/recommendation/services/eligibility-evaluator.service';
import { WelfareSchemeEntity, SchemeCategory } from './domain/welfare/scheme.entity';
import { RegisterDto, LoginDto } from './modules/auth/dto/auth.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

console.log('====================================================');
console.log('   BENEFITOS — REGISTRATION TO PROFILE FLOW TEST   ');
console.log('====================================================\n');

// Mock Repositories
const users = new Map<string, UserEntity>();
const citizens = new Map<string, CitizenEntity>();

const mockUserRepo: any = {
  findByEmail: async (email: string) => Array.from(users.values()).find(u => u.email === email) || null,
  save: async (user: UserEntity) => { users.set(user.id, user); return user; },
  findById: async (id: string) => users.get(id) || null,
  update: async (user: UserEntity) => { users.set(user.id, user); return user; },
};

const mockCitizenRepo: any = {
  save: async (c: CitizenEntity) => { citizens.set(c.userId, c); return c; },
  findByUserId: async (uid: string) => citizens.get(uid) || null,
};

const mockJwtService: any = {
  sign: () => 'mock-jwt-token-xyz',
};

const mockRedisService: any = {
  set: async () => 'OK',
  get: async () => null,
  del: async () => 1,
};

const authService = new AuthService(mockUserRepo, mockCitizenRepo, mockJwtService, mockRedisService);
const evaluator = new EligibilityEvaluatorService();

async function runRegistrationFlowTest() {
  console.log('1. Testing Standards-Based Email Validation (Invalid Emails Rejection)...');
  const invalidEmails = [
    'divyansh.@gmail.com',
    '@gmail.com',
    'divyansh@gmail',
    'divyansh gmail.com',
    'divyansh@.com',
    'divyansh@com',
  ];

  for (const badEmail of invalidEmails) {
    const badDto = plainToInstance(RegisterDto, {
      name: 'Test Citizen',
      age: 25,
      category: 'GENERAL',
      profession: 'EMPLOYED',
      annualIncome: 300000,
      state: 'Delhi',
      email: badEmail,
      password: 'SecurePassword123!',
    });
    const errors = await validate(badDto);
    const emailError = errors.find(e => e.property === 'email');
    if (!emailError) {
      throw new Error(`Expected invalid email '${badEmail}' to fail RegisterDto validation!`);
    }
    console.log(`  [PASS] Rejected invalid email: '${badEmail}' (${emailError.constraints?.isEmail})`);
  }

  console.log('\n2. Testing Standards-Based Email Validation (Valid Emails Acceptance)...');
  const validEmails = [
    'divyansh@gmail.com',
    'test.user@gmail.com',
    'student123@example.com',
    'user+benefitos@gmail.com',
  ];

  for (const goodEmail of validEmails) {
    const goodDto = plainToInstance(RegisterDto, {
      name: 'Test Citizen',
      age: 25,
      category: 'GENERAL',
      profession: 'EMPLOYED',
      annualIncome: 300000,
      state: 'Delhi',
      email: goodEmail,
      password: 'SecurePassword123!',
    });
    const errors = await validate(goodDto);
    if (errors.length > 0) {
      throw new Error(`Expected valid email '${goodEmail}' to pass validation! Errors: ${JSON.stringify(errors)}`);
    }
    console.log(`  [PASS] Accepted valid email: '${goodEmail}'`);
  }

  console.log('\n3. Testing Exact User Report (Divyansh Gupta, 23, ST, Student, ₹1000, Delhi, divyansh@gmail.com)...');
  const divyanshPayload = {
    name: 'Divyansh Gupta',
    age: 23,
    category: 'ST',
    profession: 'STUDENT',
    annualIncome: 1000,
    state: 'Delhi',
    email: 'divyansh@gmail.com',
    password: 'SecurePassword123!',
  };

  const divyanshDto = plainToInstance(RegisterDto, divyanshPayload);
  const divyanshErrors = await validate(divyanshDto);
  if (divyanshErrors.length > 0) {
    throw new Error(`Divyansh Gupta registration DTO validation failed: ${JSON.stringify(divyanshErrors)}`);
  }
  console.log('  [PASS] Divyansh Gupta RegisterDto validation succeeded');

  const divyanshReg = await authService.register(divyanshDto);
  console.log(`  [PASS] Registration successful for user ID: ${divyanshReg.user.id}, role: ${divyanshReg.user.role}`);
  if (divyanshReg.user.role !== UserRole.CITIZEN) throw new Error('Role must be CITIZEN');

  const divyanshProfile = await mockCitizenRepo.findByUserId(divyanshReg.user.id);
  if (!divyanshProfile) throw new Error('CitizenProfile was NOT created!');
  console.log(`  [PASS] Persisted Profile: ${divyanshProfile.firstName} ${divyanshProfile.lastName}, Age: ${divyanshProfile.age}, State: ${divyanshProfile.address?.state}, Category: ${divyanshProfile.socialCategory}, Profession: ${divyanshProfile.employmentStatus}`);

  if (divyanshProfile.socialCategory !== SocialCategory.ST) throw new Error('Category must be ST');
  if (divyanshProfile.employmentStatus !== EmploymentStatus.STUDENT) throw new Error('Profession must be STUDENT');
  if (divyanshProfile.address?.state !== 'Delhi') throw new Error('State must be Delhi');

  console.log('\n4. Testing Duplicate Email Registration Conflict (HTTP 409)...');
  try {
    await authService.register(divyanshDto);
    throw new Error('Expected duplicate registration to throw ConflictException!');
  } catch (err: any) {
    if (err.status === 409 || err.message?.includes('already exists')) {
      console.log(`  [PASS] Duplicate registration rejected with ConflictException: ${err.message}`);
    } else {
      throw err;
    }
  }

  console.log('\n5. Testing Persona B (Priya Sharma, 20, OBC, Student, ₹150000, Uttar Pradesh)...');
  const personaBDto = plainToInstance(RegisterDto, {
    name: 'Priya Sharma',
    age: 20,
    category: 'OBC',
    profession: 'STUDENT',
    annualIncome: 150000,
    state: 'Uttar Pradesh',
    email: 'priya.sharma@example.gov.in',
    phone: '9876543210',
    password: 'SecurePassword123!',
  });
  const personaBErrors = await validate(personaBDto);
  if (personaBErrors.length > 0) throw new Error('Persona B validation failed');
  const personaBReg = await authService.register(personaBDto);
  console.log(`  [PASS] Persona B registered: ${personaBReg.user.id}`);

  console.log('\n6. Testing Persona C (Ramesh Patel, 45, GENERAL, FARMER, ₹200000, Uttar Pradesh)...');
  const personaCDto = plainToInstance(RegisterDto, {
    name: 'Ramesh Patel',
    age: 45,
    category: 'GENERAL',
    profession: 'FARMER',
    annualIncome: 200000,
    state: 'Uttar Pradesh',
    email: 'ramesh.patel@example.gov.in',
    password: 'SecurePassword123!',
  });
  const personaCErrors = await validate(personaCDto);
  if (personaCErrors.length > 0) throw new Error('Persona C validation failed');
  const personaCReg = await authService.register(personaCDto);
  console.log(`  [PASS] Persona C registered: ${personaCReg.user.id}`);

  console.log('\n7. Testing Persona D (Shanti Devi, 65, GENERAL, RETIRED, ₹100000, Uttar Pradesh)...');
  const personaDDto = plainToInstance(RegisterDto, {
    name: 'Shanti Devi',
    age: 65,
    category: 'GENERAL',
    profession: 'RETIRED',
    annualIncome: 100000,
    state: 'Uttar Pradesh',
    email: 'shanti.devi@example.gov.in',
    password: 'SecurePassword123!',
  });
  const personaDErrors = await validate(personaDDto);
  if (personaDErrors.length > 0) throw new Error('Persona D validation failed');
  const personaDReg = await authService.register(personaDDto);
  console.log(`  [PASS] Persona D registered: ${personaDReg.user.id}`);

  console.log('\n8. Verifying Login Flow for newly registered user (Divyansh Gupta)...');
  const loginResult = await authService.login({
    email: 'divyansh@gmail.com',
    password: 'SecurePassword123!',
  });
  console.log(`  [PASS] Login successful, issued accessToken: ${loginResult.accessToken ? 'YES' : 'NO'}`);
  console.log(`  [PASS] Authenticated user ID: ${loginResult.user.id}, role: ${loginResult.user.role}`);

  console.log('\n9. Verifying Instant Scheme Recommendations from newly registered profile...');
  const upScholarship = new WelfareSchemeEntity({
    id: 'sch-up-scholarship',
    code: 'UP-POST-MATRIC-SCHOLARSHIP',
    title: 'UP Post Matric Scholarship for OBC Students',
    description: 'Scholarship assistance for students.',
    category: SchemeCategory.EDUCATION,
    department: 'Backward Classes Welfare Dept, UP',
    financialBenefit: 50000,
    isCentralScheme: false,
    isActive: true,
    state: 'Uttar Pradesh',
    eligibilityRules: [
      { id: 'r-1', attributeKey: 'socialCategory', operator: 'EQUALS', targetValue: 'OBC', isRequired: true, description: 'Must belong to OBC category' },
      { id: 'r-2', attributeKey: 'employmentStatus', operator: 'EQUALS', targetValue: 'STUDENT', isRequired: true, description: 'Must be actively enrolled as a student' },
      { id: 'r-3', attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '250000', isRequired: true, description: 'Family income must not exceed 2.5 LPA' },
    ],
  });

  const personaBCitizen = await mockCitizenRepo.findByUserId(personaBReg.user.id);
  const recB = evaluator.evaluateEligibility(personaBCitizen!, upScholarship);
  console.log(`  [PASS] Persona B (UP OBC Student) match: ${recB.matchPercentage}% | Eligible: ${recB.isEligible}`);
  if (!recB.isEligible) throw new Error('Persona B must be eligible for UP OBC Scholarship');

  const recDivyansh = evaluator.evaluateEligibility(divyanshProfile, upScholarship);
  console.log(`  [PASS] Divyansh Gupta (Delhi ST Student) match on UP Scheme: ${recDivyansh.matchPercentage}% | Eligible: ${recDivyansh.isEligible} (State Domicile Block)`);
  if (recDivyansh.isEligible) throw new Error('Delhi citizen must be ineligible for UP-only scheme');

  console.log('\n====================================================');
  console.log('   REGISTRATION -> PROFILE -> REC TEST: PASS       ');
  console.log('====================================================');
}

runRegistrationFlowTest().catch((err) => {
  console.error('Registration flow test failed:', err);
  process.exit(1);
});
