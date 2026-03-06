import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useTISSGuides = () => {
  const { clinicId, user } = useAuth();
  const queryClient = useQueryClient();

  const { data: guides = [], isLoading } = useQuery({
    queryKey: ["tiss-guides", clinicId],
    queryFn: async () => {
      if (!clinicId) return [];

      const data = await apiClient.get<any[]>(
        `/rest/v1/tiss_guides?clinic_id=eq.${clinicId}&order=data_atendimento.desc`,
      );
      return data;
    },
    enabled: !!clinicId,
  });

  const { data: batches = [], isLoading: isLoadingBatches } = useQuery({
    queryKey: ["tiss-batches", clinicId],
    queryFn: async () => {
      if (!clinicId) return [];

      const data = await apiClient.get<any[]>(
        `/rest/v1/tiss_batches?clinic_id=eq.${clinicId}&order=created_at.desc`,
      );
      return data;
    },
    enabled: !!clinicId,
  });

  const createGuide = useMutation({
    mutationFn: async (guideData: any) => {
      const response = await apiClient.post<any[]>(
        "/rest/v1/tiss_guides",
        [
          {
            ...guideData,
            clinic_id: clinicId,
            created_by: user?.id,
          },
        ],
        { headers: { Prefer: "return=representation" } },
      );

      return response[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiss-guides", clinicId] });
      toast.success("Guia TISS criada!");
    },
    onError: () => {
      toast.error("Erro ao criar guia");
    },
  });

  const createBatch = useMutation({
    mutationFn: async (guideIds: string[]) => {
      const response = await apiClient.post<any[]>(
        "/rest/v1/tiss_batches",
        [
          {
            clinic_id: clinicId,
            guide_ids: guideIds,
            status: "PENDENTE",
            batch_number: `LOTE-${Date.now()}`,
            insurance_company: "A_DEFINIR",
          },
        ],
        { headers: { Prefer: "return=representation" } },
      );

      return response[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiss-batches", clinicId] });
      toast.success("Lote criado!");
    },
    onError: () => {
      toast.error("Erro ao criar lote");
    },
  });

  return {
    guides,
    batches,
    isLoading: isLoading || isLoadingBatches,
    createGuide: createGuide.mutate,
    createBatch: createBatch.mutate,
  };
};
