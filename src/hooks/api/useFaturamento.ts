import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/apiClient';
import { toast } from 'sonner';

interface NFe {
  id: string;
  clinic_id: string;
  numero: string;
  serie: string;
  valor_total: number;
  status: string;
  chave_acesso?: string;
  xml_path?: string;
  created_at: string;
}

export const useFaturamento = () => {
  const queryClient = useQueryClient();

  const { data: notas = [], isLoading: isLoadingNotas } = useQuery({
    queryKey: ['notas-fiscais'],
    queryFn: async () => {
      return await apiClient.get<NFe[]>('/faturamento/nfe');
    },
  });

  const emitirNFe = useMutation({
    mutationFn: async (data: {
      destinatario: {
        cpf_cnpj: string;
        nome: string;
        endereco: string;
      };
      items: Array<{
        descricao: string;
        quantidade: number;
        valor_unitario: number;
      }>;
    }) => {
      return await apiClient.post<NFe>('/faturamento/nfe/emitir', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] });
      toast.success('NFe emitida com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao emitir NFe');
    },
  });

  const autorizarNFe = useMutation({
    mutationFn: async (nfeId: string) => {
      return await apiClient.post<NFe>(`/faturamento/nfe/${nfeId}/autorizar`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] });
      toast.success('NFe autorizada pela SEFAZ!');
    },
    onError: () => {
      toast.error('Erro ao autorizar NFe');
    },
  });

  const cancelarNFe = useMutation({
    mutationFn: async (data: { nfe_id: string; motivo: string }) => {
      return await apiClient.post<NFe>(`/faturamento/nfe/${data.nfe_id}/cancelar`, {
        motivo: data.motivo,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] });
      toast.success('NFe cancelada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao cancelar NFe');
    },
  });

  const consultarStatusSEFAZ = useMutation({
    mutationFn: async (nfeId: string) => {
      return await apiClient.get<{ status: string }>(`/faturamento/nfe/${nfeId}/status-sefaz`);
    },
    onSuccess: (data) => {
      toast.success(`Status SEFAZ: ${data.status}`);
    },
    onError: () => {
      toast.error('Erro ao consultar status na SEFAZ');
    },
  });

  return {
    notas,
    isLoadingNotas,
    emitirNFe: emitirNFe.mutate,
    autorizarNFe: autorizarNFe.mutate,
    cancelarNFe: cancelarNFe.mutate,
    consultarStatusSEFAZ: consultarStatusSEFAZ.mutate,
    isEmitindoNFe: emitirNFe.isPending,
  };
};
