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

      const analisesData = await apiClient.get<any[]>(
        `/rest/v1/analises_radiograficas?clinic_id=eq.${clinicId}&order=created_at.desc`,
      );

      // Buscar dados dos pacientes separadamente
      const patientIds = [
        ...new Set(analisesData?.map((a) => a.patient_id).filter(Boolean)),
      ];

      let patientsMap: Record<string, any> = {};
      if (patientIds.length > 0) {
        const patientsData = await apiClient.get<any[]>(
          `/rest/v1/patients?id=in.(${patientIds.join(",")})&select=id,nome_completo`,
        );

        patientsMap = (patientsData || []).reduce((acc: any, patient: any) => {
          acc[patient.id] = patient;
          return acc;
        }, {});
      }

      const analisesFormatadas =
        analisesData?.map((analise: any) => ({
          ...analise,
          patient_name:
            patientsMap[analise.patient_id]?.nome_completo ||
            "Paciente não identificado",
          problemas: analise.resultado_ia?.problemas_detectados || [],
        })) || [];

      setAnalises(analisesFormatadas);
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

      // Upload do arquivo
      const fileExt = file.name.split(".").pop();
      const fileName = `${clinicId}/${patientId}/${Date.now()}.${fileExt}`;
      const filePath = `radiografias/${fileName}`;

      const formData = new FormData();
      formData.append("file", file);

      await apiClient.post(
        `/rest/v1/storage/pep-anexos/upload?path=${encodeURIComponent(filePath)}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      const publicUrl = `${baseUrl}/rest/v1/storage/pep-anexos/public?path=${encodeURIComponent(filePath)}`;

      // Criar registro de análise
      const analiseResponse = await apiClient.post<any>(
        "/rest/v1/analises_radiograficas",
        {
          clinic_id: clinicId,
          patient_id: patientId,
          prontuario_id: prontuarioId,
          tipo_radiografia: tipoRadiografia,
          imagem_url: publicUrl,
          imagem_storage_path: filePath,
          status_analise: "PENDENTE",
        },
      );

      const analise = Array.isArray(analiseResponse)
        ? analiseResponse[0]
        : analiseResponse;

      toast({
        title: "Radiografia enviada",
        description: "Iniciando análise com IA...",
      });

      // Chamar Edge Function para análise
      try {
        await apiClient.post("/rest/v1/functions/analisar-radiografia", {
          analise_id: analise.id,
          imagem_url: publicUrl,
        });

        toast({
          title: "Análise iniciada",
          description:
            "A IA está analisando a radiografia. Isso pode levar alguns segundos.",
        });
      } catch (functionError) {
        console.error("Erro ao iniciar análise:", functionError);
        toast({
          title: "Erro na análise",
          description: "A análise não pôde ser iniciada. Tente novamente.",
          variant: "destructive",
        });
      }

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
        `/rest/v1/analises_radiograficas?id=eq.${analiseId}`,
        {
          revisado_por_dentista: true,
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
