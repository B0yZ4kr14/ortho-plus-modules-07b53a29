import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/apiClient';
import { toast } from 'sonner';

interface TerminalSession {
  id: string;
  clinic_id: string;
  user_id: string;
  status: string;
  created_at: string;
  last_activity_at: string;
}

interface CommandResult {
  output: string;
  exit_code: number;
  executed_at: string;
}

export const useTerminal = () => {
  const queryClient = useQueryClient();

  const { data: session, isLoading: isLoadingSession } = useQuery({
    queryKey: ['terminal-session'],
    queryFn: async () => {
      return await apiClient.get<TerminalSession>('/terminal/session');
    },
  });

  const { data: history = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['terminal-history', session?.id],
    queryFn: async () => {
      if (!session?.id) return [];
      return await apiClient.get<CommandResult[]>(`/terminal/sessions/${session.id}/history`);
    },
    enabled: !!session?.id,
  });

  const criarSessao = useMutation({
    mutationFn: async () => {
      return await apiClient.post<TerminalSession>('/terminal/sessions');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terminal-session'] });
      toast.success('Sessão de terminal criada!');
    },
    onError: () => {
      toast.error('Erro ao criar sessão de terminal');
    },
  });

  const executarComando = useMutation({
    mutationFn: async (data: { session_id: string; command: string }) => {
      return await apiClient.post<CommandResult>(`/terminal/sessions/${data.session_id}/execute`, {
        command: data.command,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terminal-history'] });
    },
    onError: () => {
      toast.error('Erro ao executar comando');
    },
  });

  const encerrarSessao = useMutation({
    mutationFn: async (sessionId: string) => {
      return await apiClient.delete(`/terminal/sessions/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terminal-session'] });
      toast.success('Sessão encerrada!');
    },
    onError: () => {
      toast.error('Erro ao encerrar sessão');
    },
  });

  return {
    session,
    isLoadingSession,
    history,
    isLoadingHistory,
    criarSessao: criarSessao.mutate,
    executarComando: executarComando.mutate,
    encerrarSessao: encerrarSessao.mutate,
    isExecutandoComando: executarComando.isPending,
  };
};
