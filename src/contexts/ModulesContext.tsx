import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';
import { LucideIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

// Validation schema for module configuration
const moduleConfigSchema = z.object({
  id: z.string().min(1),
  enabled: z.boolean(),
  order: z.number().int().min(0),
});

const modulesConfigSchema = z.array(moduleConfigSchema);

export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  path: string;
  category: string;
  badge?: string;
  enabled: boolean;
  order: number;
  canDisable: boolean; // Some modules like Dashboard might be required
}

interface ModulesContextType {
  modules: ModuleDefinition[];
  toggleModule: (id: string) => void;
  moveModuleUp: (id: string) => void;
  moveModuleDown: (id: string) => void;
  getEnabledModules: () => ModuleDefinition[];
  getModulesByCategory: (category: string) => ModuleDefinition[];
  resetToDefaults: () => void;
}

const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

const STORAGE_KEY = 'orthoplus_modules_config';

// Default modules configuration
const defaultModules: ModuleDefinition[] = [
  // Dashboard modules (cannot be disabled)
  {
    id: 'home',
    name: 'Página Inicial',
    description: 'Dashboard principal com visão geral do sistema',
    icon: null as any, // Will be set in component
    path: '/',
    category: 'DASHBOARD',
    enabled: true,
    order: 0,
    canDisable: false,
  },
  {
    id: 'resumo',
    name: 'Resumo Gerencial',
    description: 'Relatórios e indicadores de desempenho',
    icon: null as any,
    path: '/resumo',
    category: 'DASHBOARD',
    enabled: true,
    order: 1,
    canDisable: true,
  },
  // Cadastros modules
  {
    id: 'pacientes',
    name: 'Pacientes',
    description: 'Gerenciamento completo de pacientes',
    icon: null as any,
    path: '/pacientes',
    category: 'CADASTROS',
    badge: '1.247',
    enabled: true,
    order: 2,
    canDisable: true,
  },
  {
    id: 'dentistas',
    name: 'Dentistas',
    description: 'Cadastro e gestão de profissionais',
    icon: null as any,
    path: '/dentistas',
    category: 'CADASTROS',
    enabled: true,
    order: 3,
    canDisable: true,
  },
  {
    id: 'funcionarios',
    name: 'Funcionários',
    description: 'Gestão de equipe administrativa',
    icon: null as any,
    path: '/funcionarios',
    category: 'CADASTROS',
    enabled: true,
    order: 4,
    canDisable: true,
  },
  {
    id: 'procedimentos',
    name: 'Procedimentos',
    description: 'Catálogo de procedimentos odontológicos',
    icon: null as any,
    path: '/procedimentos',
    category: 'CADASTROS',
    enabled: true,
    order: 5,
    canDisable: true,
  },
  // Agenda modules
  {
    id: 'agenda-clinica',
    name: 'Agenda Clínica',
    description: 'Agendamento e controle de consultas',
    icon: null as any,
    path: '/agenda-clinica',
    category: 'AGENDA',
    badge: '28',
    enabled: true,
    order: 6,
    canDisable: true,
  },
  {
    id: 'agenda-avaliacao',
    name: 'Agenda de Avaliação',
    description: 'Agendamento de avaliações iniciais',
    icon: null as any,
    path: '/agenda-avaliacao',
    category: 'AGENDA',
    enabled: true,
    order: 7,
    canDisable: true,
  },
  {
    id: 'controle-chegada',
    name: 'Controle de Chegada',
    description: 'Registro de presença de pacientes',
    icon: null as any,
    path: '/controle-chegada',
    category: 'AGENDA',
    enabled: true,
    order: 8,
    canDisable: true,
  },
  {
    id: 'confirmacao-agenda',
    name: 'Confirmação Agenda',
    description: 'Confirmação de consultas agendadas',
    icon: null as any,
    path: '/confirmacao-agenda',
    category: 'AGENDA',
    enabled: true,
    order: 9,
    canDisable: true,
  },
  {
    id: 'gestao-dentistas',
    name: 'Gestão de Dentistas',
    description: 'Configuração de agendas e disponibilidade',
    icon: null as any,
    path: '/gestao-dentistas',
    category: 'AGENDA',
    enabled: true,
    order: 10,
    canDisable: true,
  },
  // Comercial modules
  {
    id: 'financeiro',
    name: 'Financeiro',
    description: 'Controle financeiro e fluxo de caixa',
    icon: null as any,
    path: '/financeiro',
    category: 'COMERCIAL',
    enabled: true,
    order: 11,
    canDisable: true,
  },
];

export function ModulesProvider({ children }: { children: ReactNode }) {
  const [modules, setModules] = useState<ModuleDefinition[]>(defaultModules);
  const [activeModuleKeys, setActiveModuleKeys] = useState<string[]>([]);
  const { user, clinicId } = useAuth();

  // Fetch active modules from backend
  useEffect(() => {
    if (!user || !clinicId) {
      // If not logged in, use localStorage fallback
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const validated = modulesConfigSchema.parse(parsed);
          
          const updatedModules = defaultModules.map(module => {
            const stored = validated.find(v => v.id === module.id);
            if (stored) {
              return { ...module, enabled: stored.enabled, order: stored.order };
            }
            return module;
          });

          updatedModules.sort((a, b) => a.order - b.order);
          setModules(updatedModules);
        }
      } catch (error) {
        console.error('Error loading modules from localStorage:', error);
      }
      return;
    }

    // Fetch active modules from backend
    const fetchActiveModules = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-my-modules');
        
        if (error) throw error;

        if (data && Array.isArray(data)) {
          // Extract module keys that are active
          const activeKeys = data
            .filter((m: any) => m.is_active)
            .map((m: any) => m.module_key.toLowerCase());
          
          setActiveModuleKeys(activeKeys);

          // Update modules based on backend data
          const updatedModules = defaultModules.map(module => ({
            ...module,
            enabled: activeKeys.includes(module.id.toUpperCase()),
          }));

          setModules(updatedModules);
        }
      } catch (error) {
        console.error('Error fetching active modules:', error);
        toast.error('Erro ao carregar módulos ativos');
      }
    };

    fetchActiveModules();
  }, [user, clinicId]);

  // Save modules configuration to localStorage whenever it changes
  const saveConfig = (updatedModules: ModuleDefinition[]) => {
    try {
      const config = updatedModules.map(m => ({
        id: m.id,
        enabled: m.enabled,
        order: m.order,
      }));
      
      const validated = modulesConfigSchema.parse(config);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
    } catch (error) {
      console.error('Error saving modules configuration:', error);
      toast.error('Erro ao salvar configuração dos módulos');
    }
  };

  const toggleModule = (id: string) => {
    setModules(prev => {
      const module = prev.find(m => m.id === id);
      
      if (!module) {
        toast.error('Módulo não encontrado');
        return prev;
      }

      if (!module.canDisable) {
        toast.error('Este módulo não pode ser desativado');
        return prev;
      }

      const updated = prev.map(m =>
        m.id === id ? { ...m, enabled: !m.enabled } : m
      );

      saveConfig(updated);
      toast.success(
        module.enabled ? 'Módulo desativado' : 'Módulo ativado',
        { description: module.name }
      );

      return updated;
    });
  };

  const moveModuleUp = (id: string) => {
    setModules(prev => {
      const index = prev.findIndex(m => m.id === id);
      if (index <= 0) return prev; // Already at top or not found

      const module = prev[index];
      const category = module.category;
      
      // Find previous module in same category
      let prevIndex = index - 1;
      while (prevIndex >= 0 && prev[prevIndex].category !== category) {
        prevIndex--;
      }

      if (prevIndex < 0) return prev; // No previous module in same category

      const updated = [...prev];
      [updated[prevIndex], updated[index]] = [updated[index], updated[prevIndex]];
      
      // Update order numbers
      updated.forEach((m, i) => {
        m.order = i;
      });

      saveConfig(updated);
      toast.success('Módulo movido para cima');

      return updated;
    });
  };

  const moveModuleDown = (id: string) => {
    setModules(prev => {
      const index = prev.findIndex(m => m.id === id);
      if (index === -1 || index === prev.length - 1) return prev; // Not found or already at bottom

      const module = prev[index];
      const category = module.category;
      
      // Find next module in same category
      let nextIndex = index + 1;
      while (nextIndex < prev.length && prev[nextIndex].category !== category) {
        nextIndex++;
      }

      if (nextIndex >= prev.length) return prev; // No next module in same category

      const updated = [...prev];
      [updated[index], updated[nextIndex]] = [updated[nextIndex], updated[index]];
      
      // Update order numbers
      updated.forEach((m, i) => {
        m.order = i;
      });

      saveConfig(updated);
      toast.success('Módulo movido para baixo');

      return updated;
    });
  };

  const getEnabledModules = () => {
    return modules.filter(m => m.enabled);
  };

  const getModulesByCategory = (category: string) => {
    return modules.filter(m => m.category === category);
  };

  const resetToDefaults = () => {
    setModules(defaultModules);
    localStorage.removeItem(STORAGE_KEY);
    toast.success('Configuração restaurada para padrão');
  };

  return (
    <ModulesContext.Provider
      value={{
        modules,
        toggleModule,
        moveModuleUp,
        moveModuleDown,
        getEnabledModules,
        getModulesByCategory,
        resetToDefaults,
      }}
    >
      {children}
    </ModulesContext.Provider>
  );
}

export function useModules() {
  const context = useContext(ModulesContext);
  if (!context) {
    throw new Error('useModules must be used within ModulesProvider');
  }
  return context;
}
