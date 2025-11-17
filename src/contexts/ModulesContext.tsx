/**
 * ModulesContext - Gestão centralizada de módulos via REST API
 * 
 * Este context substitui a gestão estática de módulos por uma
 * integração dinâmica com a REST API Node.js do backend.
 */
import React, { createContext, useContext, ReactNode } from 'react';
import { useModulos } from '@/hooks/api/useModulos';

interface Module {
  id: number;
  module_key: string;
  name: string;
  description?: string;
  category: string;
  is_active: boolean;
  dependencies?: string[];
}

interface ModulesContextData {
  modules: Module[];
  isLoading: boolean;
  activeModules: Module[];
  isModuleActive: (moduleKey: string) => boolean;
  getModulesByCategory: (category: string) => Module[];
  toggleModule: (moduleId: number) => void;
  isTogglingModule: boolean;
  dependencies: any;
}

const ModulesContext = createContext<ModulesContextData | undefined>(undefined);

interface ModulesProviderProps {
  children: ReactNode;
}

export function ModulesProvider({ children }: ModulesProviderProps) {
  const {
    modules,
    activeModules,
    isLoading,
    toggleModule,
    isToggling,
    dependencies,
    isModuleActive,
    getModulesByCategory,
  } = useModulos();

  return (
    <ModulesContext.Provider
      value={{
        modules,
        isLoading,
        activeModules,
        isModuleActive,
        getModulesByCategory,
        toggleModule,
        isTogglingModule: isToggling,
        dependencies,
      }}
    >
      {children}
    </ModulesContext.Provider>
  );
}

export function useModulesContext() {
  const context = useContext(ModulesContext);
  if (!context) {
    throw new Error('useModulesContext must be used within ModulesProvider');
  }
  return context;
}
