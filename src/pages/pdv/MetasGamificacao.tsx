import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/shared/PageHeader";
import { Trophy, Target, TrendingUp, Award, Medal, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MetasGamificacao() {
  const { user, clinicId } = useAuth();
  const { toast } = useToast();
  const [metas, setMetas] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [periodoRanking, setPeriodoRanking] = useState("MES");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clinicId) {
      loadData();
    }
  }, [clinicId, periodoRanking]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar metas do usuário
      const { data: metasData, error: metasError } = await supabase
        .from("vendedor_metas")
        .select(`
          *,
          premiacao:vendedor_premiacoes(*)
        `)
        .eq("clinic_id", clinicId)
        .eq("vendedor_id", user?.id)
        .order("periodo_inicio", { ascending: false });

      if (metasError) throw metasError;
      setMetas(metasData || []);

      // Carregar ranking
      const hoje = new Date().toISOString().split('T')[0];
      const { data: rankingData, error: rankingError } = await supabase
        .from("vendedor_ranking")
        .select(`
          *,
          vendedor:profiles!vendedor_ranking_vendedor_id_fkey(full_name)
        `)
        .eq("clinic_id", clinicId)
        .eq("periodo", periodoRanking)
        .eq("data_referencia", hoje)
        .order("posicao", { ascending: true });

      if (rankingError) throw rankingError;
      setRanking(rankingData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de metas e ranking",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (badge: string) => {
    if (badge === "OURO") return <Crown className="h-5 w-5 text-yellow-500" />;
    if (badge === "PRATA") return <Medal className="h-5 w-5 text-gray-400" />;
    if (badge === "BRONZE") return <Medal className="h-5 w-5 text-amber-600" />;
    return null;
  };

  const getStatusColor = (status: string) => {
    if (status === "ATINGIDA") return "success";
    if (status === "SUPERADA") return "info";
    if (status === "NAO_ATINGIDA") return "error";
    return "default";
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Metas e Gamificação"
        description="Acompanhe suas metas, conquistas e posição no ranking"
      />

      {/* Minhas Metas */}
      <Card depth="normal" className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Minhas Metas</h2>
        </div>
        
        <div className="space-y-4">
          {metas.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma meta cadastrada</p>
          ) : (
            metas.map((meta) => (
              <Card key={meta.id} depth="subtle" className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {new Date(meta.periodo_inicio).toLocaleDateString('pt-BR')} até{' '}
                        {new Date(meta.periodo_fim).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Meta: R$ {parseFloat(meta.meta_valor).toFixed(2)}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(meta.status)}>
                      {meta.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span className="font-medium">{meta.percentual_atingido}%</span>
                    </div>
                    <Progress value={parseFloat(meta.percentual_atingido)} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Vendas</p>
                      <p className="font-medium">{meta.quantidade_atingida} / {meta.meta_quantidade}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Valor Atingido</p>
                      <p className="font-medium">R$ {parseFloat(meta.valor_atingido).toFixed(2)}</p>
                    </div>
                  </div>

                  {meta.premiacao && (
                    <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                      <Award className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{meta.premiacao.nome}</p>
                        <p className="text-xs text-muted-foreground">{meta.premiacao.descricao}</p>
                      </div>
                      {meta.premiacao_paga ? (
                        <Badge variant="success">Pago</Badge>
                      ) : (
                        <Badge variant="warning">Pendente</Badge>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>

      {/* Ranking */}
      <Card depth="normal" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Ranking de Vendedores</h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant={periodoRanking === "DIA" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriodoRanking("DIA")}
            >
              Dia
            </Button>
            <Button
              variant={periodoRanking === "SEMANA" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriodoRanking("SEMANA")}
            >
              Semana
            </Button>
            <Button
              variant={periodoRanking === "MES" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriodoRanking("MES")}
            >
              Mês
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {ranking.length === 0 ? (
            <p className="text-muted-foreground">Nenhum dado de ranking disponível</p>
          ) : (
            ranking.map((item) => (
              <Card
                key={item.id}
                depth="subtle"
                className={`p-4 ${item.vendedor_id === user?.id ? 'border-2 border-primary' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getBadgeIcon(item.badge)}
                      <span className="text-2xl font-bold text-muted-foreground">
                        #{item.posicao}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{item.vendedor?.full_name || 'Vendedor'}</p>
                      <p className="text-sm text-muted-foreground">{item.pontos} pontos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">R$ {parseFloat(item.total_vendas).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantidade_vendas} vendas
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ticket: R$ {parseFloat(item.ticket_medio).toFixed(2)}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}