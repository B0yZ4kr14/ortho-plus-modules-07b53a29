import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/apiClient";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useFidelidade() {
  const { user, selectedClinic } = useAuth();
  const [config, setConfig] = useState<any>({});
  const [pontos, setPontos] = useState<any[]>([]);
  const [recompensas, setRecompensas] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [indicacoes, setIndicacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!selectedClinic) return;

    try {
      setLoading(true);

      const [
        configData,
        pontosData,
        recompensasData,
        badgesData,
        indicacoesData,
      ] = await Promise.all([
        apiClient.get("/fidelidade/config"),
        apiClient.get("/fidelidade/pontos", {
          params: { sort: "created_at.desc" },
        }),
        apiClient.get("/fidelidade/recompensas", {
          params: { sort: "pontos_necessarios.asc" },
        }),
        apiClient.get("/fidelidade/badges", {
          params: { sort: "created_at.desc" },
        }),
        apiClient.get("/fidelidade/indicacoes", {
          params: { sort: "created_at.desc" },
        }),
      ]);

      if (configData) setConfig(configData as any);
      if (pontosData) setPontos(pontosData as any[]);
      if (recompensasData) setRecompensas(recompensasData as any[]);
      if (badgesData) setBadges(badgesData as any[]);
      if (indicacoesData) setIndicacoes(indicacoesData as any[]);
    } catch (error: any) {
      console.error("Erro ao carregar dados de fidelidade:", error);
      toast.error("Erro ao carregar dados de fidelidade");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Polling as a replacement for realtime subscriptions
    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedClinic]);

  const createOrUpdateConfig = async (configData: any) => {
    if (!user || !selectedClinic) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      if (config && config.id) {
        // Update
        await apiClient.put("/fidelidade/config", configData);
        toast.success("Configuração atualizada com sucesso!");
      } else {
        // Create
        await apiClient.post("/fidelidade/config", configData);
        toast.success("Configuração criada com sucesso!");
      }

      await loadData();
    } catch (error: any) {
      console.error("Erro ao salvar configuração:", error);
      toast.error("Erro ao salvar configuração");
    }
  };

  const createRecompensa = async (recompensaData: any) => {
    if (!user || !selectedClinic) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      await apiClient.post("/fidelidade/recompensas", recompensaData);
      toast.success("Recompensa criada com sucesso!");
      await loadData();
    } catch (error: any) {
      console.error("Erro ao criar recompensa:", error);
      toast.error("Erro ao criar recompensa");
    }
  };

  const updateRecompensa = async (id: string, recompensaData: any) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      await apiClient.put(`/fidelidade/recompensas/${id}`, recompensaData);
      toast.success("Recompensa atualizada com sucesso!");
      await loadData();
    } catch (error: any) {
      console.error("Erro ao atualizar recompensa:", error);
      toast.error("Erro ao atualizar recompensa");
    }
  };

  const deleteRecompensa = async (id: string) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      await apiClient.delete(`/fidelidade/recompensas/${id}`);
      toast.success("Recompensa excluída com sucesso!");
      await loadData();
    } catch (error: any) {
      console.error("Erro ao excluir recompensa:", error);
      toast.error("Erro ao excluir recompensa");
    }
  };

  const createBadge = async (badgeData: any) => {
    if (!user || !selectedClinic) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      await apiClient.post("/fidelidade/badges", badgeData);
      toast.success("Badge criada com sucesso!");
      await loadData();
    } catch (error: any) {
      console.error("Erro ao criar badge:", error);
      toast.error("Erro ao criar badge");
    }
  };

  return {
    config,
    pontos,
    recompensas,
    badges,
    indicacoes,
    loading,
    createOrUpdateConfig,
    createRecompensa,
    updateRecompensa,
    deleteRecompensa,
    createBadge,
    loadData,
  };
}
