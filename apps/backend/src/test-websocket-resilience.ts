import { strict as assert } from 'assert';
import { RealtimeGateway } from './modules/realtime/realtime.gateway';

console.log('====================================================');
console.log(' BENEFITOS — WEBSOCKET REALTIME & RESILIENCE SUITE  ');
console.log('====================================================\n');

async function runWebSocketTests() {
  const mockJwtService: any = {
    verify: (token: string, opts?: any) => {
      if (token === 'valid_token_user_1') {
        return { sub: 'usr-1111', role: 'CITIZEN', email: 'user1@example.com' };
      }
      if (token === 'valid_token_user_2') {
        return { sub: 'usr-2222', role: 'CITIZEN', email: 'user2@example.com' };
      }
      if (token === 'expired_token') {
        const err: any = new Error('jwt expired');
        err.name = 'TokenExpiredError';
        throw err;
      }
      throw new Error('invalid token');
    },
  };

  const mockAiService: any = {
    getSchemeInstructions: async (title: string, id?: string, lang?: string) => {
      if (title === 'FailScheme') {
        throw new Error('Upstream AI generation failed');
      }
      const isCached = title.includes('Cached');
      return {
        instructions: `Guidance for ${title}`,
        applicationUrl: 'https://scholarships.gov.in',
        schemeTitle: title,
        isCached,
      };
    },
  };

  process.env.JWT_SECRET = 'test-secret-key-16-bytes-min';
  const gateway = new RealtimeGateway(mockJwtService, mockAiService);

  // 1. Connection & Authentication Validation
  console.log('1. Testing WebSocket connection authentication & JWT verification...');
  let disconnected = false;
  let emittedEvents: Array<{ event: string; data: any }> = [];

  const createMockSocket = (token?: string, id = 'sock-1') => {
    disconnected = false;
    emittedEvents = [];
    const rooms = new Set<string>();
    return {
      id,
      handshake: {
        headers: {},
        auth: { token },
      },
      data: {} as any,
      join: (r: string) => rooms.add(r),
      rooms,
      emit: (event: string, data: any) => {
        emittedEvents.push({ event, data });
      },
      disconnect: (force: boolean) => {
        disconnected = true;
      },
    };
  };

  // Test 1a: Valid token connects successfully
  const validSocket = createMockSocket('Bearer valid_token_user_1');
  await gateway.handleConnection(validSocket as any);
  assert.equal(disconnected, false, 'Valid socket is not disconnected');
  assert.equal(validSocket.data.user.sub, 'usr-1111', 'User payload attached to socket data');
  assert(validSocket.rooms.has('user:usr-1111'), 'Socket automatically joined private user room');
  const ack = emittedEvents.find((e) => e.event === 'connection_ack');
  assert(ack && ack.data.status === 'CONNECTED', 'Received connection_ack with CONNECTED status');
  console.log('  [PASS] Authenticated client connected, verified, and joined private room');

  // Test 1b: Expired token rejected
  console.log('\n2. Testing expired JWT rejection...');
  const expiredSocket = createMockSocket('expired_token');
  await gateway.handleConnection(expiredSocket as any);
  assert.equal(disconnected, true, 'Expired socket was immediately disconnected');
  const errEvent = emittedEvents.find((e) => e.event === 'error');
  assert(errEvent && errEvent.data.code === 'UNAUTHORIZED', 'Error event with UNAUTHORIZED emitted');
  console.log('  [PASS] Expired JWT properly rejected and connection severed');

  // Test 2: Token Refresh & Re-authentication
  console.log('\n3. Testing in-session re-authentication on token refresh...');
  const reauthSocket = createMockSocket('valid_token_user_1', 'sock-reauth');
  await gateway.handleConnection(reauthSocket as any);
  const reauthResult = await gateway.handleReauthenticate({ token: 'valid_token_user_2' }, reauthSocket as any);
  assert.equal(reauthResult.status, 'AUTHENTICATED', 'Reauthentication succeeded');
  assert.equal(reauthSocket.data.user.sub, 'usr-2222', 'Socket data updated with refreshed user ID');
  console.log('  [PASS] Reauthentication seamlessly refreshed socket user credentials');

  // Test 3: AI Guidance Request Flow with Correlation IDs
  console.log('\n4. Testing AI guidance request flow with correlation IDs & event lifecycle...');
  const clientSocket = createMockSocket('Bearer valid_token_user_1', 'sock-guidance');
  await gateway.handleConnection(clientSocket as any);
  emittedEvents = [];

  const requestId1 = 'corr-id-998877';
  await gateway.handleRequestGuidance(
    {
      requestId: requestId1,
      schemeTitle: 'PM-KISAN Samman Nidhi',
      schemeId: 'sch-pmk',
      language: 'en',
    },
    clientSocket as any,
  );

  const startEvent = emittedEvents.find((e) => e.event === 'guidance_started');
  assert(startEvent, 'guidance_started event emitted');
  assert.equal(startEvent?.data.requestId, requestId1, 'guidance_started preserves correlation ID');

  const compEvent = emittedEvents.find((e) => e.event === 'guidance_completed');
  assert(compEvent, 'guidance_completed event emitted');
  assert.equal(compEvent?.data.requestId, requestId1, 'guidance_completed preserves correlation ID');
  assert(compEvent?.data.instructions.includes('PM-KISAN'), 'Instructions delivered');
  console.log('  [PASS] Full event lifecycle verified with exact requestId correlation');

  // Test 4: Cached Guidance Event (guidance_cached)
  console.log('\n5. Testing cached guidance event emission...');
  emittedEvents = [];
  const requestIdCached = 'corr-id-cached-123';
  await gateway.handleRequestGuidance(
    {
      requestId: requestIdCached,
      schemeTitle: 'Cached-Scheme-Title',
      schemeId: 'sch-cached',
      language: 'en',
    },
    clientSocket as any,
  );

  const cachedEvent = emittedEvents.find((e) => e.event === 'guidance_cached');
  assert(cachedEvent, 'guidance_cached event emitted for cached entry');
  assert.equal(cachedEvent?.data.requestId, requestIdCached, 'guidance_cached preserves correlation ID');
  assert.equal(cachedEvent?.data.isCached, true, 'isCached is true');
  console.log('  [PASS] Cached guidance accurately emits guidance_cached event');

  // Test 5: Error Handling (guidance_failed)
  console.log('\n6. Testing guidance failure event emission...');
  emittedEvents = [];
  const requestIdFail = 'corr-id-fail-456';
  await gateway.handleRequestGuidance(
    {
      requestId: requestIdFail,
      schemeTitle: 'FailScheme',
      schemeId: 'sch-fail',
      language: 'en',
    },
    clientSocket as any,
  );

  const failEvent = emittedEvents.find((e) => e.event === 'guidance_failed');
  assert(failEvent, 'guidance_failed event emitted on error');
  assert.equal(failEvent?.data.requestId, requestIdFail, 'guidance_failed preserves correlation ID');
  console.log('  [PASS] Guidance failure gracefully handled with safe generic error');

  // Test 6: Multiple Simultaneous Users Isolation
  console.log('\n7. Testing multiple simultaneous users and event isolation...');
  const user1Sock = createMockSocket('Bearer valid_token_user_1', 'sock-u1');
  const user2Sock = createMockSocket('Bearer valid_token_user_2', 'sock-u2');
  await gateway.handleConnection(user1Sock as any);
  await gateway.handleConnection(user2Sock as any);

  assert(user1Sock.rooms.has('user:usr-1111'), 'User 1 is in room user:usr-1111');
  assert(!user1Sock.rooms.has('user:usr-2222'), 'User 1 is NOT in room user:usr-2222');
  assert(user2Sock.rooms.has('user:usr-2222'), 'User 2 is in room user:usr-2222');
  assert(!user2Sock.rooms.has('user:usr-1111'), 'User 2 is NOT in room user:usr-1111');
  console.log('  [PASS] Private room isolation verified across simultaneous users');

  console.log('\n====================================================');
  console.log(' ALL 7/7 WEBSOCKET REALTIME & RESILIENCE TESTS PASSED!');
  console.log('====================================================\n');
}

runWebSocketTests().catch((err) => {
  console.error('WebSocket test failed:', err);
  process.exit(1);
});
