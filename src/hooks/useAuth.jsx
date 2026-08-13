import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as authLogin, logout as authLogout, getCurrentUser, getUserRole, isAuthenticated, onAuthChange } from '../services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getCurrentUser());
  const [role, setRole] = useState(getUserRole());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Listen for auth store changes
    const unsubscribe = onAuthChange(() => {
      setUser(getCurrentUser());
      setRole(getUserRole());
    });
    return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      await authLogin(email, password);
      setUser(getCurrentUser());
      setRole(getUserRole());
      return getUserRole();
    } catch (err) {
      setError(err?.message || 'Login failed. Check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
    setRole(null);
  }, []);

  const value = {
    user,
    role,
    loading,
    error,
    isAuth: isAuthenticated(),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
