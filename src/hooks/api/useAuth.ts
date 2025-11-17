/**
 * useAuth Hook
 * Hook para autenticação com backend Node.js
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/apiClient';
import { toast } from 'sonner';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: 'ADMIN' | 'MEMBER';
  clinicId: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    clinicId: string;
  };
  token: string;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('auth_token');
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      return await apiClient.post<AuthResponse>('/auth/login', credentials);
    },
    onSuccess: (data) => {
      apiClient.setAuthToken(data.token);
      setIsAuthenticated(true);
      toast.success('Login realizado com sucesso!');
    },
    onError: () => {
      toast.error('Falha no login. Verifique suas credenciais.');
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      return await apiClient.post<AuthResponse>('/auth/register', data);
    },
    onSuccess: (data) => {
      apiClient.setAuthToken(data.token);
      setIsAuthenticated(true);
      toast.success('Cadastro realizado com sucesso!');
    },
    onError: () => {
      toast.error('Falha no cadastro. Tente novamente.');
    },
  });

  const logout = () => {
    apiClient.clearAuthToken();
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  return {
    isAuthenticated,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
};
