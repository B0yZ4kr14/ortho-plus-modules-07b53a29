import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { PatientNotification, PatientMessage, PatientPreferences } from '../types/patient-portal.types';
import { toast } from 'sonner';

export function usePatientPortalSupabase(patientId?: string) {
  const [notifications, setNotifications] = useState<PatientNotification[]>([]);
  const [messages, setMessages] = useState<PatientMessage[]>([]);
  const [preferences, setPreferences] = useState<PatientPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Carregar notificações
  const loadNotifications = async () => {
    if (!patientId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patient_notifications')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data as PatientNotification[]);
      
      // Contar não lidas
      const unread = data.filter(n => !n.lida).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      toast.error('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  // Carregar mensagens
  const loadMessages = async (clinicId: string) => {
    if (!patientId) return;
    
    try {
      const { data, error } = await supabase
        .from('patient_messages')
        .select('*')
        .eq('patient_id', patientId)
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data as PatientMessage[]);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast.error('Erro ao carregar mensagens');
    }
  };

  // Carregar preferências
  const loadPreferences = async () => {
    if (!patientId) return;
    
    try {
      const { data, error } = await supabase
        .from('patient_preferences')
        .select('*')
        .eq('patient_id', patientId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setPreferences(data as PatientPreferences);
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
    }
  };

  // Marcar notificação como lida
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('patient_notifications')
        .update({ 
          lida: true,
          lida_em: new Date().toISOString(),
        })
        .eq('id', notificationId);

      if (error) throw error;

      await loadNotifications();
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    if (!patientId) return;

    try {
      const { error } = await supabase
        .from('patient_notifications')
        .update({ 
          lida: true,
          lida_em: new Date().toISOString(),
        })
        .eq('patient_id', patientId)
        .eq('lida', false);

      if (error) throw error;

      await loadNotifications();
      toast.success('Todas as notificações foram marcadas como lidas');
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      toast.error('Erro ao marcar notificações como lidas');
    }
  };

  // Enviar mensagem
  const sendMessage = async (clinicId: string, mensagem: string, remetenteTipo: 'PACIENTE' | 'CLINICA', remetenteId: string) => {
    if (!patientId) return;

    try {
      const { error } = await supabase
        .from('patient_messages')
        .insert({
          clinic_id: clinicId,
          patient_id: patientId,
          remetente_tipo: remetenteTipo,
          remetente_id: remetenteId,
          mensagem,
        });

      if (error) throw error;

      await loadMessages(clinicId);
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
      return false;
    }
  };

  // Atualizar preferências
  const updatePreferences = async (updates: Partial<PatientPreferences>) => {
    if (!patientId) return;

    try {
      const { error } = await supabase
        .from('patient_preferences')
        .upsert({
          patient_id: patientId,
          ...updates,
        });

      if (error) throw error;

      await loadPreferences();
      toast.success('Preferências atualizadas com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      toast.error('Erro ao atualizar preferências');
      return false;
    }
  };

  // Criar notificação (usado pela clínica)
  const createNotification = async (notification: Partial<PatientNotification>) => {
    try {
      const { error } = await supabase
        .from('patient_notifications')
        .insert(notification as any);

      if (error) throw error;

      await loadNotifications();
      return true;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      toast.error('Erro ao criar notificação');
      return false;
    }
  };

  // Carregar dados ao montar
  useEffect(() => {
    if (patientId) {
      loadNotifications();
      loadPreferences();

      // Subscrever a mudanças em tempo real
      const channel = supabase
        .channel('patient-portal-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'patient_notifications', filter: `patient_id=eq.${patientId}` }, () => {
          loadNotifications();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [patientId]);

  return {
    notifications,
    messages,
    preferences,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    sendMessage,
    updatePreferences,
    createNotification,
    loadMessages,
    refreshNotifications: loadNotifications,
  };
}
