/**
 * BACKEND SELECTOR V5.0
 * Interface para alternar entre Supabase Cloud e Ubuntu Server Local
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Cloud, Server, Wifi, WifiOff, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

type BackendType = 'supabase' | 'ubuntu-server';

interface BackendConfig {
  type: BackendType;
  url: string;
  status: 'online' | 'offline' | 'checking';
  latency: number | null;
}

export function BackendSelector() {
  const [selectedBackend, setSelectedBackend] = useState<BackendType>('supabase');
  const [backends, setBackends] = useState<Record<BackendType, BackendConfig>>({
    'supabase': {
      type: 'supabase',
      url: import.meta.env.VITE_SUPABASE_URL || 'https://yxpoqjyfgotkytwtifau.supabase.co',
      status: 'checking',
      latency: null
    },
    'ubuntu-server': {
      type: 'ubuntu-server',
      url: localStorage.getItem('UBUNTU_SERVER_URL') || 'http://192.168.1.100:5432',
      status: 'checking',
      latency: null
    }
  });

  // Carregar seleção salva
  useEffect(() => {
    const saved = localStorage.getItem('SELECTED_BACKEND') as BackendType;
    if (saved && (saved === 'supabase' || saved === 'ubuntu-server')) {
      setSelectedBackend(saved);
    }
  }, []);

  // Verificar status de conexão
  useEffect(() => {
    const checkBackendStatus = async (backend: BackendConfig): Promise<BackendConfig> => {
      const startTime = Date.now();
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${backend.url}/rest/v1/`, {
          method: 'HEAD',
          signal: controller.signal,
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || ''
          }
        });
        
        clearTimeout(timeoutId);
        const latency = Date.now() - startTime;
        
        return {
          ...backend,
          status: response.ok ? 'online' : 'offline',
          latency
        };
      } catch (error) {
        return {
          ...backend,
          status: 'offline',
          latency: null
        };
      }
    };

    const checkAllBackends = async () => {
      const [supabaseStatus, ubuntuStatus] = await Promise.all([
        checkBackendStatus(backends['supabase']),
        checkBackendStatus(backends['ubuntu-server'])
      ]);

      setBackends({
        'supabase': supabaseStatus,
        'ubuntu-server': ubuntuStatus
      });
    };

    checkAllBackends();
    
    // Recheck a cada 30 segundos
    const interval = setInterval(checkAllBackends, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleBackendChange = (value: string) => {
    const newBackend = value as BackendType;
    
    if (backends[newBackend].status === 'offline') {
      toast.error('Backend indisponível', {
        description: 'Este backend está offline. Por favor, verifique a conexão.'
      });
      return;
    }

    setSelectedBackend(newBackend);
    localStorage.setItem('SELECTED_BACKEND', newBackend);
    
    toast.success('Backend alterado', {
      description: `Conectado ao ${newBackend === 'supabase' ? 'Supabase Cloud' : 'Ubuntu Server Local'}. Recarregue a página para aplicar as mudanças.`
    });
  };

  const getStatusBadge = (status: BackendConfig['status']) => {
    const variants = {
      'online': { variant: 'default' as const, icon: Wifi, text: 'Online' },
      'offline': { variant: 'destructive' as const, icon: WifiOff, text: 'Offline' },
      'checking': { variant: 'outline' as const, icon: Clock, text: 'Verificando...' }
    };

    const { variant, icon: Icon, text } = variants[status];
    
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {text}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seleção de Backend</CardTitle>
        <CardDescription>
          Escolha entre Supabase Cloud (gerenciado) ou Ubuntu Server (local/on-premises)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={selectedBackend} onValueChange={handleBackendChange}>
          {/* Supabase Cloud */}
          <div className="flex items-start space-x-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
            <RadioGroupItem value="supabase" id="supabase" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="supabase" className="flex items-center gap-2 text-base font-semibold cursor-pointer">
                  <Cloud className="h-5 w-5 text-primary" />
                  Supabase Cloud
                </Label>
                {getStatusBadge(backends['supabase'].status)}
              </div>
              <p className="text-sm text-muted-foreground">
                Backend gerenciado na nuvem. Sempre disponível, com backup automático e escalabilidade.
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>URL: {backends['supabase'].url}</span>
                {backends['supabase'].latency !== null && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {backends['supabase'].latency}ms
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Ubuntu Server Local */}
          <div className="flex items-start space-x-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
            <RadioGroupItem value="ubuntu-server" id="ubuntu-server" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="ubuntu-server" className="flex items-center gap-2 text-base font-semibold cursor-pointer">
                  <Server className="h-5 w-5 text-primary" />
                  Ubuntu Server Local
                </Label>
                {getStatusBadge(backends['ubuntu-server'].status)}
              </div>
              <p className="text-sm text-muted-foreground">
                Servidor PostgreSQL local/on-premises. Controle total, dados 100% na sua infraestrutura.
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>URL: {backends['ubuntu-server'].url}</span>
                {backends['ubuntu-server'].latency !== null && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {backends['ubuntu-server'].latency}ms
                  </span>
                )}
              </div>
            </div>
          </div>
        </RadioGroup>

        <div className="rounded-lg bg-muted p-4 text-sm">
          <p className="font-semibold mb-2">ℹ️ Dica:</p>
          <p className="text-muted-foreground">
            Após alterar o backend, recarregue a página para aplicar as mudanças. 
            O sistema se conectará automaticamente ao backend selecionado.
          </p>
        </div>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => window.location.reload()}
        >
          Recarregar Aplicação
        </Button>
      </CardContent>
    </Card>
  );
}
