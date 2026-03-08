import { apiClient } from "@/lib/api/apiClient";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  PatientMessage,
  PatientNotification,
  PatientPreferences,
} from "../types/patient-portal.types";

export function usePatientPortal(patientId?: string) {
  const [notifications, setNotifications] = useState<PatientNotification[]>([]);
  const [messages, setMessages] = useState<PatientMessage[]>([]);
  const [preferences, setPreferences] = useState<PatientPreferences | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Carregar notificações
  const loadNotifications = async () => {
    if (!patientId) return;

    try {
      setLoading(true);
      const data = await apiClient.get<PatientNotification[]>(
        `/portal-paciente/${patientId}/notificacoes`,
      );

      setNotifications(data);

      // Contar não lidas
      const unread = data.filter((n) => !n.lida).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
      toast.error("Erro ao carregar notificações");
    } finally {
      setLoading(false);
    }
  };

  // Carregar mensagens
  const loadMessages = async (clinicId: string) => {
    if (!patientId) return;

    try {
      const data = await apiClient.get<PatientMessage[]>(
        `/portal-paciente/${patientId}/mensagens`,
        { params: { clinic_id: clinicId } },
      );

      setMessages(data);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
      toast.error("Erro ao carregar mensagens");
    }
  };

  // Carregar preferências
  const loadPreferences = async () => {
    if (!patientId) return;

    try {
      const response = await apiClient.get<PatientPreferences>(
        `/portal-paciente/${patientId}/preferencias`,
      );

      setPreferences(response || null);
    } catch (error) {
      console.error("Erro ao carregar preferências:", error);
    }
  };

  // Marcar notificação como lida
  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.patch(
        `/portal-paciente/${patientId}/notificacoes/${notificationId}/lida`,
        {},
      );

      await loadNotifications();
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    if (!patientId) return;

    try {
      await apiClient.patch(
        `/portal-paciente/${patientId}/notificacoes/marcar-todas-lidas`,
        {},
      );

      await loadNotifications();
      toast.success("Todas as notificações foram marcadas como lidas");
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
      toast.error("Erro ao marcar notificações como lidas");
    }
  };

  // Enviar mensagem
  const sendMessage = async (
    clinicId: string,
    mensagem: string,
    remetenteTipo: "PACIENTE" | "CLINICA",
    remetenteId: string,
  ) => {
    if (!patientId) return;

    try {
      await apiClient.post(
        `/portal-paciente/${patientId}/mensagens`,
        {
          clinic_id: clinicId,
          remetente_tipo: remetenteTipo,
          remetente_id: remetenteId,
          mensagem,
        },
      );

      await loadMessages(clinicId);
      return true;
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao enviar mensagem");
      return false;
    }
  };

  // Atualizar preferências
  const updatePreferences = async (updates: Partial<PatientPreferences>) => {
    if (!patientId) return;

    try {
      await apiClient.put(
        `/portal-paciente/${patientId}/preferencias`,
        updates,
      );

      await loadPreferences();
      toast.success("Preferências atualizadas com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro ao atualizar preferências:", error);
      toast.error("Erro ao atualizar preferências");
      return false;
    }
  };

  // Criar notificação (usado pela clínica)
  const createNotification = async (
    notification: Partial<PatientNotification>,
  ) => {
    try {
      await apiClient.post(
        `/portal-paciente/${patientId}/notificacoes`,
        notification,
      );

      await loadNotifications();
      return true;
    } catch (error) {
      console.error("Erro ao criar notificação:", error);
      toast.error("Erro ao criar notificação");
      return false;
    }
  };

  // Carregar dados ao montar
  useEffect(() => {
    if (patientId) {
      loadNotifications();
      loadPreferences();

      // Substituir realtime por polling a cada 30 segundos
      const intervalId = setInterval(() => {
        loadNotifications();
      }, 30000);

      return () => {
        clearInterval(intervalId);
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
