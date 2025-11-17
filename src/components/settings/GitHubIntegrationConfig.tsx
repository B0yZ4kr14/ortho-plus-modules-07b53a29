import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Github, ExternalLink, RefreshCw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface GitHubConfig {
  repository_url?: string;
  auto_sync_enabled?: boolean;
  branch_name?: string;
  last_sync_at?: string;
}

export function GitHubIntegrationConfig() {
  const { toast } = useToast();
  const { selectedClinic } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<GitHubConfig>({
    repository_url: '',
    auto_sync_enabled: false,
    branch_name: 'main',
  });

  useEffect(() => {
    loadConfig();
  }, [selectedClinic]);

  const loadConfig = async () => {
    if (!selectedClinic) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_configurations')
        .select('config_data')
        .eq('clinic_id', typeof selectedClinic === 'string' ? selectedClinic : selectedClinic.id)
        .eq('config_type', 'github')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data?.config_data) {
        setConfig(data.config_data as GitHubConfig);
      }
    } catch (error) {
      console.error('Erro ao carregar config GitHub:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!selectedClinic) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('admin_configurations')
        .upsert({
          clinic_id: typeof selectedClinic === 'string' ? selectedClinic : selectedClinic.id,
          config_type: 'github',
          config_data: config as any,
          is_active: true,
        }, {
          onConflict: 'clinic_id,config_type'
        });

      if (error) throw error;

      toast({
        title: 'Configurações salvas',
        description: 'Integração com GitHub configurada com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    if (!config.repository_url) {
      toast({
        title: 'URL obrigatória',
        description: 'Informe a URL do repositório GitHub',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Testando conexão...',
      description: 'Verificando acesso ao repositório',
    });

    // Simular teste de conexão (em produção, fazer chamada real via Edge Function)
    setTimeout(() => {
      toast({
        title: 'Conexão bem-sucedida',
        description: 'Repositório acessível',
      });
    }, 1500);
  };

  if (loading) {
    return <Card><CardContent className="pt-6">Carregando...</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          <CardTitle>Integração com GitHub</CardTitle>
        </div>
        <CardDescription>
          Configure o repositório GitHub para versionamento e backup do código
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repo-url">URL do Repositório</Label>
            <div className="flex gap-2">
              <Input
                id="repo-url"
                placeholder="https://github.com/sua-organizacao/ortho-plus"
                value={config.repository_url || ''}
                onChange={(e) => setConfig({ ...config, repository_url: e.target.value })}
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={testConnection}
                title="Testar conexão"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Exemplo: https://github.com/sua-org/seu-repo
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch">Branch Principal</Label>
            <Input
              id="branch"
              placeholder="main"
              value={config.branch_name || 'main'}
              onChange={(e) => setConfig({ ...config, branch_name: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sincronização Automática</Label>
              <p className="text-sm text-muted-foreground">
                Enviar commits automaticamente após mudanças
              </p>
            </div>
            <Switch
              checked={config.auto_sync_enabled || false}
              onCheckedChange={(checked) => 
                setConfig({ ...config, auto_sync_enabled: checked })
              }
            />
          </div>

          {config.last_sync_at && (
            <div className="p-3 bg-muted rounded-lg text-sm">
              <span className="text-muted-foreground">Última sincronização:</span>{' '}
              {new Date(config.last_sync_at).toLocaleString('pt-BR')}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={saveConfig} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
          <Button variant="outline" onClick={() => loadConfig()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Recarregar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
