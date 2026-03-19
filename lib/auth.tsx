import React, { createContext, useContext, useEffect, useState } from 'react';
import { getToken, getUser, setToken, setUser, clearSession, apiPost, apiFetch } from './api';

interface UserData {
  id: number;
  email: string;
  full_name: string;
  is_pro: boolean;
  profile_image?: string;
}

interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (email: string, password: string, fullName: string) => Promise<{ ok: boolean; error?: string; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => ({ ok: false }),
  signup: async () => ({ ok: false }),
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await getToken();
      if (token) {
        const userData = await getUser();
        if (userData) {
          setUserState(userData as unknown as UserData);
        }
      }
    } catch {}
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
      console.log('[AUTH] Attempting login to:', `${apiUrl}/api/auth/login`);

      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      console.log('[AUTH] Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        await setToken(data.access_token);
        await setUser(data.user as Record<string, unknown>);
        setUserState(data.user as UserData);
        return { ok: true };
      } else {
        let errorMsg = 'Login failed';
        try {
          const errData = await response.json();
          console.log('[AUTH] Error response:', JSON.stringify(errData));
          if (typeof errData.detail === 'string') errorMsg = errData.detail;
        } catch {}
        return { ok: false, error: errorMsg };
      }
    } catch (err) {
      console.log('[AUTH] Connection error:', String(err));
      return { ok: false, error: `Cannot reach server. Make sure backend is running and firewall allows port 8000.` };
    }
  };

  const signup = async (email: string, _password: string, fullName: string) => {
    const res = await apiPost<{ message: string }>('/api/auth/signup', {
      email,
      full_name: fullName,
      source: 'mobile',
    });
    if (res.ok) {
      return { ok: true, message: res.data?.message || 'Verification email sent. Check your inbox.' };
    }
    return { ok: false, error: res.error || 'Signup failed' };
  };

  const logout = async () => {
    await clearSession();
    setUserState(null);
  };

  const refreshUser = async () => {
    const userData = await getUser();
    if (userData) setUserState(userData as unknown as UserData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
