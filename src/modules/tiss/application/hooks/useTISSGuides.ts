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
      const data = await apiClient.get<any[]>("/tiss/guias");
      return data;
    },
    enabled: !!clinicId,
  });

  const { data: batches = [], isLoading: isLoadingBatches } = useQuery({
    queryKey: ["tiss-batches", clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      const data = await apiClient.get<any[]>("/tiss/lotes");
      return data;
    },
    enabled: !!clinicId,
  });

  const createGuide = useMutation({
    mutationFn: async (guideData: any) => {
      const response = await apiClient.post<any>(
        "/tiss/guias",
        {
          ...guideData,
          created_by: user?.id,
        },
      );
      return response;
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
      const response = await apiClient.post<any>(
        "/tiss/lotes",
        {
          guide_ids: guideIds,
          batch_number: `LOTE-${Date.now()}`,
          insurance_company: "A_DEFINIR",
        },
      );
      return response;
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
