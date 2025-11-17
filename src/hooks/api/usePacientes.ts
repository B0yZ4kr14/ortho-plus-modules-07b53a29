/**
 * usePacientes Hook
 * Hook para gestão de pacientes via REST API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/apiClient';
import { toast } from 'sonner';

interface Patient {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
  email?: string;
  status: string;
  createdAt: string;
}

interface CreatePatientData {
  nome: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
  email?: string;
  endereco?: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
}

interface PatientsResponse {
  patients: Patient[];
  total: number;
  page: number;
  totalPages: number;
}

export const usePacientes = () => {
  const queryClient = useQueryClient();

  // Listar pacientes
  const { data, isLoading, error } = useQuery({
    queryKey: ['pacientes'],
    queryFn: async () => {
      return await apiClient.get<PatientsResponse>('/pacientes');
    },
  });

  // Criar paciente
  const createMutation = useMutation({
    mutationFn: async (patientData: CreatePatientData) => {
      return await apiClient.post('/pacientes', patientData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
      toast.success('Paciente cadastrado com sucesso!');
    },
  });

  // Alterar status do paciente
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus, reason }: { id: string; newStatus: string; reason?: string }) => {
      return await apiClient.patch(`/pacientes/${id}/status`, { newStatus, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
      toast.success('Status do paciente atualizado!');
    },
  });

  // Obter paciente específico
  const usePatient = (id: string) => {
    return useQuery({
      queryKey: ['paciente', id],
      queryFn: async () => {
        return await apiClient.get<{ patient: Patient }>(`/pacientes/${id}`);
      },
      enabled: !!id,
    });
  };

  return {
    patients: data?.patients || [],
    total: data?.total || 0,
    isLoading,
    error,
    createPatient: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateStatus: updateStatusMutation.mutate,
    isUpdatingStatus: updateStatusMutation.isPending,
    usePatient,
  };
};
