import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api/apiClient";
import { useEffect, useState } from "react";
import type {
  PrescricaoRemota,
  TeleconsultaComplete,
  Triagem,
} from "../../domain/types/teleodontologia.types";

export const useTeleodontologia = (clinicId: string) => {
  const [teleconsultas, setTeleconsultas] = useState<TeleconsultaComplete[]>(
    [],
  );
  const [prescricoes, setPrescricoes] = useState<PrescricaoRemota[]>([]);
  const [triagens, setTriagens] = useState<Triagem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadData = async () => {
    try {
      setLoading(true);

      // Buscar teleconsultas com detalhes (backend faz os joins)
      const teleconsultasData = await apiClient.get<TeleconsultaComplete[]>(
        "/teleodonto/teleconsultas",
        { params: { include_details: true } },
      );

      setTeleconsultas(teleconsultasData || []);

      // Load prescricoes
      const prescricoesData = await apiClient.get<PrescricaoRemota[]>(
        "/teleodonto/prescricoes",
      );

      // Load triagens
      const triagensData = await apiClient.get<Triagem[]>(
        "/teleodonto/triagens",
      );

      setPrescricoes(prescricoesData || []);
      setTriagens(triagensData || []);
    } catch (error: any) {
      console.error("Error loading teleodontologia data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clinicId) {
      loadData();

      // Implement polling for realtime updates
      const interval = setInterval(() => {
        loadData();
      }, 10000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [clinicId]);

  const createTeleconsulta = async (teleconsulta: any) => {
    try {
      const response = await apiClient.post<any>(
        "/teleodonto/teleconsultas",
        teleconsulta,
      );

      const data = Array.isArray(response) ? response[0] : response;

      toast({
        title: "Sucesso",
        description: "Teleconsulta criada com sucesso!",
      });

      await loadData();
      return data;
    } catch (error: any) {
      console.error("Error creating teleconsulta:", error);
      toast({
        title: "Erro",
        description:
          "Erro ao criar teleconsulta: " +
          (error.message || "Erro desconhecido"),
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTeleconsulta = async (id: string, updates: any) => {
    try {
      const response = await apiClient.patch<any>(
        `/teleodonto/teleconsultas/${id}`,
        updates,
      );

      const data = Array.isArray(response) ? response[0] : response;

      toast({
        title: "Sucesso",
        description: "Teleconsulta atualizada com sucesso!",
      });

      await loadData();
      return data;
    } catch (error: any) {
      console.error("Error updating teleconsulta:", error);
      toast({
        title: "Erro",
        description:
          "Erro ao atualizar teleconsulta: " +
          (error.message || "Erro desconhecido"),
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTeleconsulta = async (id: string) => {
    try {
      await apiClient.delete(`/teleodonto/teleconsultas/${id}`);

      toast({
        title: "Sucesso",
        description: "Teleconsulta excluída com sucesso!",
      });

      await loadData();
    } catch (error: any) {
      console.error("Error deleting teleconsulta:", error);
      toast({
        title: "Erro",
        description:
          "Erro ao excluir teleconsulta: " +
          (error.message || "Erro desconhecido"),
        variant: "destructive",
      });
      throw error;
    }
  };

  const createPrescricao = async (prescricao: any) => {
    try {
      const response = await apiClient.post<any>(
        "/teleodonto/prescricoes",
        prescricao,
      );

      const data = Array.isArray(response) ? response[0] : response;

      toast({
        title: "Sucesso",
        description: "Prescrição criada com sucesso!",
      });

      await loadData();
      return data;
    } catch (error: any) {
      console.error("Error creating prescricao:", error);
      toast({
        title: "Erro",
        description:
          "Erro ao criar prescrição: " + (error.message || "Erro desconhecido"),
        variant: "destructive",
      });
      throw error;
    }
  };

  const createTriagem = async (triagem: any) => {
    try {
      const response = await apiClient.post<any>(
        "/teleodonto/triagens",
        triagem,
      );

      const data = Array.isArray(response) ? response[0] : response;

      toast({
        title: "Sucesso",
        description: "Triagem criada com sucesso!",
      });

      await loadData();
      return data;
    } catch (error: any) {
      console.error("Error creating triagem:", error);
      toast({
        title: "Erro",
        description:
          "Erro ao criar triagem: " + (error.message || "Erro desconhecido"),
        variant: "destructive",
      });
      throw error;
    }
  };

  const iniciarConsulta = async (teleconsultaId: string) => {
    try {
      // Mock video room data for now
      return {
        token: "mock-token",
        appId: "mock-app-id",
        channelName: `teleconsulta-${teleconsultaId}`,
        uid: user?.id || "anonymous",
        teleconsultaId,
      };
    } catch (error: any) {
      console.error("Error starting consultation:", error);
      toast({
        title: "Erro",
        description:
          "Erro ao iniciar consulta: " + (error.message || "Erro desconhecido"),
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    teleconsultas,
    prescricoes,
    triagens,
    loading,
    createTeleconsulta,
    updateTeleconsulta,
    deleteTeleconsulta,
    createPrescricao,
    createTriagem,
    iniciarConsulta,
    refresh: loadData,
  };
};
