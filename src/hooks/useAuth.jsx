import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { solarch } from '../lib/solarch';

const AuthContext = createContext(null);

// Helper to safely read cached user from localStorage
function getCachedUser() {
  try {
    const cached = localStorage.getItem('solarch_user');
    const token = localStorage.getItem('solarch_token');
    if (cached && token) {
      return JSON.parse(cached);
    }
  } catch {
    // Corrupted data, clear it
    localStorage.removeItem('solarch_user');
    localStorage.removeItem('solarch_token');
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Global Settings for Prototype
  const [requireDriverApproval, setRequireDriverApproval] = useState(
    localStorage.getItem('require_driver_approval') === 'true'
  );

  const toggleDriverApproval = (value) => {
    setRequireDriverApproval(value);
    localStorage.setItem('require_driver_approval', value.toString());
  };

  // Safe localStorage parser
  const getCachedUser = useCallback(() => {
    try {
      const cached = localStorage.getItem('solarch_user');
      const token = localStorage.getItem('solarch_token');
      if (cached && token) {
        return JSON.parse(cached);
      }
    } catch {
      localStorage.removeItem('solarch_user');
      localStorage.removeItem('solarch_token');
    }
    return null;
  }, []);

  const hasInitialized = useRef(false);

  // Application starts -> Try auth refresh -> 404 -> Catch 404 -> Read localStorage -> Restore user -> Set loading = false
  useEffect(() => {
    const initAuth = async () => {
      if (hasInitialized.current) return;
      hasInitialized.current = true;
      
      console.log('[AUTH] initialization started');
      const token = localStorage.getItem('solarch_token');
      
      if (!token) {
        console.log('[AUTH] no token found, clearing state');
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        console.log('[AUTH] attempting refresh');
        // This will throw or return cached user internally if 404
        const activeUser = await solarch.auth.getUser();
        if (activeUser) {
          console.log('[AUTH] restored user:', activeUser);
          setUser(activeUser);
          localStorage.setItem('solarch_user', JSON.stringify(activeUser));
        }
      } catch (err) {
        console.log('[AUTH] refresh failed or unavailable:', err.message);
        console.log('[AUTH] restoring local cache');
        
        // Fallback explicitly handled here as well, just in case solarch.js throws
        const cachedUser = getCachedUser();
        if (cachedUser) {
          console.log('[AUTH] restored user from cache:', cachedUser);
          setUser(cachedUser);
        } else {
          console.log('[AUTH] no valid cache, clearing state');
          setUser(null);
        }
      } finally {
        console.log('[AUTH] initialization completed');
        setLoading(false);
      }
    };

    initAuth();
  }, [getCachedUser]);

  const login = useCallback(async (email, password) => {
    setError('');
    setLoading(true);
    try {
      const response = await solarch.auth.login(email, password);
      const loggedUser = response.user;
      
      // Persist to localStorage immediately so future page loads are instant
      if (loggedUser) {
        localStorage.setItem('solarch_user', JSON.stringify(loggedUser));
      }
      
      setUser(loggedUser);
      setLoading(false);
      return loggedUser.role || 'PASSENGER';
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
      setLoading(false);
      throw err;
    }
  }, []);

  const signup = useCallback(async (name, email, password, passwordConfirm, requestAdmin = false) => {
    setError('');
    setLoading(true);
    try {
      // 1. Create the user. The backend will forcibly set role=PASSENGER.
      await fetch(`${solarch.db.baseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          passwordConfirm,
          admin_request: requestAdmin ? 'PENDING' : 'NONE'
        })
      });
      
      // 2. Automatically log them in after successful creation
      return await login(email, password);
    } catch (err) {
      setError(err.message || 'Failed to create account. Please check your information.');
      setLoading(false);
      throw err;
    }
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await solarch.auth.logout();
    } catch (err) {
      console.error('Logout error', err);
    }
    // ALWAYS clear everything, even if the API call fails
    localStorage.removeItem('solarch_token');
    localStorage.removeItem('solarch_user');
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(''), []);

  const updateUser = useCallback((data) => {
    setUser(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('solarch_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    updateUser,
    clearError,
    requireDriverApproval,
    toggleDriverApproval
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
