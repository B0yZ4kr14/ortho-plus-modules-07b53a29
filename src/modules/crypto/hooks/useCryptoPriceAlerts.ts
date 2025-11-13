import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PriceAlert {
  id: string;
  coin_type: string;
  target_rate_brl: number;
  alert_type: 'ABOVE' | 'BELOW';
  notification_method: string[];
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
  stop_loss_enabled?: boolean;
  auto_convert_on_trigger?: boolean;
  conversion_percentage?: number;
  cascade_enabled?: boolean;
  cascade_group_id?: string | null;
  cascade_order?: number;
}

export function useCryptoPriceAlerts() {
  const { user } = useAuth();
  const clinicId = user?.user_metadata?.clinic_id;
  
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    if (!clinicId) return;

    try {
      const { data, error } = await supabase
        .from('crypto_price_alerts' as any)
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching alerts:', error);
      toast.error('Erro ao carregar alertas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [clinicId]);

  const createAlert = async (alertData: Omit<PriceAlert, 'id' | 'created_at' | 'last_triggered_at' | 'is_active'>) => {
    if (!clinicId || !user?.id) return;

    try {
      const { error } = await supabase
        .from('crypto_price_alerts' as any)
        .insert({
          ...alertData,
          clinic_id: clinicId,
          created_by: user.id,
          target_rate_brl: Number(alertData.target_rate_brl),
          conversion_percentage: Number(alertData.conversion_percentage || 100),
        });

      if (error) throw error;

      const successMsg = alertData.stop_loss_enabled
        ? 'Stop-Loss configurado com sucesso!'
        : 'Alerta criado com sucesso!';
      toast.success(successMsg);
      fetchAlerts();
    } catch (error: any) {
      console.error('Error creating alert:', error);
      toast.error('Erro ao criar alerta');
    }
  };

  const toggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('crypto_price_alerts' as any)
        .update({ is_active: !isActive })
        .eq('id', alertId);

      if (error) throw error;

      toast.success(`Alerta ${!isActive ? 'ativado' : 'desativado'} com sucesso!`);
      fetchAlerts();
    } catch (error: any) {
      console.error('Error toggling alert:', error);
      toast.error('Erro ao atualizar alerta');
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('crypto_price_alerts' as any)
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      toast.success('Alerta excluído com sucesso!');
      fetchAlerts();
    } catch (error: any) {
      console.error('Error deleting alert:', error);
      toast.error('Erro ao excluir alerta');
    }
  };

  return {
    alerts,
    loading,
    createAlert,
    toggleAlert,
    deleteAlert,
    refetch: fetchAlerts,
  };
}
