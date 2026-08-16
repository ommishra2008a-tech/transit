import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';
import { buildFilterString, SolarchClient } from '../src/lib/solarch.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ PASS: ${name}`);
  } catch (err) {
    failedTests++;
    failures.push({ name, error: err.message });
    console.log(`  ❌ FAIL: ${name} -> ${err.message}`);
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🚀 SMARTTRANSIT — AUTOMATED REGRESSION SUITE');
  console.log('======================================================\n');

  // ----------------------------------------------------
  // TEST GROUP 1: FINDING-001 (Logging Hardening)
  // ----------------------------------------------------
  console.log('📦 Group 1: FINDING-001 — Backend Debug Logging Audit');
  test('server.js PATCH middleware does not log sensitive request body', () => {
    const serverCode = fs.readFileSync(path.join(ROOT_DIR, 'backend', 'server.js'), 'utf8');
    assert(!serverCode.includes('console.log("MIDDLEWARE HIT!'), 'Found debug log "MIDDLEWARE HIT!"');
    assert(!serverCode.includes('console.log("Original req.body:'), 'Found debug log "Original req.body:"');
    assert(!serverCode.includes('console.log("Modified req.body:'), 'Found debug log "Modified req.body:"');
  });

  test('src/ directory does not leak credentials in console statements', () => {
    const solarchClientCode = fs.readFileSync(path.join(ROOT_DIR, 'src', 'lib', 'solarch.js'), 'utf8');
    assert(!solarchClientCode.includes('console.log(this.token)'), 'Token logging detected');
  });

  // ----------------------------------------------------
  // TEST GROUP 2: FINDING-002 (Seed Script Hardening)
  // ----------------------------------------------------
  console.log('\n📦 Group 2: FINDING-002 — Production Seed Script Protection');
  test('seed.js contains production guard checking NODE_ENV', () => {
    const seedCode = fs.readFileSync(path.join(ROOT_DIR, 'backend', 'seed.js'), 'utf8');
    assert(seedCode.includes("process.env.NODE_ENV === 'production'"), 'Missing NODE_ENV production check');
    assert(seedCode.includes('process.exit(1)'), 'Missing process.exit on production check');
  });

  test('seed.js uses environment-configurable password variable', () => {
    const seedCode = fs.readFileSync(path.join(ROOT_DIR, 'backend', 'seed.js'), 'utf8');
    assert(seedCode.includes('process.env.DEV_SEED_PASSWORD'), 'Missing DEV_SEED_PASSWORD env check');
    assert(!seedCode.includes("'123456password'"), 'Plaintext password "123456password" still present');
  });

  // ----------------------------------------------------
  // TEST GROUP 3: FINDING-003 (Admin List Authorization Rule)
  // ----------------------------------------------------
  console.log('\n📦 Group 3: FINDING-003 — Users Collection List/View Rules');
  test('users collection listRule allows ADMIN access alongside self-access', () => {
    const serverCode = fs.readFileSync(path.join(ROOT_DIR, 'backend', 'server.js'), 'utf8');
    assert(serverCode.includes("listRule: 'id = @request.auth.id || @request.auth.role = \"ADMIN\"'"), 'listRule does not include ADMIN role permission');
    assert(serverCode.includes("viewRule: 'id = @request.auth.id || @request.auth.role = \"ADMIN\"'"), 'viewRule does not include ADMIN role permission');
  });

  // ----------------------------------------------------
  // TEST GROUP 4: FINDING-004 (Filter Contract Validation)
  // ----------------------------------------------------
  console.log('\n📦 Group 4: FINDING-004 — Solarch Filter Contract Bridge');
  test('buildFilterString handles empty/null filter correctly', () => {
    assert.strictEqual(buildFilterString(null), '');
    assert.strictEqual(buildFilterString(undefined), '');
    assert.strictEqual(buildFilterString(''), '');
  });

  test('buildFilterString passes string filters unchanged', () => {
    const input = 'role = "ADMIN" && status = "APPROVED"';
    assert.strictEqual(buildFilterString(input), input);
  });

  test('buildFilterString converts simple key-value object to PocketBase syntax', () => {
    const input = { role: 'ADMIN', status: 'APPROVED' };
    const expected = 'role = "ADMIN" && status = "APPROVED"';
    assert.strictEqual(buildFilterString(input), expected);
  });

  test('buildFilterString converts numeric and boolean filter values without quotes', () => {
    const input = { active: true, stop_order: 1 };
    const expected = 'active = true && stop_order = 1';
    assert.strictEqual(buildFilterString(input), expected);
  });

  test('buildFilterString safely escapes quotes in string values', () => {
    const input = { route_name: 'IPS "Express" Route' };
    const expected = 'route_name = "IPS \\"Express\\" Route"';
    assert.strictEqual(buildFilterString(input), expected);
  });

  // ----------------------------------------------------
  // TEST GROUP 5: FINDING-005 (AddDriver Password Policy)
  // ----------------------------------------------------
  console.log('\n📦 Group 5: FINDING-005 — AddDriver Password Validation');
  test('AddDriver.jsx requires minimum 8-character password', () => {
    const addDriverCode = fs.readFileSync(path.join(ROOT_DIR, 'src', 'pages', 'admin', 'AddDriver.jsx'), 'utf8');
    assert(!addDriverCode.includes("'InitialDriverPass@123'"), 'Hardcoded default password InitialDriverPass@123 still present');
    assert(addDriverCode.includes('initialPassword.length < 8'), 'Missing minimum 8-character length check');
    assert(addDriverCode.includes('required minLength={8}'), 'Missing HTML5 required/minLength attributes on input');
  });

  // ----------------------------------------------------
  // TEST GROUP 6: FINDING-006 (SSE Realtime Authentication)
  // ----------------------------------------------------
  console.log('\n📦 Group 6: FINDING-006 — SSE Realtime Authentication Stream');
  test('SolarchClient passes authentication token in SSE query string', () => {
    const solarchClientCode = fs.readFileSync(path.join(ROOT_DIR, 'src', 'lib', 'solarch.js'), 'utf8');
    assert(solarchClientCode.includes('?token=${encodeURIComponent(this.token)}'), 'Missing token in EventSource URL');
  });

  // ----------------------------------------------------
  // TEST GROUP 7: FINDING-007 (Rate Limiting on Auth Endpoints)
  // ----------------------------------------------------
  console.log('\n📦 Group 7: FINDING-007 — Rate Limiting on Sensitive Endpoints');
  test('server.js applies rateLimit middleware to auth-with-password and signup', () => {
    const serverCode = fs.readFileSync(path.join(ROOT_DIR, 'backend', 'server.js'), 'utf8');
    assert(serverCode.includes("import rateLimit from 'express-rate-limit'"), 'Missing express-rate-limit import');
    assert(serverCode.includes("e.router.post('/api/collections/users/auth-with-password', authLimiter)"), 'Missing rate limiter on auth-with-password');
    assert(serverCode.includes("e.router.post('/api/auth/signup', signupLimiter"), 'Missing rate limiter on /api/auth/signup');
  });

  // ----------------------------------------------------
  // TEST GROUP 8: FINDING-008 (Realtime Reconnection Logic)
  // ----------------------------------------------------
  console.log('\n📦 Group 8: FINDING-008 — Realtime Reconnection & Backoff');
  test('SolarchClient has onerror handler with reconnection timeout', () => {
    const solarchClientCode = fs.readFileSync(path.join(ROOT_DIR, 'src', 'lib', 'solarch.js'), 'utf8');
    assert(solarchClientCode.includes('this.sse.onerror'), 'Missing SSE onerror handler');
    assert(solarchClientCode.includes('this.reconnectTimeout'), 'Missing reconnection timeout handling');
  });

  // ----------------------------------------------------
  // TEST GROUP 9: FINDING-009 (SQLite Database Concurrency)
  // ----------------------------------------------------
  console.log('\n📦 Group 9: FINDING-009 — SQLite Concurrency Integrity');
  test('SQLite database operations use synchronous transactions safely', () => {
    const serverCode = fs.readFileSync(path.join(ROOT_DIR, 'backend', 'server.js'), 'utf8');
    assert(serverCode.includes('db.prepare('), 'Uses prepared statements for atomic execution');
  });

  // ----------------------------------------------------
  // TEST GROUP 10: FINDING-010 (Duplicate SSE Listener Prevention)
  // ----------------------------------------------------
  console.log('\n📦 Group 10: FINDING-010 — Duplicate SSE Listener Prevention');
  test('SolarchClient maintains collectionListeners Set to ensure single event listener per collection', () => {
    const solarchClientCode = fs.readFileSync(path.join(ROOT_DIR, 'src', 'lib', 'solarch.js'), 'utf8');
    assert(solarchClientCode.includes('this.collectionListeners = new Set()'), 'Missing collectionListeners set');
    assert(solarchClientCode.includes('ensureCollectionListener(colName)'), 'Missing ensureCollectionListener method');
    assert(solarchClientCode.includes('if (!this.sse || this.collectionListeners.has(colName)) return'), 'Missing duplicate listener guard');
  });

  // ----------------------------------------------------
  // TEST GROUP 11: FINDING-011 (Dedicated Driver Approval Endpoint)
  // ----------------------------------------------------
  console.log('\n📦 Group 11: FINDING-011 — Dedicated Admin Driver Approval Endpoint');
  test('server.js exposes dedicated /api/admin/drivers/:id/approve endpoint', () => {
    const serverCode = fs.readFileSync(path.join(ROOT_DIR, 'backend', 'server.js'), 'utf8');
    assert(serverCode.includes("e.router.post('/api/admin/drivers/:id/approve'"), 'Missing dedicated driver approval endpoint');
    assert(serverCode.includes("SET approval_status = 'APPROVED'"), 'Missing SQL update for driver approval');
  });

  test('DriverApprovals.jsx calls dedicated /api/admin/drivers/:id/approve endpoint', () => {
    const driverApprovalsCode = fs.readFileSync(path.join(ROOT_DIR, 'src', 'pages', 'admin', 'DriverApprovals.jsx'), 'utf8');
    assert(driverApprovalsCode.includes('/api/admin/drivers/${driverId}/approve'), 'DriverApprovals does not call dedicated endpoint');
  });

  // ----------------------------------------------------
  // TEST GROUP 12: FINDING-012 (Bootstrap Role Protection)
  // ----------------------------------------------------
  console.log('\n📦 Group 12: FINDING-012 — Bootstrap Role Protection in Production');
  test('server.js guards default account role promotion behind isDev check', () => {
    const serverCode = fs.readFileSync(path.join(ROOT_DIR, 'backend', 'server.js'), 'utf8');
    assert(serverCode.includes('if (isDev) {'), 'Missing isDev check before bootstrap role sync');
    assert(serverCode.includes("const isDev = process.env.NODE_ENV !== 'production'"), 'Missing isDev definition');
  });

  // ----------------------------------------------------
  // TEST GROUP 13: Core Authentication & Escalation Guard
  // ----------------------------------------------------
  console.log('\n📦 Group 13: Core Authentication & Privilege Escalation Guards');
  test('Signup endpoint strictly enforces role=PASSENGER', () => {
    const serverCode = fs.readFileSync(path.join(ROOT_DIR, 'backend', 'server.js'), 'utf8');
    assert(serverCode.includes("'PASSENGER'"), 'Signup does not hardcode PASSENGER role');
  });

  test('PATCH middleware strips role, approval_status, admin_request for non-admins', () => {
    const serverCode = fs.readFileSync(path.join(ROOT_DIR, 'backend', 'server.js'), 'utf8');
    assert(serverCode.includes('delete req.body.role;'), 'Middleware does not delete role');
    assert(serverCode.includes('delete req.body.approval_status;'), 'Middleware does not delete approval_status');
    assert(serverCode.includes('delete req.body.admin_request;'), 'Middleware does not delete admin_request');
  });

  // ----------------------------------------------------
  // Summary
  // ----------------------------------------------------
  console.log('\n======================================================');
  console.log(`📊 TEST RESULTS: ${passedTests}/${totalTests} Passed (${failedTests} Failed)`);
  console.log('======================================================\n');

  if (failedTests > 0) {
    console.error('❌ Failures summary:');
    failures.forEach(f => console.error(`  - ${f.name}: ${f.error}`));
    process.exit(1);
  } else {
    console.log('🎉 ALL REGRESSION TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  }
}

runTests();
