'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from './api';

export enum UserRole {
  GUEST = 'guest',
  CUSTOMER = 'customer',
  KITCHEN = 'kitchen',
  DRIVER = 'driver',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email?: string | null;
  phone: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isPhoneVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<void>;
  sendSmsCode: (phone: string) => Promise<{ demoCode?: string }>;
  verifySmsCode: (phone: string, code: string) => Promise<{ hasPassword: boolean; userId: string }>;
  setPassword: (phone: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status on mount — ONCE only, no re-renders
  useEffect(() => {
    let cancelled = false;
    const checkAuth = async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (!cancelled) setUser(data);
      } catch (err: any) {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    checkAuth();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    const { data } = await api.post('/auth/phone-login', { phone, password });
    setUser(data.user);
  }, []);

  const sendSmsCode = useCallback(async (phone: string) => {
    const { data } = await api.post('/auth/sms/send', { phone });
    return data;
  }, []);

  const verifySmsCode = useCallback(async (phone: string, code: string) => {
    const { data } = await api.post('/auth/sms/verify', { phone, code });
    return data;
  }, []);

  const setPassword = useCallback(async (phone: string, password: string, confirmPassword: string) => {
    const { data } = await api.post('/auth/sms/set-password', { phone, password, confirmPassword });
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        sendSmsCode,
        verifySmsCode,
        setPassword,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
