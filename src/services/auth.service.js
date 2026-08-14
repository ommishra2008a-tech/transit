import sol from '../lib/solarch';

/**
 * Login with email and password via Solarch auth collection
 */
export async function login(email, password) {
  try {
    const authData = await sol.collection('users').authWithPassword(email, password);
    return authData;
  } catch (err) {
    console.error('Solarch auth error:', err.message || err);
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
