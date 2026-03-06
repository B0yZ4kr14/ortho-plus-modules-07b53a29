import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useInadimplentes = () => {
  const { clinicId } = useAuth();
  const queryClient = useQueryClient();

  const { data: inadimplentes = [], isLoading } = useQuery({
    queryKey: ["inadimplentes", clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      const data: any = await apiClient.get("/inadimplentes", {
        params: { clinic_id: clinicId, sort: "valor_total_devido.desc" },
      });
      return data;
    },
    enabled: !!clinicId,
  });

  const { data: campanhas = [], isLoading: isLoadingCampanhas } = useQuery({
    queryKey: ["campanhas-inadimplencia", clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      const data: any = await apiClient.get("/campanhas-inadimplencia", {
        params: { clinic_id: clinicId, sort: "created_at.desc" },
      });
      return data;
    },
    enabled: !!clinicId,
  });

  const iniciarCobranca = useMutation({
    mutationFn: async ({
      inadimplenteId,
      tipo,
    }: {
      inadimplenteId: string;
      tipo: string;
    }) => {
      const data: any = await apiClient.post("/campanhas-inadimplencia", {
        clinic_id: clinicId,
        inadimplente_id: inadimplenteId,
        tipo_campanha: tipo,
        status: "ATIVA",
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["campanhas-inadimplencia", clinicId],
      });
      toast.success("Cobrança iniciada!");
    },
    onError: () => {
      toast.error("Erro ao iniciar cobrança");
    },
  });

  return {
    inadimplentes,
    campanhas,
    isLoading: isLoading || isLoadingCampanhas,
    iniciarCobranca: iniciarCobranca.mutate,
  };
};
