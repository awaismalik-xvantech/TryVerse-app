import React, { createContext, useContext, useEffect, useState } from 'react';
import { getToken, getUser, setToken, setUser, clearSession, apiPost } from './api';

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
  signup: (email: string, password: string, fullName: string) => Promise<{ ok: boolean; error?: string }>;
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
    const res = await apiPost<{ access_token: string; user: UserData }>('/api/auth/login', {
      email,
      password,
    });
    if (res.ok && res.data) {
      await setToken(res.data.access_token);
      await setUser(res.data.user as unknown as Record<string, unknown>);
      setUserState(res.data.user);
      return { ok: true };
    }
    return { ok: false, error: res.error || 'Login failed' };
  };

  const signup = async (email: string, password: string, fullName: string) => {
    const res = await apiPost<{ access_token: string; user: UserData }>('/api/auth/register', {
      email,
      password,
      full_name: fullName,
    });
    if (res.ok && res.data) {
      await setToken(res.data.access_token);
      await setUser(res.data.user as unknown as Record<string, unknown>);
      setUserState(res.data.user);
      return { ok: true };
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
