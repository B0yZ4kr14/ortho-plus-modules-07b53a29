import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/apiClient';

export interface AuditLog {
  id: number;
  action: string;
  action_type: string | null;
  user_id: string | null;
  clinic_id: string | null;
  target_module_id: number | null;
  details: Record<string, any> | null;
  ip_address: string;
  user_agent: string | null;
  created_at: string;
}

export function useAuditLogsAPI() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = async (filters?: { action_type?: string; start_date?: string; end_date?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters?.action_type) params.append('action_type', filters.action_type);
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      
      const response = await apiClient.get<AuditLog[]>(`/audit-logs?${params.toString()}`);
      setLogs(response);
    } catch (err) {
      console.error('[useAuditLogsAPI] Error fetching logs:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return {
    logs,
    loading,
    error,
    refetch: fetchLogs,
  };
}
