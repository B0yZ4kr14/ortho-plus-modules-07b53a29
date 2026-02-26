import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, RefreshCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface BancoConfig {
  id?: string;
  banco_nome: string;
  banco_codigo: string;
  agencia: string;
  conta: string;
  api_url: string;
  api_key: string;
  api_secret: string;
  certificado_path: string;
  ativo: boolean;
  ultima_sincronizacao?: string;
}

export function ConfiguracaoBancaria() {
  const { user, selectedClinic } = useAuth();
  const [configs, setConfigs] = useState<BancoConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState<BancoConfig | null>(null);

  const bancos = [
    { codigo: '001', nome: 'Banco do Brasil' },
    { codigo: '033', nome: 'Santander' },
    { codigo: '104', nome: 'Caixa Econômica' },
    { codigo: '237', nome: 'Bradesco' },
    { codigo: '341', nome: 'Itaú' },
    { codigo: '756', nome: 'Sicoob' },
  ];

  const handleSave = async () => {
    if (!editando || !selectedClinic) return;

    setLoading(true);
    try {
      const payload = {
        ...editando,
        clinic_id: selectedClinic,
      };

      if (editando.id) {
        const { error } = await supabase
          .from('banco_config')
          .update(payload)
          .eq('id', editando.id);
        if (error) throw error;
        toast.success('Configuração atualizada com sucesso');
      } else {
        const { error } = await supabase
          .from('banco_config')
          .insert(payload);
        if (error) throw error;
        toast.success('Configuração criada com sucesso');
      }

      setEditando(null);
      loadConfigs();
    } catch (error: any) {
      toast.error(`Erro ao salvar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadConfigs = async () => {
    if (!selectedClinic) return;

    try {
      const { data, error } = await supabase
        .from('banco_config')
        .select('*')
        .eq('clinic_id', selectedClinic);

      if (error) throw error;
      setConfigs(data || []);
    } catch (error: any) {
      toast.error(`Erro ao carregar configurações: ${error.message}`);
    }
  };

  const handleSincronizar = async (configId: string) => {
    setLoading(true);
    try {
      const hoje = new Date();
      const trintaDiasAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase.functions.invoke('sincronizar-extrato-bancario', {
        body: {
          bancoConfigId: configId,
          dataInicio: trintaDiasAtras.toISOString().split('T')[0],
          dataFim: hoje.toISOString().split('T')[0],
        },
      });

      if (error) throw error;
      toast.success(`${data.lancamentos_sincronizados} lançamentos sincronizados (${data.conciliados_automaticamente} conciliados)`);
      loadConfigs();
    } catch (error: any) {
      toast.error(`Erro ao sincronizar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta configuração bancária?')) return;

    try {
      const { error } = await supabase
        .from('banco_config')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Configuração excluída com sucesso');
      loadConfigs();
    } catch (error: any) {
      toast.error(`Erro ao excluir: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configuração Bancária</h2>
          <p className="text-muted-foreground">
            Configure integração com APIs bancárias para conciliação automática
          </p>
        </div>
        <Button onClick={() => setEditando({
          banco_nome: '',
          banco_codigo: '',
          agencia: '',
          conta: '',
          api_url: '',
          api_key: '',
          api_secret: '',
          certificado_path: '',
          ativo: true,
        })}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Configuração
        </Button>
      </div>

      {editando && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editando.id ? 'Editar' : 'Nova'} Configuração
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Banco</Label>
              <Select
                value={editando.banco_codigo}
                onValueChange={(value) => {
                  const banco = bancos.find(b => b.codigo === value);
                  setEditando({
                    ...editando,
                    banco_codigo: value,
                    banco_nome: banco?.nome || '',
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o banco" />
                </SelectTrigger>
                <SelectContent>
                  {bancos.map(banco => (
                    <SelectItem key={banco.codigo} value={banco.codigo}>
                      {banco.codigo} - {banco.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Agência</Label>
              <Input
                value={editando.agencia}
                onChange={(e) => setEditando({ ...editando, agencia: e.target.value })}
                placeholder="0001"
              />
            </div>

            <div>
              <Label>Conta</Label>
              <Input
                value={editando.conta}
                onChange={(e) => setEditando({ ...editando, conta: e.target.value })}
                placeholder="12345-6"
              />
            </div>

            <div>
              <Label>URL da API</Label>
              <Input
                value={editando.api_url}
                onChange={(e) => setEditando({ ...editando, api_url: e.target.value })}
                placeholder="https://api.banco.com.br/extrato"
              />
            </div>

            <div>
              <Label>API Key</Label>
              <Input
                type="password"
                value={editando.api_key}
                onChange={(e) => setEditando({ ...editando, api_key: e.target.value })}
              />
            </div>

            <div>
              <Label>API Secret</Label>
              <Input
                type="password"
                value={editando.api_secret}
                onChange={(e) => setEditando({ ...editando, api_secret: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <Label>Caminho do Certificado</Label>
              <Input
                value={editando.certificado_path}
                onChange={(e) => setEditando({ ...editando, certificado_path: e.target.value })}
                placeholder="/certs/banco_certificado.pfx"
              />
            </div>

            <div className="col-span-2 flex items-center space-x-2">
              <Switch
                checked={editando.ativo}
                onCheckedChange={(checked) => setEditando({ ...editando, ativo: checked })}
              />
              <Label>Ativo</Label>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleSave} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
            <Button variant="outline" onClick={() => setEditando(null)}>
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {configs.map((config) => (
          <Card key={config.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{config.banco_nome}</h4>
                <p className="text-sm text-muted-foreground">
                  Agência: {config.agencia} | Conta: {config.conta}
                </p>
                {config.ultima_sincronizacao && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Última sincronização: {new Date(config.ultima_sincronizacao).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSincronizar(config.id!)}
                  disabled={loading}
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Sincronizar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditando(config)}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(config.id!)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}