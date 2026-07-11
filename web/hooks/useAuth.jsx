'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/utils/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await authApi.getMe();
      setUser(data);
    } catch {
      localStorage.removeItem('access_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    localStorage.setItem('access_token', data.access_token);
    setUser(data.user);
    return data.user;
  };

  const register = async (email, password, name, acceptedTerms) => {
    const data = await authApi.register({ email, password, name, accepted_terms: acceptedTerms });
    localStorage.setItem('access_token', data.access_token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      /* best-effort */
    }
    localStorage.removeItem('access_token');
    setUser(null);
  };

  const refreshUser = useCallback(async () => {
    try {
      const data = await authApi.getMe();
      setUser(data);
    } catch {
      /* noop */
    }
  }, []);

  const isAdmin = user?.role === 'admin';
  const isLoggedIn = !!user;
  const isEmailVerified = user?.is_email_verified === true;

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isLoggedIn, isEmailVerified, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
