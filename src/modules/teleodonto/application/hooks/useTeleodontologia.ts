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

      // Buscar teleconsultas
      const teleconsultasData = await apiClient.get<any[]>(
        `/rest/v1/teleconsultas?clinic_id=eq.${clinicId}&order=data_agendada.desc`,
      );

      // Buscar informações de pacientes e dentistas separadamente
      if (teleconsultasData && teleconsultasData.length > 0) {
        const patientIds = [
          ...new Set(
            teleconsultasData.map((t) => t.patient_id).filter(Boolean),
          ),
        ];
        const dentistIds = [
          ...new Set(
            teleconsultasData.map((t) => t.dentist_id).filter(Boolean),
          ),
        ];

        let patientsData: any[] = [];
        if (patientIds.length > 0) {
          patientsData = await apiClient.get<any[]>(
            `/rest/v1/prontuarios?patient_id=in.(${patientIds.join(",")})&select=patient_id,patient_name`,
          );
        }

        let dentistsData: any[] = [];
        if (dentistIds.length > 0) {
          dentistsData = await apiClient.get<any[]>(
            `/rest/v1/profiles?id=in.(${dentistIds.join(",")})&select=id,full_name`,
          );
        }

        // Mapear dados para as teleconsultas
        const teleconsultasWithDetails = teleconsultasData.map((t) => ({
          ...t,
          patient_name: patientsData?.find((p) => p.patient_id === t.patient_id)
            ?.patient_name,
          dentist_name: dentistsData?.find((d) => d.id === t.dentist_id)
            ?.full_name,
        }));

        setTeleconsultas(teleconsultasWithDetails);
      } else {
        setTeleconsultas([]);
      }

      // Load prescricoes
      const prescricoesData = await apiClient.get<any[]>(
        "/rest/v1/prescricoes_remotas?order=created_at.desc",
      );

      // Load triagens (nome correto da tabela é singular)
      const triagensData = await apiClient.get<any[]>(
        "/rest/v1/triagem_teleconsulta?order=created_at.desc",
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

      // Implement polling to replace supabase realtime subscriptions
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
      const response = await apiClient.post<any>("/rest/v1/teleconsultas", {
        ...teleconsulta,
        clinic_id: clinicId,
      });

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
        `/rest/v1/teleconsultas?id=eq.${id}&clinic_id=eq.${clinicId}`,
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
      await apiClient.delete(
        `/rest/v1/teleconsultas?id=eq.${id}&clinic_id=eq.${clinicId}`,
      );

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
        "/rest/v1/prescricoes_remotas",
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
        "/rest/v1/triagem_teleconsulta",
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
