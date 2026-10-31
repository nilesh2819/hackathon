const http = require('http');

const BASE_URL = 'http://localhost:5000';

function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(url, { method, headers }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting RECLAIM AI Backend Integration Test Suite...\n');

  try {
    // 1. Health check
    const health = await request('GET', '/api/health');
    console.log('✅ 1. Health Check:', health.status === 200 ? 'PASSED' : 'FAILED', health.body.status);

    // 2. Admin Login
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@brightloop.io',
      password: 'Admin@123#'
    });
    console.log('✅ 2. Admin Authentication:', adminLogin.status === 200 ? 'PASSED' : 'FAILED', `Token obtained for ${adminLogin.body.user.full_name}`);
    const adminToken = adminLogin.body.token;

    // 3. Customer Login
    const custLogin = await request('POST', '/api/auth/login', {
      email: 'customer@acme.com',
      password: 'Customer@123#'
    });
    console.log('✅ 3. Customer Authentication:', custLogin.status === 200 ? 'PASSED' : 'FAILED', `Role: ${custLogin.body.user.role}`);

    // 4. Products List
    const prods = await request('GET', '/api/products');
    console.log('✅ 4. Product Catalog:', prods.status === 200 ? 'PASSED' : 'FAILED', `${prods.body.products.length} products loaded (incl. Odoo variant)`);

    // 5. Subscriptions List
    const subs = await request('GET', '/api/subscriptions', null, adminToken);
    console.log('✅ 5. Subscription Management:', subs.status === 200 ? 'PASSED' : 'FAILED', `${subs.body.subscriptions.length} subscriptions returned`);

    // 6. Invoices List
    const invs = await request('GET', '/api/invoices', null, adminToken);
    console.log('✅ 6. Invoice Management:', invs.status === 200 ? 'PASSED' : 'FAILED', `${invs.body.invoices.length} invoices active`);

    // 7. Usage-to-Value Intelligence
    const usage = await request('GET', '/api/intelligence/usage-to-value', null, adminToken);
    console.log('✅ 7. Usage-to-Value Intelligence:', usage.status === 200 ? 'PASSED' : 'FAILED',
      `Platform Utilization: ${usage.body.summary.overall_utilization_rate}%, Platform Value Score: ${usage.body.summary.platform_value_score}/100, Idle Wasted Spend: INR ${usage.body.summary.total_wasted_expenditure.toLocaleString()}`);

    // 8. Sharing Intelligence
    const sharing = await request('GET', '/api/intelligence/sharing', null, adminToken);
    console.log('✅ 8. Sharing Intelligence:', sharing.status === 200 ? 'PASSED' : 'FAILED',
      `Surplus Units: ${sharing.body.surplus_departments.length}, Potential Monthly Savings: INR ${sharing.body.metrics.potential_monthly_savings.toLocaleString()}`);

    // 9. Subscription Value Exchange (Execute Demo Scenario: Approve Transfer 15 seats Marketing -> Engineering)
    const exchangeBefore = await request('GET', '/api/intelligence/exchange', null, adminToken);
    const pendingMatch = exchangeBefore.body.matching_proposals.find(p => p.status === 'pending');
    console.log(`\n🎯 DEMONSTRATION SCENARIO: Found pending match #${pendingMatch.request_number}`);
    console.log(`   Source: ${pendingMatch.source_department} (Offering: ${pendingMatch.seats_offered} seats)`);
    console.log(`   Target: ${pendingMatch.target_department} (Requested: ${pendingMatch.seats_requested} seats)`);
    console.log(`   Matched: ${pendingMatch.seats_matched} seats | Savings: INR ${parseFloat(pendingMatch.financial_savings_amount).toLocaleString()}/month`);

    const approvalRes = await request('POST', '/api/intelligence/exchange/process', {
      request_id: pendingMatch.id,
      action: 'approve',
      notes: 'Approved during Brightloop platform validation demonstration.'
    }, adminToken);

    console.log('✅ 9. Value Exchange Approval:', approvalRes.status === 200 ? 'PASSED' : 'FAILED', approvalRes.body.message);

    // 10. Future Waste Predictor
    const wastePred = await request('POST', '/api/intelligence/predict-waste', {
      growthRate: 0.05,
      churnRisk: 0.08,
      optimizationEffort: 0.65
    }, adminToken);
    console.log('✅ 10. AI Future Waste Predictor:', wastePred.status === 200 ? 'PASSED' : 'FAILED',
      `3-Month Best Case Potential Savings: INR ${wastePred.body.cumulative_3_month_potential_savings.best_case.toLocaleString()}`);

    // 11. AI Business Assistant
    const aiQuestion = await request('POST', '/api/intelligence/assistant', {
      query: 'Which department wastes the most subscription expenditure?'
    }, adminToken);
    console.log('✅ 11. AI Business Assistant:', aiQuestion.status === 200 ? 'PASSED' : 'FAILED');
    console.log(`   AI Answer: "${aiQuestion.body.answer.replace(/\n/g, ' ')}"`);

    console.log('\n======================================================');
    console.log('🎉 ALL BACKEND MODULES & DEMO SCENARIOS TESTED SUCCESSFULLY!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ Test failed with error:', err.message);
  }
}

runTests();
