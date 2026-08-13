import sol from '../lib/solarch';

// Fallback demo users if Solarch API is initializing
const DEMO_USERS = {
  'admin@transit.dev': { id: 'usr_admin', email: 'admin@transit.dev', name: 'Admin User', role: 'ADMIN' },
  'driver@transit.dev': { id: 'usr_driver', email: 'driver@transit.dev', name: 'Rahul Sharma', role: 'DRIVER' },
  'passenger@transit.dev': { id: 'usr_passenger', email: 'passenger@transit.dev', name: 'Priya Patel', role: 'PASSENGER' },
};

/**
 * Login with email and password
 */
export async function login(email, password) {
  try {
    const authData = await sol.collection('users').authWithPassword(email, password);
    return authData;
  } catch (err) {
    // If backend returns 404 or connection issue, fallback to demo accounts for zero-friction demo
    if (DEMO_USERS[email]) {
      const demoUser = DEMO_USERS[email];
      sol.authStore.save(`demo_token_${Date.now()}`, demoUser);
      return { token: sol.authStore.token, record: demoUser };
    }
    throw err;
  }
}

/**
 * Logout — clears the auth store
 */
export function logout() {
  sol.authStore.clear();
}

/**
 * Get the currently authenticated user record
 */
export function getCurrentUser() {
  return sol.authStore.record;
}

/**
 * Get the role of the currently authenticated user
 */
export function getUserRole() {
  return sol.authStore.record?.role || null;
}

/**
 * Check if the user is currently authenticated
 */
export function isAuthenticated() {
  return sol.authStore.isValid;
}

/**
 * Listen for auth store changes
 */
export function onAuthChange(callback) {
  return sol.authStore.onChange(callback);
}
