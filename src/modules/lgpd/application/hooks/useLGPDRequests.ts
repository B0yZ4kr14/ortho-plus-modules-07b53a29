import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useLGPDRequests = () => {
  const { clinicId, user } = useAuth();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["lgpd-requests", clinicId],
    queryFn: async () => {
      if (!clinicId) return [];

      const data = await apiClient.get<any[]>(
        `/rest/v1/lgpd_data_requests?clinic_id=eq.${clinicId}&order=created_at.desc`,
      );
      return data;
    },
    enabled: !!clinicId,
  });

  const { data: consents = [], isLoading: isLoadingConsents } = useQuery({
    queryKey: ["lgpd-consents", clinicId],
    queryFn: async () => {
      if (!clinicId) return [];

      const data = await apiClient.get<any[]>(
        `/rest/v1/lgpd_consents?clinic_id=eq.${clinicId}&order=created_at.desc`,
      );
      return data;
    },
    enabled: !!clinicId,
  });

  const createRequest = useMutation({
    mutationFn: async (requestData: any) => {
      const response = await apiClient.post<any[]>(
        "/rest/v1/lgpd_data_requests",
        [
          {
            ...requestData,
            clinic_id: clinicId,
            requested_by: user?.id,
          },
        ],
        {
          headers: {
            Prefer: "return=representation",
          },
        },
      );
      return response[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lgpd-requests", clinicId] });
      toast.success("Solicitação criada!");
    },
    onError: () => {
      toast.error("Erro ao criar solicitação");
    },
  });

  const updateRequestStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiClient.patch(`/rest/v1/lgpd_data_requests?id=eq.${id}`, {
        status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lgpd-requests", clinicId] });
      toast.success("Status atualizado!");
    },
  });

  return {
    requests,
    consents,
    isLoading: isLoading || isLoadingConsents,
    createRequest: createRequest.mutate,
    updateRequestStatus: updateRequestStatus.mutate,
  };
};
