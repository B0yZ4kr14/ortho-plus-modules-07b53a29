import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  AlertTriangle,
  Brain,
  DollarSign,
  Shield,
  Clock,
  TrendingUp
} from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

interface SangriaInteligenteProps {
  caixaId: string;
  valorAtualCaixa: number;
}

export const SangriaInteligente = ({ caixaId, valorAtualCaixa }: SangriaInteligenteProps) => {
  const { clinicId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [valorSangria, setValorSangria] = useState<number>(0);
  const [observacoes, setObservacoes] = useState('');

  // Buscar sugestão da IA
  const { data: sugestaoIA, isLoading, refetch } = useQuery({
    queryKey: ['sugestao-sangria', clinicId, valorAtualCaixa],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('sugerir-sangria-ia', {
        body: {
          clinicId,
          valorAtualCaixa
        }
      });

      if (error) throw error;
      return data;
    },
    enabled: !!clinicId && valorAtualCaixa > 0,
    refetchInterval: 300000, // Atualizar a cada 5 minutos
  });

  // Auto-preencher valor sugerido
  useEffect(() => {
    if (sugestaoIA?.deveSugerirSangria && sugestaoIA?.valorSugerido > 0) {
      setValorSangria(sugestaoIA.valorSugerido);
      setObservacoes(`Sangria sugerida automaticamente pela IA: ${sugestaoIA.motivo}`);
    }
  }, [sugestaoIA]);

  const sangriaMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('caixa_movimentos')
        .insert({
          clinic_id: clinicId,
          caixa_id: caixaId,
          tipo: 'SANGRIA',
          valor: valorSangria,
          observacoes,
          motivo_sangria: sugestaoIA?.deveSugerirSangria ? sugestaoIA.motivo : 'Manual',
          sugerido_por_ia: sugestaoIA?.deveSugerirSangria || false,
          risco_calculado: sugestaoIA?.analise?.riscoPercentual || 0,
          horario_risco: new Date().getHours().toString(),
          created_by: user.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caixa-movimentos'] });
      toast({
        title: 'Sangria realizada',
        description: `R$ ${valorSangria.toFixed(2)} removido do caixa`,
      });
      setValorSangria(0);
      setObservacoes('');
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao realizar sangria',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSangria = () => {
    if (valorSangria <= 0) {
      toast({
        title: 'Valor inválido',
        description: 'Informe um valor maior que zero',
        variant: 'destructive',
      });
      return;
    }

    if (valorSangria > valorAtualCaixa) {
      toast({
        title: 'Valor inválido',
        description: 'Valor da sangria não pode ser maior que o disponível em caixa',
        variant: 'destructive',
      });
      return;
    }

    sangriaMutation.mutate();
  };

  return (
    <div className="space-y-4">
      {/* Sugestão da IA */}
      {sugestaoIA?.deveSugerirSangria && (
        <Alert variant="destructive">
          <Brain className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            <Badge variant="destructive">ALERTA IA</Badge>
            Sangria Recomendada
          </AlertTitle>
          <AlertDescription>
            <div className="space-y-2 mt-2">
              <p className="font-medium">{sugestaoIA.motivo}</p>
              <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Valor Sugerido</p>
                  <p className="font-bold text-lg">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(sugestaoIA.valorSugerido)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Risco Calculado</p>
                  <p className="font-bold text-lg">
                    {sugestaoIA.analise.riscoPercentual.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Análise de Risco */}
      {sugestaoIA?.analise && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">Análise de Risco IA</h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span>Horário</span>
              </div>
              <p className="font-semibold">{sugestaoIA.analise.horaAtual}:00h</p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                <span>Em Caixa</span>
              </div>
              <p className="font-semibold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(sugestaoIA.analise.valorAtualCaixa)}
              </p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <AlertTriangle className="h-4 w-4" />
                <span>Incidentes</span>
              </div>
              <p className="font-semibold">{sugestaoIA.analise.totalIncidentes}</p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span>Média Sangrias</span>
              </div>
              <p className="font-semibold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(sugestaoIA.analise.mediaValorSangrias)}
              </p>
            </div>
          </div>

          {sugestaoIA.analise.horariosRisco.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm font-medium mb-2">Horários de Maior Risco:</p>
              <div className="flex gap-2">
                {sugestaoIA.analise.horariosRisco.map((hr: any) => (
                  <Badge key={hr.hora} variant="outline">
                    {hr.hora}:00h ({hr.incidentes} incidentes)
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Formulário de Sangria */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Realizar Sangria</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="valor">Valor da Sangria *</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              value={valorSangria}
              onChange={(e) => setValorSangria(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
            <p className="text-sm text-muted-foreground">
              Disponível em caixa: {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(valorAtualCaixa)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Motivo da sangria..."
              rows={3}
            />
          </div>

          <Button
            onClick={handleSangria}
            disabled={sangriaMutation.isPending || valorSangria <= 0}
            className="w-full"
          >
            {sangriaMutation.isPending ? 'Processando...' : 'Confirmar Sangria'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
