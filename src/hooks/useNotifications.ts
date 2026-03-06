import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/apiClient";
import { useEffect, useState } from "react";

interface Notification {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  link_acao: string | null;
  lida: boolean;
  lida_em: string | null;
  created_at: string;
}

export const useNotifications = () => {
  const { user, selectedClinic } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    if (!user || !selectedClinic) return;

    try {
      const data = await apiClient.get<{ notifications: Notification[] }>(
        "/notifications",
      );
      setNotifications(data.notifications || []);
      setUnreadCount(data.notifications?.filter((n) => !n.lida).length || 0);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`, {});
      await loadNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user || !selectedClinic) return;

    try {
      await apiClient.post("/notifications/mark-all-read", {});
      await loadNotifications();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Poll every 30 seconds instead of realtime websocket
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [user, selectedClinic]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: loadNotifications,
  };
};
