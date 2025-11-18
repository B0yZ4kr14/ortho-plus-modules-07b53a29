import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useGitHubTools } from '@/hooks/api/useGitHubTools';
import { Github, ExternalLink, Play, RefreshCw, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface RepositoryFormData {
  name: string;
  url: string;
  token: string;
  defaultBranch: string;
  enableWebhooks: boolean;
}

export function RepositoryManager() {
  const { repos, isLoadingRepos, branches, autenticarGitHub, executarWorkflow, isAutenticando } = useGitHubTools();
  const [showForm, setShowForm] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [formData, setFormData] = useState<RepositoryFormData>({
    name: '',
    url: '',
    token: '',
    defaultBranch: 'main',
    enableWebhooks: false,
  });

  const handleTestConnection = async () => {
    if (!formData.token) {
      toast.error('Token de acesso obrigatório');
      return;
    }

    setTestingConnection(true);
    try {
      // Testar conexão via API
      await autenticarGitHub({ github_token: formData.token });
      toast.success('Conexão testada com sucesso!');
    } catch (error) {
      toast.error('Erro ao testar conexão');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleConnectRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.url || !formData.token) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await autenticarGitHub({ github_token: formData.token });
      toast.success('Repositório conectado com sucesso!');
      setShowForm(false);
      setFormData({
        name: '',
        url: '',
        token: '',
        defaultBranch: 'main',
        enableWebhooks: false,
      });
    } catch (error) {
      toast.error('Erro ao conectar repositório');
    }
  };

  const handleExecuteWorkflow = async (repoName: string, workflowId: string, branch: string) => {
    try {
      await executarWorkflow({ repo_name: repoName, workflow_id: workflowId, ref: branch });
    } catch (error) {
      toast.error('Erro ao executar workflow');
    }
  };

  return (
    <div className="space-y-6">
      {/* Lista de Repositórios Conectados */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Repositórios Conectados</CardTitle>
              <CardDescription>Gerencie os repositórios GitHub vinculados ao sistema</CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancelar' : '+ Adicionar Repositório'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingRepos ? (
            <p className="text-muted-foreground">Carregando repositórios...</p>
          ) : repos.length === 0 ? (
            <p className="text-muted-foreground">Nenhum repositório conectado</p>
          ) : (
            <div className="space-y-3">
              {repos.map((repo) => (
                <Card key={repo.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Github className="h-5 w-5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{repo.full_name}</p>
                          <Badge variant={repo.private ? 'secondary' : 'outline'}>
                            {repo.private ? 'Privado' : 'Público'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{repo.description || 'Sem descrição'}</p>
                        <a 
                          href={repo.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1"
                        >
                          Ver no GitHub <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExecuteWorkflow(repo.name, 'deploy', 'main')}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Deploy
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulário Adicionar Repositório */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Novo Repositório</CardTitle>
            <CardDescription>Configure um novo repositório GitHub para integração</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleConnectRepo} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="repo-name">Nome do Repositório</Label>
                  <Input
                    id="repo-name"
                    placeholder="ortho-plus"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repo-url">URL do Repositório</Label>
                  <Input
                    id="repo-url"
                    placeholder="https://github.com/org/repo"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="repo-token">Token de Acesso (Personal Access Token)</Label>
                <Input
                  id="repo-token"
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxx"
                  value={formData.token}
                  onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Crie um token em GitHub → Settings → Developer settings → Personal access tokens
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-branch">Branch Padrão</Label>
                <Select
                  value={formData.defaultBranch}
                  onValueChange={(value) => setFormData({ ...formData, defaultBranch: value })}
                >
                  <SelectTrigger id="default-branch">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">main</SelectItem>
                    <SelectItem value="master">master</SelectItem>
                    <SelectItem value="develop">develop</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-webhooks"
                  checked={formData.enableWebhooks}
                  onCheckedChange={(checked) => setFormData({ ...formData, enableWebhooks: checked })}
                />
                <Label htmlFor="enable-webhooks">Habilitar Webhooks (notificações automáticas)</Label>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={testingConnection || !formData.token}
                >
                  {testingConnection ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Testar Conexão
                    </>
                  )}
                </Button>
                <Button type="submit" disabled={isAutenticando}>
                  {isAutenticando ? 'Conectando...' : 'Conectar Repositório'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
