import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, AlertCircle, Filter, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils/validation.utils';

interface BancoExtrato {
  id: string;
  data_movimento: string;
  descricao: string;
  valor: number;
  tipo: 'CREDITO' | 'DEBITO';
  documento: string | null;
  conciliado: boolean;
  conta_receber_id: string | null;
  observacoes: string | null;
}

export default function ConciliacaoBancaria() {
  const { selectedClinic } = useAuth();
  const [extratos, setExtratos] = useState<BancoExtrato[]>([]);
  const [filtro, setFiltro] = useState<'TODOS' | 'CONCILIADO' | 'PENDENTE'>('TODOS');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedClinic) {
      loadExtratos();
    }
  }, [selectedClinic, filtro]);

  const loadExtratos = async () => {
    try {
      let query = supabase
        .from('banco_extratos')
        .select('*')
        .eq('clinic_id', selectedClinic!)
        .order('data_movimento', { ascending: false });

      if (filtro === 'CONCILIADO') {
        query = query.eq('conciliado', true);
      } else if (filtro === 'PENDENTE') {
        query = query.eq('conciliado', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      setExtratos(data || []);
    } catch (error: any) {
      toast.error(`Erro ao carregar extratos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConciliar = async (extratoId: string, contaReceberId: string) => {
    try {
      const { error } = await supabase
        .from('banco_extratos')
        .update({
          conciliado: true,
          conta_receber_id: contaReceberId,
          observacoes: 'Conciliado manualmente',
        })
        .eq('id', extratoId);

      if (error) throw error;
      toast.success('Lançamento conciliado com sucesso');
      loadExtratos();
    } catch (error: any) {
      toast.error(`Erro ao conciliar: ${error.message}`);
    }
  };

  const handleDesconciliar = async (extratoId: string) => {
    try {
      const { error } = await supabase
        .from('banco_extratos')
        .update({
          conciliado: false,
          conta_receber_id: null,
          observacoes: null,
        })
        .eq('id', extratoId);

      if (error) throw error;
      toast.success('Conciliação desfeita com sucesso');
      loadExtratos();
    } catch (error: any) {
      toast.error(`Erro ao desconciliar: ${error.message}`);
    }
  };

  const stats = {
    total: extratos.length,
    conciliados: extratos.filter(e => e.conciliado).length,
    pendentes: extratos.filter(e => !e.conciliado).length,
    valorTotal: extratos.filter(e => e.tipo === 'CREDITO').reduce((sum, e) => sum + e.valor, 0),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conciliação Bancária"
        description="Reconcilie lançamentos bancários com contas a receber automaticamente"
      />

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total de Lançamentos</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Conciliados</div>
          <div className="text-2xl font-bold text-success">{stats.conciliados}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Pendentes</div>
          <div className="text-2xl font-bold text-warning">{stats.pendentes}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Valor Total</div>
          <div className="text-2xl font-bold">{formatCurrency(stats.valorTotal)}</div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Select value={filtro} onValueChange={(v: any) => setFiltro(v)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                <SelectItem value="CONCILIADO">Conciliados</SelectItem>
                <SelectItem value="PENDENTE">Pendentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>

        <div className="space-y-2">
          {extratos.map((extrato) => (
            <div
              key={extrato.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{extrato.descricao}</span>
                  {extrato.conciliado ? (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Conciliado
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Pendente
                    </Badge>
                  )}
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                  <span>{new Date(extrato.data_movimento).toLocaleDateString('pt-BR')}</span>
                  {extrato.documento && <span>Doc: {extrato.documento}</span>}
                  {extrato.observacoes && <span>{extrato.observacoes}</span>}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className={`font-bold ${extrato.tipo === 'CREDITO' ? 'text-success' : 'text-destructive'}`}>
                    {extrato.tipo === 'CREDITO' ? '+' : '-'} {formatCurrency(extrato.valor)}
                  </div>
                  <div className="text-xs text-muted-foreground">{extrato.tipo}</div>
                </div>

                {extrato.conciliado ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDesconciliar(extrato.id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Desconciliar
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      // Em produção, abrir dialog para selecionar conta a receber
                      toast.info('Selecione a conta a receber correspondente');
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Conciliar
                  </Button>
                )}
              </div>
            </div>
          ))}

          {extratos.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum lançamento bancário encontrado. Configure a integração bancária primeiro.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}