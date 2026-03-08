import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api/apiClient";
import { useEffect, useState } from "react";
import type { AnaliseComplete } from "../types/radiografia.types";

export const useRadiografia = () => {
  const [analises, setAnalises] = useState<AnaliseComplete[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, clinicId } = useAuth();

  const loadData = async () => {
    try {
      if (!user || !clinicId) return;
      setLoading(true);

      // Backend faz os joins com pacientes
      const analisesData = await apiClient.get<AnaliseComplete[]>(
        "/ia-radiografia/analises",
      );

      setAnalises(analisesData || []);
    } catch (error) {
      console.error("Erro ao carregar análises:", error);
      toast({
        title: "Erro ao carregar análises",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadRadiografia = async (
    patientId: string,
    prontuarioId: string | undefined,
    tipoRadiografia: string,
    file: File,
  ) => {
    try {
      if (!user) throw new Error("Usuário não autenticado");
      if (!clinicId) throw new Error("Clínica não encontrada");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("patient_id", patientId);
      if (prontuarioId) formData.append("prontuario_id", prontuarioId);
      formData.append("tipo_radiografia", tipoRadiografia);

      const analise = await apiClient.post<any>(
        "/ia-radiografia/upload-e-analisar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast({
        title: "Radiografia enviada",
        description: "Análise com IA sendo processada...",
      });

      await loadData();
      return analise;
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro ao fazer upload",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    }
  };

  const marcarComoRevisado = async (analiseId: string, observacoes: string) => {
    try {
      await apiClient.patch(
        `/ia-radiografia/analises/${analiseId}/revisar`,
        {
          observacoes_dentista: observacoes,
        },
      );

      toast({
        title: "Análise revisada",
        description: "Observações do dentista salvas com sucesso",
      });

      await loadData();
    } catch (error) {
      console.error("Erro ao marcar como revisado:", error);
      toast({
        title: "Erro ao salvar revisão",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (clinicId) {
      loadData();

      // Realtime subscriptions replaced with polling
      const interval = setInterval(() => {
        loadData();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [clinicId, user]);

  return {
    analises,
    loading,
    uploadRadiografia,
    marcarComoRevisado,
    reloadData: loadData,
  };
};
