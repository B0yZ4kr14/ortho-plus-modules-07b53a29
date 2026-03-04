import { useState, useEffect } from 'react';
import { Github, GitBranch, GitCommit, GitPullRequest, Play, RefreshCw, Settings } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RepositoryManager } from '@/components/admin/RepositoryManager';
import { WebhookManager } from '@/components/admin/WebhookManager';
import { GitHubIntegrationConfig } from '@/components/settings/GitHubIntegrationConfig';

interface GitHubData {
  commits: any[];
  branches: any[];
  pull_requests: any[];
  workflows: any[];
}

export default function GitHubManagerPage() {
  const [data, setData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchGitHubData = async () => {
    setLoading(true);
    try {
      const { data: response, error } = await supabase.functions.invoke('github-proxy', {
        body: { action: 'VIEW' }
      });

      if (error) throw error;

      setData(response.data);
      toast.success('Dados atualizados');
    } catch (error) {
      toast.error('Erro ao carregar dados do GitHub');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGitHubData();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="GitHub Manager"
          description="Gerenciamento de repositório, commits, branches e CI/CD"
          icon={Github}
        />
        <Button onClick={fetchGitHubData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <Github className="h-4 w-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="repositories">
            <GitBranch className="h-4 w-4 mr-2" />
            Repositórios
          </TabsTrigger>
          <TabsTrigger value="configuration">
            <Settings className="h-4 w-4 mr-2" />
            Configuração
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <Play className="h-4 w-4 mr-2" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Commits Recentes</CardTitle>
                <CardDescription>Histórico de commits do repositório principal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data?.commits.map((commit) => (
                    <div key={commit.sha} className="flex items-start gap-3 p-3 border rounded-lg">
                      <GitCommit className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{commit.message}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{commit.author}</span>
                          <span>•</span>
                          <span>{new Date(commit.date).toLocaleString()}</span>
                          <span>•</span>
                          <Badge variant="outline">{commit.branch}</Badge>
                        </div>
                        <p className="font-mono text-xs text-muted-foreground">{commit.sha}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pull Requests</CardTitle>
                <CardDescription>PRs abertos e recentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data?.pull_requests.map((pr) => (
                    <div key={pr.number} className="flex items-start gap-3 p-3 border rounded-lg">
                      <GitPullRequest className="h-5 w-5 text-green-500 mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">#{pr.number} - {pr.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>por {pr.author}</span>
                          <span>•</span>
                          <span>{new Date(pr.created_at).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{pr.base}</Badge>
                          <span className="text-muted-foreground">←</span>
                          <Badge variant="outline">{pr.head}</Badge>
                        </div>
                      </div>
                      <Badge>{pr.state}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Branches</CardTitle>
                <CardDescription>Branches ativos do repositório</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data?.branches.map((branch) => (
                    <div key={branch.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <GitBranch className="h-5 w-5" />
                        <div>
                          <p className="font-medium">{branch.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Último commit: {new Date(branch.last_commit).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {branch.protected && (
                        <Badge variant="secondary">Protegido</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CI/CD Workflows</CardTitle>
                <CardDescription>Status dos pipelines de deploy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data?.workflows.map((workflow) => (
                    <div key={workflow.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Play className="h-5 w-5" />
                        <div>
                          <p className="font-medium">{workflow.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Última execução: {new Date(workflow.last_run).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{workflow.duration}</span>
                        <Badge variant={workflow.status === 'success' ? 'default' : 'destructive'}>
                          {workflow.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="repositories" className="space-y-4">
          <RepositoryManager />
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <GitHubIntegrationConfig />
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <WebhookManager />
        </TabsContent>

      </Tabs>
    </div>
  );
}
