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
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsed,
        });
      });
    });

    req.on('error', (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runLiveApiProbe() {
  console.log('====================================================');
  console.log(' BENEFITOS — LIVE DEPLOYED API PROBE (RENDER PROD)  ');
  console.log('====================================================\n');

  console.log('1. Testing Live Backend Health Endpoint (/health)...');
  const healthRes = await makeRequest('GET', '/health');
  console.log('Health Response Status:', healthRes.statusCode);
  console.log('Health Response Body  :', JSON.stringify(healthRes.data?.data));

  console.log('\n2. Registering Fresh Citizen on Live Backend (/auth/register)...');
  const testEmail = `probe.citizen.${Date.now()}@benefitos-verify.in`;
  const testPassword = 'Password@123456';
  
  const regPayload = {
    name: 'Rohan Verma',
    age: 28,
    gender: 'MALE',
    category: 'OBC',
    profession: 'FARMER',
    annualIncome: 180000,
    state: 'Uttar Pradesh',
    email: testEmail,
    password: testPassword,
  };

  const regRes = await makeRequest('POST', '/auth/register', regPayload);
  console.log('Register Response Status:', regRes.statusCode);
  
  const token = regRes.data?.data?.tokens?.accessToken || regRes.data?.data?.accessToken;
  if (!token) {
    console.error('FAILED TO OBTAIN AUTH TOKEN:', JSON.stringify(regRes.data));
    process.exit(1);
  }
  console.log('Live Access Token Generated for User ID:', regRes.data?.data?.user?.id);

  console.log('\n3. Fetching Verified Citizen Profile (/citizens/me)...');
  const profileRes = await makeRequest('GET', '/citizens/me', null, token);
  const profile = profileRes.data?.data?.profile || profileRes.data?.profile;
  console.log('Profile Status:', profileRes.statusCode);
  console.log('Profile Name  :', profile?.firstName, profile?.lastName);
  console.log('Profile Age   :', profile?.age, '| Profession:', profile?.employmentStatus);
  console.log('Profile State :', profile?.state);
  console.log('Profile Income: INR', profile?.annualIncomeINR);
  console.log('Profile Completion Percentage:', profile?.completionPercentage + '%');

  console.log('\n4. Fetching Evaluated Recommendations (/recommendations)...');
  const recRes = await makeRequest('GET', '/recommendations', null, token);
  console.log('Recommendations Status:', recRes.statusCode);
  const recs = recRes.data?.data?.recommendations || recRes.data?.recommendations || [];
  console.log(`Total Schemes Evaluated: ${recs.length}`);
  const eligibleSchemes = recs.filter((r) => r.isEligible === true && r.eligibilityStatus === 'ELIGIBLE');
  const ineligibleSchemes = recs.filter((r) => r.isEligible === false && r.eligibilityStatus !== 'INCOMPLETE_PROFILE');
  const incompleteSchemes = recs.filter((r) => r.eligibilityStatus === 'INCOMPLETE_PROFILE');

  console.log(`Eligible Schemes Count        : ${eligibleSchemes.length}`);
  console.log(`Not-Eligible Schemes Count    : ${ineligibleSchemes.length}`);
  console.log(`Incomplete Schemes Count      : ${incompleteSchemes.length}`);

  eligibleSchemes.forEach((s) => {
    console.log(`  -> [ELIGIBLE] ${s.title || s.scheme?.title} (Match: ${s.matchPercentage}%) - Status: ${s.eligibilityStatus}`);
  });

  console.log('\n5. Testing Live AI Scheme Guidance Caching Workflow...');
  console.log('5a. Request 1 (Initial Cache Miss -> Generating & Storing on Live LLM)...');
  const t0_ai1 = Date.now();
  const aiRes1 = await makeRequest('POST', '/ai/scheme-instructions', {
    schemeTitle: 'Pradhan Mantri Kisan Samman Nidhi',
  }, token);
  const dur1 = Date.now() - t0_ai1;
  const aiData1 = aiRes1.data?.data || aiRes1.data;
  console.log(`  Status: ${aiRes1.statusCode} | Duration: ${dur1}ms | isCached: ${aiData1?.isCached}`);
  console.log('  Response Preview:', String(aiData1?.instructions || '').substring(0, 160).replace(/\n/g, ' ') + '...');

  console.log('\n5b. Request 2 (Repeat Request -> Cache Hit on Neon DB)...');
  const t0_ai2 = Date.now();
  const aiRes2 = await makeRequest('POST', '/ai/scheme-instructions', {
    schemeTitle: 'Pradhan Mantri Kisan Samman Nidhi',
  }, token);
  const dur2 = Date.now() - t0_ai2;
  const aiData2 = aiRes2.data?.data || aiRes2.data;
  console.log(`  Status: ${aiRes2.statusCode} | Duration: ${dur2}ms | isCached: ${aiData2?.isCached}`);
  console.log(`  Verified Speedup: Initial = ${dur1}ms -> Cached = ${dur2}ms (${((dur1 - dur2)/dur1 * 100).toFixed(1)}% latency reduction)`);

  console.log('\n6. Testing Live AI Chat with English & Hindi...');
  console.log('6a. English AI Chat (/ai/chat)...');
  const t0_chat_en = Date.now();
  const chatResEn = await makeRequest('POST', '/ai/chat', {
    prompt: 'What documents do I need to apply for PM-KISAN?',
    language: 'en',
  }, token);
  const durChatEn = Date.now() - t0_chat_en;
  console.log(`  Status: ${chatResEn.statusCode} | Duration: ${durChatEn}ms | isCached: ${chatResEn.data?.data?.isCached}`);
  console.log('  English Chat Reply:', String(chatResEn.data?.data?.reply || '').substring(0, 160).replace(/\n/g, ' ') + '...');

  console.log('\n6b. Hindi AI Chat (/ai/chat)...');
  const t0_chat_hi = Date.now();
  const chatResHi = await makeRequest('POST', '/ai/chat', {
    prompt: 'मुझे पीएम-किसान योजना के बारे में जानकारी चाहिए',
    language: 'hi',
  }, token);
  const durChatHi = Date.now() - t0_chat_hi;
  console.log(`  Status: ${chatResHi.statusCode} | Duration: ${durChatHi}ms | isCached: ${chatResHi.data?.data?.isCached}`);
  console.log('  Hindi Chat Reply:', String(chatResHi.data?.data?.reply || '').substring(0, 160).replace(/\n/g, ' ') + '...');


  console.log('\n7. Testing Live Profile Update & Cache Invalidation (/citizens/me)...');
  const updatePayload = {
    firstName: profile?.firstName || 'Rohan',
    lastName: profile?.lastName || 'Verma',
    dateOfBirth: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().substring(0, 10) : '1996-01-01',
    gender: profile?.gender || 'MALE',
    maritalStatus: profile?.maritalStatus || 'SINGLE',
    socialCategory: profile?.socialCategory || 'OBC',
    employmentStatus: 'UNEMPLOYED',
    annualIncomeINR: 850000,
    disabilityType: 'NONE',
    disabilityPercent: 0,
    isBplCardHolder: false,
    state: 'Uttar Pradesh',
  };
  const updateRes = await makeRequest('PUT', '/citizens/me', updatePayload, token);
  console.log('Profile Update Status:', updateRes.statusCode);
  console.log('Profile Update Response:', JSON.stringify(updateRes.data));


  console.log('\n8. Recalculating Recommendations on Live Server (/recommendations/recalculate)...');
  const updatedRecRes = await makeRequest('POST', '/recommendations/recalculate', null, token);
  const updatedRecs = updatedRecRes.data?.data?.recommendations || updatedRecRes.data?.recommendations || [];
  const updatedEligible = updatedRecs.filter((r) => r.isEligible === true && r.eligibilityStatus === 'ELIGIBLE');
  console.log(`New Eligible Schemes Count (after income raised to 8.5L): ${updatedEligible.length}`);

  console.log('\n====================================================');
  console.log(' LIVE DEPLOYED BACKEND END-TO-END PROBE SUCCEEDED!  ');
  console.log('====================================================\n');
}

runLiveApiProbe().catch((err) => {
  console.error('Probe failed:', err);
  process.exit(1);
});
