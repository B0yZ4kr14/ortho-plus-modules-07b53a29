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
        `/rest/v1/patient_notifications?patient_id=eq.${patientId}&order=created_at.desc&limit=50`,
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
        `/rest/v1/patient_messages?patient_id=eq.${patientId}&clinic_id=eq.${clinicId}&order=created_at.asc`,
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
      const response = await apiClient.get<PatientPreferences[]>(
        `/rest/v1/patient_preferences?patient_id=eq.${patientId}&limit=1`,
      );

      setPreferences(response[0] || null);
    } catch (error) {
      console.error("Erro ao carregar preferências:", error);
    }
  };

  // Marcar notificação como lida
  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.patch(
        `/rest/v1/patient_notifications?id=eq.${notificationId}`,
        {
          lida: true,
          lida_em: new Date().toISOString(),
        },
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
        `/rest/v1/patient_notifications?patient_id=eq.${patientId}&lida=eq.false`,
        {
          lida: true,
          lida_em: new Date().toISOString(),
        },
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
      await apiClient.post("/rest/v1/patient_messages", [
        {
          clinic_id: clinicId,
          patient_id: patientId,
          remetente_tipo: remetenteTipo,
          remetente_id: remetenteId,
          mensagem,
        },
      ]);

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
      await apiClient.post(
        "/rest/v1/patient_preferences",
        [
          {
            patient_id: patientId,
            ...updates,
          },
        ],
        { headers: { Prefer: "resolution=merge-duplicates" } },
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
      await apiClient.post("/rest/v1/patient_notifications", [
        notification as any,
      ]);

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
