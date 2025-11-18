import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/apiClient';

interface User {
  id: string;
  email: string;
  full_name: string;
  clinic_id: string;
  app_role: 'ADMIN' | 'MEMBER' | 'ROOT';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasModuleAccess: (moduleKey: string) => boolean;
  userPermissions: string[];
  clinicId: string | null;
}

const AuthContextAPI = createContext<AuthContextType | undefined>(undefined);

export function AuthProviderAPI({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserMetadata = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await apiClient.get<{ user: User; permissions: string[] }>('/auth/me');
      setUser(response.user);
      setUserPermissions(response.permissions || []);
    } catch (error) {
      console.error('[AuthContextAPI] Error fetching user metadata:', error);
      localStorage.removeItem('auth_token');
      setUser(null);
      setUserPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserMetadata();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.post<{ token: string; user: User }>('/auth/login', { email, password });
      localStorage.setItem('auth_token', response.token);
      setUser(response.user);
      await fetchUserMetadata();
    } catch (error) {
      console.error('[AuthContextAPI] Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch (error) {
      console.error('[AuthContextAPI] Sign out error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
      setUserPermissions([]);
    }
  };

  const hasModuleAccess = (moduleKey: string): boolean => {
    if (!user) return false;
    if (user.app_role === 'ADMIN' || user.app_role === 'ROOT') return true;
    return userPermissions.includes(moduleKey) || userPermissions.includes('ALL');
  };

  return (
    <AuthContextAPI.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        hasModuleAccess,
        userPermissions,
        clinicId: user?.clinic_id || null,
      }}
    >
      {children}
    </AuthContextAPI.Provider>
  );
}

export function useAuthAPI() {
  const context = useContext(AuthContextAPI);
  if (context === undefined) {
    throw new Error('useAuthAPI must be used within an AuthProviderAPI');
  }
  return context;
}
