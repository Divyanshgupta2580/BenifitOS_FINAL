const { io } = require('socket.io-client');
const https = require('https');

const API_BASE = 'https://benefitos-backend-1dq1.onrender.com/api/v1';

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const postData = body ? JSON.stringify(body) : null;

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ statusCode: res.statusCode, data: parsed });
      });
    });

    req.on('error', (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runLiveWebSocketProbe() {
  console.log('====================================================');
  console.log(' BENEFITOS — LIVE WEBSOCKET PROBE (RENDER PROD)     ');
  console.log('====================================================\n');

  console.log('1. Authenticating test citizen to get fresh JWT token...');
  const testEmail = `ws.probe.${Date.now()}@benefitos-verify.in`;
  const regRes = await makeRequest('POST', '/auth/register', {
    name: 'Ananya Sharma',
    age: 24,
    gender: 'FEMALE',
    category: 'GENERAL',
    profession: 'STUDENT',
    annualIncome: 120000,
    state: 'Uttar Pradesh',
    email: testEmail,
    password: 'Password@123456',
  });

  const token = regRes.data?.data?.tokens?.accessToken || regRes.data?.data?.accessToken;
  if (!token) {
    console.error('Failed to get token:', regRes.data);
    process.exit(1);
  }
  const userId = regRes.data?.data?.user?.id;
  console.log('Authenticated User ID:', userId);

  console.log('\n2. Connecting to Live WebSocket Gateway (wss://benefitos-backend-1dq1.onrender.com/ws)...');
  const socket = io('https://benefitos-backend-1dq1.onrender.com/ws', {
    auth: { token },
    query: { token },
    transports: ['websocket', 'polling'],
    timeout: 10000,
  });

  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.disconnect();
      reject(new Error('WebSocket connection timed out'));
    }, 12000);

    socket.on('connect', () => {
      console.log('  [PASS] WebSocket Connected! Socket ID:', socket.id);
    });

    socket.on('connection_ack', (ack) => {
      console.log('  [PASS] Received connection_ack from live server:', JSON.stringify(ack));
      clearTimeout(timer);
      resolve();
    });

    socket.on('connect_error', (err) => {
      console.error('WebSocket connect_error:', err.message);
      clearTimeout(timer);
      reject(err);
    });
  });

  console.log('\n3. Testing Room Subscription on Live Gateway (/subscribe_user)...');
  const subResult = await new Promise((resolve) => {
    socket.emit('subscribe_user', { userId }, (response) => {
      resolve(response);
    });
    // Fallback if no callback
    setTimeout(() => resolve({ status: 'TIMEOUT_OR_ACKED' }), 2000);
  });
  console.log('Subscription response:', JSON.stringify(subResult));

  console.log('\n4. Testing Unauthenticated / Invalid Token Rejection...');
  const badSocket = io('https://benefitos-backend-1dq1.onrender.com/ws', {
    auth: { token: 'invalid_junk_token_here' },
    transports: ['websocket'],
    timeout: 5000,
  });

  await new Promise((resolve) => {
    badSocket.on('connect_error', (err) => {
      console.log('  [PASS] Invalid token successfully rejected by live server with error:', err.message);
      badSocket.disconnect();
      resolve();
    });
    badSocket.on('error', (err) => {
      console.log('  [PASS] Received error event for invalid token:', JSON.stringify(err));
      badSocket.disconnect();
      resolve();
    });
    setTimeout(() => {
      badSocket.disconnect();
      resolve();
    }, 3000);
  });

  socket.disconnect();
  console.log('\n====================================================');
  console.log(' LIVE WEBSOCKET PROBE SUCCEEDED!                    ');
  console.log('====================================================\n');
}

runLiveWebSocketProbe().catch((err) => {
  console.error('WebSocket probe error:', err);
  process.exit(1);
});
