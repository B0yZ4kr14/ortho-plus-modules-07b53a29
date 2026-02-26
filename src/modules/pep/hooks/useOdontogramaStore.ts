import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { 
  OdontogramaData, 
  ToothData, 
  ToothStatus,
  ToothSurface,
  OdontogramaHistoryEntry,
  ALL_TEETH 
} from '../types/odontograma.types';

const STORAGE_KEY = 'orthoplus_odontograma_data';

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

export const useOdontogramaStore = (prontuarioId: string) => {
  const [storedData, setStoredData] = useLocalStorage<Record<string, OdontogramaData>>(STORAGE_KEY, {});
  const [teethData, setTeethData] = useState<Record<number, ToothData>>({});
  const [history, setHistory] = useState<OdontogramaHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const surfaceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Carregar dados do prontuário específico
  useEffect(() => {
    setIsLoading(true);
    const prontuarioData = storedData[prontuarioId];
    
    if (prontuarioData) {
      setTeethData(prontuarioData.teeth);
      setHistory(prontuarioData.history || []);
    } else {
      // Inicializar com todos os dentes hígidos
      const initialData: Record<number, ToothData> = {};
      ALL_TEETH.forEach(num => {
        initialData[num] = createInitialToothData(num);
      });
      setTeethData(initialData);
      setHistory([]);
    }
    setIsLoading(false);
  }, [prontuarioId, storedData]);

  // Cleanup pending history timers on unmount
  useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
      if (surfaceTimerRef.current) clearTimeout(surfaceTimerRef.current);
    };
  }, []);

  // Salvar dados automaticamente
  const saveData = useCallback(() => {
    setStoredData(prev => ({
      ...prev,
      [prontuarioId]: {
        prontuarioId,
        teeth: teethData,
        lastUpdated: new Date().toISOString(),
        history,
      },
    }));
  }, [prontuarioId, teethData, history, setStoredData]);

  // Adicionar entrada ao histórico
  const addHistoryEntry = useCallback((changedTeeth: number[], description?: string) => {
    const entry: OdontogramaHistoryEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      teeth: JSON.parse(JSON.stringify(teethData)), // Deep clone
      changedTeeth,
      description,
    };
    setHistory(prev => [entry, ...prev]);
  }, [teethData]);

  // Atualizar status geral de um dente
  const updateToothStatus = useCallback((toothNumber: number, status: ToothStatus, addToHistory = true) => {
    setTeethData(prev => {
      const newData = {
        ...prev,
        [toothNumber]: {
          ...prev[toothNumber],
          status,
          updatedAt: new Date().toISOString(),
        },
      };
      return newData;
    });
    
    if (addToHistory) {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
      statusTimerRef.current = setTimeout(() => addHistoryEntry([toothNumber], `Dente ${toothNumber} marcado como ${status}`), 100);
    }
  }, [addHistoryEntry]);

  // Atualizar status de uma face específica
  const updateToothSurface = useCallback((
    toothNumber: number, 
    surface: ToothSurface, 
    status: ToothStatus,
    addToHistory = true
  ) => {
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
      if (surfaceTimerRef.current) clearTimeout(surfaceTimerRef.current);
      surfaceTimerRef.current = setTimeout(() => addHistoryEntry([toothNumber], `Face ${surface} do dente ${toothNumber} marcada como ${status}`), 100);
    }
  }, [addHistoryEntry]);

  // Atualizar notas de um dente
  const updateToothNotes = useCallback((toothNumber: number, notes: string) => {
    setTeethData(prev => ({
      ...prev,
      [toothNumber]: {
        ...prev[toothNumber],
        notes,
        updatedAt: new Date().toISOString(),
      },
    }));
  }, []);

  // Restaurar odontograma de uma entrada do histórico
  const restoreFromHistory = useCallback((historyId: string) => {
    const entry = history.find(h => h.id === historyId);
    if (entry) {
      setTeethData(JSON.parse(JSON.stringify(entry.teeth)));
      addHistoryEntry([], 'Odontograma restaurado do histórico');
    }
  }, [history, addHistoryEntry]);

  // Resetar odontograma
  const resetOdontograma = useCallback(() => {
    const resetData: Record<number, ToothData> = {};
    ALL_TEETH.forEach(num => {
      resetData[num] = createInitialToothData(num);
    });
    setTeethData(resetData);
    addHistoryEntry(ALL_TEETH, 'Odontograma resetado');
  }, [addHistoryEntry]);

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
      
      if (tooth1.status !== tooth2.status || 
          JSON.stringify(tooth1.surfaces) !== JSON.stringify(tooth2.surfaces)) {
        changes.push(num);
      }
    });

    return changes;
  }, [history]);

  // Salvar quando os dados mudarem
  useEffect(() => {
    if (!isLoading && Object.keys(teethData).length > 0) {
      const timeoutId = setTimeout(() => {
        saveData();
      }, 500); // Debounce de 500ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [teethData, history, isLoading, saveData]);

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
    saveData,
  };
};
