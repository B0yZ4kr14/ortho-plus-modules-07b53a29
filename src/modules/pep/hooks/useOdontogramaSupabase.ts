import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  ToothData, 
  ToothStatus,
  ToothSurface,
  OdontogramaHistoryEntry,
  ALL_TEETH 
} from '../types/odontograma.types';

const createInitialToothData = (number: number): ToothData => ({
  number,
  status: 'higido',
  surfaces: {
    mesial: 'higido',
    distal: 'higido',
    oclusal: 'higido',
    vestibular: 'higido',
    lingual: 'higido',
  },
  updatedAt: new Date().toISOString(),
});

export const useOdontogramaSupabase = (prontuarioId: string) => {
  const [teethData, setTeethData] = useState<Record<number, ToothData>>({});
  const [history, setHistory] = useState<OdontogramaHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do prontuário específico do Supabase
  const loadData = useCallback(async () => {
    if (!prontuarioId) return;
    
    setIsLoading(true);
    try {
      // Buscar dados do odontograma
      const { data: odontogramaData, error: odontogramaError } = await supabase
        .from('pep_odontograma_data')
        .select('*, pep_tooth_surfaces(*)')
        .eq('prontuario_id', prontuarioId);

      if (odontogramaError) throw odontogramaError;

      // Buscar histórico
      const { data: historyData, error: historyError } = await supabase
        .from('pep_odontograma_history')
        .select('*')
        .eq('prontuario_id', prontuarioId)
        .order('created_at', { ascending: false });

      if (historyError) throw historyError;

      // Processar dados dos dentes
      const processedTeeth: Record<number, ToothData> = {};
      
      if (odontogramaData && odontogramaData.length > 0) {
        odontogramaData.forEach((tooth: any) => {
          const surfaces: any = {
            mesial: 'higido',
            distal: 'higido',
            oclusal: 'higido',
            vestibular: 'higido',
            lingual: 'higido',
          };

          if (tooth.pep_tooth_surfaces) {
            tooth.pep_tooth_surfaces.forEach((surface: any) => {
              surfaces[surface.surface] = surface.status;
            });
          }

          processedTeeth[tooth.tooth_number] = {
            number: tooth.tooth_number,
            status: tooth.status,
            notes: tooth.notes,
            surfaces,
            updatedAt: tooth.updated_at,
          };
        });
      } else {
        // Inicializar com todos os dentes hígidos se não houver dados
        ALL_TEETH.forEach(num => {
          processedTeeth[num] = createInitialToothData(num);
        });
      }

      setTeethData(processedTeeth);

      // Processar histórico
      if (historyData) {
        const processedHistory: OdontogramaHistoryEntry[] = historyData.map((entry: any) => ({
          id: entry.id,
          timestamp: entry.created_at,
          teeth: entry.snapshot_data,
          changedTeeth: entry.changed_teeth || [],
          description: entry.description,
        }));
        setHistory(processedHistory);
      }
    } catch (error: any) {
      console.error('Erro ao carregar odontograma:', error);
      toast.error('Erro ao carregar dados do odontograma');
    } finally {
      setIsLoading(false);
    }
  }, [prontuarioId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Adicionar entrada ao histórico
  const addHistoryEntry = useCallback(async (changedTeeth: number[], description?: string) => {
    try {
      const { error } = await supabase
        .from('pep_odontograma_history')
        .insert({
          prontuario_id: prontuarioId,
          snapshot_data: teethData,
          changed_teeth: changedTeeth,
          description,
        });

      if (error) throw error;

      // Recarregar histórico
      await loadData();
    } catch (error: any) {
      console.error('Erro ao adicionar ao histórico:', error);
      toast.error('Erro ao salvar histórico');
    }
  }, [prontuarioId, teethData, loadData]);

  // Atualizar status geral de um dente
  const updateToothStatus = useCallback(async (
    toothNumber: number, 
    status: ToothStatus, 
    addToHistory = true
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Verificar se o dente já existe
      const { data: existing } = await supabase
        .from('pep_odontograma_data')
        .select('id')
        .eq('prontuario_id', prontuarioId)
        .eq('tooth_number', toothNumber)
        .maybeSingle();

      if (existing) {
        // Atualizar
        const { error } = await supabase
          .from('pep_odontograma_data')
          .update({
            status,
            updated_by: user.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Inserir
        const { error } = await supabase
          .from('pep_odontograma_data')
          .insert({
            prontuario_id: prontuarioId,
            tooth_number: toothNumber,
            status,
            created_by: user.id,
          });

        if (error) throw error;
      }

      // Atualizar estado local
      setTeethData(prev => ({
        ...prev,
        [toothNumber]: {
          ...prev[toothNumber],
          status,
          updatedAt: new Date().toISOString(),
        },
      }));

      if (addToHistory) {
        await addHistoryEntry([toothNumber], `Dente ${toothNumber} marcado como ${status}`);
      }

      toast.success('Dente atualizado com sucesso');
    } catch (error: any) {
      console.error('Erro ao atualizar dente:', error);
      toast.error('Erro ao atualizar dente');
    }
  }, [prontuarioId, addHistoryEntry]);

  // Atualizar status de uma face específica
  const updateToothSurface = useCallback(async (
    toothNumber: number,
    surface: ToothSurface,
    status: ToothStatus,
    addToHistory = true
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar ou criar registro do dente
      let { data: toothData } = await supabase
        .from('pep_odontograma_data')
        .select('id')
        .eq('prontuario_id', prontuarioId)
        .eq('tooth_number', toothNumber)
        .maybeSingle();

      if (!toothData) {
        const { data: newTooth, error: insertError } = await supabase
          .from('pep_odontograma_data')
          .insert({
            prontuario_id: prontuarioId,
            tooth_number: toothNumber,
            status: 'higido',
            created_by: user.id,
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        toothData = newTooth;
      }

      // Atualizar ou inserir superfície
      const { data: existingSurface } = await supabase
        .from('pep_tooth_surfaces')
        .select('id')
        .eq('odontograma_data_id', toothData.id)
        .eq('surface', surface)
        .maybeSingle();

      if (existingSurface) {
        const { error } = await supabase
          .from('pep_tooth_surfaces')
          .update({ status })
          .eq('id', existingSurface.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('pep_tooth_surfaces')
          .insert({
            odontograma_data_id: toothData.id,
            surface,
            status,
          });

        if (error) throw error;
      }

      // Atualizar estado local
      setTeethData(prev => ({
        ...prev,
        [toothNumber]: {
          ...prev[toothNumber],
          surfaces: {
            ...prev[toothNumber].surfaces,
            [surface]: status,
          },
          updatedAt: new Date().toISOString(),
        },
      }));

      if (addToHistory) {
        await addHistoryEntry([toothNumber], `Face ${surface} do dente ${toothNumber} marcada como ${status}`);
      }

      toast.success('Superfície atualizada com sucesso');
    } catch (error: any) {
      console.error('Erro ao atualizar superfície:', error);
      toast.error('Erro ao atualizar superfície');
    }
  }, [prontuarioId, addHistoryEntry]);

  // Atualizar notas de um dente
  const updateToothNotes = useCallback(async (toothNumber: number, notes: string) => {
    try {
      const { data: toothData } = await supabase
        .from('pep_odontograma_data')
        .select('id')
        .eq('prontuario_id', prontuarioId)
        .eq('tooth_number', toothNumber)
        .maybeSingle();

      if (!toothData) {
        toast.error('Dente não encontrado');
        return;
      }

      const { error } = await supabase
        .from('pep_odontograma_data')
        .update({ notes })
        .eq('id', toothData.id);

      if (error) throw error;

      setTeethData(prev => ({
        ...prev,
        [toothNumber]: {
          ...prev[toothNumber],
          notes,
          updatedAt: new Date().toISOString(),
        },
      }));

      toast.success('Notas atualizadas');
    } catch (error: any) {
      console.error('Erro ao atualizar notas:', error);
      toast.error('Erro ao atualizar notas');
    }
  }, [prontuarioId]);

  // Restaurar odontograma de uma entrada do histórico
  const restoreFromHistory = useCallback(async (historyId: string) => {
    const entry = history.find(h => h.id === historyId);
    if (entry) {
      setTeethData(JSON.parse(JSON.stringify(entry.teeth)));
      await addHistoryEntry([], 'Odontograma restaurado do histórico');
      toast.success('Odontograma restaurado');
    }
  }, [history, addHistoryEntry]);

  // Resetar odontograma
  const resetOdontograma = useCallback(async () => {
    try {
      // Deletar todos os dentes do prontuário
      const { error } = await supabase
        .from('pep_odontograma_data')
        .delete()
        .eq('prontuario_id', prontuarioId);

      if (error) throw error;

      const resetData: Record<number, ToothData> = {};
      ALL_TEETH.forEach(num => {
        resetData[num] = createInitialToothData(num);
      });
      
      setTeethData(resetData);
      await addHistoryEntry(ALL_TEETH, 'Odontograma resetado');
      toast.success('Odontograma resetado');
    } catch (error: any) {
      console.error('Erro ao resetar:', error);
      toast.error('Erro ao resetar odontograma');
    }
  }, [prontuarioId, addHistoryEntry]);

  // Obter estatísticas
  const getStatusCount = useCallback((status: ToothStatus) => {
    return Object.values(teethData).filter(t => t.status === status).length;
  }, [teethData]);

  // Comparar dois estados do odontograma
  const compareStates = useCallback((historyId1: string, historyId2: string) => {
    const state1 = history.find(h => h.id === historyId1);
    const state2 = history.find(h => h.id === historyId2);
    
    if (!state1 || !state2) return [];

    const changes: number[] = [];
    ALL_TEETH.forEach(num => {
      const tooth1 = state1.teeth[num];
      const tooth2 = state2.teeth[num];
      
      if (tooth1?.status !== tooth2?.status || 
          JSON.stringify(tooth1?.surfaces) !== JSON.stringify(tooth2?.surfaces)) {
        changes.push(num);
      }
    });

    return changes;
  }, [history]);

  return {
    teethData,
    history,
    isLoading,
    updateToothStatus,
    updateToothSurface,
    updateToothNotes,
    resetOdontograma,
    restoreFromHistory,
    getStatusCount,
    compareStates,
    refreshData: loadData,
  };
};
