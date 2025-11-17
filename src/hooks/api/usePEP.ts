import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/apiClient';
import { toast } from 'sonner';

interface Prontuario {
  id: string;
  patient_id: string;
  clinic_id: string;
  created_at: string;
  created_by: string;
}

interface Evolucao {
  id: string;
  prontuario_id: string;
  descricao: string;
  created_at: string;
  created_by: string;
}

export const usePEP = (patientId?: string) => {
  const queryClient = useQueryClient();

  const { data: prontuario, isLoading: isLoadingProntuario } = useQuery({
    queryKey: ['prontuario', patientId],
    queryFn: async () => {
      if (!patientId) return null;
      return await apiClient.get<Prontuario>(`/pep/prontuarios/patient/${patientId}`);
    },
    enabled: !!patientId,
  });

  const { data: evolucoes = [], isLoading: isLoadingEvolucoes } = useQuery({
    queryKey: ['evolucoes', prontuario?.id],
    queryFn: async () => {
      if (!prontuario?.id) return [];
      return await apiClient.get<Evolucao[]>(`/pep/prontuarios/${prontuario.id}/evolucoes`);
    },
    enabled: !!prontuario?.id,
  });

  const criarProntuario = useMutation({
    mutationFn: async (data: { patient_id: string }) => {
      return await apiClient.post<Prontuario>('/pep/prontuarios', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prontuario'] });
      toast.success('Prontuário criado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar prontuário');
    },
  });

  const adicionarEvolucao = useMutation({
    mutationFn: async (data: { prontuario_id: string; descricao: string }) => {
      return await apiClient.post<Evolucao>(`/pep/prontuarios/${data.prontuario_id}/evolucoes`, {
        descricao: data.descricao,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolucoes'] });
      toast.success('Evolução adicionada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao adicionar evolução');
    },
  });

  const assinarDigitalmente = useMutation({
    mutationFn: async (data: { prontuario_id: string; pin: string }) => {
      return await apiClient.post(`/pep/prontuarios/${data.prontuario_id}/assinar`, { pin: data.pin });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prontuario'] });
      toast.success('Prontuário assinado digitalmente!');
    },
    onError: () => {
      toast.error('Erro ao assinar prontuário');
    },
  });

  return {
    prontuario,
    isLoadingProntuario,
    evolucoes,
    isLoadingEvolucoes,
    criarProntuario: criarProntuario.mutate,
    adicionarEvolucao: adicionarEvolucao.mutate,
    assinarDigitalmente: assinarDigitalmente.mutate,
    isCriandoProntuario: criarProntuario.isPending,
    isAdicionandoEvolucao: adicionarEvolucao.isPending,
  };
};
