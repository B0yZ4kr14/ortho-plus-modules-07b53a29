import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Module } from '@/lib/modules';

// Cache simples para módulos (5 minutos)
let modulesCache: { data: Module[]; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export function useModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadModules = useCallback(async (forceRefresh = false) => {
    try {
      // Verificar cache
      if (!forceRefresh && modulesCache && Date.now() - modulesCache.timestamp < CACHE_DURATION) {
        console.log('✅ Using cached modules');
        setModules(modulesCache.data);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      const { data, error: invokeError } = await supabase.functions.invoke('get-my-modules');

      if (invokeError) {
        throw new Error(invokeError.message || 'Erro ao carregar módulos');
      }

      if (!data || !data.modules) {
        throw new Error('Resposta inválida do servidor');
      }

      // Atualizar cache
      modulesCache = {
        data: data.modules,
        timestamp: Date.now(),
      };

      setModules(data.modules);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Error loading modules:', err);
      toast({
        title: 'Erro ao carregar módulos',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  const toggleModule = useCallback(async (moduleKey: string) => {
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('toggle-module-state', {
        body: { module_key: moduleKey },
      });

      if (invokeError) {
        throw new Error(invokeError.message || 'Erro ao alterar status do módulo');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.success) {
      toast({
        title: 'Módulo atualizado',
        description: data.message || 'O status do módulo foi alterado com sucesso.',
      });
      // Invalidar cache e recarregar
      modulesCache = null;
      await loadModules(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao alterar status';
      console.error('Error toggling module:', err);
      toast({
        title: 'Erro ao alterar módulo',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [toast, loadModules]);

  // Memoizar lista de módulos ativos
  const activeModules = useMemo(() => 
    modules.filter(m => m.is_active).map(m => m.module_key),
    [modules]
  );

  return {
    modules,
    loading,
    error,
    loadModules,
    toggleModule,
    activeModules, // Exportar lista de módulos ativos
  };
}
