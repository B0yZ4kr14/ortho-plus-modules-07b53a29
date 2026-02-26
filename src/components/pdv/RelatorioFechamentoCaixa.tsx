import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { LoadingState } from '@/components/shared/LoadingState';
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Download,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface RelatorioFechamentoCaixaProps {
  caixaMovimentoId: string;
}

export const RelatorioFechamentoCaixa = ({ caixaMovimentoId }: RelatorioFechamentoCaixaProps) => {
  const { clinicId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [gerandoSped, setGerandoSped] = useState(false);

  // Buscar dados do fechamento
  const { data: fechamento, isLoading } = useQuery({
    queryKey: ['fechamento-caixa', caixaMovimentoId],
    queryFn: async () => {
      // Buscar vendas PDV
      const { data: vendas, error: vendasError } = await supabase
        .from('pdv_vendas')
        .select('*')
        .eq('caixa_movimento_id', caixaMovimentoId);

      if (vendasError) throw vendasError;

      const totalVendasPDV = vendas?.reduce((sum, v) => sum + Number(v.valor_total), 0) || 0;

      // Buscar NFCe emitidas
      const { data: nfces, error: nfcesError } = await supabase
        .from('nfce_emitidas')
        .select('*')
        .in('venda_id', vendas?.map(v => v.id) || []);

      if (nfcesError) throw nfcesError;

      const totalNFCe = nfces?.reduce((sum, n) => sum + Number(n.valor_total), 0) || 0;

      // Vendas sem NFCe
      const vendasComNFCe = new Set(nfces?.map(n => n.venda_id) || []);
      const vendasSemNFCe = vendas?.filter(v => !vendasComNFCe.has(v.id)).length || 0;

      const divergencia = totalVendasPDV - totalNFCe;
      const percentualDivergencia = totalVendasPDV > 0
        ? (divergencia / totalVendasPDV) * 100
        : 0;

      return {
        totalVendasPDV,
        totalNFCe,
        divergencia,
        percentualDivergencia,
        quantidadeVendasPDV: vendas?.length || 0,
        quantidadeNFCe: nfces?.length || 0,
        vendasSemNFCe,
        vendas,
        nfces
      };
    },
    enabled: !!caixaMovimentoId,
  });

  const gerarSpedMutation = useMutation({
    mutationFn: async () => {
      setGerandoSped(true);
      
      const dataHoje = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase.functions.invoke('gerar-sped-fiscal', {
        body: {
          clinicId,
          dataInicio: dataHoje,
          dataFim: dataHoje
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Criar arquivo para download
      const blob = new Blob([data.arquivo], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SPED_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'SPED Fiscal gerado',
        description: `${data.estatisticas.totalNFCe} NFCe processadas`,
      });
      setGerandoSped(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao gerar SPED',
        description: error.message,
        variant: 'destructive',
      });
      setGerandoSped(false);
    },
  });

  if (isLoading) {
    return <LoadingState />;
  }

  const chartData = [
    {
      name: 'Vendas PDV',
      valor: fechamento?.totalVendasPDV || 0,
      quantidade: fechamento?.quantidadeVendasPDV || 0
    },
    {
      name: 'NFCe Emitidas',
      valor: fechamento?.totalNFCe || 0,
      quantidade: fechamento?.quantidadeNFCe || 0
    }
  ];

  const hasDivergencia = Math.abs(fechamento?.divergencia || 0) > 0.01;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Relatório de Fechamento</h3>
              <p className="text-sm text-muted-foreground">
                Comparação PDV vs NFCe Emitidas
              </p>
            </div>
          </div>
          <Button
            onClick={() => gerarSpedMutation.mutate()}
            disabled={gerandoSped}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            {gerandoSped ? 'Gerando...' : 'Gerar SPED Fiscal'}
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total PDV</p>
                <p className="text-xl font-bold">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(fechamento?.totalVendasPDV || 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <FileText className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total NFCe</p>
                <p className="text-xl font-bold">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(fechamento?.totalNFCe || 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${hasDivergencia ? 'bg-destructive/10' : 'bg-success/10'}`}>
                {hasDivergencia ? (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-success" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Divergência</p>
                <p className={`text-xl font-bold ${hasDivergencia ? 'text-destructive' : 'text-success'}`}>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    signDisplay: 'always'
                  }).format(fechamento?.divergencia || 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <TrendingUp className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sem NFCe</p>
                <p className="text-xl font-bold">
                  {fechamento?.vendasSemNFCe || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Gráfico Comparativo */}
        <Card className="p-4 mb-6">
          <h4 className="text-sm font-semibold mb-4">Comparativo de Valores</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(value)
                }
              />
              <Legend />
              <Bar dataKey="valor" fill="hsl(var(--primary))" name="Valor" />
              <Bar dataKey="quantidade" fill="hsl(var(--success))" name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Alertas */}
        {hasDivergencia && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium text-destructive">
                  Divergência Detectada: {fechamento?.percentualDivergencia.toFixed(2)}%
                </p>
                <p className="text-sm text-destructive-foreground mt-1">
                  {fechamento?.vendasSemNFCe} vendas sem NFCe emitida. Verifique se todas as vendas geraram cupom fiscal corretamente.
                </p>
              </div>
            </div>
          </div>
        )}

        {!hasDivergencia && (
          <div className="p-4 rounded-lg bg-success/10 border border-success/20">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="font-medium text-success">
                  Fechamento Conferido
                </p>
                <p className="text-sm text-success-foreground mt-1">
                  Todos os valores estão corretos. Sistema fiscal em conformidade.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
