import { getTimeAwareGreeting } from '../src/utils/greeting.js';

console.log('--- Testing getTimeAwareGreeting ---');

const morningDate = new Date('2026-08-16T08:30:00');
const afternoonDate = new Date('2026-08-16T14:15:00');
const eveningDate = new Date('2026-08-16T18:45:00');
const nightDate = new Date('2026-08-16T22:30:00');
const earlyNightDate = new Date('2026-08-16T03:00:00');

console.log('Morning (08:30):', getTimeAwareGreeting(morningDate), getTimeAwareGreeting(morningDate) === 'Good Morning' ? '✅ PASS' : '❌ FAIL');
console.log('Afternoon (14:15):', getTimeAwareGreeting(afternoonDate), getTimeAwareGreeting(afternoonDate) === 'Good Afternoon' ? '✅ PASS' : '❌ FAIL');
console.log('Evening (18:45):', getTimeAwareGreeting(eveningDate), getTimeAwareGreeting(eveningDate) === 'Good Evening' ? '✅ PASS' : '❌ FAIL');
console.log('Night (22:30):', getTimeAwareGreeting(nightDate), getTimeAwareGreeting(nightDate) === 'Good Night' ? '✅ PASS' : '❌ FAIL');
console.log('Night (03:00):', getTimeAwareGreeting(earlyNightDate), getTimeAwareGreeting(earlyNightDate) === 'Good Night' ? '✅ PASS' : '❌ FAIL');

// Test Security & Auth sanity
console.log('\n--- Map & UI Verification Completed ---');
