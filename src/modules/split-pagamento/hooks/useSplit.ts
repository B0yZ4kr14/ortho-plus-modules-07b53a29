import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/apiClient";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useSplit() {
  const { user, selectedClinic } = useAuth();
  const [configs, setConfigs] = useState<any[]>([]);
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [comissoes, setComissoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!selectedClinic) return;

    try {
      setLoading(true);

      const [configsData, transacoesData, comissoesData] = await Promise.all([
        apiClient.get("/split/config", {
          params: { clinic_id: selectedClinic, sort: "created_at.desc" },
        }),
        apiClient.get("/split/transacoes", {
          params: { clinic_id: selectedClinic, sort: "created_at.desc" },
        }),
        apiClient.get("/split/comissoes", {
          params: { clinic_id: selectedClinic, sort: "mes_referencia.desc" },
        }),
      ]);

      if (configsData) setConfigs(configsData as any[]);
      if (transacoesData) setTransacoes(transacoesData as any[]);
      if (comissoesData) setComissoes(comissoesData as any[]);
    } catch (error: any) {
      console.error("Erro ao carregar dados de split:", error);
      toast.error("Erro ao carregar dados de split");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Setup polling since realtime subscriptions are removed
    const interval = setInterval(() => {
      loadData();
    }, 45000); // Poll every 45 seconds

    return () => clearInterval(interval);
  }, [selectedClinic]);

  const createConfig = async (configData: any) => {
    if (!user || !selectedClinic) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      await apiClient.post("/split/config", {
        ...configData,
        clinic_id: selectedClinic,
      });

      toast.success("Configuração de split criada com sucesso!");
      await loadData();
    } catch (error: any) {
      console.error("Erro ao criar configuração:", error);
      toast.error("Erro ao criar configuração de split");
    }
  };

  const updateConfig = async (id: string, configData: any) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      await apiClient.put(`/split/config/${id}`, configData);

      toast.success("Configuração de split atualizada com sucesso!");
      await loadData();
    } catch (error: any) {
      console.error("Erro ao atualizar configuração:", error);
      toast.error("Erro ao atualizar configuração de split");
    }
  };

  const deleteConfig = async (id: string) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      await apiClient.delete(`/split/config/${id}`);

      toast.success("Configuração de split excluída com sucesso!");
      await loadData();
    } catch (error: any) {
      console.error("Erro ao excluir configuração:", error);
      toast.error("Erro ao excluir configuração de split");
    }
  };

  return {
    configs,
    transacoes,
    comissoes,
    loading,
    createConfig,
    updateConfig,
    deleteConfig,
    loadData,
  };
}
