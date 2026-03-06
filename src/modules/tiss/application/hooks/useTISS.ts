import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface TISSGuide {
  id: string;
  clinic_id: string;
  batch_id?: string;
  guide_number: string;
  patient_id: string;
  insurance_company: string;
  procedure_code: string;
  procedure_name: string;
  amount: number;
  status: "pendente" | "enviada" | "aprovada" | "glosada";
  service_date: string;
  submission_date?: string;
  response_date?: string;
  created_at: string;
  updated_at: string;
}

export interface TISSBatch {
  id: string;
  clinic_id: string;
  batch_number: string;
  insurance_company: string;
  total_guides: number;
  total_amount: number;
  status: "pendente" | "enviado" | "processando" | "concluido";
  sent_at?: string;
  processed_at?: string;
  created_at: string;
}

export function useTISS() {
  const { user, clinicId } = useAuth();
  const queryClient = useQueryClient();

  const { data: guides = [], isLoading: loadingGuides } = useQuery({
    queryKey: ["tiss-guides", clinicId],
    queryFn: async () => {
      const data = await apiClient.get<TISSGuide[]>(
        `/rest/v1/tiss_guides?clinic_id=eq.${clinicId}&order=created_at.desc&limit=100`,
      );
      return data;
    },
    enabled: !!clinicId,
  });

  const { data: batches = [], isLoading: loadingBatches } = useQuery({
    queryKey: ["tiss-batches", clinicId],
    queryFn: async () => {
      const data = await apiClient.get<TISSBatch[]>(
        `/rest/v1/tiss_batches?clinic_id=eq.${clinicId}&order=created_at.desc&limit=50`,
      );
      return data;
    },
    enabled: !!clinicId,
  });

  const createGuide = useMutation({
    mutationFn: async (
      guideData: Partial<TISSGuide> & {
        patient_id: string;
        insurance_company: string;
        procedure_code: string;
        procedure_name: string;
        amount: number;
        service_date: string;
      },
    ) => {
      const guideNumber = `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;

      const response = await apiClient.post<any[]>(
        "/rest/v1/tiss_guides",
        [
          {
            clinic_id: clinicId!,
            guide_number: guideNumber,
            patient_id: guideData.patient_id,
            insurance_company: guideData.insurance_company,
            procedure_code: guideData.procedure_code,
            procedure_name: guideData.procedure_name,
            amount: guideData.amount,
            service_date: guideData.service_date,
            status: "pendente",
          },
        ],
        { headers: { Prefer: "return=representation" } },
      );

      return response[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiss-guides"] });
      toast.success("Guia TISS criada!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar guia: ${error.message}`);
    },
  });

  const createBatch = useMutation({
    mutationFn: async ({
      insurance_company,
      guide_ids,
    }: {
      insurance_company: string;
      guide_ids: string[];
    }) => {
      // Generate batch number
      const batchNumber = `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;

      // Get guides to calculate totals
      const batchGuides = await apiClient.get<TISSGuide[]>(
        `/rest/v1/tiss_guides?id=in.(${guide_ids.join(",")})`,
      );

      const totalAmount = batchGuides.reduce(
        (sum, guide) => sum + guide.amount,
        0,
      );

      const response = await apiClient.post<any[]>(
        "/rest/v1/tiss_batches",
        [
          {
            clinic_id: clinicId,
            batch_number: batchNumber,
            insurance_company,
            total_guides: guide_ids.length,
            total_amount: totalAmount,
          },
        ],
        { headers: { Prefer: "return=representation" } },
      );

      const data = response[0];

      // Update guides with batch_id
      await apiClient.patch(
        `/rest/v1/tiss_guides?id=in.(${guide_ids.join(",")})`,
        {
          batch_id: data.id,
          status: "enviada",
          submission_date: new Date().toISOString(),
        },
      );

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiss-batches"] });
      queryClient.invalidateQueries({ queryKey: ["tiss-guides"] });
      toast.success("Lote TISS criado e enviado!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar lote: ${error.message}`);
    },
  });

  return {
    guides,
    batches,
    isLoading: loadingGuides || loadingBatches,
    createGuide: createGuide.mutate,
    isCreatingGuide: createGuide.isPending,
    createBatch: createBatch.mutate,
    isCreatingBatch: createBatch.isPending,
  };
}
