const http = require('http');

const BASE_URL = 'http://127.0.0.1:4000/api/v1';

function request(method: string, path: string, headers: Record<string, string> = {}, body?: any): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const reqBody = body ? (typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body)) : null;

    const reqHeaders: Record<string, string> = {
      Connection: 'close',
      ...headers,
    };

    if (reqBody && !reqHeaders['Content-Type']) {
      reqHeaders['Content-Type'] = 'application/json';
    }
    if (reqBody) {
      reqHeaders['Content-Length'] = String(Buffer.byteLength(reqBody));
    }

    const opts = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: reqHeaders,
    };

    const req = http.request(opts, (res: any) => {
      let raw = '';
      res.on('data', (chunk: any) => (raw += chunk));
      res.on('end', () => {
        let parsed = raw;
        try {
          parsed = JSON.parse(raw);
        } catch {}
        resolve({ status: res.statusCode || 0, body: parsed });
      });
    });

    req.on('error', reject);
    if (reqBody) req.write(reqBody);
    req.end();
  });
}

async function runRuntimeAudit() {
  console.log('====================================================');
  console.log(' BENEFITOS — PHASE 6 PRODUCTION RUNTIME AUDIT SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, title: string, details?: string) {
    if (condition) {
      console.log(`[PASS] ${title}`);
      passed++;
    } else {
      console.error(`[FAIL] ${title} - Details: ${details || 'None'}`);
      failed++;
    }
  }

  async function step(name: string, fn: () => Promise<void>) {
    try {
      await fn();
    } catch (err: any) {
      console.error(`[ERROR] ${name}:`, err.message || err);
      failed++;
    }
  }

  let accessToken = '';
  let refreshToken = '';
  let authHeaders: Record<string, string> = {};
  const testEmail = `test_citizen_${Date.now()}@example.com`;

  // 1. Health Endpoint
  await step('1. Health Check', async () => {
    const health = await request('GET', '/health');
    assert(
      health.status === 200 && health.body?.data?.info?.database?.status === 'up',
      '1. GET /health returns 200 & database up'
    );
  });

  // 2. Register synthetic user
  await step('2. Register User', async () => {
    const regRes = await request('POST', '/auth/register', {}, {
      email: testEmail,
      password: 'TestPassword123!',
    });
    accessToken = regRes.body?.data?.tokens?.accessToken || '';
    assert(regRes.status === 201 && !!regRes.body?.data?.user?.id, '2. POST /auth/register creates user');
  });

  // 3. Login user
  await step('3. Login User', async () => {
    const loginRes = await request('POST', '/auth/login', {}, {
      email: testEmail,
      password: 'TestPassword123!',
    });
    accessToken = loginRes.body?.data?.tokens?.accessToken || accessToken;
    refreshToken = loginRes.body?.data?.tokens?.refreshToken || '';
    authHeaders = { Authorization: `Bearer ${accessToken}` };
    assert(loginRes.status === 200 && !!accessToken, '3. POST /auth/login returns accessToken');
  });

  // 4. Invalid Login
  await step('4. Invalid Login', async () => {
    const badLogin = await request('POST', '/auth/login', {}, {
      email: testEmail,
      password: 'WrongPassword!',
    });
    assert(badLogin.status === 401, '4. POST /auth/login with invalid password returns 401');
  });

  // 5. Missing Token
  await step('5. Unauthorized Access', async () => {
    const noTokenRes = await request('GET', '/citizens/me');
    assert(noTokenRes.status === 401, '5. GET /citizens/me without token returns 401');
  });

  // 6. Profile PUT & GET
  await step('6. Profile Management', async () => {
    const profilePut = await request('PUT', '/citizens/me', authHeaders, {
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: '1990-01-01T00:00:00.000Z',
      gender: 'MALE',
      maritalStatus: 'SINGLE',
      socialCategory: 'GENERAL',
      employmentStatus: 'UNEMPLOYED',
      annualIncomeINR: 50000,
      disabilityType: 'NONE',
      disabilityPercent: 0,
      isBplCardHolder: false,
    });
    assert(profilePut.status === 200 || profilePut.status === 201, '6a. PUT /citizens/me creates profile');

    const profileRes = await request('GET', '/citizens/me', authHeaders);
    assert(
      profileRes.status === 200 && profileRes.body?.data?.profile?.firstName === 'Test',
      '6b. GET /citizens/me returns user profile',
      JSON.stringify(profileRes.body)
    );
  });

  // 7. Welfare Schemes
  await step('7. Welfare Schemes List', async () => {
    const schemesRes = await request('GET', '/schemes');
    assert(
      schemesRes.status === 200 && Array.isArray(schemesRes.body?.data?.schemes),
      '7. GET /schemes returns seeded schemes'
    );
  });

  // 8. Recommendations
  await step('8. Recommendations Engine', async () => {
    const recsRes = await request('GET', '/recommendations', authHeaders);
    assert(recsRes.status === 200, '8. GET /recommendations returns calculation status');
  });

  // 9 & 10. Document Classification & Upload Anti-Spoofing
  await step('9 & 10. Document Classification & Storage Isolation', async () => {
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const aadhaarContent = 'Government of India Unique Identification Authority of India UIDAI Mera Aadhaar 1234 5678 9012';
    const dlContent = 'Union of India Driving Licence Transport Department DL No DL-1420110012345 Authorisation to drive Motor Vehicles';

    // Mismatched upload
    let multipartMismatched =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="documentType"\r\n\r\nAADHAAR\r\n` +
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="aadhaar.pdf"\r\n` +
      `Content-Type: application/pdf\r\n\r\n` +
      `${dlContent}\r\n` +
      `--${boundary}--\r\n`;

    const mismatchedUpload = await request('POST', '/documents/upload', {
      ...authHeaders,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    }, multipartMismatched);

    assert(
      mismatchedUpload.status === 400 && JSON.stringify(mismatchedUpload.body).includes('Incorrect document'),
      '9. POST /documents/upload rejects mismatched document (Required AADHAAR + actual Driving Licence)'
    );

    // Matched upload
    let multipartMatched =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="documentType"\r\n\r\nAADHAAR\r\n` +
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="my_aadhaar.pdf"\r\n` +
      `Content-Type: application/pdf\r\n\r\n` +
      `${aadhaarContent}\r\n` +
      `--${boundary}--\r\n`;

    const matchedUpload = await request('POST', '/documents/upload', {
      ...authHeaders,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    }, multipartMatched);

    assert(
      matchedUpload.status === 201 && matchedUpload.body?.data?.document?.verificationStatus === 'VERIFIED',
      '10. POST /documents/upload accepts & verifies matched document (AADHAAR)'
    );
  });

  // 11. Document List
  await step('11. Document Vault List', async () => {
    const docListRes = await request('GET', '/documents', authHeaders);
    assert(
      docListRes.status === 200 && (docListRes.body?.data?.documents?.length === 1 || docListRes.body?.data?.count === 1),
      '11. GET /documents lists verified uploaded document'
    );
  });

  // 12 & 13. Draft & Get Application
  await step('12 & 13. Application Workflow', async () => {
    const schemesRes = await request('GET', '/schemes');
    const rawSchemes = schemesRes.body?.data?.schemes;
    const schemeId = Array.isArray(rawSchemes) && rawSchemes[0]?.id ? rawSchemes[0].id : 'a1111111-1111-1111-1111-111111111111';
    
    const draftRes = await request('POST', '/applications/draft', authHeaders, {
      schemeId,
      formData: { applicantName: 'Test User', bankAccount: '123456789' },
    });
    const appId = draftRes.body?.data?.application?.id;
    assert(draftRes.status === 201 && !!appId, '12. POST /applications/draft creates application draft');

    if (appId) {
      const getApp = await request('GET', `/applications/${appId}`, authHeaders);
      assert(getApp.status === 200 && getApp.body?.data?.application?.id === appId, '13. GET /applications/:id retrieves draft application');
    }
  });

  // 14. Notifications List
  await step('14. Notifications List', async () => {
    const notifsRes = await request('GET', '/notifications', authHeaders);
    assert(notifsRes.status === 200, '14. GET /notifications lists user notifications');
  });

  // 15 & 16. Refresh & Logout
  await step('15 & 16. Refresh Token & Logout', async () => {
    if (refreshToken) {
      const refreshRes = await request('POST', '/auth/refresh', {}, { refreshToken });
      assert(refreshRes.status === 200 && !!refreshRes.body?.data?.tokens?.accessToken, '15. POST /auth/refresh returns new token');

      const logoutRes = await request('POST', '/auth/logout', authHeaders, { refreshToken });
      assert(logoutRes.status === 200, '16. POST /auth/logout invalidates session');
    }
  });

  console.log('\n----------------------------------------------------');
  console.log(`RUNTIME AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED out of ${passed + failed}`);
  console.log('----------------------------------------------------\n');

  process.exit(failed > 0 ? 1 : 0);
}

runRuntimeAudit();
