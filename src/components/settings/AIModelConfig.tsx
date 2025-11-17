import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Brain, Key, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface AIModelConfig {
  default_provider?: string;
  openai_api_key?: string;
  google_api_key?: string;
  anthropic_api_key?: string;
  openrouter_api_key?: string;
  huggingface_api_key?: string;
  default_model?: string;
  temperature?: number;
  max_tokens?: number;
}

const AI_PROVIDERS = [
  { id: 'lovable', name: 'Lovable AI (Padrão)', free: true, models: ['google/gemini-2.5-flash', 'google/gemini-2.5-pro', 'openai/gpt-5'] },
  { id: 'openai', name: 'ChatGPT (OpenAI)', free: false, models: ['gpt-5', 'gpt-5-mini', 'gpt-5-nano'] },
  { id: 'google', name: 'Gemini Pro (Google)', free: false, models: ['gemini-2.5-pro', 'gemini-2.5-flash'] },
  { id: 'anthropic', name: 'Claude Pro (Anthropic)', free: false, models: ['claude-sonnet-4-5', 'claude-opus-4-1'] },
  { id: 'openrouter', name: 'OpenRouter.ai', free: false, models: ['múltiplos modelos'] },
  { id: 'huggingface', name: 'HuggingFace', free: false, models: ['múltiplos modelos'] },
];

export function AIModelConfig() {
  const { toast } = useToast();
  const { selectedClinic } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [config, setConfig] = useState<AIModelConfig>({
    default_provider: 'lovable',
    temperature: 0.7,
    max_tokens: 2000,
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
        .eq('config_type', 'ai_models')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data?.config_data) {
        setConfig(data.config_data as AIModelConfig);
      }
    } catch (error) {
      console.error('Erro ao carregar config IA:', error);
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
          config_type: 'ai_models',
          config_data: config as any,
          is_active: true,
        }, {
          onConflict: 'clinic_id,config_type'
        });

      if (error) throw error;

      toast({
        title: 'Configurações salvas',
        description: 'Modelos de IA configurados com sucesso',
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

  const toggleShowKey = (provider: string) => {
    setShowKeys({ ...showKeys, [provider]: !showKeys[provider] });
  };

  const selectedProvider = AI_PROVIDERS.find(p => p.id === config.default_provider);

  if (loading) {
    return <Card><CardContent className="pt-6">Carregando...</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          <CardTitle>Configuração de Modelos de IA</CardTitle>
        </div>
        <CardDescription>
          Selecione o provedor de IA e configure API keys para módulos que usam inteligência artificial
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider Selection */}
        <div className="space-y-2">
          <Label htmlFor="provider">Provedor de IA Padrão</Label>
          <Select
            value={config.default_provider || 'lovable'}
            onValueChange={(value) => setConfig({ ...config, default_provider: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AI_PROVIDERS.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  <div className="flex items-center gap-2">
                    {provider.name}
                    {provider.free && (
                      <Badge variant="outline" className="text-xs">Gratuito</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedProvider && (
            <p className="text-sm text-muted-foreground">
              Modelos disponíveis: {selectedProvider.models.join(', ')}
            </p>
          )}
        </div>

        <Separator />

        {/* API Keys */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <h3 className="text-sm font-medium">Chaves de API (API Keys)</h3>
          </div>

          {/* OpenAI */}
          <div className="space-y-2">
            <Label htmlFor="openai-key">OpenAI API Key (ChatGPT)</Label>
            <div className="flex gap-2">
              <Input
                id="openai-key"
                type={showKeys.openai ? 'text' : 'password'}
                placeholder="sk-proj-*********************"
                value={config.openai_api_key || ''}
                onChange={(e) => setConfig({ ...config, openai_api_key: e.target.value })}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleShowKey('openai')}
              >
                {showKeys.openai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Obtenha em: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" className="underline">platform.openai.com</a>
            </p>
          </div>

          {/* Google */}
          <div className="space-y-2">
            <Label htmlFor="google-key">Google AI API Key (Gemini Pro)</Label>
            <div className="flex gap-2">
              <Input
                id="google-key"
                type={showKeys.google ? 'text' : 'password'}
                placeholder="AIzaSy*********************"
                value={config.google_api_key || ''}
                onChange={(e) => setConfig({ ...config, google_api_key: e.target.value })}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleShowKey('google')}
              >
                {showKeys.google ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Obtenha em: <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener" className="underline">makersuite.google.com</a>
            </p>
          </div>

          {/* Anthropic */}
          <div className="space-y-2">
            <Label htmlFor="anthropic-key">Anthropic API Key (Claude Pro)</Label>
            <div className="flex gap-2">
              <Input
                id="anthropic-key"
                type={showKeys.anthropic ? 'text' : 'password'}
                placeholder="sk-ant-*********************"
                value={config.anthropic_api_key || ''}
                onChange={(e) => setConfig({ ...config, anthropic_api_key: e.target.value })}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleShowKey('anthropic')}
              >
                {showKeys.anthropic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Obtenha em: <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener" className="underline">console.anthropic.com</a>
            </p>
          </div>

          {/* OpenRouter */}
          <div className="space-y-2">
            <Label htmlFor="openrouter-key">OpenRouter API Key</Label>
            <div className="flex gap-2">
              <Input
                id="openrouter-key"
                type={showKeys.openrouter ? 'text' : 'password'}
                placeholder="sk-or-*********************"
                value={config.openrouter_api_key || ''}
                onChange={(e) => setConfig({ ...config, openrouter_api_key: e.target.value })}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleShowKey('openrouter')}
              >
                {showKeys.openrouter ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Obtenha em: <a href="https://openrouter.ai/keys" target="_blank" rel="noopener" className="underline">openrouter.ai</a>
            </p>
          </div>

          {/* HuggingFace */}
          <div className="space-y-2">
            <Label htmlFor="huggingface-key">HuggingFace API Key</Label>
            <div className="flex gap-2">
              <Input
                id="huggingface-key"
                type={showKeys.huggingface ? 'text' : 'password'}
                placeholder="hf_*********************"
                value={config.huggingface_api_key || ''}
                onChange={(e) => setConfig({ ...config, huggingface_api_key: e.target.value })}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleShowKey('huggingface')}
              >
                {showKeys.huggingface ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Obtenha em: <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener" className="underline">huggingface.co</a>
            </p>
          </div>
        </div>

        <Separator />

        {/* Advanced Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Configurações Avançadas</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (Criatividade)</Label>
              <Input
                id="temperature"
                type="number"
                min={0}
                max={2}
                step={0.1}
                value={config.temperature || 0.7}
                onChange={(e) => 
                  setConfig({ ...config, temperature: parseFloat(e.target.value) })
                }
              />
              <p className="text-xs text-muted-foreground">
                0 = Conservador, 1 = Balanceado, 2 = Criativo
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-tokens">Máximo de Tokens</Label>
              <Input
                id="max-tokens"
                type="number"
                min={100}
                max={4000}
                step={100}
                value={config.max_tokens || 2000}
                onChange={(e) => 
                  setConfig({ ...config, max_tokens: parseInt(e.target.value) })
                }
              />
              <p className="text-xs text-muted-foreground">
                Controla tamanho máximo da resposta
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-sm text-amber-600 dark:text-amber-400">
            <strong>💡 Recomendação:</strong> Use Lovable AI (gratuito) para começar. 
            Configure outros provedores apenas se precisar de modelos específicos.
          </p>
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
