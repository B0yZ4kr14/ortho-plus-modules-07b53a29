import { useState } from 'react';
import { apiClient } from '@/lib/api/apiClient';

export interface ReportParams {
  report_type: 'financial' | 'patients' | 'appointments' | 'inventory';
  start_date: string;
  end_date: string;
  format?: 'json' | 'csv' | 'pdf';
}

export interface ReportData {
  report_id: string;
  report_type: string;
  generated_at: string;
  data: any;
}

export function useReportsAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateReport = async (params: ReportParams): Promise<ReportData> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post<ReportData>('/reports/generate', params);
      return response;
    } catch (err) {
      console.error('[useReportsAPI] Error generating report:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (reportId: string, format: 'csv' | 'pdf' | 'xlsx') => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3333'}/api/reports/${reportId}/download?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to download report');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('[useReportsAPI] Error downloading report:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    generateReport,
    downloadReport,
  };
}
