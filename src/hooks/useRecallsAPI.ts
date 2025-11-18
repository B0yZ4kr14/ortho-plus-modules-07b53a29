import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/apiClient';

export interface Recall {
  id: string;
  patient_id: string;
  tipo_recall: string;
  data_agendada: string;
  status: string;
  mensagem_enviada: boolean;
  observacoes: string | null;
  created_at: string;
}

export function useRecallsAPI() {
  const [recalls, setRecalls] = useState<Recall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecalls = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<Recall[]>('/recalls');
      setRecalls(response);
    } catch (err) {
      console.error('[useRecallsAPI] Error fetching recalls:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createRecall = async (data: Partial<Recall>) => {
    try {
      const response = await apiClient.post<Recall>('/recalls', data);
      await fetchRecalls();
      return response;
    } catch (err) {
      console.error('[useRecallsAPI] Error creating recall:', err);
      throw err;
    }
  };

  const updateRecall = async (id: string, data: Partial<Recall>) => {
    try {
      const response = await apiClient.put<Recall>(`/recalls/${id}`, data);
      await fetchRecalls();
      return response;
    } catch (err) {
      console.error('[useRecallsAPI] Error updating recall:', err);
      throw err;
    }
  };

  const deleteRecall = async (id: string) => {
    try {
      await apiClient.delete(`/recalls/${id}`);
      await fetchRecalls();
    } catch (err) {
      console.error('[useRecallsAPI] Error deleting recall:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchRecalls();
  }, []);

  return {
    recalls,
    loading,
    error,
    createRecall,
    updateRecall,
    deleteRecall,
    refetch: fetchRecalls,
  };
}
