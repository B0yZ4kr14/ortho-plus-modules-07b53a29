import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LoadingState } from '@/components/shared/LoadingState';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { FileText, Shield, Check, AlertTriangle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const ConfiguracaoFiscal = () => {
  const { clinicId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: fiscalConfig, isLoading } = useQuery({
    queryKey: ['fiscal-config', clinicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fiscal_config')
        .select('*')
        .eq('clinic_id', clinicId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!clinicId,
  });

  const [formData, setFormData] = useState({
    ambiente: 'HOMOLOGACAO',
    tipo_emissao: 'NFCE',
    cnpj: '',
    razao_social: '',
    nome_fantasia: '',
    inscricao_estadual: '',
    regime_tributario: 'SIMPLES_NACIONAL',
    codigo_regime_tributario: 1,
    csc_id: '',
    csc_token: '',
    serie_nfce: 1,
    email_contabilidade: '',
    contingencia_enabled: false,
    is_active: true,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (fiscalConfig) {
        const { error } = await supabase
          .from('fiscal_config')
          .update(data)
          .eq('id', fiscalConfig.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('fiscal_config')
          .insert({ ...data, clinic_id: clinicId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiscal-config'] });
      toast({
        title: 'Configuração salva',
        description: 'Configuração fiscal atualizada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Configuração Fiscal</h3>
              <p className="text-sm text-muted-foreground">
                Configure emissão de NFCe/SAT/MFe conforme legislação
              </p>
            </div>
          </div>
          {fiscalConfig?.is_active ? (
            <Badge variant="success" className="flex items-center gap-1">
              <Check className="h-3 w-3" />
              Ativo
            </Badge>
          ) : (
            <Badge variant="warning" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Inativo
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="ambiente">Ambiente</Label>
            <Select
              value={formData.ambiente}
              onValueChange={(value) =>
                setFormData({ ...formData, ambiente: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HOMOLOGACAO">Homologação</SelectItem>
                <SelectItem value="PRODUCAO">Produção</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo_emissao">Tipo de Emissão</Label>
            <Select
              value={formData.tipo_emissao}
              onValueChange={(value) =>
                setFormData({ ...formData, tipo_emissao: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NFCE">NFCe</SelectItem>
                <SelectItem value="SAT">SAT</SelectItem>
                <SelectItem value="MFE">MFe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ *</Label>
            <Input
              id="cnpj"
              value={formData.cnpj}
              onChange={(e) =>
                setFormData({ ...formData, cnpj: e.target.value })
              }
              placeholder="00.000.000/0000-00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="razao_social">Razão Social *</Label>
            <Input
              id="razao_social"
              value={formData.razao_social}
              onChange={(e) =>
                setFormData({ ...formData, razao_social: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
            <Input
              id="nome_fantasia"
              value={formData.nome_fantasia}
              onChange={(e) =>
                setFormData({ ...formData, nome_fantasia: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
            <Input
              id="inscricao_estadual"
              value={formData.inscricao_estadual}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  inscricao_estadual: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="regime_tributario">Regime Tributário</Label>
            <Select
              value={formData.regime_tributario}
              onValueChange={(value) =>
                setFormData({ ...formData, regime_tributario: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SIMPLES_NACIONAL">
                  Simples Nacional
                </SelectItem>
                <SelectItem value="LUCRO_PRESUMIDO">
                  Lucro Presumido
                </SelectItem>
                <SelectItem value="LUCRO_REAL">Lucro Real</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serie_nfce">Série NFCe</Label>
            <Input
              id="serie_nfce"
              type="number"
              value={formData.serie_nfce}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  serie_nfce: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="csc_id">CSC ID</Label>
            <Input
              id="csc_id"
              value={formData.csc_id}
              onChange={(e) =>
                setFormData({ ...formData, csc_id: e.target.value })
              }
              placeholder="Código de Segurança do Contribuinte"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="csc_token">CSC Token</Label>
            <Input
              id="csc_token"
              type="password"
              value={formData.csc_token}
              onChange={(e) =>
                setFormData({ ...formData, csc_token: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email_contabilidade">Email Contabilidade</Label>
            <Input
              id="email_contabilidade"
              type="email"
              value={formData.email_contabilidade}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email_contabilidade: e.target.value,
                })
              }
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="contingencia"
              checked={formData.contingencia_enabled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, contingencia_enabled: checked })
              }
            />
            <Label htmlFor="contingencia">Modo Contingência</Label>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 p-4 rounded-lg bg-info/10 border border-info/20">
          <Shield className="h-5 w-5 text-info" />
          <div className="text-sm text-info-foreground">
            <p className="font-medium">Certificado Digital (A1 ou A3)</p>
            <p className="text-xs mt-1">
              O upload do certificado digital será implementado posteriormente.
              Configure as demais informações por enquanto.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Salvando...' : 'Salvar Configuração'}
          </Button>
        </div>
      </Card>
    </form>
  );
};
