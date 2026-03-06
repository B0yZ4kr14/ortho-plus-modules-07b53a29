import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useTeleconsultas = () => {
  const { clinicId } = useAuth();
  const queryClient = useQueryClient();

  const { data: teleconsultas = [], isLoading } = useQuery({
    queryKey: ["teleconsultas", clinicId],
    queryFn: async () => {
      if (!clinicId) return [];

      const data = await apiClient.get<any[]>(
        `/rest/v1/teleconsultas?clinic_id=eq.${clinicId}&order=data_agendada.desc`,
      );

      return data;
    },
    enabled: !!clinicId,
  });

  const createTeleconsulta = useMutation({
    mutationFn: async (teleconsulta: any) => {
      const response = await apiClient.post<any>("/rest/v1/teleconsultas", {
        ...teleconsulta,
        clinic_id: clinicId,
      });

      return Array.isArray(response) ? response[0] : response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teleconsultas", clinicId] });
      toast.success("Teleconsulta agendada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao agendar teleconsulta");
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiClient.patch(`/rest/v1/teleconsultas?id=eq.${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teleconsultas", clinicId] });
      toast.success("Status atualizado!");
    },
  });

  return {
    teleconsultas,
    isLoading,
    createTeleconsulta: createTeleconsulta.mutate,
    updateStatus: updateStatus.mutate,
  };
};
