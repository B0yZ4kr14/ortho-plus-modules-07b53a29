import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Module } from '@/lib/modules';

export function useModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadModules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: invokeError } = await supabase.functions.invoke('get-my-modules');

      if (invokeError) {
        throw new Error(invokeError.message || 'Erro ao carregar módulos');
      }

      if (!data || !data.modules) {
        throw new Error('Resposta inválida do servidor');
      }

      setModules(data.modules);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Error loading modules:', err);
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
        // Reload modules to update UI
        await loadModules();
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

  const requestModule = useCallback(async (moduleKey: string) => {
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('request-new-module', {
        body: { module_key: moduleKey },
      });

      if (invokeError) {
        throw new Error(invokeError.message || 'Erro ao solicitar módulo');
      }

      toast({
        title: 'Solicitação enviada!',
        description: data?.message || 'Nossa equipe entrará em contato em breve.',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao solicitar módulo';
      console.error('Error requesting module:', err);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [toast]);

  return {
    modules,
    loading,
    error,
    loadModules,
    toggleModule,
    requestModule,
  };
}
