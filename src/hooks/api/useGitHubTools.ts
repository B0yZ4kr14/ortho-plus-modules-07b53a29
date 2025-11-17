import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/apiClient';
import { toast } from 'sonner';

interface Repository {
  id: string;
  name: string;
  full_name: string;
  private: boolean;
  description?: string;
  url: string;
}

interface Branch {
  name: string;
  commit_sha: string;
  protected: boolean;
}

interface PullRequest {
  id: number;
  title: string;
  state: string;
  created_at: string;
  user: string;
}

export const useGitHubTools = (repoName?: string) => {
  const queryClient = useQueryClient();

  const { data: repos = [], isLoading: isLoadingRepos } = useQuery({
    queryKey: ['github-repos'],
    queryFn: async () => {
      return await apiClient.get<Repository[]>('/github-tools/repos');
    },
  });

  const { data: branches = [], isLoading: isLoadingBranches } = useQuery({
    queryKey: ['github-branches', repoName],
    queryFn: async () => {
      if (!repoName) return [];
      return await apiClient.get<Branch[]>(`/github-tools/repos/${repoName}/branches`);
    },
    enabled: !!repoName,
  });

  const { data: pullRequests = [], isLoading: isLoadingPRs } = useQuery({
    queryKey: ['github-prs', repoName],
    queryFn: async () => {
      if (!repoName) return [];
      return await apiClient.get<PullRequest[]>(`/github-tools/repos/${repoName}/pulls`);
    },
    enabled: !!repoName,
  });

  const autenticarGitHub = useMutation({
    mutationFn: async (data: { github_token: string }) => {
      return await apiClient.post('/github-tools/auth', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['github-repos'] });
      toast.success('Autenticação GitHub configurada!');
    },
    onError: () => {
      toast.error('Erro ao autenticar no GitHub');
    },
  });

  const executarWorkflow = useMutation({
    mutationFn: async (data: { repo_name: string; workflow_id: string; ref: string }) => {
      return await apiClient.post(`/github-tools/repos/${data.repo_name}/workflows/${data.workflow_id}/dispatches`, {
        ref: data.ref,
      });
    },
    onSuccess: () => {
      toast.success('Workflow executado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao executar workflow');
    },
  });

  return {
    repos,
    isLoadingRepos,
    branches,
    isLoadingBranches,
    pullRequests,
    isLoadingPRs,
    autenticarGitHub: autenticarGitHub.mutate,
    executarWorkflow: executarWorkflow.mutate,
    isAutenticando: autenticarGitHub.isPending,
  };
};
