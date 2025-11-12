import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { 
  OdontogramaData, 
  ToothData, 
  ToothStatus, 
  ALL_TEETH 
} from '../types/odontograma.types';

const STORAGE_KEY = 'orthoplus_odontograma_data';

export const useOdontogramaStore = (prontuarioId: string) => {
  const [storedData, setStoredData] = useLocalStorage<Record<string, OdontogramaData>>(STORAGE_KEY, {});
  const [teethData, setTeethData] = useState<Record<number, ToothData>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do prontuário específico
  useEffect(() => {
    setIsLoading(true);
    const prontuarioData = storedData[prontuarioId];
    
    if (prontuarioData) {
      setTeethData(prontuarioData.teeth);
    } else {
      // Inicializar com todos os dentes hígidos
      const initialData: Record<number, ToothData> = {};
      ALL_TEETH.forEach(num => {
        initialData[num] = { 
          number: num, 
          status: 'higido',
          updatedAt: new Date().toISOString(),
        };
      });
      setTeethData(initialData);
    }
    setIsLoading(false);
  }, [prontuarioId, storedData]);

  // Salvar dados automaticamente
  const saveData = useCallback(() => {
    setStoredData(prev => ({
      ...prev,
      [prontuarioId]: {
        prontuarioId,
        teeth: teethData,
        lastUpdated: new Date().toISOString(),
      },
    }));
  }, [prontuarioId, teethData, setStoredData]);

  // Atualizar status de um dente
  const updateToothStatus = useCallback((toothNumber: number, status: ToothStatus) => {
    setTeethData(prev => ({
      ...prev,
      [toothNumber]: {
        ...prev[toothNumber],
        status,
        updatedAt: new Date().toISOString(),
      },
    }));
  }, []);

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

  // Resetar odontograma
  const resetOdontograma = useCallback(() => {
    const resetData: Record<number, ToothData> = {};
    ALL_TEETH.forEach(num => {
      resetData[num] = { 
        number: num, 
        status: 'higido',
        updatedAt: new Date().toISOString(),
      };
    });
    setTeethData(resetData);
  }, []);

  // Obter estatísticas
  const getStatusCount = useCallback((status: ToothStatus) => {
    return Object.values(teethData).filter(t => t.status === status).length;
  }, [teethData]);

  // Salvar quando os dados mudarem
  useEffect(() => {
    if (!isLoading && Object.keys(teethData).length > 0) {
      saveData();
    }
  }, [teethData, isLoading, saveData]);

  return {
    teethData,
    isLoading,
    updateToothStatus,
    updateToothNotes,
    resetOdontograma,
    getStatusCount,
    saveData,
  };
};
