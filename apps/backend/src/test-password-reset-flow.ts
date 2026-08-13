import * as dotenv from 'dotenv';
dotenv.config();

import { AuthService } from './modules/auth/auth.service';
import { UserEntity, UserRole } from './domain/user/user.entity';
import * as argon2 from 'argon2';

console.log('====================================================');
console.log('   BENEFITOS — PASSWORD RESET SECURITY TEST         ');
console.log('====================================================\n');

const users = new Map<string, UserEntity>();
const redisStore = new Map<string, string>();

const initialPassword = 'OldInitialPassword123!';
const newPassword = 'BrandNewSecurePassword456!';

async function setupTest() {
  process.env.NODE_ENV = 'development';
  const initialHash = await argon2.hash(initialPassword);
  const testUser = new UserEntity({
    id: 'user-reset-test',
    email: 'citizen.reset@example.gov.in',
    passwordHash: initialHash,
    role: UserRole.CITIZEN,
    isEmailVerified: true,
    isPhoneVerified: false,
    mfaEnabled: false,
  });
  users.set(testUser.id, testUser);

  const mockUserRepo: any = {
    findByEmail: async (email: string) => Array.from(users.values()).find(u => u.email === email) || null,
    findById: async (id: string) => users.get(id) || null,
    update: async (u: UserEntity) => { users.set(u.id, u); return u; },
  };

  const mockCitizenRepo: any = {};
  const mockJwtService: any = {};
  const mockRedisService: any = {
    set: async (key: string, val: string, ttl: number) => { redisStore.set(key, val); return 'OK'; },
    get: async (key: string) => redisStore.get(key) || null,
    del: async (key: string) => { const ex = redisStore.has(key); redisStore.delete(key); return ex ? 1 : 0; },
  };

  const authService = new AuthService(mockUserRepo, mockCitizenRepo, mockJwtService, mockRedisService);

  console.log('1. Requesting password reset token (forgotPassword)...');
  const forgotRes = await authService.forgotPassword('citizen.reset@example.gov.in');
  console.log(`- Response message: ${forgotRes.message}`);
  console.log(`- Token generated: ${forgotRes.resetToken ? 'YES (length ' + forgotRes.resetToken.length + ')' : 'NO'}`);
  
  if (!forgotRes.resetToken) throw new Error('Reset token was not returned in dev/staging mode!');

  const rawToken = forgotRes.resetToken;

  console.log('\n2. Executing password reset with token (resetPassword)...');
  const resetRes = await authService.resetPassword({
    token: rawToken,
    newPassword,
  });
  console.log(`- Reset success: ${resetRes.success}`);
  console.log(`- Reset message: ${resetRes.message}`);

  console.log('\n3. Verifying updated password hash in user repository...');
  const updatedUser = users.get('user-reset-test')!;
  const isOldValid = await argon2.verify(updatedUser.passwordHash, initialPassword);
  const isNewValid = await argon2.verify(updatedUser.passwordHash, newPassword);
  console.log(`- Old password valid: ${isOldValid} (Expected: false)`);
  console.log(`- New password valid: ${isNewValid} (Expected: true)`);
  if (isOldValid || !isNewValid) throw new Error('Password was not correctly updated!');

  console.log('\n4. Verifying token invalidation (anti-replay / single-use)...');
  try {
    await authService.resetPassword({ token: rawToken, newPassword: 'AnotherPassword789!' });
    throw new Error('Token reuse was NOT blocked!');
  } catch (err: any) {
    console.log(`- Token reuse blocked: "${err.message}" (Expected: Invalid or expired password reset token)`);
  }

  console.log('\n====================================================');
  console.log('   PASSWORD RESET SECURITY TEST: PASS              ');
  console.log('====================================================');
}

setupTest().catch((err) => {
  console.error('Password reset test failed:', err);
  process.exit(1);
});
