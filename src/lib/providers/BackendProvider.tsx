/**
 * Backend Provider - V5.2 Phase 3
 * Abstração completa para alternar entre Supabase e PostgreSQL (Ubuntu Server)
 * Permite switching dinâmico via UI sem reload
 */

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { IBackendService } from '@/infrastructure/backend/IBackendService';
import { SupabaseBackendService } from '@/infrastructure/backend/SupabaseBackendService';
import { logger } from '@/lib/logger';

type BackendType = 'supabase' | 'ubuntu-server' | 'postgresql';

interface BackendContextType {
  backendType: BackendType;
  backend: IBackendService;
  isReady: boolean;
  switchBackend: (type: BackendType) => Promise<void>;
}

const BackendContext = createContext<BackendContextType | undefined>(undefined);

export const useBackend = () => {
  const context = useContext(BackendContext);
  if (!context) {
    throw new Error('useBackend must be used within BackendProvider');
  }
  return context;
};

interface BackendProviderProps {
  children: ReactNode;
}

/**
 * Provider que gerencia a abstração de backend
 * Suporta switching dinâmico entre Supabase e PostgreSQL
 */
export function BackendProvider({ children }: BackendProviderProps) {
  const [backendType, setBackendType] = useState<BackendType>(() => {
    // Prioridade: localStorage > env variable > default
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('selected_backend') as BackendType;
      if (stored) return stored;
    }
    return (import.meta.env.VITE_BACKEND_TYPE as BackendType) || 'supabase';
  });

  const [backend, setBackend] = useState<IBackendService>(() => {
    return createBackendService(backendType);
  });

  const [isReady, setIsReady] = useState(false);

  // Verificar se backend está pronto
  useEffect(() => {
    const checkReady = async () => {
      try {
        const ready = await backend.isReady();
        setIsReady(ready);
        if (ready) {
          logger.info(`[BackendProvider] ${backendType} backend is ready`);
        } else {
          logger.warn(`[BackendProvider] ${backendType} backend is not ready`);
        }
      } catch (error) {
        logger.error(`[BackendProvider] Error checking ${backendType} readiness`, error);
        setIsReady(false);
      }
    };

    checkReady();
  }, [backend, backendType]);

  /**
   * Troca o backend dinamicamente
   */
  const switchBackend = async (type: BackendType) => {
    try {
      logger.info(`[BackendProvider] Switching backend to ${type}`);
      
      const newBackend = createBackendService(type);
      const ready = await newBackend.isReady();
      
      if (!ready) {
        throw new Error(`Backend ${type} is not ready or unreachable`);
      }

      setBackend(newBackend);
      setBackendType(type);
      setIsReady(true);
      
      // Persistir escolha
      if (typeof window !== 'undefined') {
        localStorage.setItem('selected_backend', type);
      }

      logger.info(`[BackendProvider] Successfully switched to ${type}`);
    } catch (error) {
      logger.error(`[BackendProvider] Failed to switch to ${type}`, error);
      throw error;
    }
  };

  return (
    <BackendContext.Provider value={{ backendType, backend, isReady, switchBackend }}>
      {children}
    </BackendContext.Provider>
  );
}

/**
 * Factory para criar serviço de backend baseado no tipo
 */
function createBackendService(type: BackendType): IBackendService {
  if (type === 'ubuntu-server' || type === 'postgresql') {
    // Lazy load PostgreSQL backend apenas quando necessário
    try {
      const { PostgreSQLBackendService } = require('@/infrastructure/backend/PostgreSQLBackendService');
      return new PostgreSQLBackendService();
    } catch (error) {
      logger.error('[BackendProvider] Failed to load PostgreSQL backend, falling back to Supabase', error);
      return new SupabaseBackendService();
    }
  }

  // Default: Supabase
  return new SupabaseBackendService();
}
