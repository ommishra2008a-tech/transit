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

  useEffect(() => {
    const initAuth = async () => {
      if (hasInitialized.current) return;
      hasInitialized.current = true;
      
      const token = localStorage.getItem('solarch_token');
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const activeUser = await solarch.auth.getUser();
        if (activeUser) {
          setUser(activeUser);
          localStorage.setItem('solarch_user', JSON.stringify(activeUser));
        }
      } catch (err) {
        const cachedUser = getCachedUser();
        if (cachedUser) {
          setUser(cachedUser);
        } else {
          setUser(null);
        }
      } finally {
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
      const msg = err.message || 'Invalid email or password. Please try again.';
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  }, []);

  const signup = useCallback(async (name, email, password, passwordConfirm, requestAdmin = false) => {
    setError('');
    setLoading(true);
    try {
      // 1. Create the user via backend endpoint. The backend will forcibly set role=PASSENGER.
      const signupRes = await fetch(`${solarch.url}/api/auth/signup`, {
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
      
      const resData = await signupRes.json().catch(() => ({}));
      if (!signupRes.ok || resData.code >= 400) {
        throw new Error(resData.message || 'Failed to create account.');
      }
      
      // 2. Automatically log them in after successful creation
      try {
        return await login(email, password);
      } catch (loginErr) {
        throw new Error('Account created successfully, but automatic login failed. Please sign in.');
      }
    } catch (err) {
      const msg = err.message || 'Failed to create account. Please check your information.';
      setError(msg);
      setLoading(false);
      throw new Error(msg);
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
    setError('');
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
