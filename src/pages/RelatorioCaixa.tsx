import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { FileText, DollarSign, TrendingUp, TrendingDown, Calendar, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LoadingState } from '@/components/shared/LoadingState';

export default function RelatorioCaixa() {
  const { clinicId } = useAuth();
  const [movimentos, setMovimentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'hoje' | 'semana' | 'mes'>('hoje');

  const loadMovimentos = async () => {
    if (!clinicId) return;

    setLoading(true);
    try {
      const dataInicio = new Date();
      
      if (filtro === 'hoje') {
        dataInicio.setHours(0, 0, 0, 0);
      } else if (filtro === 'semana') {
        dataInicio.setDate(dataInicio.getDate() - 7);
      } else {
        dataInicio.setDate(dataInicio.getDate() - 30);
      }

      const { data, error } = await supabase
        .from('caixa_movimentos')
        .select(`
          *,
          user:profiles!user_id(full_name)
        `)
        .eq('clinic_id', clinicId)
        .eq('status', 'FECHADO')
        .gte('fechado_em', dataInicio.toISOString())
        .order('fechado_em', { ascending: false });

      if (error) throw error;
      setMovimentos(data || []);
    } catch (error) {
      console.error('Error loading movimentos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovimentos();
  }, [clinicId, filtro]);

  const totalSobras = movimentos
    .filter(m => (m.diferenca || 0) > 0)
    .reduce((sum, m) => sum + (m.diferenca || 0), 0);

  const totalFaltas = movimentos
    .filter(m => (m.diferenca || 0) < 0)
    .reduce((sum, m) => sum + Math.abs(m.diferenca || 0), 0);

  const totalMovimentado = movimentos
    .reduce((sum, m) => sum + (m.valor_esperado || 0) - m.valor_inicial, 0);

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <PageHeader 
          icon={FileText} 
          title="Relatório de Caixa"
          description="Histórico de movimentações e fechamentos"
        />
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader 
          icon={FileText} 
          title="Relatório de Caixa"
          description="Histórico de movimentações e fechamentos"
        />
        
        <div className="flex gap-2">
          <Button
            variant={filtro === 'hoje' ? 'default' : 'outline'}
            onClick={() => setFiltro('hoje')}
            size="sm"
          >
            Hoje
          </Button>
          <Button
            variant={filtro === 'semana' ? 'default' : 'outline'}
            onClick={() => setFiltro('semana')}
            size="sm"
          >
            7 dias
          </Button>
          <Button
            variant={filtro === 'mes' ? 'default' : 'outline'}
            onClick={() => setFiltro('mes')}
            size="sm"
          >
            30 dias
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="metric">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Movimentado</p>
                <p className="text-2xl font-bold">
                  R$ {totalMovimentado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card variant="metric">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Sobras</p>
                <p className="text-2xl font-bold text-green-600">
                  +R$ {totalSobras.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card variant="metric">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Faltas</p>
                <p className="text-2xl font-bold text-red-600">
                  -R$ {totalFaltas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingDown className="h-10 w-10 text-red-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Movimentos */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Fechamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {movimentos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum fechamento de caixa encontrado no período selecionado
            </div>
          ) : (
            <div className="space-y-3">
              {movimentos.map((mov) => {
                const diferenca = mov.diferenca || 0;
                const hasDiferenca = Math.abs(diferenca) > 0.01;

                return (
                  <div
                    key={mov.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(new Date(mov.fechado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {mov.user?.full_name || 'Usuário'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Inicial:</span>
                          <span className="ml-2 font-medium">
                            R$ {mov.valor_inicial.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Esperado:</span>
                          <span className="ml-2 font-medium">
                            R$ {(mov.valor_esperado || 0).toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Contado:</span>
                          <span className="ml-2 font-medium">
                            R$ {(mov.valor_final || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {mov.observacoes && (
                        <p className="text-sm text-muted-foreground italic">
                          {mov.observacoes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {hasDiferenca && (
                        <Badge variant={diferenca > 0 ? 'success' : 'destructive'}>
                          {diferenca > 0 ? '+' : ''}R$ {Math.abs(diferenca).toFixed(2)}
                        </Badge>
                      )}
                      {!hasDiferenca && (
                        <Badge variant="secondary">
                          ✓ Conferido
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}